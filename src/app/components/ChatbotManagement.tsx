import { useState, useEffect } from "react";
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

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type {
  ConversationLog,
  QuestionCategory,
  ChatbotStats,
} from "../../types";

const API_BASE_URL =
  "http://oval-zigzagged-umbrella.ngrok-free.dev";

interface ChatbotLogResponse {
  content: ChatbotLogItem[];
}

interface ChatbotLogItem {
  logId: number;
  sessionId: string;
  messageRole: "USER" | "ASSISTANT";
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

  /**
   * 챗봇 로그 조회 API 연동
   */
  useEffect(() => {
    const fetchChatbotLogs = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/admin/logs/chatbot?page=0&size=100`
        );

        if (!response.ok) {
          throw new Error("로그 조회 실패");
        }

        const data: ChatbotLogResponse =
          await response.json();

        /**
         * USER -> 질문
         * ASSISTANT -> 답변
         * 형태로 변환
         */
        const mappedLogs: ConversationLog[] = [];

        for (let i = 0; i < data.content.length; i++) {
          const current = data.content[i];
          const next = data.content[i + 1];

          if (
            current.messageRole === "USER" &&
            next &&
            next.messageRole === "ASSISTANT" &&
            current.sessionId === next.sessionId
          ) {
            mappedLogs.push({
              id: current.logId,
              userId: current.sessionId,
              category: "일반",
              question: current.content,
              answer: next.content,
              rating: "like",
              timestamp: current.createdAt,
            });
          }
        }

        setConversationLogs(mappedLogs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchChatbotLogs();
  }, []);

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

  // 낮은 평가(싫어요) 필터링
  const lowRatedConversations =
    conversationLogs.filter(
      (log) => log.rating === "dislike"
    );

  // 검색 필터링
  const filteredLogs = conversationLogs.filter((log) =>
    log.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          챗봇 관리
        </h2>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {conversationStats.map((stat, index) => {
          const Icon = stat.icon;

          const colorClasses = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            red: "bg-red-50 text-red-600",
            purple: "bg-purple-50 text-purple-600",
          };

          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    colorClasses[
                      stat.color as keyof typeof colorClasses
                    ]
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-1">
                {stat.label}
              </div>

              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 대화 로그 및 분석 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              대화 로그 및 분석
            </h2>
          </div>
        </div>

        {/* 검색 필드 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="질문 내용 검색"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 탭 */}
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">
              전체 로그
            </TabsTrigger>

            <TabsTrigger value="low-rated">
              <ThumbsDown className="w-4 h-4 mr-2" />
              낮은 평가
            </TabsTrigger>

            <TabsTrigger value="categories">
              <BarChart3 className="w-4 h-4 mr-2" />
              카테고리별
            </TabsTrigger>
          </TabsList>

          {/* 전체 대화 로그 */}
          <TabsContent value="all">
            {filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {log.category}
                        </span>

                        {log.rating === "like" ? (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100">
                            <ThumbsUp className="w-3 h-3 text-green-600" />

                            <span className="text-xs font-medium text-green-700">
                              좋아요
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100">
                            <ThumbsDown className="w-3 h-3 text-red-600" />

                            <span className="text-xs font-medium text-red-700">
                              싫어요
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />

                        {new Date(
                          log.timestamp
                        ).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">
                          Q.
                        </span>

                        <span className="text-gray-900 ml-2">
                          {log.question}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">
                          A.
                        </span>

                        <span className="text-gray-700 ml-2">
                          {log.answer}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                데이터 없음
              </div>
            )}
          </TabsContent>

          {/* 낮은 평가 */}
          <TabsContent value="low-rated">
            <div className="text-center py-12">
              <ThumbsDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />

              <p className="text-gray-500">
                낮은 평가 데이터가 없습니다.
              </p>
            </div>
          </TabsContent>

          {/* 카테고리 */}
          <TabsContent value="categories">
            <div className="text-center py-12 text-gray-500">
              카테고리 데이터 없음
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}