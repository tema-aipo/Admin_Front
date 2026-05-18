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
  X,
  Server,
  Cpu,
  User,
  HardDrive,
  Calendar,
} from "lucide-react";

import type {
  APIStatus,
  IPOSchedule,
  RAGDocument,
  AttractionWeight,
} from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

// --- API 응답 인터페이스 정의 ---
interface DocumentApiResponse {
  docId: number;
  originalName: string;
  fileSize: number;
  contentType: string;
  docStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  uploaderLoginId: string;
  uploadedAt: string;
}

interface DocumentDetailResponse {
  docId: number;
  originalName: string;
  fileSize: number;
  contentType: string;
  docStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
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

interface LoginLogItem {
  logId: number;
  loginId: string;
  role: "USER" | "ADMIN";
  loggedInAt: string;
}

interface LoginLogResponse {
  content: LoginLogItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface SystemStatusResponse {
  status: string;
  databaseOk: boolean;
  uptimeMs: number;
  memory: {
    totalMb: number;
    freeMb: number;
    usedMb: number;
    maxMb: number;
  };
  checkedAt: string;
}

export function DataManagement() {
  const [selectedTab, setSelectedTab] = useState("파이프라인");
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [ipoSchedule, setIpoSchedule] = useState<IPOSchedule>({
    updateInterval: 30,
    lastUpdate: "",
  });
  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>([]);
  const [attractionWeights, setAttractionWeights] = useState<AttractionWeight[]>([]);

  /**
   * 참고 문서 상태 관리
   */
  const [referenceDocuments, setReferenceDocuments] = useState<DocumentApiResponse[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetailResponse | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  /**
   * 로그인 로그 상태 및 페이지네이션 상태 관리
   */
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10; 

  /**
   * 시스템 상태 관련 상태 관리
   */
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  /**
   * 문서 목록 조회
   */
  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const token = localStorage.getItem("accessToken");
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
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("문서 목록 조회 실패");
      }

      const data: DocumentListResponse = await response.json();
      setReferenceDocuments(data.content);
    } catch (error) {
      console.error(error);
      alert("문서 목록 조회에 실패했습니다.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  /**
   * 문서 상세 조회
   */
  const fetchDocumentDetail = async (docId: number) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/documents/${docId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("문서 상세 조회 실패");
      }

      const data: DocumentDetailResponse = await response.json();
      setSelectedDocument(data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error(error);
      alert("문서 상세 조회에 실패했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 로그인 로그 목록 조회
   */
  const fetchLoginLogs = async (page: number) => {
    try {
      setLoadingLogs(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/logs/login?page=${page}&size=${PAGE_SIZE}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("로그인 로그 조회 실패");
      }

      const data: LoginLogResponse = await response.json();
      setLoginLogs(data.content);
      setCurrentPage(data.number);    
      setTotalPages(data.totalPages); 
    } catch (error) {
      console.error(error);
      alert("로그인 로그 조회에 실패했습니다.");
    } finally {
      setLoadingLogs(false);
    }
  };

  /**
   * 시스템 상태 API 호출 함수
   */
  const fetchSystemStatus = async () => {
    try {
      setLoadingStatus(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/admin/system/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("시스템 상태 조회 실패");
      }

      const data: SystemStatusResponse = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error(error);
      alert("시스템 상태를 가져오는 데 실패했습니다.");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "참고 문서") {
      fetchDocuments();
    } else if (selectedTab === "로그인 로그") {
      fetchLoginLogs(0); 
    } else if (selectedTab === "시스템 상태") {
      fetchSystemStatus(); 
    }
  }, [selectedTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    fetchLoginLogs(newPage);
  };

  const tabs = ["파이프라인", "시스템 상태", "로그인 로그", "참고 문서"];

  const handleUpdateInterval = async () => {
    const newInterval = prompt(
      "공모주 일정 변경 주기를 입력하세요 (분):",
      ipoSchedule.updateInterval.toString()
    );

    if (newInterval) {
      setIpoSchedule({
        ...ipoSchedule,
        updateInterval: parseInt(newInterval),
      });
    }
  };

  const handleUploadReference = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/v1/admin/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("문서 업로드 실패");
      }

      alert("문서 업로드 완료");
      await fetchDocuments();
    } catch (error) {
      console.error(error);
      alert("문서 업로드에 실패했습니다.");
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = "";
    if (days > 0) result += `${days}일 `;
    if (hours > 0) result += `${hours}시간 `;
    if (minutes > 0) result += `${minutes}분 `;
    result += `${secs}초`;
    return result;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "failed":
      case "FAILED":
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case "running":
      case "processing":
      case "PROCESSING":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDocumentStatusLabel = (status: string) => {
    switch (status) {
      case "UPLOADED": return "업로드 완료";
      case "PROCESSING": return "처리중";
      case "COMPLETED": return "분석 완료";
      case "FAILED": return "실패";
      default: return status;
    }
  };

  const getDocumentStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "PROCESSING": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "FAILED": return "bg-rose-50 text-rose-700 border border-rose-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 타이틀 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">데이터 관리</h1>
      </div>

      {/* 글로벌 네비게이션 탭 */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              selectedTab === tab
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 파이프라인 관리 탭 패널 */}
      {selectedTab === "파이프라인" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                공모주 일정 변경 주기 설정
              </h3>
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
                <span className="text-gray-600">현재 주기:</span>
                <span className="font-semibold text-gray-900 ml-1">
                  {ipoSchedule.updateInterval}분
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>마지막 갱신: {ipoSchedule.lastUpdate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시스템 상태 조회 탭 패널 */}
      {selectedTab === "시스템 상태" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">서버 인프라 상태 및 가동 요약</h3>
            <button 
              onClick={fetchSystemStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStatus ? "animate-spin" : ""}`} />
              새로고침
            </button>
          </div>

          {loadingStatus ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">시스템 상태 정보를 불러오는 중...</p>
            </div>
          ) : systemStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: 전체 시스템 상태 및 데이터베이스 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">시스템 헬스 체크</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${systemStatus.status === "OK" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {systemStatus.status}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">데이터베이스 상태</span>
                    <span className={`font-medium flex items-center gap-1 ${systemStatus.databaseOk ? "text-green-600" : "text-red-600"}`}>
                      {systemStatus.databaseOk ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> 정상 (OK)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> 에러 (Error)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">마지막 확인 일시</span>
                    <span className="text-gray-700 font-mono">
                      {new Date(systemStatus.checkedAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: 메모리 사용량 (Memory) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">JVM 메모리 현황</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>사용 중: {systemStatus.memory.usedMb} MB</span>
                      <span>전체: {systemStatus.memory.totalMb} MB</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (systemStatus.memory.usedMb / systemStatus.memory.totalMb) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>여유 메모리: {systemStatus.memory.freeMb} MB</span>
                    <span>최대 할당 가능: {systemStatus.memory.maxMb} MB</span>
                  </div>
                </div>
              </div>

              {/* Card 3: 시스템 업타임 (Uptime) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">서버 연속 가동 시간</h4>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-800 tracking-tight">
                    {formatUptime(systemStatus.uptimeMs)}
                  </div>
                  <p className="text-xs text-gray-400">
                    서버 인스턴스가 실행된 이후 경과된 총 시간입니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">데이터가 존재하지 않습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 로그인 로그 탭 패널 */}
      {selectedTab === "로그인 로그" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">최근 로그인 내역</h3>
            <button 
              onClick={() => fetchLoginLogs(currentPage)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
          </div>

          {loadingLogs ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">로그인 로그 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">로그 ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">로그인 ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">권한 (Role)</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">로그인 일시</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loginLogs.length > 0 ? (
                      loginLogs.map((log) => (
                        <tr key={log.logId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.logId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.loginId}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                              {log.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.loggedInAt).toLocaleString("ko-KR")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">기록된 로그인 로그가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        총 <span className="font-medium">{totalPages}</span> 페이지 중{" "}
                        <span className="font-medium">{currentPage + 1}</span> 페이지
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                          className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                        >
                          이전
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i).map((pageIdx) => {
                          if (Math.abs(currentPage - pageIdx) < 3) {
                            return (
                              <button
                                key={pageIdx}
                                onClick={() => handlePageChange(pageIdx)}
                                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20 ${
                                  currentPage === pageIdx
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageIdx + 1}
                              </button>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                          className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                        >
                          다음
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 참고 문서 탭 패널 */}
      {selectedTab === "참고 문서" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">RAG 참고 문서 관리</h3>
            
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span>문서 업로드</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleUploadReference}
              />
            </label>
          </div>

          {loadingDocuments ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">문서 목록 불러오는 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceDocuments.length > 0 ? (
                referenceDocuments.map((doc) => (
                  <div
                    key={doc.docId}
                    onClick={() => fetchDocumentDetail(doc.docId)}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(doc.docStatus)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {doc.originalName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getDocumentStatusStyle(doc.docStatus)}`}>
                              {getDocumentStatusLabel(doc.docStatus)}
                            </span>
                            <span className="text-xs text-gray-500">{doc.contentType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>업로더: {doc.uploaderLoginId}</div>
                      <div>파일 크기: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                      <div>업로드: {new Date(doc.uploadedAt).toLocaleString("ko-KR")}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">등록된 참고 문서가 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 문서 상세 팝업 모달 */}
          {isDetailOpen && selectedDocument && (
            <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedDocument.originalName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getDocumentStatusStyle(selectedDocument.docStatus)}`}>
                          {getDocumentStatusLabel(selectedDocument.docStatus)}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">ID {selectedDocument.docId}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500">파일 크기</div>
                      <div className="text-sm font-semibold text-gray-800 mt-1">
                        {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500">파일 타입</div>
                      <div className="text-sm font-semibold text-gray-800 mt-1">{selectedDocument.contentType}</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500">업로더</div>
                      <div className="text-sm font-semibold text-gray-800 mt-1 truncate">{selectedDocument.uploaderLoginId}</div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">업로드 시간</span>
                        <span className="font-medium text-gray-900">{new Date(selectedDocument.uploadedAt).toLocaleString("ko-KR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">문서 상태</span>
                        <span className="font-medium text-gray-900">{selectedDocument.docStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}