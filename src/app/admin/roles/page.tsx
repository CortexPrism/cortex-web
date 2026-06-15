"use client";

import { useEffect, useState } from "react";
import { Plus, Shield, Trash2, Check, X, Save } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";

interface Permission {
  id: string; key: string; name: string; description: string | null;
}

interface RolePermission {
  permission: Permission;
}

interface Role {
  id: string; key: string; name: string; description: string | null;
  isSystem: boolean; permissions: RolePermission[];
  _count: { users: number };
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleName, setNewRoleName] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      fetch("/api/admin/roles", { headers: { authorization: `Bearer ${token}` } }),
      fetch("/api/admin/permissions", { headers: { authorization: `Bearer ${token}` } }),
    ]);
    if (rRes.ok) {
      const data = await rRes.json();
      setRoles(data.roles || []);
    }
    if (pRes.ok) {
      const data = await pRes.json();
      setPermissions(data.permissions || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (role: Role) => {
    setEditingRole(role.id);
    setEditPerms(role.permissions.map(rp => rp.permission.id));
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setEditPerms([]);
  };

  const saveRole = async (roleId: string) => {
    if (!token) return;
    await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: roleId, permissionIds: editPerms }),
    });
    setEditingRole(null);
    fetchData();
  };

  const deleteRole = async (roleId: string) => {
    if (!token) return;
    await fetch("/api/admin/roles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: roleId }),
    });
    fetchData();
  };

  const createRole = async () => {
    if (!token || !newRoleKey || !newRoleName) return;
    await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: newRoleKey, name: newRoleName, permissionIds: [] }),
    });
    setShowNewRole(false);
    setNewRoleKey("");
    setNewRoleName("");
    fetchData();
  };

  const togglePerm = (permId: string) => {
    setEditPerms(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-[#55556a]">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2ea]">Roles & Permissions</h1>
          <p className="text-[#9090a8] text-sm">Manage access control roles and their permissions</p>
        </div>
        <button onClick={() => setShowNewRole(!showNewRole)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm hover:bg-indigo-500/20 transition-colors">
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      {showNewRole && (
        <div className="glass-card p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">Create New Role</h3>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Key</label>
              <input type="text" value={newRoleKey} onChange={e => setNewRoleKey(e.target.value)}
                className="px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]"
                placeholder="custom-role" />
            </div>
            <div>
              <label className="block text-xs text-[#55556a] mb-1">Name</label>
              <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                className="px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea]"
                placeholder="Custom Role" />
            </div>
            <Button onClick={createRole} disabled={!newRoleKey || !newRoleName}>Create</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {roles.map(role => (
          <div key={role.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-[#e2e2ea]">{role.name}</h3>
                  {role.isSystem && <Badge variant="indigo">System</Badge>}
                  <Badge variant="default">{role._count.users} users</Badge>
                </div>
                {role.description && <p className="text-xs text-[#55556a] mt-1">{role.description}</p>}
                <p className="text-xs text-[#55556a] mt-0.5">Key: <code className="text-indigo-400">{role.key}</code></p>
              </div>
              <div className="flex gap-2">
                {editingRole === role.id ? (
                  <>
                    <button onClick={() => saveRole(role.id)}
                      className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={cancelEdit}
                      className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => startEdit(role)}
                    className="text-xs px-3 py-1.5 rounded bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]">
                    Edit Permissions
                  </button>
                )}
                {!role.isSystem && (
                  <button onClick={() => deleteRole(role.id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissions.map(perm => {
                const isAssigned = editingRole === role.id
                  ? editPerms.includes(perm.id)
                  : role.permissions.some(rp => rp.permission.id === perm.id);

                return (
                  <button
                    key={perm.id}
                    onClick={() => editingRole === role.id && togglePerm(perm.id)}
                    disabled={editingRole !== role.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      isAssigned
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        : "bg-[#0a0a0f] text-[#55556a] border border-[rgba(255,255,255,0.05)]"
                    } ${editingRole === role.id ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                  >
                    {isAssigned ? <Check className="w-3 h-3 shrink-0" /> : <div className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{perm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
