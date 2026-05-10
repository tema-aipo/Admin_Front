import { useEffect, useState } from "react";
import { Database } from "lucide-react";

import type {
  IpoViewStats,
  SurgingStock,
  TopSurgingStock,
  FavoriteStock,
} from "../../types";

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

export function AdminHome() {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(false);

  // 공모주 조회 통계 (기존 유지)
  const [ipoViewStats] = useState<IpoViewStats>({
    totalViews: 0,
    todayViews: 0,
    yesterdayViews: 0,
    weeklyGrowth: 0,
  });

  const [surgingStocks] = useState<SurgingStock[]>([]);
  const [topSurgingStocks] = useState<TopSurgingStock[]>([]);
  const [favoriteStocks] = useState<FavoriteStock[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/v1/admin/dashboard/stats"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch dashboard stats"
          );
        }

        const data = await response.json();

        setDashboardStats(data);
      } catch (error) {
        console.error(
          "Failed to fetch dashboard stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        불러오는 중...
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
        {/* 사용자 통계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            사용자
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 회원
              </span>
              <span className="font-bold">
                {dashboardStats?.users.total.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                활성 회원
              </span>
              <span className="font-bold text-green-600">
                {dashboardStats?.users.active.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                정지 회원
              </span>
              <span className="font-bold text-red-500">
                {dashboardStats?.users.suspended.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                탈퇴 회원
              </span>
              <span className="font-bold">
                {dashboardStats?.users.withdrawn.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">
                최근 7일 가입
              </span>
              <span className="font-bold text-blue-600">
                +
                {dashboardStats?.users.newLast7Days.toLocaleString() ??
                  0}
              </span>
            </div>
          </div>
        </div>

        {/* 챗봇 통계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            챗봇
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 메시지
              </span>
              <span className="font-bold">
                {dashboardStats?.chatbot.totalMessages.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                전체 세션
              </span>
              <span className="font-bold">
                {dashboardStats?.chatbot.totalSessions.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                오늘 메시지
              </span>
              <span className="font-bold text-blue-600">
                {dashboardStats?.chatbot.todayMessages.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                오늘 세션
              </span>
              <span className="font-bold text-green-600">
                {dashboardStats?.chatbot.todaySessions.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                주간 메시지
              </span>
              <span className="font-bold text-orange-600">
                {dashboardStats?.chatbot.weeklyMessages.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">
                주간 토큰
              </span>
              <span className="font-bold text-purple-600">
                {dashboardStats?.chatbot.weeklyTokens.toLocaleString() ??
                  0}
              </span>
            </div>
          </div>
        </div>

        {/* 문서 통계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                {dashboardStats?.documents.total.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                처리중
              </span>
              <span className="font-bold text-yellow-500">
                {dashboardStats?.documents.processing.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                실패
              </span>
              <span className="font-bold text-red-500">
                {dashboardStats?.documents.failed.toLocaleString() ??
                  0}
              </span>
            </div>
          </div>
        </div>

        {/* 파이프라인 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            파이프라인
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">
                실행중
              </span>
              <span className="font-bold text-green-600">
                {dashboardStats?.pipeline.running.toLocaleString() ??
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                실패
              </span>
              <span className="font-bold text-red-500">
                {dashboardStats?.pipeline.failed.toLocaleString() ??
                  0}
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
                  오늘 조회
                </span>

                <span className="text-lg font-semibold text-gray-900">
                  {ipoViewStats.todayViews.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">
                  어제 조회
                </span>

                <span className="text-sm font-medium text-gray-700">
                  {ipoViewStats.yesterdayViews.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">
                  주간 성장률
                </span>

                <span className="text-sm font-semibold text-green-600">
                  +{ipoViewStats.weeklyGrowth}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 조회 급증 종목 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            조회 급증 종목 (최근 1시간)
          </h2>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              급증 Top 3
            </div>

            {topSurgingStocks.length > 0 ? (
              topSurgingStocks.map((stock) => (
                <div
                  key={stock.code}
                  className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stock.name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {stock.code}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {stock.views}회
                    </div>

                    <div className="text-xs font-medium text-red-600">
                      {stock.growth}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                데이터 없음
              </div>
            )}
          </div>
        </div>

        {/* 관심 종목 Top5 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            관심 종목 Top 5
          </h2>

          <div className="space-y-1">
            {favoriteStocks.length > 0 ? (
              favoriteStocks
                .slice(0, 5)
                .map((stock) => (
                  <div
                    key={stock.code}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
                      stock.rank < 4
                        ? "bg-yellow-50"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        stock.rank === 1
                          ? "bg-yellow-400 text-white"
                          : stock.rank === 2
                            ? "bg-gray-300 text-white"
                            : stock.rank === 3
                              ? "bg-amber-600 text-white"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {stock.rank}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {stock.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {stock.code}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {stock.count.toLocaleString()}
                      </div>

                      <div
                        className={`text-xs font-medium ${
                          stock.change.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                데이터 없음
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}