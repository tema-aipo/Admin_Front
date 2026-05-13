import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { AdminHome } from "./components/AdminHome";
import { UserManagement } from "./components/UserManagement";
import { DataManagement } from "./components/DataManagement";
import { ChatbotManagement } from "./components/ChatbotManagement";
import { AuthModal } from "./components/AuthModal";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  const [user, setUser] = useState<{ name: string } | null>(null);

  // 새로고침 시 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 로그인 성공
  const handleAuthSuccess = (userData: { name: string }) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 로그아웃
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  // 로그인 안 된 상태
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

  // 로그인 성공 후
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
