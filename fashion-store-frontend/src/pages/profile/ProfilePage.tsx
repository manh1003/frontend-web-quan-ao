import { useState, useEffect } from "react";
import { User, MapPin, Lock, Bell, Heart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { formatDate } from "@/lib/utils";
import { authApi } from "@/api/auth";
import { AddressesTab } from "./AddressesTab";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      setSuccess("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Không thể cập nhật thông tin"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Không thể đổi mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset messages when switching tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "addresses", label: "Địa chỉ", icon: MapPin },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
    { id: "orders", label: "Đơn hàng", icon: Package },
    { id: "wishlist", label: "Yêu thích", icon: Heart },
    { id: "notifications", label: "Thông báo", icon: Bell },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "orders") {
      navigate("/orders");
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user?.fullName}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-md"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thông tin cá nhân
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline"
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                    {success}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Họ và tên</label>
                      <input
                        type="text"
                        className="input"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            fullName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Tên đăng nhập</label>
                      <input
                        type="text"
                        className="input"
                        value={user?.username}
                        disabled
                      />
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        className="input"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Số điện thoại</label>
                      <input
                        type="tel"
                        className="input"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Ngày tham gia</label>
                      <input
                        type="text"
                        className="input"
                        value={
                          user?.createdAt ? formatDate(user.createdAt) : ""
                        }
                        disabled
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 mt-8">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-outline"
                        disabled={loading}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && <AddressesTab />}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Đổi mật khẩu
                </h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                    {success}
                  </div>
                )}

                <form
                  onSubmit={handleChangePassword}
                  className="max-w-md space-y-6"
                >
                  <div>
                    <label className="label">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tối thiểu 6 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="label">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </form>
              </div>
            )}

            {/* Other tabs */}
            {!["profile", "addresses", "password"].includes(activeTab) && (
              <div className="card p-12 text-center">
                <p className="text-gray-600">Tính năng đang phát triển</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
