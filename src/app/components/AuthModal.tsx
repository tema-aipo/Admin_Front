import { useEffect, useState } from "react";

import {
  X,
  User as UserIcon,
  Lock,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;

  onClose: () => void;

  onSuccess: (user: {
    name: string;
  }) => void;
}

const BASE_URL =
  "http://3.37.25.92:8080";

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [formData, setFormData] =
    useState({
      loginId: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        loginId: "",
        password: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /**
   * 쿠키 삭제
   */
  const clearCookies = () => {
    document.cookie
      .split(";")
      .forEach((cookie) => {
        document.cookie =
          cookie
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              `=;expires=${new Date(
                0
              ).toUTCString()};path=/`
            );
      });
  };

  /**
   * 로그인
   */
  const handleLogin = async () => {
    /**
     * 기존 인증 제거
     */
    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    localStorage.removeItem("user");

    sessionStorage.clear();

    clearCookies();

    const response = await fetch(
      `${BASE_URL}/api/v1/admin/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          loginId:
            formData.loginId.trim(),

          password:
            formData.password,
        }),
      }
    );

    console.log(
      "STATUS:",
      response.status
    );

    const rawText =
      await response.text();

    console.log("RAW:", rawText);

    let data: any = {};

    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error(
        "JSON 파싱 실패:",
        error
      );
    }

    /**
     * 로그인 실패
     */
    if (!response.ok) {
      console.error(
        "LOGIN ERROR:",
        data
      );

      throw new Error(
        data?.message ||
          `서버 오류 (${response.status})`
      );
    }

    console.log(
      "LOGIN SUCCESS:",
      data
    );

    /**
     * 토큰 저장
     */
    if (data.accessToken) {
      localStorage.setItem(
        "accessToken",
        data.accessToken
      );
    }

    if (data.refreshToken) {
      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );
    }

    /**
     * 사용자 저장
     */
    const userData = {
      name:
        data.userName ||
        formData.loginId,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    /**
     * 로그인 성공
     */
    onSuccess(userData);
  };

  /**
   * 제출
   */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await handleLogin();

      setFormData({
        loginId: "",
        password: "",
      });

      onClose();
    } catch (error) {
      console.error(
        "LOGIN FAILED:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("로그인 실패");
      }
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
        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
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
                    setFormData({
                      ...formData,
                      loginId:
                        e.target.value,
                    })
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
                    setFormData({
                      ...formData,
                      password:
                        e.target.value,
                    })
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
            {loading
              ? "처리 중..."
              : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}