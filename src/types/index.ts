/**
 * 사용자 관련 타입
 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

/**
 * 대시보드 통계 타입
 */
export interface DashboardData {
  dailyActiveUsers: DailyActiveUser[];
  weeklyActiveUsers: WeeklyActiveUser[];
  satisfactionRatio: SatisfactionRatio[];
  satisfactionTrend: SatisfactionTrend[];
  apiCallData: ApiCall[];
  apiUsageTrend: ApiUsage[];
  ragStockStats: RagStockStats;
  ipoViewStats: IpoViewStats;
  surgingStocks: SurgingStock[];
  topSurgingStocks: TopSurgingStock[];
  favoriteStocks: FavoriteStock[];
}

export interface DailyActiveUser {
  day: string;
  users: number;
}

export interface WeeklyActiveUser {
  week: string;
  users: number;
}

export interface SatisfactionRatio {
  name: string;
  value: number;
  color: string;
}

export interface SatisfactionTrend {
  date: string;
  satisfaction: number;
}

export interface ApiCall {
  time: string;
  calls: number;
}

export interface ApiUsage {
  date: string;
  calls: number;
}

export interface CategoryCount {
  category: string;
  count: number;
  color: string;
}

export interface RagStockStats {
  totalStocks: number;
  categoryCounts: CategoryCount[];
}

export interface IpoViewStats {
  totalViews: number;
  todayViews: number;
  weeklyViews: number;
}

export interface SurgingStock {
  time: string;
  views: number;
  name: string;
}

export interface TopSurgingStock {
  name: string;
  code: string;
  views: number;
  growth: string;
}

export interface FavoriteStock {
  rank: number;
  name: string;
  code: string;
  count: number;
  change: string;
}

/**
 * 데이터 관리 관련 타입
 */
export interface APIStatus {
  id: number;
  name: string;
  type: string;
  status: "success" | "failed" | "running";
  lastRun: string;
  successRate: number;
}

export interface RAGDocument {
  id: number;
  fileName: string;
  uploadDate: string;
  status: "completed" | "processing" | "failed";
  embeddingCount: number;
}

export interface AttractionWeight {
  id: number;
  factor: string;
  weight: number;
  description: string;
}

export interface ReferenceDocument {
  id: number;
  title: string;
  version: string;
  lastUpdate: string;
  category: string;
}

export interface IPOSchedule {
  updateInterval: number;
  lastUpdate: string;
}

/**
 * 챗봇 관련 타입
 */
export interface ConversationLog {
  id: number;
  userId: string;
  question: string;
  answer: string;
  timestamp: string;
  rating: "like" | "dislike";
  category: string;
}

export interface QuestionCategory {
  category: string;
  count: number;
  color: string;
}

export interface ChatbotStats {
  totalConversations: number;
  likes: number;
  dislikes: number;
  satisfaction: number;
}

/**
 * 인증 관련 타입
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    name: string;
    email: string;
  };
  token?: string;
}
