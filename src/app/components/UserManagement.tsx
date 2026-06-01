import { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
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
  const [searchQuery, setSearchQuery] = useState("");
  // 백엔드에서 가져온 전체 원본 데이터를 저장할 상태
  const [allUsers, setAllUsers] = useState<UserApiResponse[]>([]);
  // 현재 페이지에 보여줄 10명의 데이터만 저장할 상태
  const [displayedUsers, setDisplayedUsers] = useState<UserApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 10; // 한 페이지에 보여줄 개수

  const formatDate = (date?: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ko-KR");
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      let url = `${BASE_URL}/api/v1/admin/users?page=0&size=10000`;
      
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await fetch(url, {
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

      // 받아온 전체 데이터를 마지막 로그인순(최신순)으로 정렬
      const sortedData = [...data.content].sort((a, b) => {
        const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return dateB - dateA; // 내림차순 정렬
      });

      setAllUsers(sortedData);
      setCurrentPage(0); // 검색어가 바뀌거나 새로 고쳐지면 1페이지(인덱스 0)로 초기화
    } catch (error) {
      console.error(error);
      alert("사용자 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색어가 바뀌면 전체 데이터를 다시 조회
  useEffect(() => {
    fetchAllUsers();
  }, [searchQuery]);

  useEffect(() => {
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedUsers(allUsers.slice(startIndex, endIndex));
  }, [allUsers, currentPage]);

  // 총 페이지 수
  const totalPages = Math.ceil(allUsers.length / PAGE_SIZE);

  /**
   * 검색어 입력 핸들러
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-yellow-500", "bg-red-500", "bg-teal-500",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
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
            onChange={handleSearchChange}
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase w-20">번호</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">사용자</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">아이디</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">이메일</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">가입일</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase">마지막 로그인</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                {/* colSpan을 5에서 6으로 변경 */}
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                   데이터를 불러오는 중입니다...
                </td>
              </tr>
            ) : displayedUsers.length > 0 ? (
              displayedUsers.map((user, index) => {
                // 현재 페이지와 인덱스를 기준으로 연번 계산 (1, 2, 3...)
                const rowNumber = currentPage * PAGE_SIZE + index + 1;

                return (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-400 font-mono">
                      {rowNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.userName)} flex items-center justify-center text-white font-semibold`}>
                          {user.userName ? user.userName.charAt(0) : ""}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 font-mono">{user.loginId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">{formatDate(user.lastLoginAt)}</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                {/* colSpan을 5에서 6으로 변경 */}
                <td colSpan={6} className="px-6 py-16 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-1">
                    {searchQuery ? "검색 결과가 없습니다" : "등록된 사용자가 없습니다"}
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
                총 <span className="font-semibold">{totalPages}</span> 페이지 중{" "}
                <span className="font-semibold">{currentPage + 1}</span> 페이지
              </p>

              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  let startPage = Math.max(0, currentPage - 1);
                  let endPage = Math.min(totalPages - 1, currentPage + 1);

                  if (currentPage === 0) endPage = Math.min(2, totalPages - 1);
                  if (currentPage === totalPages - 1) startPage = Math.max(0, totalPages - 3);

                  return Array.from(
                    { length: Math.max(0, endPage - startPage + 1) },
                    (_, i) => startPage + i
                  ).map((pageIdx) => (
                    <button
                      key={pageIdx}
                      onClick={() => handlePageChange(pageIdx)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        currentPage === pageIdx
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}