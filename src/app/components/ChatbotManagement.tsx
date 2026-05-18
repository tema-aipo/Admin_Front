import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ThumbsDown,
  ThumbsUp,
  Clock,
  BarChart3,
  TrendingUp,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

import type {
  ConversationLog,
  QuestionCategory,
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

export function ChatbotManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const [conversationLogs, setConversationLogs] =
    useState<ConversationLog[]>([]);

  const [questionCategories, setQuestionCategories] =
    useState<QuestionCategory[]>([]);

  const [stats, setStats] = useState<ChatbotStats>({
    totalConversations: 0,
    likes: 0,
    dislikes: 0,
    satisfaction: 0,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /**
   * 아이콘 색상
   */
  const iconColors = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
  };

  /**
   * 초기 로딩
   */
  useEffect(() => {
    fetchChatbotLogs();
  }, []);

  /**
   * 챗봇 로그 조회
   */
  const fetchChatbotLogs = async () => {
    try {
      setLoading(true);
      setError("");

      /**
       * 저장된 JWT 토큰 가져오기
       */
      const accessToken =
        localStorage.getItem("accessToken");

      /**
       * 토큰 없을 경우
       */
      if (!accessToken) {
        throw new Error(
          "로그인이 필요합니다."
        );
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/logs/chatbot?page=0&size=200`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",

            /**
             * Authorization 헤더 추가
             */
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      /**
       * 인증 실패
       */
      if (response.status === 401) {
        throw new Error(
          "로그인이 만료되었습니다."
        );
      }

      /**
       * 권한 없음
       */
      if (response.status === 403) {
        throw new Error(
          "관리자 권한이 없습니다."
        );
      }

      if (!response.ok) {
        throw new Error(
          "챗봇 로그 조회 실패"
        );
      }

      const data: ChatbotLogResponse =
        await response.json();

      /**
       * 시간순 정렬
       */
      const sortedLogs = [...data.content].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      /**
       * USER 질문 + ASSISTANT 답변 매칭
       */
      const mappedLogs: ConversationLog[] = [];

      for (let i = 0; i < sortedLogs.length; i++) {
        const current = sortedLogs[i];

        /**
         * USER 메시지만 사용
         */
        if (current.messageRole !== "USER") {
          continue;
        }

        /**
         * 같은 세션의 다음 ASSISTANT 찾기
         */
        const assistantMessage = sortedLogs.find(
          (item, index) =>
            index > i &&
            item.sessionId === current.sessionId &&
            item.messageRole === "ASSISTANT"
        );

        mappedLogs.push({
          id: current.logId,
          userId: current.sessionId,
          category: "일반",
          question: current.content,
          answer:
            assistantMessage?.content ||
            "답변 없음",
          rating: "like",
          timestamp: current.createdAt,
        });
      }

      /**
       * 최신순 정렬
       */
      mappedLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );

      setConversationLogs(mappedLogs);

      /**
       * 통계 계산
       */
      const likes = mappedLogs.filter(
        (log) => log.rating === "like"
      ).length;

      const dislikes = mappedLogs.filter(
        (log) => log.rating === "dislike"
      ).length;

      const total = mappedLogs.length;

      const satisfaction =
        total === 0
          ? 0
          : Math.round((likes / total) * 100);

      setStats({
        totalConversations: total,
        likes,
        dislikes,
        satisfaction,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "알 수 없는 오류"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 낮은 평가 필터링
   */
  const lowRatedConversations =
    conversationLogs.filter(
      (log) => log.rating === "dislike"
    );

  /**
   * 검색 필터링
   */
  const filteredLogs = useMemo(() => {
    return conversationLogs.filter((log) =>
      log.question
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [conversationLogs, searchTerm]);

  /**
   * 통계 카드
   */
  const conversationStats = [
    {
      label: "총 대화 수",
      value: stats.totalConversations.toLocaleString(),
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "좋아요",
      value: stats.likes.toLocaleString(),
      icon: ThumbsUp,
      color: "green",
    },
    {
      label: "싫어요",
      value: stats.dislikes.toLocaleString(),
      icon: ThumbsDown,
      color: "red",
    },
    {
      label: "만족도",
      value: `${stats.satisfaction}%`,
      icon: TrendingUp,
      color: "purple",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          챗봇 관리
        </h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {conversationStats.map((stat) => {
          const Icon = stat.icon;

          const colors =
            iconColors[
              stat.color as keyof typeof iconColors
            ];

          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`p-3 rounded-xl ${colors.bg}`}
                >
                  <Icon
                    className={`w-5 h-5 ${colors.text}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 로그 영역 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {/* 제목 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              대화 로그 및 분석
            </h2>

            <p className="text-sm text-gray-500">
              챗봇 질문 및 응답 내역
            </p>
          </div>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="질문 내용 검색"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="py-20 text-center text-gray-500">
            로딩 중...
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="py-20 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* 로그 */}
        {!loading && !error && (
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="all">
                전체 로그
              </TabsTrigger>

              <TabsTrigger value="low-rated">
                <ThumbsDown className="w-4 h-4 mr-2" />
                낮은 평가
              </TabsTrigger>
            </TabsList>

            {/* 전체 로그 */}
            <TabsContent value="all">
              {filteredLogs.length > 0 ? (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* 상단 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                            {log.category}
                          </span>

                          {log.rating === "like" ? (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100">
                              <ThumbsUp className="w-3 h-3 text-green-600" />

                              <span className="text-xs font-medium text-green-700">
                                좋아요
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100">
                              <ThumbsDown className="w-3 h-3 text-red-600" />

                              <span className="text-xs font-medium text-red-700">
                                싫어요
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 시간 */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="w-3 h-3" />

                          {new Date(
                            log.timestamp
                          ).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {/* 질문 */}
                      <div className="mb-3">
                        <div className="flex gap-2">
                          <span className="font-semibold text-gray-800">
                            Q.
                          </span>

                          <p className="text-gray-900 leading-relaxed">
                            {log.question}
                          </p>
                        </div>
                      </div>

                      {/* 답변 */}
                      <div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-gray-800">
                            A.
                          </span>

                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {log.answer}
                          </p>
                        </div>
                      </div>

                      {/* 세션 */}
                      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
                        Session ID : {log.userId}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </TabsContent>

            {/* 낮은 평가 */}
            <TabsContent value="low-rated">
              {lowRatedConversations.length > 0 ? (
                <div className="space-y-4">
                  {lowRatedConversations.map((log) => (
                    <div
                      key={log.id}
                      className="p-5 bg-red-50 rounded-xl border border-red-200"
                    >
                      <div className="mb-3">
                        <div className="font-semibold text-red-700 mb-1">
                          질문
                        </div>

                        <p className="text-gray-800">
                          {log.question}
                        </p>
                      </div>

                      <div>
                        <div className="font-semibold text-red-700 mb-1">
                          답변
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap">
                          {log.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <ThumbsDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />

                  <p className="text-gray-500">
                    낮은 평가 데이터가 없습니다.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}