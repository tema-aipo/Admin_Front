import { LogOut } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoClick: () => void;
  onLogout: () => void;

  user: {
    name: string;
  } | null;
}

export function Header({
  activeTab,
  onTabChange,
  onLogoClick,
  onLogout,
  user,
}: HeaderProps) {
  const tabs = [
    { id: "home", label: "홈" },
    { id: "user-management", label: "사용자 관리" },
    { id: "data-management", label: "데이터 관리" },
    { id: "chatbot-management", label: "챗봇 관리" },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Left - Logo and Navigation */}
          <div className="flex items-center">
            <button
              onClick={onLogoClick}
              className="text-2xl font-bold text-gray-900 mr-12 py-5 hover:text-blue-600 transition-colors"
            >
              APIO ADMIN
            </button>

            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-6 py-5 text-[15px] font-semibold relative transition-colors ${
                    activeTab === tab.id
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}

                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right - Auth */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-gray-700 font-medium">
                  {user.name}님
                </span>

                <button
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />

                  <span className="text-sm font-medium">
                    로그아웃
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}