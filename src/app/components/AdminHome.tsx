import { useState, useEffect } from "react";
import { Database } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import type {
  DailyActiveUser,
  WeeklyActiveUser,
  SatisfactionRatio,
  SatisfactionTrend,
  ApiCall,
  ApiUsage,
  RagStockStats,
  IpoViewStats,
  SurgingStock,
  TopSurgingStock,
  FavoriteStock,
} from "../../types";

export function AdminHome() {
  
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUser[]>([]);
  const [weeklyActiveUsers, setWeeklyActiveUsers] = useState<WeeklyActiveUser[]>([]);
  const [satisfactionRatio, setSatisfactionRatio] = useState<SatisfactionRatio[]>([]);
  const [satisfactionTrend, setSatisfactionTrend] = useState<SatisfactionTrend[]>([]);
  const [apiCallData, setApiCallData] = useState<ApiCall[]>([]);
  const [apiUsageTrend, setApiUsageTrend] = useState<ApiUsage[]>([]);
  const [ragStockStats, setRagStockStats] = useState<RagStockStats>({
    totalStocks: 0,
    categoryCounts: [],
  });
  const [ipoViewStats, setIpoViewStats] = useState<IpoViewStats>({
    totalViews: 0,
    todayViews: 0,
    yesterdayViews: 0,
    weeklyGrowth: 0,
  });
  const [surgingStocks, setSurgingStocks] = useState<SurgingStock[]>([]);
  const [topSurgingStocks, setTopSurgingStocks] = useState<TopSurgingStock[]>([]);
  const [favoriteStocks, setFavoriteStocks] = useState<FavoriteStock[]>([]);

  // TODO: API 연동 - 데이터 로드
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const response = await fetch('/api/admin/dashboard');
  //       const data = await response.json();
  //       setDailyActiveUsers(data.dailyActiveUsers);
  //       setWeeklyActiveUsers(data.weeklyActiveUsers);
  //       setSatisfactionRatio(data.satisfactionRatio);
  //       setSatisfactionTrend(data.satisfactionTrend);
  //       setApiCallData(data.apiCallData);
  //       setApiUsageTrend(data.apiUsageTrend);
  //       setRagStockStats(data.ragStockStats);
  //       setIpoViewStats(data.ipoViewStats);
  //       setSurgingStocks(data.surgingStocks);
  //       setTopSurgingStocks(data.topSurgingStocks);
  //       setFavoriteStocks(data.favoriteStocks);
  //     } catch (error) {
  //       console.error('Failed to fetch dashboard data:', error);
  //     }
  //   };
  //   fetchDashboardData();
  // }, []);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          서비스 대시보드
        </h1>
      </div>
      <div className="mb-5">
        <p className="text-gray-600">서비스 현황 통계</p>
      </div>
      {/* 활성 사용자 차트 - 통합 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            활성 사용자 수
          </h2>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="daily">일간</TabsTrigger>
              <TabsTrigger value="weekly">주간</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              {dailyActiveUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="users"
                      fill="#3b82f6"
                      name="활성 사용자"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
            <TabsContent value="weekly">
              {weeklyActiveUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weeklyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="활성 사용자"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 챗봇 만족도 차트 - 통합 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            챗봇 만족도 통계
          </h2>
          <Tabs defaultValue="ratio" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="ratio">비율</TabsTrigger>
              <TabsTrigger value="trend">추이</TabsTrigger>
            </TabsList>
            <TabsContent value="ratio">
              {satisfactionRatio.length > 0 ? (
                <>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer
                      width="100%"
                      height={240}
                    >
                      <PieChart>
                        <Pie
                          data={satisfactionRatio}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
            
                          label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {satisfactionRatio.map((entry) => (
                            <Cell
                              key={`cell-${entry.name}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">
                        좋아요:{" "}
                        {satisfactionRatio[0]?.value || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">
                        싫어요:{" "}
                        {satisfactionRatio[1]?.value || 0}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
            <TabsContent value="trend">
              {satisfactionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={satisfactionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[85, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="만족도 (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* API 호출량 차트 - 통합 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            외부 API 호출량
          </h2>
          <Tabs defaultValue="hourly" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="hourly">시간대별</TabsTrigger>
              <TabsTrigger value="daily">일별</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly">
              {apiCallData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={apiCallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="calls"
                      fill="#f97316"
                      name="API 호출 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
            <TabsContent value="daily">
              {apiUsageTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={apiUsageTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="API 호출 수"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  데이터 없음
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* RAG 데이터베이스 종목 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              RAG 데이터베이스 종목 통계
            </h2>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {ragStockStats.totalStocks.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">
                종목
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {ragStockStats.categoryCounts.length > 0 ? (
              ragStockStats.categoryCounts.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {category.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(category.count / ragStockStats.totalStocks) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    ></div>
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
      <div className="mb-5">
        <p className="text-gray-600">공모주 조회 통계</p>
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

        {/* 조회 급증 종목 실시간 차트 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            조회 급증 종목 (최근 1시간)
          </h2>

          <div className="mb-4">
            {surgingStocks.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={surgingStocks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="조회수"
                    dot={{ fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                데이터 없음
              </div>
            )}
          </div>

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

        {/* 관심 종목 Top 5 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            관심 종목 Top 5
          </h2>
          <div className="space-y-1">
            {favoriteStocks.length > 0 ? (
              favoriteStocks.slice(0, 5).map((stock) => (
                <div
                  key={stock.code}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    stock.rank < 4 ? "bg-yellow-50" : ""
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