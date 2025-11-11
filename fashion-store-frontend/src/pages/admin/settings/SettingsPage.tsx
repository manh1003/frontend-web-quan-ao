import { useState, useEffect } from "react";
import {
  Settings,
  Image,
  Palette,
  Info,
  Save,
  X,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from "@/stores";

type TabType = "general" | "banners" | "appearance";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const { settings, updateSettings } = useThemeStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Sync with theme store when it changes
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Function to calculate if a color is light or dark
  const getTextColorForBackground = (hexColor: string): string => {
    // Convert hex to RGB
    const hex = (hexColor || "#000000").replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const tabs = [
    {
      id: "general" as TabType,
      label: "Thông Tin Chung",
      icon: Info,
      description: "Logo, tên website, thông tin liên hệ",
    },
    {
      id: "banners" as TabType,
      label: "Hero Banners",
      icon: Image,
      description: "Quản lý banner trang chủ",
    },
    {
      id: "appearance" as TabType,
      label: "Giao Diện",
      icon: Palette,
      description: "Màu sắc và theme",
    },
  ];

  const handleSave = async () => {
    try {
      // Save to theme store (which saves to backend and localStorage)
      await updateSettings(localSettings);

      // Show success message
      setSaveSuccess(true);

      // Only reload if on appearance tab (to fully apply color changes)
      if (activeTab === "appearance") {
        // Show reloading indicator after 500ms
        setTimeout(() => {
          setIsReloading(true);
        }, 500);

        // Auto-reload page after 1000ms để áp dụng màu sắc mới
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // For general settings, just show success message and hide after 3s
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Không thể lưu cài đặt. Vui lòng thử lại!");
    }
  };

  return (
    <>
      {/* Reloading Overlay */}
      {isReloading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <RefreshCw className="h-16 w-16 text-primary-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Đang áp dụng màu sắc mới
            </h3>
            <p className="text-gray-600">
              Trang sẽ tự động reload để áp dụng theme mới...
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary-600" />
              Cài Đặt Hệ Thống
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin và giao diện website
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-left transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "bg-white border-primary-600"
                        : "bg-gray-50 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`h-5 w-5 mt-0.5 ${
                          activeTab === tab.id
                            ? "text-primary-600"
                            : "text-gray-500"
                        }`}
                      />
                      <div>
                        <div
                          className={`font-semibold ${
                            activeTab === tab.id
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {tab.label}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            activeTab === tab.id
                              ? "text-gray-700"
                              : "text-gray-500"
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Logo Thương Hiệu
                    </label>
                    {localSettings.logoUrl && (
                      <div className="border-2 border-gray-300 rounded-xl p-6 mb-3 text-center bg-gray-50">
                        <img
                          src={localSettings.logoUrl}
                          alt="Logo"
                          className="h-24 mx-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      value={localSettings.logoUrl}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          logoUrl: e.target.value,
                        })
                      }
                      placeholder="Nhập URL logo (ví dụ: https://example.com/logo.png)"
                      className="input w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Nhập đường dẫn URL đến file logo (PNG, JPG, SVG)
                    </p>
                    {localSettings.logoUrl && (
                      <button
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            logoUrl: "",
                          })
                        }
                        className="text-red-600 text-sm hover:text-red-700 mt-2 flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Xóa logo
                      </button>
                    )}
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Favicon (Icon Browser)
                    </label>
                    {localSettings.faviconUrl && (
                      <div className="border-2 border-gray-300 rounded-xl p-6 mb-3 text-center bg-gray-50">
                        <img
                          src={localSettings.faviconUrl}
                          alt="Favicon"
                          className="h-16 mx-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      value={localSettings.faviconUrl}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          faviconUrl: e.target.value,
                        })
                      }
                      placeholder="Nhập URL favicon (ví dụ: https://example.com/favicon.ico)"
                      className="input w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Nhập đường dẫn URL đến file favicon (ICO, PNG 32x32px)
                    </p>
                    {localSettings.faviconUrl && (
                      <button
                        onClick={() =>
                          setLocalSettings({
                            ...localSettings,
                            faviconUrl: "",
                          })
                        }
                        className="text-red-600 text-sm hover:text-red-700 mt-2 flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Xóa favicon
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Thông Tin Website
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Website
                      </label>
                      <input
                        type="text"
                        value={localSettings.siteName}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            siteName: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Liên Hệ
                      </label>
                      <input
                        type="email"
                        value={localSettings.contactEmail}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            contactEmail: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Điện Thoại
                      </label>
                      <input
                        type="tel"
                        value={localSettings.contactPhone}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            contactPhone: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa Chỉ
                      </label>
                      <input
                        type="text"
                        value={localSettings.address}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            address: e.target.value,
                          })
                        }
                        className="input w-full"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô Tả Website
                      </label>
                      <textarea
                        value={localSettings.siteDescription}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            siteDescription: e.target.value,
                          })
                        }
                        className="input w-full"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  {saveSuccess && !isReloading && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle className="h-5 w-5" />
                      <span>Đã lưu thay đổi thành công!</span>
                    </div>
                  )}
                  {isReloading && (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Đang áp dụng màu sắc mới...</span>
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isReloading}
                    className="btn-primary px-8 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Quản Lý Hero Banners
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Hero Banners được quản lý trong trang riêng với đầy đủ tính
                    năng CRUD, upload ảnh, và preview.
                  </p>
                  <Link
                    to="/admin/banners"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Image className="h-5 w-5" />
                    Đi đến Quản Lý Banners
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Tính Năng Có Sẵn
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Tạo, sửa, xóa banners</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Upload ảnh hoặc dùng URL</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Tùy chỉnh màu sắc</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Sắp xếp thứ tự hiển thị</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Bật/tắt banner nhanh chóng</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Lên lịch hiển thị theo ngày</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card p-6">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Hướng Dẫn Sử Dụng
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                      <li>Click vào nút "Đi đến Quản Lý Banners"</li>
                      <li>Nhấn "Thêm Banner Mới"</li>
                      <li>Điền thông tin và URL ảnh</li>
                      <li>Chọn màu sắc và thứ tự</li>
                      <li>Lưu và banner sẽ hiện trên trang chủ</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Màu Sắc Chủ Đạo
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Màu Chính (Primary)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={localSettings.primaryColor}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              primaryColor: e.target.value,
                            })
                          }
                          className="h-16 w-24 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={localSettings.primaryColor}
                            onChange={(e) =>
                              setLocalSettings({
                                ...localSettings,
                                primaryColor: e.target.value,
                              })
                            }
                            className="input w-full font-mono"
                            placeholder="#6366f1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Màu chính của website (buttons, links, etc.)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Màu Phụ (Secondary)
                      </label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          value={localSettings.secondaryColor}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              secondaryColor: e.target.value,
                            })
                          }
                          className="h-16 w-24 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={localSettings.secondaryColor}
                            onChange={(e) =>
                              setLocalSettings({
                                ...localSettings,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="input w-full font-mono"
                            placeholder="#ec4899"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Màu nhấn mạnh (highlights, accents)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Preview Màu Sắc
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        backgroundColor: localSettings.primaryColor,
                        color: getTextColorForBackground(
                          localSettings.primaryColor
                        ),
                      }}
                    >
                      <h4 className="font-bold mb-2">Primary Color</h4>
                      <p className="text-sm opacity-90">
                        Đây là màu chính của website
                      </p>
                      <button
                        className="mt-4 px-4 py-2 rounded-lg font-semibold"
                        style={{
                          backgroundColor:
                            getTextColorForBackground(
                              localSettings.primaryColor
                            ) === "#ffffff"
                              ? "#ffffff"
                              : "#000000",
                          color:
                            getTextColorForBackground(
                              localSettings.primaryColor
                            ) === "#ffffff"
                              ? "#000000"
                              : "#ffffff",
                        }}
                      >
                        Button
                      </button>
                    </div>

                    <div
                      className="p-6 rounded-xl"
                      style={{
                        backgroundColor: localSettings.secondaryColor,
                        color: getTextColorForBackground(
                          localSettings.secondaryColor
                        ),
                      }}
                    >
                      <h4 className="font-bold mb-2">Secondary Color</h4>
                      <p className="text-sm opacity-90">Màu phụ và nhấn mạnh</p>
                      <button
                        className="mt-4 px-4 py-2 rounded-lg font-semibold"
                        style={{
                          backgroundColor:
                            getTextColorForBackground(
                              localSettings.secondaryColor
                            ) === "#ffffff"
                              ? "#ffffff"
                              : "#000000",
                          color:
                            getTextColorForBackground(
                              localSettings.secondaryColor
                            ) === "#ffffff"
                              ? "#000000"
                              : "#ffffff",
                        }}
                      >
                        Button
                      </button>
                    </div>

                    <div className="p-6 rounded-xl bg-gray-100 text-gray-900">
                      <h4 className="font-bold mb-2">Neutral Colors</h4>
                      <p className="text-sm text-gray-600">
                        Background và text colors
                      </p>
                      <button className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold">
                        Button
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  {saveSuccess && !isReloading && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle className="h-5 w-5" />
                      <span>
                        Đã lưu thay đổi thành công! Màu sắc đã được áp dụng.
                      </span>
                    </div>
                  )}
                  {isReloading && (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Đang áp dụng màu sắc mới...</span>
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isReloading}
                    className="btn-primary px-8 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Lưu Thay Đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
