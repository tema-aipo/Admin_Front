import { useEffect, useState } from "react";

import {
  Plus,
  Edit,
  RefreshCw,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Database,
  FileText,
  Settings,
} from "lucide-react";

import type {
  APIStatus,
  IPOSchedule,
  RAGDocument,
  AttractionWeight,
} from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

interface DocumentApiResponse {
  docId: number;

  originalName: string;

  fileSize: number;

  contentType: string;

  docStatus:
    | "UPLOADED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

  uploaderLoginId: string;

  uploadedAt: string;
}

interface DocumentListResponse {
  content: DocumentApiResponse[];

  totalElements: number;

  totalPages: number;

  size: number;

  number: number;
}

export function DataManagement() {
  const [selectedTab, setSelectedTab] =
    useState("외부 데이터 API");

  const [apiStatuses, setApiStatuses] =
    useState<APIStatus[]>([]);

  const [ipoSchedule, setIpoSchedule] =
    useState<IPOSchedule>({
      updateInterval: 30,
      lastUpdate: "",
    });

  const [ragDocuments, setRagDocuments] =
    useState<RAGDocument[]>([]);

  const [attractionWeights, setAttractionWeights] =
    useState<AttractionWeight[]>([]);

  /**
   * 참고 문서
   */
  const [referenceDocuments, setReferenceDocuments] =
    useState<DocumentApiResponse[]>([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(false);

  /**
   * 문서 목록 조회
   */
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/documents?page=0&size=20`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "문서 목록 조회 실패"
        );
      }

      const data: DocumentListResponse =
        await response.json();

      setReferenceDocuments(data.content);
    } catch (error) {
      console.error(error);

      alert(
        "문서 목록 조회에 실패했습니다."
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const tabs = [
    "외부 데이터 API",
    "RAG 데이터베이스",
    "매력지수 가중치",
    "참고 문서",
  ];

  /**
   * API 실행
   */
  const handleRunAPI = async (
    id: number
  ) => {
    setApiStatuses(
      apiStatuses.map((api) =>
        api.id === id
          ? {
              ...api,
              status: "running" as const,
            }
          : api
      )
    );

    setTimeout(() => {
      setApiStatuses((prev) =>
        prev.map((api) =>
          api.id === id
            ? {
                ...api,
                status: "success" as const,
                lastRun:
                  new Date().toLocaleString(
                    "ko-KR"
                  ),
              }
            : api
        )
      );
    }, 3000);
  };

  /**
   * 주기 수정
   */
  const handleUpdateInterval =
    async () => {
      const newInterval = prompt(
        "공모주 일정 변경 주기를 입력하세요 (분):",
        ipoSchedule.updateInterval.toString()
      );

      if (newInterval) {
        setIpoSchedule({
          ...ipoSchedule,
          updateInterval:
            parseInt(newInterval),
        });
      }
    };

  /**
   * RAG 업로드
   */
  const handleUploadRAG =
    async () => {
      const fileName = prompt(
        "업로드할 PDF 파일명을 입력하세요:"
      );

      if (fileName) {
        const newDoc: RAGDocument = {
          id: ragDocuments.length + 1,

          fileName,

          uploadDate:
            new Date().toLocaleString(
              "ko-KR"
            ),

          status: "processing",

          embeddingCount: 0,
        };

        setRagDocuments([
          ...ragDocuments,
          newDoc,
        ]);

        setTimeout(() => {
          setRagDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id
                ? {
                    ...doc,
                    status:
                      "completed" as const,
                    embeddingCount: 120,
                  }
                : doc
            )
          );
        }, 5000);
      }
    };

  /**
   * 가중치 수정
   */
  const handleUpdateWeight =
    async (id: number) => {
      const weight = prompt(
        "새로운 가중치를 입력하세요 (0-100):"
      );

      if (weight) {
        const newWeight =
          parseInt(weight);

        if (
          newWeight >= 0 &&
          newWeight <= 100
        ) {
          setAttractionWeights(
            attractionWeights.map((w) =>
              w.id === id
                ? {
                    ...w,
                    weight: newWeight,
                  }
                : w
            )
          );
        }
      }
    };

  /**
   * 참고 문서 업로드
   */
  const handleUploadReference =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      try {
        const token =
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const formData =
          new FormData();

        formData.append("file", file);

        const response = await fetch(
          `${BASE_URL}/api/v1/admin/documents/upload`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          }
        );

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(errorText);

          throw new Error(
            "문서 업로드 실패"
          );
        }

        alert("문서 업로드 완료");

        await fetchDocuments();
      } catch (error) {
        console.error(error);

        alert(
          "문서 업로드에 실패했습니다."
        );
      }
    };

  /**
   * 상태 아이콘
   */
  const getStatusIcon = (
    status: string
  ) => {
    switch (status) {
      case "success":
      case "completed":
      case "COMPLETED":
        return (
          <CheckCircle className="w-5 h-5 text-green-600" />
        );

      case "failed":
      case "FAILED":
        return (
          <XCircle className="w-5 h-5 text-red-600" />
        );

      case "running":
      case "processing":
      case "PROCESSING":
        return (
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
        );

      default:
        return (
          <AlertCircle className="w-5 h-5 text-gray-400" />
        );
    }
  };

  /**
   * 문서 상태 텍스트
   */
  const getDocumentStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "UPLOADED":
        return "업로드 완료";

      case "PROCESSING":
        return "처리중";

      case "COMPLETED":
        return "완료";

      case "FAILED":
        return "실패";

      default:
        return status;
    }
  };

  /**
   * 문서 상태 스타일
   */
  const getDocumentStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "PROCESSING":
        return "bg-blue-100 text-blue-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          데이터 관리
        </h1>
      </div>

      {/* 탭 */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setSelectedTab(tab)
            }
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              selectedTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 외부 데이터 API */}
      {selectedTab ===
        "외부 데이터 API" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  공모주 일정 변경 주기 설정
                </h3>
              </div>

              <button
                onClick={
                  handleUpdateInterval
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />

                <span>주기 변경</span>
              </button>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div>
                <span className="text-gray-600">
                  현재 주기:
                </span>

                <span className="font-semibold text-gray-900 ml-1">
                  {
                    ipoSchedule.updateInterval
                  }
                  분
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />

                <span>
                  마지막 갱신:
                  {" "}
                  {
                    ipoSchedule.lastUpdate
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {apiStatuses.length > 0 ? (
              apiStatuses.map((api) => (
                <div
                  key={api.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(
                        api.status
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {api.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleRunAPI(
                          api.id
                        )
                      }
                      disabled={
                        api.status ===
                        "running"
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      <Play className="w-4 h-4" />

                      <span>
                        수동 실행
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        최근 실행:
                      </span>

                      <span className="text-gray-900 ml-1">
                        {api.lastRun}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-600">
                        성공률:
                      </span>

                      <span className="font-semibold text-green-600 ml-1">
                        {
                          api.successRate
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">
                  등록된 API가 없습니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAG DB */}
      {selectedTab ===
        "RAG 데이터베이스" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleUploadRAG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />

              <span>PDF 업로드</span>
            </button>
          </div>

          <div className="space-y-4">
            {ragDocuments.length > 0 ? (
              ragDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(
                        doc.status
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {doc.fileName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Database className="w-4 h-4" />

                      <span>
                        {
                          doc.embeddingCount
                        }
                        임베딩
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    업로드:
                    {" "}
                    {doc.uploadDate}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">
                  업로드된 문서가 없습니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 매력지수 */}
      {selectedTab ===
        "매력지수 가중치" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    평가 요소
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    설명
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    가중치
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {attractionWeights.map(
                  (weight) => (
                    <tr key={weight.id}>
                      <td className="px-6 py-4">
                        {weight.factor}
                      </td>

                      <td className="px-6 py-4">
                        {
                          weight.description
                        }
                      </td>

                      <td className="px-6 py-4">
                        {weight.weight}%
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleUpdateWeight(
                              weight.id
                            )
                          }
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />

                          수정
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 참고 문서 */}
      {selectedTab === "참고 문서" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />

              <span>문서 업로드</span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={
                  handleUploadReference
                }
              />
            </label>
          </div>

          {loadingDocuments ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                문서 목록 불러오는 중...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceDocuments.length >
              0 ? (
                referenceDocuments.map(
                  (doc) => (
                    <div
                      key={doc.docId}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(
                            doc.docStatus
                          )}

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {
                                doc.originalName
                              }
                            </h3>

                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getDocumentStatusStyle(
                                  doc.docStatus
                                )}`}
                              >
                                {getDocumentStatusLabel(
                                  doc.docStatus
                                )}
                              </span>

                              <span className="text-xs text-gray-500">
                                {
                                  doc.contentType
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          업로더:
                          {" "}
                          {
                            doc.uploaderLoginId
                          }
                        </div>

                        <div>
                          파일 크기:
                          {" "}
                          {(
                            doc.fileSize /
                            1024 /
                            1024
                          ).toFixed(2)}
                          MB
                        </div>

                        <div>
                          업로드:
                          {" "}
                          {new Date(
                            doc.uploadedAt
                          ).toLocaleString(
                            "ko-KR"
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  <p className="text-gray-500 text-lg font-medium">
                    등록된 참고 문서가 없습니다
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}