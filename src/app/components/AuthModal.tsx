import { useEffect, useState } from "react";
import { X, User as UserIcon, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string }) => void;
}

const BASE_URL =
  "https://oval-zigzagged-umbrella.ngrok-free.dev";

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
      setFormData({
        loginId: "",
        password: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // =========================
  // 로그인
  // =========================
  const handleLogin = async () => {
    const response = await fetch(
      `${BASE_URL}/api/v1/admin/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      throw new Error("로그인 실패");
    }

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    const token =
      data.accessToken ||
      data.data?.accessToken ||
      data.result?.accessToken;

    if (token) {
      localStorage.setItem("accessToken", token);
    }

    onSuccess({
      name: data.user?.name || data.userName || formData.loginId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await handleLogin();
      setFormData({ loginId: "", password: "" });
      onClose();
    } catch (error) {
      console.error(error);
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            관리자 로그인
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 아이디 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디
              </label>

              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={formData.loginId}
                  onChange={(e) =>
                    setFormData({ ...formData, loginId: e.target.value })
                  }
                  placeholder="아이디를 입력하세요"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
          >
            {loading ? "처리 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
