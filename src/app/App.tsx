import { useState } from "react";
import { Header } from "./components/Header";
import { AdminHome } from "./components/AdminHome";
import { UserManagement } from "./components/UserManagement";
import { DataManagement } from "./components/DataManagement";
import { ChatbotManagement } from "./components/ChatbotManagement";
import { AuthModal } from "./components/AuthModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handleAuthSuccess = (userData: {
    name: string;
    email: string;
  }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // 로그인되지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={handleAuthSuccess}
          mode="login"
        />
      </div>
    );
  }

  // 로그인 성공
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
        {activeTab === "chatbot-management" && (
          <ChatbotManagement />
        )}
      </main>
    </div>
  );
}