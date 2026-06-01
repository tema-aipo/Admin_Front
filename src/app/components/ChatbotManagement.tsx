import { useEffect, useMemo, useState, useCallback } from "react";

import {
  Search,
  ThumbsDown,
  ThumbsUp,
  Clock,
  BarChart3,
  TrendingUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  LayoutGrid,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import type {
  ConversationLog,
  ChatbotStats,
} from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

interface ChatbotLogResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  content: ChatbotLogItem[];
}

interface ChatbotLogItem {
  logId: number;
  sessionId: string;
  messageRole: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  tokenCount: number;
  createdAt: string;
}

interface ChatFeedbackResponse {
  content: ChatFeedbackItem[];
}

interface ChatFeedbackItem {
  feedbackId: number;
  messageId: number; 
  sessionId: number;
  userId: number;
  feedbackType: "LIKE" | "DISLIKE";
  reasonCode: string;
  reasonDetail: string;
  assistantAnswer: string;
}

const REASON_LABELS: Record<string, string> = {
  INACCURATE_INFO: "부정확한 정보",
  TOO_COMPLEX: "너무 복잡한 답변",
  IRRELEVANT_ANSWER: "무관한 답변",
};

export function ChatbotManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); 
  const [subFilter, setSubFilter] = useState("ALL"); 
  const [conversationLogs, setConversationLogs] = useState<ConversationLog[]>([]);
  const [stats, setStats] = useState<ChatbotStats>({
    totalConversations: 0,
    likes: 0,
    dislikes: 0,
    satisfaction: 0,
  });

  const [reasonStats, setReasonStats] = useState({
    INACCURATE_INFO: 0,
    TOO_COMPLEX: 0,
    IRRELEVANT_ANSWER: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 5;

  const iconColors = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
  };

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const [logsRes, feedbackRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/admin/logs/chatbot?page=0&size=10000`, { method: "GET", headers }),
        fetch(`${BASE_URL}/api/v1/admin/logs/chatbot/feedback?page=0&size=10000`, { method: "GET", headers })
      ]);

      if (logsRes.status === 401 || feedbackRes.status === 401) throw new Error("로그인이 만료되었습니다.");
      if (logsRes.status === 403 || feedbackRes.status === 403) throw new Error("관리자 권한이 없습니다.");
      if (!logsRes.ok || !feedbackRes.ok) throw new Error("데이터 로드 실패");

      const logsData: ChatbotLogResponse = await logsRes.json();
      const feedbackData: ChatFeedbackResponse = await feedbackRes.json();

      const sortedLogs = [...logsData.content].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const feedbackByMessageIdMap = new Map<number, ChatFeedbackItem>();
      const feedbackByTextMap = new Map<string, ChatFeedbackItem>();

      feedbackData.content.forEach((f) => {
        if (f.messageId) {
          feedbackByMessageIdMap.set(f.messageId, f);
        }
        if (f.assistantAnswer && f.sessionId) {
          const key = `${f.sessionId}_${f.assistantAnswer.trim()}`;
          feedbackByTextMap.set(key, f);
        }
      });

      const assistantMessagesBySession = new Map<string, ChatbotLogItem[]>();
      sortedLogs.forEach((log) => {
        if (log.messageRole === "ASSISTANT") {
          const list = assistantMessagesBySession.get(log.sessionId) || [];
          list.push(log);
          assistantMessagesBySession.set(log.sessionId, list);
        }
      });

      const mappedLogs: ConversationLog[] = [];
      const counts = { INACCURATE_INFO: 0, TOO_COMPLEX: 0, IRRELEVANT_ANSWER: 0 };

      for (let i = 0; i < sortedLogs.length; i++) {
        const current = sortedLogs[i];
        if (current.messageRole !== "USER") continue;

        const sessionAssistants = assistantMessagesBySession.get(current.sessionId) || [];
        const assistantMessage = sessionAssistants.find(
          (item) => new Date(item.createdAt).getTime() > new Date(current.createdAt).getTime()
        );

        let matchedFeedback: ChatFeedbackItem | undefined = undefined;

        if (assistantMessage) {
          matchedFeedback = feedbackByMessageIdMap.get(assistantMessage.logId);

          if (!matchedFeedback) {
            const backupKey = `${current.sessionId}_${assistantMessage.content?.trim()}`;
            matchedFeedback = feedbackByTextMap.get(backupKey);
          }
        }

        let currentCategory = "일반";
        if (matchedFeedback) {
          if (matchedFeedback.feedbackType === "DISLIKE") {
            currentCategory = `피드백: ${REASON_LABELS[matchedFeedback.reasonCode] || matchedFeedback.reasonCode}`;
            if (matchedFeedback.reasonCode in counts) {
              counts[matchedFeedback.reasonCode as keyof typeof counts]++;
            }
          } else {
            currentCategory = "만족";
          }
        }

        mappedLogs.push({
          id: current.logId,
          userId: current.sessionId,
          category: currentCategory,
          question: current.content,
          answer: assistantMessage?.content || "답변 없음",
          rating: matchedFeedback
            ? matchedFeedback.feedbackType === "LIKE" ? "like" : "dislike"
            : null,
          timestamp: current.createdAt,
          reasonCode: matchedFeedback?.reasonCode || null,
          reasonDetail: matchedFeedback?.reasonDetail || null,
        });
      }

      mappedLogs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setConversationLogs(mappedLogs);
      setReasonStats(counts);

      const likes = mappedLogs.filter((log) => log.rating === "like").length;
      const dislikes = mappedLogs.filter((log) => log.rating === "dislike").length;
      const evaluatedCount = likes + dislikes;

      const satisfaction =
        evaluatedCount === 0 ? 0 : Math.round((likes / evaluatedCount) * 100);

      setStats({
        totalConversations: mappedLogs.length,
        likes,
        dislikes,
        satisfaction,
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
       setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredLogs = useMemo(() => {
    return conversationLogs.filter((log) => {
      const matchesSearch =
        log.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = activeTab === "all" || log.rating === "dislike";
      
      const matchesSubFilter = 
        activeTab !== "dislike" || 
        subFilter === "ALL" || 
        log.reasonCode === subFilter;

      return matchesSearch && matchesTab && matchesSubFilter;
    });
  }, [conversationLogs, searchTerm, activeTab, subFilter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const paginatedLogs = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, activeTab, subFilter]);

  // 메인 탭이 바뀔 때 서브 필터도 'ALL'로 초기화 해주는 트리거
  useEffect(() => {
    if (activeTab === "all") {
      setSubFilter("ALL");
    }
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
  };

  const conversationStats = [
    { label: "총 대화 수", value: stats.totalConversations.toLocaleString(), icon: BarChart3, color: "blue" },
    { label: "좋아요", value: stats.likes.toLocaleString(), icon: ThumbsUp, color: "green" },
    { label: "싫어요", value: stats.dislikes.toLocaleString(), icon: ThumbsDown, color: "red" },
    { label: "만족도", value: `${stats.satisfaction}%`, icon: TrendingUp, color: "purple" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">챗봇 관리</h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {conversationStats.map((stat) => {
          const Icon = stat.icon;
          const colors = iconColors[stat.color as keyof typeof iconColors];

          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 로그 영역 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">대화 로그 및 분석</h2>
            <p className="text-sm text-gray-500">챗봇 질문 및 응답 내역</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col gap-4 mb-6">
            {/* 상위 메인 탭 리스트 */}
            <TabsList className="inline-flex h-11 items-center justify-start rounded-xl p-1 text-gray-500 w-fit">
              <TabsTrigger
                value="all"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                전체 로그 ({stats.totalConversations})
              </TabsTrigger>
              <TabsTrigger
                value="dislike"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                낮은 평가 ({stats.dislikes})
              </TabsTrigger>
            </TabsList>

            {activeTab === "dislike" && (
              <Tabs value={subFilter} onValueChange={setSubFilter} className="w-full animate-fadeIn">
                <TabsList className="inline-flex h-10 items-center justify-start rounded-xl p-1 text-gray-500 w-fit flex-wrap">
                  <TabsTrigger
                    value="ALL"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
                  >
                    전체 사유 ({stats.dislikes})
                  </TabsTrigger>
                  {Object.entries(REASON_LABELS).map(([code, label]) => {
                    const count = reasonStats[code as keyof typeof reasonStats] || 0;
                    return (
                      <TabsTrigger
                        key={code}
                        value={code}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm"
                      >
                        {label} ({count})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            )}

            {/* 검색바 */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="질문 또는 답변 내용 검색"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading && <div className="py-20 text-center text-gray-500">로딩 중...</div>}
          {error && <div className="py-20 text-center text-red-500 font-medium">{error}</div>}

          {!loading && !error && (
            <>
              <TabsContent value="all" className="m-0 mt-0 focus-visible:outline-none">
                {renderLogList(paginatedLogs)}
              </TabsContent>

              <TabsContent value="dislike" className="m-0 mt-0 focus-visible:outline-none">
                {renderLogList(paginatedLogs)}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* 페이징 */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-b-xl mt-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                총 <span className="font-semibold">{totalPages}</span> 페이지 중{" "}
                <span className="font-semibold">{currentPage + 1}</span> 페이지
              </p>

              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  let startPage = Math.max(0, currentPage - 1);
                  let endPage = Math.min(totalPages - 1, currentPage + 1);

                  if (currentPage === 0) endPage = Math.min(2, totalPages - 1);
                  if (currentPage === totalPages - 1) startPage = Math.max(0, totalPages - 3);

                  return Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => startPage + i
                  ).map((pageIdx) => (
                    <button
                      key={pageIdx}
                      onClick={() => handlePageChange(pageIdx)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        currentPage === pageIdx
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderLogList(logs: ConversationLog[]) {
    if (logs.length === 0) {
      return <div className="py-20 text-center text-gray-500">결과가 존재하지 않습니다.</div>;
    }

    return (
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  log.rating === "like" ? "bg-green-50 text-green-700" : log.rating === "dislike" ? "bg-red-50 text-red-700" : "bg-indigo-100 text-indigo-800"
                }`}>
                  {log.category}
                </span>

                {log.rating === "like" ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100">
                    <ThumbsUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700">좋아요</span>
                  </div>
                ) : log.rating === "dislike" ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100">
                    <ThumbsDown className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-red-700">싫어요</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100">
                    <span className="text-xs font-medium text-gray-600">미평가</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex gap-2">
                <span className="font-semibold text-gray-800">Q.</span>
                <p className="text-gray-900 leading-relaxed">{log.question}</p>
              </div>
            </div>

            <div className={log.rating === "dislike" && log.reasonDetail ? "mb-3" : ""}>
              <div className="flex gap-2">
                <span className="font-semibold text-gray-800">A.</span>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{log.answer}</p>
              </div>
            </div>

            {log.rating === "dislike" && log.reasonDetail && (
              <div className="mt-2 p-3 bg-red-50/50 rounded-lg border border-red-100 text-sm">
                <p className="text-red-800 font-medium mb-1">💡 상세 피드백 내용</p>
                <p className="text-red-700">{log.reasonDetail}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
              Session ID : {log.userId}
            </div>
          </div>
        ))}
      </div>
    );
  }
}