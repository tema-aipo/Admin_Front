import { useState } from "react";
import { X, User as UserIcon, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  mode: "login" | "signup" | "delete";
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
  onDelete?: () => void;
  currentUser?: { name: string; email: string } | null;
}

export function AuthModal({ isOpen, mode, onClose, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: API 연동 - 로그인 인증
    // try {
    //   const response = await fetch('/api/admin/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username: formData.username, password: formData.password })
    //   });
    //   if (response.ok) {
    //     const data = await response.json();
    //     onSuccess(data.user);
    //     setFormData({ username: "", password: "" });
    //   } else {
    //     alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    //   }
    // } catch (error) {
    //   console.error('Login failed:', error);
    //   alert('로그인에 실패했습니다.');
    // }

    // 임시 하드코딩된 인증 (root/root)
    if (formData.username === "root" && formData.password === "root") {
      onSuccess({ name: "관리자", email: "admin@root.com" });
      setFormData({ username: "", password: "" });
    } else {
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">관리자 로그인</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="아이디를 입력하세요"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}