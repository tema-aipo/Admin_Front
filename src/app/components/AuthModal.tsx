import { useEffect, useState } from "react";
import { X, User as UserIcon, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string }) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ loginId: "", password: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // =========================
  // 🔥 임시 로그인 (API 없음)
  // =========================
  const handleLogin = async () => {
    setLoading(true);

    await new Promise((res) => setTimeout(res, 300)); // 로딩 효과

    const fakeUser = {
      name: formData.loginId || "테스트 관리자",
    };

    localStorage.setItem("accessToken", "fake-token");
    localStorage.setItem("user", JSON.stringify(fakeUser));

    onSuccess(fakeUser);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleLogin();
      onClose();
    } catch (error) {
      alert("로그인 실패");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            관리자 로그인 (임시)
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 아이디 */}
            <div>
              <label className="block text-sm mb-2">아이디</label>

              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={formData.loginId}
                  onChange={(e) =>
                    setFormData({ ...formData, loginId: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  placeholder="아이디"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm mb-2">비밀번호</label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  placeholder="비밀번호"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}