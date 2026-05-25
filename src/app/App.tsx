import { useEffect, useState } from "react";

import { Header } from "./components/Header";

import { AdminHome } from "./components/AdminHome";

import { UserManagement } from "./components/UserManagement";

import { DataManagement } from "./components/DataManagement";

import { ChatbotManagement } from "./components/ChatbotManagement";

import { AuthModal } from "./components/AuthModal";

const BASE_URL =
  "http://3.37.25.92:8080";

function App() {
  const [activeTab, setActiveTab] =
    useState("home");

  const [user, setUser] =
    useState<{
      name: string;
    } | null>(null);

  const [loading, setLoading] =
    useState(true);

  /**
   * 로그인 유지
   * sessionStorage 사용
   */
  useEffect(() => {
    const token =
      sessionStorage.getItem(
        "accessToken"
      );

    const savedUser =
      sessionStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  /**
   * 로그인 성공
   */
  const handleAuthSuccess = (
    userData: {
      name: string;
    }
  ) => {
    setUser(userData);

    /**
     * 유저 정보 저장
     */
    sessionStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
  };

  /**
   * 로그아웃
   */
  const handleLogout = async () => {
    try {
      const accessToken =
        sessionStorage.getItem(
          "accessToken"
        );

      await fetch(
        `${BASE_URL}/api/v1/admin/auth/logout`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    } finally {
      /**
       * 프론트 인증 제거
       */
      sessionStorage.removeItem(
        "accessToken"
      );

      sessionStorage.removeItem(
        "refreshToken"
      );

      sessionStorage.removeItem("user");

      setUser(null);
    }
  };

  /**
   * 로딩
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  /**
   * 로그인 안 된 상태
   */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={
            handleAuthSuccess
          }
        />
      </div>
    );
  }

  /**
   * 로그인 후
   */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogoClick={() =>
          setActiveTab("home")
        }
        onLogout={handleLogout}
        user={user}
      />

      <main className="py-8">
        {activeTab === "home" && (
          <AdminHome />
        )}

        {activeTab ===
          "user-management" && (
          <UserManagement />
        )}

        {activeTab ===
          "data-management" && (
          <DataManagement />
        )}

        {activeTab ===
          "chatbot-management" && (
          <ChatbotManagement />
        )}
      </main>
    </div>
  );
}

export default App;