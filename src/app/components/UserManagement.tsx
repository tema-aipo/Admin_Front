import { useState, useEffect } from "react";
import { Search, Trash2, AlertCircle, X } from "lucide-react";
import type { User } from "../../types";

const BASE_URL = "http://3.37.25.92:8080";

interface UserApiResponse {
  userId: number;
  loginId: string;
  userName: string;
  email: string;
  userStatus: "ACTIVE" | "INACTIVE" | "WITHDRAWN" | "SUSPENDED";
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

interface UserDetailResponse {
  userId: number;
  loginId: string;
  userName: string;
  email: string;
  role: "USER" | "ADMIN";
  userStatus: "ACTIVE" | "INACTIVE" | "WITHDRAWN" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  passwordUpdatedAt: string;
  deletedAt: string | null;
}

// 프론트엔드 내부 매핑용 타입 확장
interface ExtendedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  userStatus: "ACTIVE" | "INACTIVE" | "WITHDRAWN" | "SUSPENDED";
  createdAt: string;
  lastLoginAt: string;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ExtendedUser[]>([]); // 타입 변경
  const [loading, setLoading] = useState(true);

  /**
   * 상세조회 상태
   */
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * 상태 한글화 매핑
   */
  const statusMap = {
    ACTIVE: "활성",
    INACTIVE: "비활성",
    WITHDRAWN: "탈퇴",
    SUSPENDED: "정지",
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ko-KR");
  };

  /**
   * 사용자 목록 조회
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/admin/users?page=0&size=20`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("사용자 목록 조회 실패");
      }

      const data: UserListResponse = await response.json();

      /**
       * 백엔드 응답 → 프론트 타입 변환 (필터 제거 및 필드 추가)
       */
      const mappedUsers: ExtendedUser[] = data.content.map((user) => ({
        id: user.userId,
        name: user.userName,
        username: user.loginId,
        email: user.email,
        userStatus: user.userStatus,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error(error);
      alert("사용자 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * 사용자 상세 조회
   */
  const fetchUserDetail = async (userId: number) => {
    try {
      setDetailLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/v1/admin/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("사용자 상세 조회 실패");
      }

      const data: UserDetailResponse = await response.json();
      setSelectedUser(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("사용자 상세 조회에 실패했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 사용자 삭제
   */
  const handleDeleteUser = async (id: number, name: string) => {
    const confirmed = confirm(`정말 "${name}" 사용자를 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${BASE_URL}/api/v1/admin/users/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          userStatus: "WITHDRAWN",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error("사용자 삭제 실패");
      }

      await fetchUsers();
      alert("사용자가 삭제 처리되었습니다.");
    } catch (error) {
      console.error(error);
      alert("사용자 삭제에 실패했습니다.");
    }
  };

  /**
   * 검색 및 정렬
   */
  const filteredUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  /**
   * 아바타 색상
   */
  const getAvatarColor = (name: string) => {
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
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  /**
   * 로딩 화면
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">사용자 목록 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="사용자 이름 / 아이디 / 이메일 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">사용자</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">아이디</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">이메일</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">상태</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">가입일</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">마지막 로그인</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">작업</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => fetchUserDetail(user.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* 사용자 이름 및 아바타 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${getAvatarColor(
                          user.name
                        )} flex items-center justify-center text-white font-semibold`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>

                  {/* 아이디 */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">{user.username}</div>
                  </td>

                  {/* 이메일 */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>

                  {/* 상태 (추가됨) */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.userStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : user.userStatus === "SUSPENDED"
                          ? "bg-red-100 text-red-700"
                          : user.userStatus === "WITHDRAWN"
                          ? "bg-gray-100 text-gray-600 line-through"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {statusMap[user.userStatus]}
                    </span>
                  </td>

                  {/* 가입일 (추가됨) */}
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">{formatDate(user.createdAt)}</div>
                  </td>

                  {/* 마지막 로그인 (추가됨) */}
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">{formatDate(user.lastLoginAt)}</div>
                  </td>

                  {/* 작업(삭제버튼) */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id, user.name);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>삭제</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-1">
                    {searchQuery ? "검색 결과가 없습니다" : "등록된 사용자가 없습니다"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 상세조회 로딩 */}
      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg">사용자 정보를 불러오는 중...</div>
        </div>
      )}

      {/* 상세 모달 */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl ${getAvatarColor(
                    selectedUser.userName
                  )} flex items-center justify-center text-white text-xl font-bold`}
                >
                  {selectedUser.userName.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {selectedUser.userName}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedUser.userStatus === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : selectedUser.userStatus === "SUSPENDED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusMap[selectedUser.userStatus]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 font-mono">{selectedUser.loginId}</div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">
              {/* SUMMARY */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500">권한</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">{selectedUser.role}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500">이메일</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1 truncate">{selectedUser.email}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs text-gray-500">마지막 로그인</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(selectedUser.lastLoginAt)}
                  </div>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">가입일</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">수정일</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedUser.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">탈퇴일</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedUser.deletedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}