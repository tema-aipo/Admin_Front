import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
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
  ReferenceDocument,
} from "../../types";

export function DataManagement() {
  const [selectedTab, setSelectedTab] = useState("외부 데이터 API");
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [ipoSchedule, setIpoSchedule] = useState<IPOSchedule>({
    updateInterval: 30,
    lastUpdate: "",
  });
  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>([]);
  const [attractionWeights, setAttractionWeights] = useState<AttractionWeight[]>([]);
  const [referenceDocuments, setReferenceDocuments] = useState<ReferenceDocument[]>([]);

  // TODO: API 연동 - 데이터 로드
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [apis, schedule, rag, weights, docs] = await Promise.all([
  //         fetch('/api/admin/data/apis').then(r => r.json()),
  //         fetch('/api/admin/data/schedule').then(r => r.json()),
  //         fetch('/api/admin/data/rag').then(r => r.json()),
  //         fetch('/api/admin/data/weights').then(r => r.json()),
  //         fetch('/api/admin/data/references').then(r => r.json()),
  //       ]);
  //       setApiStatuses(apis);
  //       setIpoSchedule(schedule);
  //       setRagDocuments(rag);
  //       setAttractionWeights(weights);
  //       setReferenceDocuments(docs);
  //     } catch (error) {
  //       console.error('Failed to fetch data:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const tabs = [
    "외부 데이터 API",
    "RAG 데이터베이스",
    "매력지수 가중치",
    "참고 문서",
  ];

  const handleRunAPI = async (id: number) => {
    setApiStatuses(
      apiStatuses.map((api) =>
        api.id === id
          ? { ...api, status: "running" as const }
          : api,
      ),
    );

    // TODO: API 연동 - 실제 API 호출
    // try {
    //   await fetch(`/api/admin/data/apis/${id}/run`, { method: 'POST' });
    //   setApiStatuses(prev => prev.map(api =>
    //     api.id === id ? { ...api, status: 'success' as const, lastRun: new Date().toLocaleString('ko-KR') } : api
    //   ));
    // } catch (error) {
    //   console.error('Failed to run API:', error);
    //   setApiStatuses(prev => prev.map(api =>
    //     api.id === id ? { ...api, status: 'failed' as const } : api
    //   ));
    // }

    // 임시 시뮬레이션
    setTimeout(() => {
      setApiStatuses((prev) =>
        prev.map((api) =>
          api.id === id
            ? {
                ...api,
                status: "success" as const,
                lastRun: new Date().toLocaleString("ko-KR"),
              }
            : api,
        ),
      );
    }, 3000);
  };

  const handleUpdateInterval = async () => {
    const newInterval = prompt(
      "공모주 일정 변경 주기를 입력하세요 (분):",
      ipoSchedule.updateInterval.toString(),
    );
    if (newInterval) {
      // TODO: API 연동 - 주기 업데이트
      // try {
      //   await fetch('/api/admin/data/schedule', {
      //     method: 'PUT',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ interval: parseInt(newInterval) })
      //   });
      //   setIpoSchedule({ ...ipoSchedule, updateInterval: parseInt(newInterval) });
      // } catch (error) {
      //   console.error('Failed to update interval:', error);
      // }

      setIpoSchedule({
        ...ipoSchedule,
        updateInterval: parseInt(newInterval),
      });
    }
  };

  const handleUploadRAG = async () => {
    const fileName = prompt(
      "업로드할 PDF 파일명을 입력하세요:",
    );
    if (fileName) {
      // TODO: API 연동 - 파일 업로드
      // const formData = new FormData();
      // formData.append('file', file);
      // try {
      //   const response = await fetch('/api/admin/data/rag/upload', {
      //     method: 'POST',
      //     body: formData
      //   });
      //   const data = await response.json();
      //   setRagDocuments([...ragDocuments, data]);
      // } catch (error) {
      //   console.error('Failed to upload file:', error);
      // }

      const newDoc: RAGDocument = {
        id: ragDocuments.length + 1,
        fileName: fileName,
        uploadDate: new Date().toLocaleString("ko-KR"),
        status: "processing",
        embeddingCount: 0,
      };
      setRagDocuments([...ragDocuments, newDoc]);

      setTimeout(() => {
        setRagDocuments((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id
              ? {
                  ...doc,
                  status: "completed" as const,
                  embeddingCount: 120,
                }
              : doc,
          ),
        );
      }, 5000);
    }
  };

  const handleUpdateWeight = async (id: number) => {
    const weight = prompt(
      "새로운 가중치를 입력하세요 (0-100):",
    );
    if (weight) {
      const newWeight = parseInt(weight);
      if (newWeight >= 0 && newWeight <= 100) {
        // TODO: API 연동 - 가중치 업데이트
        // try {
        //   await fetch(`/api/admin/data/weights/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ weight: newWeight })
        //   });
        //   setAttractionWeights(attractionWeights.map(w => w.id === id ? { ...w, weight: newWeight } : w));
        // } catch (error) {
        //   console.error('Failed to update weight:', error);
        // }

        setAttractionWeights(
          attractionWeights.map((w) =>
            w.id === id ? { ...w, weight: newWeight } : w,
          ),
        );
      }
    }
  };

  const handleAddReference = async () => {
    const title = prompt("참고 문서 제목을 입력하세요:");
    if (title) {
      // TODO: API 연동 - 문서 추가
      // try {
      //   const response = await fetch('/api/admin/data/references', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ title })
      //   });
      //   const data = await response.json();
      //   setReferenceDocuments([...referenceDocuments, data]);
      // } catch (error) {
      //   console.error('Failed to add reference:', error);
      // }

      const newDoc: ReferenceDocument = {
        id: referenceDocuments.length + 1,
        title,
        version: "v1.0",
        lastUpdate: new Date().toISOString().split("T")[0],
        category: "기타",
      };
      setReferenceDocuments([...referenceDocuments, newDoc]);
    }
  };

  const handleDeleteReference = async (id: number) => {
    if (confirm("정말 이 참고 문서를 삭제하시겠습니까?")) {
      // TODO: API 연동 - 문서 삭제
      // try {
      //   await fetch(`/api/admin/data/references/${id}`, { method: 'DELETE' });
      //   setReferenceDocuments(referenceDocuments.filter(doc => doc.id !== id));
      // } catch (error) {
      //   console.error('Failed to delete reference:', error);
      // }

      setReferenceDocuments(
        referenceDocuments.filter((doc) => doc.id !== id),
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return (
          <CheckCircle className="w-5 h-5 text-green-600" />
        );
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "running":
      case "processing":
        return (
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
        );
      default:
        return (
          <AlertCircle className="w-5 h-5 text-gray-400" />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
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
            onClick={() => setSelectedTab(tab)}
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

      {/* 외부 데이터 API 관리 */}
      {selectedTab === "외부 데이터 API" && (
        <div className="space-y-6">
          {/* 공모주 일정 변경 주기 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  공모주 일정 변경 주기 설정
                </h3>
              </div>
              <button
                onClick={handleUpdateInterval}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>주기 변경</span>
              </button>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <div>
                <span className="text-gray-600">
                  현재 주기:{" "}
                </span>
                <span className="font-semibold text-gray-900">
                  {ipoSchedule.updateInterval}분
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  마지막 갱신: {ipoSchedule.lastUpdate}
                </span>
              </div>
            </div>
          </div>

          {/* API 상태 목록 */}
          <div className="space-y-4">
            {apiStatuses.length > 0 ? (
              apiStatuses.map((api) => (
              <div
                key={api.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(api.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {api.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                          {api.type}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            api.status === "success"
                              ? "bg-green-100 text-green-700"
                              : api.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {api.status === "success"
                            ? "정상"
                            : api.status === "failed"
                              ? "실패"
                              : "실행중"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRunAPI(api.id)}
                    disabled={api.status === "running"}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    <span>수동 실행</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">
                      최근 실행:{" "}
                    </span>
                    <span className="text-gray-900">
                      {api.lastRun}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      성공률:{" "}
                    </span>
                    <span className="font-semibold text-green-600">
                      {api.successRate}%
                    </span>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">등록된 API가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAG 데이터베이스 관리 */}
      {selectedTab === "RAG 데이터베이스" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600"></p>
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
                    {getStatusIcon(doc.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {doc.fileName}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          doc.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {doc.status === "completed"
                          ? "완료"
                          : doc.status === "processing"
                            ? "처리중"
                            : "실패"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Database className="w-4 h-4" />
                    <span>{doc.embeddingCount} 임베딩</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  업로드: {doc.uploadDate}
                </div>
              </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">업로드된 문서가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 매력지수 가중치 관리 */}
      {selectedTab === "매력지수 가중치" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가 요소
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가중치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attractionWeights.length > 0 ? (
                  attractionWeights.map((weight) => (
                  <tr key={weight.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {weight.factor}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {weight.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${weight.weight}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {weight.weight}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleUpdateWeight(weight.id)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>수정</span>
                      </button>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      등록된 가중치가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 참고 문서 관리 */}
      {selectedTab === "참고 문서" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600"></p>
            <button
              onClick={handleAddReference}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>문서 추가</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {referenceDocuments.length > 0 ? (
              referenceDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                          {doc.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {doc.version}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  최종 수정: {doc.lastUpdate}
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteReference(doc.id)
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              </div>
              ))
            ) : (
              <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">등록된 참고 문서가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}