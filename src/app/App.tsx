import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { AdminHome } from "./components/AdminHome";
import { UserManagement } from "./components/UserManagement";
import { DataManagement } from "./components/DataManagement";
import { ChatbotManagement } from "./components/ChatbotManagement";
import { AuthModal } from "./components/AuthModal";

const BASE_URL = "http://3.37.25.92:8080";

interface User {
  name: string;
}

function App() {
  // 1. 초기 탭 지연 초기화
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeTab") || "home";
  });

  // 2. 초기 유저 및 로딩 상태 지연 초기화
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    return token && savedUser ? JSON.parse(savedUser) : null;
  });

  // 초기 렌더링 시 user가 이미 있다면 loading을 바로 false로 시작하게 유도
  const [loading, setLoading] = useState(() => !user);

  /**
   * [개선] 초기 로딩 및 토큰 검증 1회성 실행
   */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // 토큰이 유효하지 않거나 없으면 완전히 청소
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
    setLoading(false);
  }, []);

  /**
   * 탭 변경 시 localStorage 동기화
   */
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  /**
   * 로그인 성공 핸들러
   */
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // 💡 로그인 성공 시, 기존에 저장되어 있던 이전 탭으로 가거나 기본 home으로 지정
    const currentTab = localStorage.getItem("activeTab") || "home";
    setActiveTab(currentTab);
  };

  /**
   * 로그아웃
   */
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        await fetch(`${BASE_URL}/api/v1/admin/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      /**
       * 로컬 저장소 완전 청소
       */
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("activeTab");

      sessionStorage.clear();

      setUser(null);
      setActiveTab("home");
    }
  };

  /**
   * 로딩 중 화면
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        로딩 중...
      </div>
    );
  }

  /**
   * 로그인 안 된 상태 -> 로그인 모달 표시
   */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  /**
   * 로그인 완료 후 메인 대시보드 화면
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogoClick={() => setActiveTab("home")}
        onLogout={handleLogout}
        user={user}
      />

      <main className="py-8">
        {activeTab === "home" && <AdminHome />}
        {activeTab === "user-management" && <UserManagement />}
        {activeTab === "data-management" && <DataManagement />}
        {activeTab === "chatbot-management" && <ChatbotManagement />}
      </main>
    </div>
  );
}

export default App;