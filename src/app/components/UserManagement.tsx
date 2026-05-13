import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  AlertCircle,
} from "lucide-react";

import type { User } from "../../types";

const API_BASE_URL =
  "https://oval-zigzagged-umbrella.ngrok-free.dev";

interface UserApiResponse {
  userId: number;
  loginId: string;
  userName: string;

  userStatus:
    | "ACTIVE"
    | "INACTIVE"
    | "WITHDRAWN"
    | "SUSPENDED";

  createdAt: string;
  lastLoginAt: string;
}

interface UserListResponse {
  content: UserApiResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [users, setUsers] = useState<User[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  /**
   * 사용자 목록 조회
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("accessToken");

      console.log("TOKEN:", token);

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/users?page=0&size=20`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            "ngrok-skip-browser-warning":
              "69420",
          },
        }
      );

      console.log(
        "USER API STATUS:",
        response.status
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "사용자 목록 조회 실패"
        );
      }

      const data: UserListResponse =
        await response.json();

      console.log("USER DATA:", data);

      /**
       * 백엔드 응답 → 프론트 User 타입 변환
       */
      const mappedUsers: User[] =
        data.content
          .filter(
            (user) =>
              user.userStatus === "ACTIVE"
          )
          .map((user) => ({
            id: user.userId,
            name: user.userName,
            username: user.loginId,
          }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error(error);

      alert(
        "사용자 목록 조회에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * 사용자 삭제
   */
  const handleDeleteUser = async (
    id: number,
    name: string
  ) => {
    const confirmed = confirm(
      `정말 "${name}" 사용자를 삭제하시겠습니까?`
    );

    if (!confirmed) return;

    try {
      const token =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/${id}/status`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            "ngrok-skip-browser-warning":
              "69420",
          },

          body: JSON.stringify({
            userStatus: "WITHDRAWN",
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "사용자 삭제 실패"
        );
      }

      await fetchUsers();

      alert(
        "사용자가 삭제 처리되었습니다."
      );
    } catch (error) {
      console.error(error);

      alert("사용자 삭제에 실패했습니다.");
    }
  };

  /**
   * 검색
   */
  const filteredUsers = users
    .filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        user.username
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );

  /**
   * 아바타 색상
   */
  const getAvatarColor = (
    name: string
  ) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];

    const index =
      name.charCodeAt(0) % colors.length;

    return colors[index];
  };

  /**
   * 로딩
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">
          사용자 목록 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          사용자 관리
        </h1>

        <p className="text-gray-500">
          전체 사용자 목록을 관리할 수 있습니다.
        </p>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="사용자 이름 또는 아이디 검색"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                사용자
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                아이디
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                작업
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(
                          user.name
                        )} flex items-center justify-center text-white font-semibold`}
                      >
                        {user.name.charAt(0)}
                      </div>

                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">
                      {user.username}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        handleDeleteUser(
                          user.id,
                          user.name
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />

                      <span>삭제</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-16 text-center"
                >
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  <p className="text-gray-500 text-lg font-medium mb-1">
                    {searchQuery
                      ? "검색 결과가 없습니다"
                      : "등록된 사용자가 없습니다"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}