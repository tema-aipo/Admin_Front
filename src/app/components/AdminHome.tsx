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

import type { IpoViewStats } from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    withdrawn: number;
    newLast7Days: number;
  };
  chatbot: {
    totalMessages: number;
    totalSessions: number;
    todayMessages: number;
    todaySessions: number;
    weeklyMessages: number;
  };
  documents: {
    total: number;
    processing: number;
    failed: number;
  };
}

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
  users: { total: 0, active: 0, withdrawn: 0, newLast7Days: 0 },
  chatbot: { totalMessages: 0, totalSessions: 0, todayMessages: 0, todaySessions: 0, weeklyMessages: 0 },
  documents: { total: 0, processing: 0, failed: 0 },
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

      const [statsRes, ipoRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/admin/dashboard/stats`, { method: "GET", headers }),
        fetch(`${BASE_URL}/api/v1/admin/dashboard/ipo-stats`, { method: "GET", headers })
      ]);

      if (!statsRes.ok || !ipoRes.ok) {
        throw new Error("데이터 로드 중 오류가 발생했습니다.");
      }

      const statsData: DashboardStats = await statsRes.json();
      const ipoData: IpoStatsResponse = await ipoRes.json();
      //console.log("백엔드 수신 데이터 (stats):", statsData);

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

  // 문서 완료 수 계산
  const successDocs = Math.max(0, stats.documents.total - stats.documents.processing - stats.documents.failed);

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
    <div className="max-w-7xl mx-auto px-6 py-8">
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
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        
        {/* 사용자 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">사용자 현황</h2>
              <div className="p-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="mb-5">
              <span className="text-xs font-medium text-gray-500 block mb-1">전체 회원 수</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{stats.users.total.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-500">명</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4">
              <div className="bg-emerald-50 rounded-lg p-2 text-center">
                <span className="text-[11px] text-gray-600 block mb-0.5">활성 회원</span>
                <span className="text-sm font-bold text-emerald-600 truncate block">{stats.users.active.toLocaleString()}명</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <span className="text-[11px] text-gray-600 block mb-0.5">탈퇴 회원</span>
                <span className="text-sm font-bold text-gray-600 truncate block">{stats.users.withdrawn.toLocaleString()}명</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2.5 text-xs">
            <span className="text-blue-800 font-medium">최근 7일간 신규 가입</span>
            <span className="font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-100">
              +{stats.users.newLast7Days.toLocaleString()}명
            </span>
          </div>
        </div>

        {/* 챗봇 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">챗봇 활동 지표</h2>
              <div className="p-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 bg-purple-50 rounded-xl p-4">
              <div>
                <span className="text-[11px] font-medium text-purple-600 block mb-0.5">누적 메시지</span>
                <span className="text-xl font-extrabold text-gray-900">{stats.chatbot.totalMessages.toLocaleString()}</span>
              </div>
              <div className="border-l border-purple-300 pl-4">
                <span className="text-[11px] font-medium text-purple-600 block mb-0.5">누적 세션</span>
                <span className="text-xl font-extrabold text-gray-900">{stats.chatbot.totalSessions.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm p-1">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>오늘 메시지
                </span>
                <span className="font-bold text-gray-900">{stats.chatbot.todayMessages.toLocaleString()}건</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>오늘 세션
                </span>
                <span className="font-bold text-gray-900">{stats.chatbot.todaySessions.toLocaleString()}건</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>주간 메시지
                </span>
                <span className="font-bold text-gray-900">{stats.chatbot.weeklyMessages.toLocaleString()}건</span>
              </div>
            </div>
          </div>
        </div>

        {/* 문서 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">문서 처리 현황</h2>
              <div className="p-2">
                <Database className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* 메인 하이라이트 수치 */}
            <div className="mb-5">
              <span className="text-xs font-medium text-gray-500 block mb-1">전체 문서 수</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{stats.documents.total.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-500">건</span>
              </div>
            </div>

            {/* 게이지 바 디자인 영역 */}
            <div className="space-y-4 pt-4">
              {/* 정상 완료 게이지 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>정상 완료
                  </span>
                  <span className="text-gray-800">
                    {successDocs.toLocaleString()}건 ({stats.documents.total ? Math.round((successDocs / stats.documents.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.documents.total ? (successDocs / stats.documents.total) * 100 : 0}%` }} />
                </div>
              </div>

              {/* 처리중 게이지 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>처리 대기/중
                  </span>
                  <span className="text-gray-800">
                    {stats.documents.processing.toLocaleString()}건 ({stats.documents.total ? Math.round((stats.documents.processing / stats.documents.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.documents.total ? (stats.documents.processing / stats.documents.total) * 100 : 0}%` }} />
                </div>
              </div>

              {/* 실패 게이지 */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>처리 실패
                  </span>
                  <span className="text-gray-800">
                    {stats.documents.failed.toLocaleString()}건 ({stats.documents.total ? Math.round((stats.documents.failed / stats.documents.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.documents.total ? (stats.documents.failed / stats.documents.total) * 100 : 0}%` }} />
                </div>
              </div>
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

        {/* 인기 조회 종목 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">인기 조회 종목</h2>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          {ipoData.trendingIpos.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {ipoData.trendingIpos.map((item, idx) => (
                <li key={item.ipoId || idx} className="flex justify-between items-center py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-400 w-4">{idx + 1}</span>
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