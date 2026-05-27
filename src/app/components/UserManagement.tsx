import { useState, useEffect } from "react";

import {
  Search,
  AlertCircle,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

const BASE_URL = "http://3.37.25.92:8080";

interface UserApiResponse {
  userId: number;
  loginId: string;
  userName: string;
  email: string;
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

interface UserDetailResponse {
  userId: number;
  loginId: string;
  userName: string;
  email: string;
  role: "USER" | "ADMIN";
  userStatus:
    | "ACTIVE"
    | "INACTIVE"
    | "WITHDRAWN"
    | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  passwordUpdatedAt: string;
  deletedAt: string | null;
}

interface ExtendedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  userStatus:
    | "ACTIVE"
    | "INACTIVE"
    | "WITHDRAWN"
    | "SUSPENDED";
  createdAt: string;
  lastLoginAt: string;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [users, setUsers] =
    useState<ExtendedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * 프론트 페이징
   */
  const [currentPage, setCurrentPage] =
    useState(0);

  const PAGE_SIZE = 10;

  const [selectedUser, setSelectedUser] =
    useState<UserDetailResponse | null>(
      null
    );

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const statusMap = {
    ACTIVE: "활성",
    INACTIVE: "비활성",
    WITHDRAWN: "탈퇴",
    SUSPENDED: "정지",
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString("ko-KR");
  };

  /**
   * 사용자 목록 조회
   *
   * 전체 조회 후
   * 프론트 검색 + 프론트 페이징
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      /**
       * 전체 조회
       */
      const response = await fetch(
        `${BASE_URL}/api/v1/admin/users?page=0&size=10000`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
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

      const mappedUsers: ExtendedUser[] =
        data.content.map((user) => ({
          id: user.userId,
          name: user.userName,
          username: user.loginId,
          email: user.email,
          userStatus:
            user.userStatus,
          createdAt:
            user.createdAt,
          lastLoginAt:
            user.lastLoginAt,
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
   * 검색 시 첫 페이지 이동
   */
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  /**
   * 페이지 변경
   */
  const handlePageChange = (
    newPage: number
  ) => {
    if (newPage < 0) return;

    if (
      newPage >= totalPages
    )
      return;

    setCurrentPage(newPage);
  };

  /**
   * 사용자 상세 조회
   */
  const fetchUserDetail = async (
    userId: number
  ) => {
    try {
      setDetailLoading(true);

      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/v1/admin/users/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "사용자 상세 조회 실패"
        );
      }

      const data: UserDetailResponse =
        await response.json();

      setSelectedUser(data);

      setIsModalOpen(true);
    } catch (error) {
      console.error(error);

      alert(
        "사용자 상세 조회에 실패했습니다."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 검색 + 정렬
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
          ) ||
        user.email
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    )
    .sort((a, b) => {
      const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
      const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
      return dateB - dateA; // 최신순 정렬
    });

  /**
   * 전체 페이지 수
   */
  const totalPages = Math.ceil(
    filteredUsers.length /
      PAGE_SIZE
  );

  /**
   * 현재 페이지 사용자
   */
  const paginatedUsers =
    filteredUsers.slice(
      currentPage * PAGE_SIZE,
      currentPage * PAGE_SIZE +
        PAGE_SIZE
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
      name.charCodeAt(0) %
      colors.length;

    return colors[index];
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          사용자 관리
        </h1>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="사용자 이름 / 아이디 / 이메일 검색"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                사용자
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                아이디
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                이메일
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                가입일
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">
                마지막 로그인
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.length >
            0 ? (
              paginatedUsers.map(
                (user) => (
                  <tr
                    key={user.id}
                    onClick={() =>
                      fetchUserDetail(
                        user.id
                      )
                    }
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* 사용자 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${getAvatarColor(
                            user.name
                          )} flex items-center justify-center text-white font-semibold`}
                        >
                          {user.name.charAt(
                            0
                          )}
                        </div>

                        <div className="text-sm font-medium text-gray-900">
                          {
                            user.name
                          }
                        </div>
                      </div>
                    </td>

                    {/* 아이디 */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">
                        {
                          user.username
                        }
                      </div>
                    </td>

                    {/* 이메일 */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {
                          user.email
                        }
                      </div>
                    </td>

                    {/* 가입일 */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        {formatDate(
                          user.createdAt
                        )}
                      </div>
                    </td>

                    {/* 마지막 로그인 */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        {formatDate(
                          user.lastLoginAt
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={5}
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

        {/* 페이징 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-b-xl">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                총{" "}
                <span className="font-medium">
                  {
                    filteredUsers.length
                  }
                </span>
                명 중{" "}
                <span className="font-medium">
                  {currentPage +
                    1}
                </span>
                페이지
              </p>

              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                {/* 첫 페이지 */}
                <button
                  onClick={() =>
                    handlePageChange(
                      0
                    )
                  }
                  disabled={
                    currentPage ===
                    0
                  }
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* 이전 */}
                <button
                  onClick={() =>
                    handlePageChange(
                      currentPage -
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    0
                  }
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* 페이지 번호 */}
                {(() => {
                  let startPage =
                    Math.max(
                      0,
                      currentPage -
                        1
                    );

                  let endPage =
                    Math.min(
                      totalPages -
                        1,
                      currentPage +
                        1
                    );

                  if (
                    currentPage ===
                    0
                  ) {
                    endPage =
                      Math.min(
                        2,
                        totalPages -
                          1
                      );
                  }

                  if (
                    currentPage ===
                    totalPages - 1
                  ) {
                    startPage =
                      Math.max(
                        0,
                        totalPages -
                          3
                      );
                  }

                  return Array.from(
                    {
                      length:
                        endPage -
                        startPage +
                        1,
                    },
                    (_, i) =>
                      startPage +
                      i
                  ).map(
                    (
                      pageIdx
                    ) => (
                      <button
                        key={
                          pageIdx
                        }
                        onClick={() =>
                          handlePageChange(
                            pageIdx
                          )
                        }
                        className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                          currentPage ===
                          pageIdx
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageIdx +
                          1}
                      </button>
                    )
                  );
                })()}

                {/* 다음 */}
                <button
                  onClick={() =>
                    handlePageChange(
                      currentPage +
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages -
                      1
                  }
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* 마지막 */}
                <button
                  onClick={() =>
                    handlePageChange(
                      totalPages -
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages -
                      1
                  }
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {isModalOpen &&
        selectedUser && (
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
                    {selectedUser.userName.charAt(
                      0
                    )}
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {
                        selectedUser.userName
                      }

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedUser.userStatus ===
                          "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : selectedUser.userStatus ===
                              "SUSPENDED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {
                          statusMap[
                            selectedUser.userStatus
                          ]
                        }
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 font-mono">
                      {
                        selectedUser.loginId
                      }
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setIsModalOpen(
                      false
                    )
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500">
                      권한
                    </div>

                    <div className="text-sm font-semibold text-gray-800 mt-1">
                      {
                        selectedUser.role
                      }
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500">
                      이메일
                    </div>

                    <div className="text-sm font-semibold text-gray-800 mt-1 truncate">
                      {
                        selectedUser.email
                      }
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500">
                      마지막 로그인
                    </div>

                    <div className="text-sm font-semibold text-gray-800 mt-1">
                      {formatDate(
                        selectedUser.lastLoginAt
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      가입일
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatDate(
                        selectedUser.createdAt
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      수정일
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatDate(
                        selectedUser.updatedAt
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      탈퇴일
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatDate(
                        selectedUser.deletedAt
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}