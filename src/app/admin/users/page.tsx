"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, UserX, CheckCircle } from "lucide-react";
import { Badge } from "@/components/shared/Badge";

interface Role {
  id: string; key: string; name: string;
}

interface UserItem {
  id: string; email: string; username: string; role: string;
  avatar: string | null; isActive: boolean; createdAt: string;
  roleId: string | null;
  userRole: { id: string; key: string; name: string } | null;
  _count: { plugins: number; agents: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const [uRes, rRes] = await Promise.all([
      fetch(`/api/admin/users?${params}`, { headers: { authorization: `Bearer ${token}` } }),
      fetch(`/api/admin/roles`, { headers: { authorization: `Bearer ${token}` } }),
    ]);
    if (uRes.ok) {
      const data = await uRes.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    }
    if (rRes.ok) {
      const data = await rRes.json();
      setRoles(data.roles || []);
    }
    setLoading(false);
  }, [page, search, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUserRole = async (userId: string, roleId: string | null) => {
    if (!token) return;
    await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: userId, roleId }),
    });
    fetchUsers();
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    if (!token) return;
    await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: userId, isActive: !isActive }),
    });
    fetchUsers();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#e2e2ea]">User Management</h1>
        <p className="text-[#9090a8] text-sm">Manage registered users and their roles</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]"
            placeholder="Search by username or email..." />
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12 text-[#55556a]">Loading...</div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="text-left p-3 text-[#9090a8] font-medium">User</th>
                  <th className="text-left p-3 text-[#9090a8] font-medium hidden md:table-cell">Email</th>
                  <th className="text-left p-3 text-[#9090a8] font-medium">Role</th>
                  <th className="text-left p-3 text-[#9090a8] font-medium hidden sm:table-cell">Submissions</th>
                  <th className="text-left p-3 text-[#9090a8] font-medium">Status</th>
                  <th className="text-right p-3 text-[#9090a8] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[#111118]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs text-indigo-400">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="text-[#e2e2ea] font-medium">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#55556a] hidden md:table-cell">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.roleId || ""}
                        onChange={e => updateUserRole(u.id, e.target.value || null)}
                        className="bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded px-2 py-1 text-xs text-[#e2e2ea]"
                      >
                        <option value="">No role</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-[#55556a] hidden sm:table-cell">
                      {u._count.plugins + u._count.agents}
                    </td>
                    <td className="p-3">
                      {u.isActive ? (
                        <Badge variant="green">Active</Badge>
                      ) : (
                        <Badge variant="red">Suspended</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => toggleActive(u.id, u.isActive)}
                        className="p-1.5 rounded hover:bg-[#18181f] text-[#55556a] hover:text-[#e2e2ea]"
                        title={u.isActive ? "Suspend" : "Activate"}>
                        {u.isActive ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[#55556a]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg bg-[#111118] text-[#9090a8] disabled:opacity-50 border border-[rgba(255,255,255,0.07)]">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
