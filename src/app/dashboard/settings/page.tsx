"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Save, User, Shield, Palette, AlertTriangle, Mail, CheckCircle, XCircle } from "lucide-react";

interface SocialLinks {
  twitter: string; github: string; discord: string; linkedin: string;
}

interface Preferences {
  emailNotifications: boolean; theme: "dark" | "light" | "system";
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatar, setAvatar] = useState("");
  const [location, setLocation] = useState("");

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: "", github: "", discord: "", linkedin: "",
  });

  // Account fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true, theme: "dark",
  });

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    setDisplayName(user.displayName || "");
    setBio(user.bio || "");
    setWebsite(user.website || "");
    setAvatar(user.avatar || "");
    setLocation(user.location || "");
    setUsername(user.username);
    setEmail(user.email);
    setSocialLinks({
      twitter: (user.socialLinks as Record<string, string>)?.twitter || "",
      github: (user.socialLinks as Record<string, string>)?.github || "",
      discord: (user.socialLinks as Record<string, string>)?.discord || "",
      linkedin: (user.socialLinks as Record<string, string>)?.linkedin || "",
    });
    setPreferences({
      emailNotifications: (user.preferences as Record<string, unknown>)?.emailNotifications as boolean ?? true,
      theme: (user.preferences as Record<string, unknown>)?.theme as "dark" | "light" | "system" || "dark",
    });
  }, [user, authLoading, router]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName: displayName || undefined,
          bio: bio || undefined,
          website: website || undefined,
          avatar: avatar || undefined,
          location: location || undefined,
          socialLinks: {
            twitter: socialLinks.twitter || undefined,
            github: socialLinks.github || undefined,
            discord: socialLinks.discord || undefined,
            linkedin: socialLinks.linkedin || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        showMessage("success", "Profile saved successfully");
      } else {
        showMessage("error", typeof data.error === "string" ? data.error : "Save failed");
      }
    } catch {
      showMessage("error", "Connection error");
    }
    setSaving(false);
  };

  const saveAccount = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        showMessage("success", "Account updated");
      } else {
        showMessage("error", typeof data.error === "string" ? data.error : "Update failed");
      }
    } catch {
      showMessage("error", "Connection error");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      showMessage("error", "Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("success", "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessage("error", typeof data.error === "string" ? data.error : "Password change failed");
      }
    } catch {
      showMessage("error", "Connection error");
    }
    setSaving(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferences }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        showMessage("success", "Preferences saved");
      } else {
        showMessage("error", "Save failed");
      }
    } catch {
      showMessage("error", "Connection error");
    }
    setSaving(false);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") return;
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ confirmation: "DELETE MY ACCOUNT" }),
      });
      if (res.ok) {
        logout();
        router.push("/");
      } else {
        showMessage("error", "Account deletion failed");
      }
    } catch {
      showMessage("error", "Connection error");
    }
    setSaving(false);
  };

  if (authLoading) return <div className="max-w-page-narrow mx-auto px-4 py-20 text-center text-[#55556a]">Loading...</div>;
  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  const inputClass = "w-full px-3 py-2 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-lg text-sm text-[#e2e2ea] focus:outline-none focus:border-indigo-500/50";
  const labelClass = "block text-sm font-medium text-[#e2e2ea] mb-1";

  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e2e2ea]">Settings</h1>
        <p className="text-[#9090a8] text-sm mt-1">Manage your account, profile, and preferences</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === "success"
            ? "bg-green-500/10 text-green-300 border border-green-500/20"
            : "bg-red-500/10 text-red-300 border border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <nav className="lg:w-48 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    : "text-[#9090a8] hover:bg-[#111118] hover:text-[#e2e2ea]"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">Profile Information</h2>
                <p className="text-xs text-[#55556a] mt-1">Update your public profile visible to other users</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className={inputClass} placeholder="Your display name" />
                </div>
                <div>
                  <label className={labelClass}>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className={inputClass + " opacity-50"} disabled title="Edit in Account tab" />
                  <p className="text-xs text-[#55556a] mt-1">Edit in the Account tab</p>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    className={inputClass} placeholder="City, Country" />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                    className={inputClass} placeholder="https://example.com" />
                </div>
                <div>
                  <label className={labelClass}>Avatar URL</label>
                  <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)}
                    className={inputClass} placeholder="https://example.com/avatar.png" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Bio <span className="text-[#55556a] font-normal">({bio.length}/500)</span></label>
                <textarea rows={3} value={bio} onChange={e => e.target.value.length <= 500 && setBio(e.target.value)}
                  className={inputClass} placeholder="Tell others about yourself..." />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Social Links</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Twitter / X</label>
                    <input type="url" value={socialLinks.twitter} onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      className={inputClass} placeholder="https://x.com/username" />
                  </div>
                  <div>
                    <label className={labelClass}>GitHub</label>
                    <input type="url" value={socialLinks.github} onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })}
                      className={inputClass} placeholder="https://github.com/username" />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn</label>
                    <input type="url" value={socialLinks.linkedin} onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      className={inputClass} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div>
                    <label className={labelClass}>Discord</label>
                    <input type="text" value={socialLinks.discord} onChange={e => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                      className={inputClass} placeholder="username#0000" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <Button onClick={saveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">Account Information</h2>
                <p className="text-xs text-[#55556a] mt-1">Update your username and email address</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    className={inputClass} placeholder="username" />
                  <p className="text-xs text-[#55556a] mt-1">3-30 characters, unique across marketplace</p>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputClass} placeholder="email@example.com" />
                  <div className="flex items-center gap-1.5 mt-1">
                    {user.emailVerified ? (
                      <Badge variant="green">Verified</Badge>
                    ) : (
                      <Badge variant="yellow">Unverified</Badge>
                    )}
                    <span className="text-xs text-[#55556a]">Changing email will require re-verification</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-xs text-yellow-300">Changing your username will update your public profile URL. All existing links to your profile will continue to work.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <Button onClick={saveAccount} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Account"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">Change Password</h2>
                <p className="text-xs text-[#55556a] mt-1">Update your account password</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className={inputClass} placeholder="Enter current password" />
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className={inputClass} placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className={inputClass} placeholder="Repeat new password" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <Button onClick={changePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Change Password"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[#e2e2ea]">Preferences</h2>
                <p className="text-xs text-[#55556a] mt-1">Customize your experience</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">Notifications</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={preferences.emailNotifications}
                    onChange={e => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    className="w-4 h-4 rounded border-[rgba(255,255,255,0.07)]" />
                  <div>
                    <div className="text-sm text-[#e2e2ea] flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Notifications
                    </div>
                    <p className="text-xs text-[#55556a]">Receive emails about submission status and marketplace updates</p>
                  </div>
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#e2e2ea] mb-3">Theme</h3>
                <div className="flex gap-3">
                  {(["dark", "light", "system"] as const).map(t => (
                    <button key={t}
                      onClick={() => setPreferences({ ...preferences, theme: t })}
                      className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                        preferences.theme === t
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "bg-[#111118] text-[#9090a8] border border-[rgba(255,255,255,0.07)] hover:text-[#e2e2ea]"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.07)]">
                <Button onClick={savePreferences} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="glass-card p-6 space-y-6 border border-red-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h2 className="text-lg font-semibold text-[#e2e2ea]">Danger Zone</h2>
                  <p className="text-xs text-[#55556a]">Irreversible account actions</p>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-300 mb-2">Delete Account</h3>
                <p className="text-xs text-[#9090a8] mb-4">
                  Permanently delete your account and all associated data. Your published plugins and agents will remain in the marketplace but will be anonymized. This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[#e2e2ea]">Type <code className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">DELETE MY ACCOUNT</code> to confirm:</p>
                    <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                      onPaste={e => setTimeout(() => setDeleteConfirm((e.target as HTMLInputElement).value), 0)}
                      className="w-full px-3 py-2 bg-[#0a0a0f] border border-red-500/30 rounded-lg text-sm text-[#e2e2ea]"
                      placeholder="Type DELETE MY ACCOUNT" />
                    <div className="flex gap-2">
                      <Button onClick={deleteAccount} disabled={deleteConfirm !== "DELETE MY ACCOUNT" || saving}
                        className="!bg-red-500/20 !text-red-400 !border-red-500/30 hover:!bg-red-500/30">
                        {saving ? "Deleting..." : "Permanently Delete Account"}
                      </Button>
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm(""); }}
                        className="px-4 py-2 bg-[#111118] text-[#9090a8] rounded-lg text-sm hover:text-[#e2e2ea] transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
