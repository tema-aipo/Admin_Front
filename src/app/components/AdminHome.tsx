import { useEffect, useState } from "react";
import { 
  Database, 
  Users, 
  MessageSquare, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Heart,
  CalendarDays
} from "lucide-react";

import type {
  IpoViewStats,
  SurgingStock,
  TopSurgingStock,
  FavoriteStock,
} from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

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

// API 스키마에 맞춘 공모주 통계 인터페이스 정의
interface IpoStatsResponse {
  viewStats: IpoViewStats;
  trendingIpos: Array<{
    ipoId: number;
    stockName: string;
    viewCount: number;
  }>;
  topFavoriteIpos: Array<{
    ipoId: number;
    stockName: string;
    favoriteCount: number;
  }>;
}

const defaultStats: DashboardStats = {
  users: { total: 0, active: 0, suspended: 0, withdrawn: 0, newLast7Days: 0 },
  chatbot: { totalMessages: 0, totalSessions: 0, todayMessages: 0, todaySessions: 0, weeklyMessages: 0, weeklyTokens: 0 },
  documents: { total: 0, processing: 0, failed: 0 },
  pipeline: { running: 0, failed: 0 },
};

const defaultIpoStats: IpoStatsResponse = {
  viewStats: { totalViews: 0, todayViews: 0, weeklyViews: 0 },
  trendingIpos: [],
  topFavoriteIpos: [],
};

export function AdminHome() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [ipoStats, setIpoStats] = useState<IpoStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 대시보드 및 공모주 통계 통합 조회
   */
  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 두 API를 병렬로 호출하여 성능 최적화
      const [statsRes, ipoRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/admin/dashboard/stats`, { method: "GET", headers }),
        fetch(`${BASE_URL}/api/v1/admin/dashboard/ipo-stats`, { method: "GET", headers })
      ]);

      if (!statsRes.ok || !ipoRes.ok) {
        throw new Error("데이터 로드 중 오류가 발생했습니다.");
      }

      const statsData: DashboardStats = await statsRes.json();
      const ipoData: IpoStatsResponse = await ipoRes.json();

      setDashboardStats(statsData);
      setIpoStats(ipoData);
    } catch (error) {
      console.error(error);
      alert("대시보드 통계 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const stats = dashboardStats ?? defaultStats;
  const ipoData = ipoStats ?? defaultIpoStats;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 animate-spin text-blue-500" />
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

      {/* 서비스 현황 타이틀 */}
      <div className="mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        <p className="font-semibold text-black">서비스 현황 통계</p>
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        
        {/* 사용자 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">사용자</h2>
            <Users className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">전체 회원</span>
              <span className="font-bold text-gray-900">{stats.users.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">활성 회원</span>
              <span className="font-bold text-green-600">{stats.users.active.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">정지 회원</span>
              <span className="font-bold text-red-500">{stats.users.suspended.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">탈퇴 회원</span>
              <span className="font-bold text-gray-700">{stats.users.withdrawn.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-sm">
              <span className="text-gray-600">최근 7일 가입</span>
              <span className="font-bold text-blue-600">+{stats.users.newLast7Days.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 챗봇 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">챗봇</h2>
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">전체 메시지</span>
              <span className="font-bold text-gray-900">{stats.chatbot.totalMessages.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">전체 세션</span>
              <span className="font-bold text-gray-900">{stats.chatbot.totalSessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">오늘 메시지</span>
              <span className="font-bold text-blue-600">{stats.chatbot.todayMessages.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">오늘 세션</span>
              <span className="font-bold text-green-600">{stats.chatbot.todaySessions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">주간 메시지</span>
              <span className="font-bold text-orange-600">{stats.chatbot.weeklyMessages.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-sm">
              <span className="text-gray-600">주간 토큰</span>
              <span className="font-bold text-purple-600">{stats.chatbot.weeklyTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 문서 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">문서 처리</h2>
            <Database className="w-5 h-5 text-green-600" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">전체 문서</span>
              <span className="font-bold text-gray-900">{stats.documents.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">처리중</span>
              <span className="font-bold text-yellow-500">{stats.documents.processing.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">실패</span>
              <span className="font-bold text-red-500">{stats.documents.failed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 파이프라인 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">파이프라인</h2>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">실행중</span>
              <span className="font-bold text-green-600">{stats.pipeline.running.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">실패</span>
              <span className="font-bold text-red-500">{stats.pipeline.failed.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 공모주 통계 섹션 타이틀 */}
      <div className="mb-5 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        <p className="font-semibold text-black">공모주 조회 통계</p>
      </div>

      {/* 하단 통계 그리드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 공모주 조회 상세 통계 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">공모주 조회 통계</h2>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">전체 조회 수</div>
              <div className="text-3xl font-bold text-blue-900">
                {ipoData.viewStats.totalViews.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-600">오늘 조회 수</span>
                <span className="text-lg font-semibold text-gray-900">
                  {ipoData.viewStats.todayViews.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-600">최근 7일 조회 수</span>
                <span className="font-medium text-gray-700">
                  {ipoData.viewStats.weeklyViews.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 조회 급증 종목 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">조회 급증 종목</h2>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          {ipoData.trendingIpos.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {ipoData.trendingIpos.map((item, idx) => (
                <li key={item.ipoId || idx} className="flex justify-between items-center py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-400 w-4">{idx + 1}</span>
                    <span className="text-gray-800 font-medium">{item.stockName}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{item.viewCount.toLocaleString()} 회 조회</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              데이터 없음
            </div>
          )}
        </div>

        {/* 관심 종목 Top 5 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">관심 종목 Top 5</h2>
            <Heart className="w-5 h-5 text-pink-500 fill-pink-50" />
          </div>
          {ipoData.topFavoriteIpos.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {ipoData.topFavoriteIpos.slice(0, 5).map((item, idx) => (
                <li key={item.ipoId || idx} className="flex justify-between items-center py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-pink-400 w-4">{idx + 1}</span>
                    <span className="text-gray-800 font-medium">{item.stockName}</span>
                  </div>
                  <span className="text-gray-500 text-xs">하트 {item.favoriteCount.toLocaleString()}개</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              데이터 없음
            </div>
          )}
        </div>

      </div>
    </div>
  );
}