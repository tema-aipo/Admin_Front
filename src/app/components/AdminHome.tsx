import { useEffect, useState } from "react";
import { Database } from "lucide-react";

import type {
  IpoViewStats,
  SurgingStock,
  TopSurgingStock,
  FavoriteStock,
} from "../../types";

const BASE_URL =
  "http://3.37.25.92:8080";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    withdrawn: number;
    newLast7Days: number;
  };

  chatbot: {
    totalMessages: number;
    totalSessions: number;
    todayMessages: number;
    todaySessions: number;
    weeklyMessages: number;
    weeklyTokens: number;
  };

  documents: {
    total: number;
    processing: number;
    failed: number;
  };

  pipeline: {
    running: number;
    failed: number;
  };
}

const defaultStats: DashboardStats = {
  users: {
    total: 0,
    active: 0,
    suspended: 0,
    withdrawn: 0,
    newLast7Days: 0,
  },

  chatbot: {
    totalMessages: 0,
    totalSessions: 0,
    todayMessages: 0,
    todaySessions: 0,
    weeklyMessages: 0,
    weeklyTokens: 0,
  },

  documents: {
    total: 0,
    processing: 0,
    failed: 0,
  },

  pipeline: {
    running: 0,
    failed: 0,
  },
};

export function AdminHome() {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  // 공모주 조회 통계
  const [ipoViewStats] =
    useState<IpoViewStats>({
      totalViews: 0,
      todayViews: 0,
      yesterdayViews: 0,
      weeklyGrowth: 0,
    });

  const [surgingStocks] = useState<
    SurgingStock[]
  >([]);

  const [topSurgingStocks] =
    useState<TopSurgingStock[]>([]);

  const [favoriteStocks] = useState<
    FavoriteStock[]
  >([]);

  /**
   * 대시보드 통계 조회
   */
  const fetchDashboardStats =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "accessToken"
          );

        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(
          `${BASE_URL}/api/v1/admin/dashboard/stats`,
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
            "대시보드 통계 조회 실패"
          );
        }

        const data: DashboardStats =
          await response.json();

        setDashboardStats(data);
      } catch (error) {
        console.error(error);

        alert(
          "대시보드 통계 조회에 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats =
    dashboardStats ?? defaultStats;

  /**
   * 로딩
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">
          대시보드 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          서비스 대시보드
        </h1>
      </div>

      {/* 서비스 현황 */}
      <div className="mb-5">
        <p className="text-gray-600">
          서비스 현황 통계
        </p>
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* 사용자 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            사용자
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 회원
              </span>

              <span className="font-bold">
                {stats.users.total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                활성 회원
              </span>

              <span className="font-bold text-green-600">
                {stats.users.active.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                정지 회원
              </span>

              <span className="font-bold text-red-500">
                {stats.users.suspended.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                탈퇴 회원
              </span>

              <span className="font-bold">
                {stats.users.withdrawn.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">
                최근 7일 가입
              </span>

              <span className="font-bold text-blue-600">
                +
                {stats.users.newLast7Days.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 챗봇 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            챗봇
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 메시지
              </span>

              <span className="font-bold">
                {stats.chatbot.totalMessages.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 세션
              </span>

              <span className="font-bold">
                {stats.chatbot.totalSessions.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                오늘 메시지
              </span>

              <span className="font-bold text-blue-600">
                {stats.chatbot.todayMessages.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                오늘 세션
              </span>

              <span className="font-bold text-green-600">
                {stats.chatbot.todaySessions.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                주간 메시지
              </span>

              <span className="font-bold text-orange-600">
                {stats.chatbot.weeklyMessages.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">
                주간 토큰
              </span>

              <span className="font-bold text-purple-600">
                {stats.chatbot.weeklyTokens.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 문서 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              문서 처리
            </h2>
            <Database className="w-5 h-5 text-green-600" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 문서
              </span>

              <span className="font-bold">
                {stats.documents.total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                처리중
              </span>

              <span className="font-bold text-yellow-500">
                {stats.documents.processing.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                실패
              </span>

              <span className="font-bold text-red-500">
                {stats.documents.failed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 파이프라인 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            파이프라인
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                실행중
              </span>

              <span className="font-bold text-green-600">
                {stats.pipeline.running.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                실패
              </span>

              <span className="font-bold text-red-500">
                {stats.pipeline.failed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 공모주 조회 통계 */}
      <div className="mb-5">
        <p className="text-gray-600">
          공모주 조회 통계
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 공모주 조회 통계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            공모주 조회 통계
          </h2>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">
                전체 조회 수
              </div>

              <div className="text-3xl font-bold text-blue-900">
                {ipoViewStats.totalViews.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  오늘 조회 수
                </span>

                <span className="text-lg font-semibold text-gray-900">
                  {ipoViewStats.todayViews.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  최근 7일 조회 수
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {ipoViewStats.yesterdayViews.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 조회 급증 종목 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            조회 급증 종목
          </h2>

          <div className="text-center py-4 text-gray-500 text-sm">
            데이터 없음
          </div>
        </div>

        {/* 관심 종목 Top5 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            관심 종목 Top 5
          </h2>

          <div className="text-center py-8 text-gray-500">
            데이터 없음
          </div>
        </div>
      </div>
    </div>
  );
}