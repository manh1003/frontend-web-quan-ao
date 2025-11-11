import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { bannersApi, type HeroBanner } from "@/api";

export function BannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formData, setFormData] = useState<Partial<HeroBanner>>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "Xem ngay",
    displayOrder: 0,
    isActive: true,
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersApi.getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to load banners:", error);
      alert("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await bannersApi.updateBanner(editingBanner.bannerId, formData);
      } else {
        await bannersApi.createBanner(formData);
      }
      setShowModal(false);
      setEditingBanner(null);
      resetForm();
      document.body.style.overflow = 'unset';
      loadBanners();
    } catch (error) {
      console.error("Failed to save banner:", error);
      alert("Không thể lưu banner");
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowModal(true);
    // Prevent scroll to top by maintaining scroll position
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
    }, 0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
    try {
      await bannersApi.deleteBanner(id);
      loadBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
      alert("Không thể xóa banner");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await bannersApi.toggleBannerStatus(id);
      loadBanners();
    } catch (error) {
      console.error("Failed to toggle banner status:", error);
      alert("Không thể thay đổi trạng thái");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "Xem ngay",
      displayOrder: 0,
      isActive: true,
      backgroundColor: "#6366f1",
      textColor: "#ffffff",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản Lý Hero Banners
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý banner hiển thị trên trang chủ
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            resetForm();
            setShowModal(true);
            setTimeout(() => {
              document.body.style.overflow = 'hidden';
            }, 0);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Thêm Banner Mới
        </button>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Chưa có banner nào</p>
          <button
            onClick={() => {
              setEditingBanner(null);
              resetForm();
              setShowModal(true);
              setTimeout(() => {
                document.body.style.overflow = 'hidden';
              }, 0);
            }}
            className="btn-primary"
          >
            Tạo Banner Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {banners.map((banner) => (
            <div
              key={banner.bannerId}
              className="card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Banner Preview */}
                <div className="relative aspect-[4/5] md:aspect-auto bg-gray-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x500?text=No+Image";
                    }}
                  />
                  {banner.isActive ? (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                      Đang hoạt động
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-gray-500 text-white text-sm font-semibold rounded-full">
                      Tạm dừng
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                    Thứ tự: {banner.displayOrder}
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {banner.title}
                      </h3>
                      <p className="text-gray-600">{banner.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Button Text:</span>
                        <p className="font-semibold">
                          {banner.buttonText || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Link URL:</span>
                        <p className="font-semibold truncate">
                          {banner.linkUrl || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Bắt đầu:
                        </span>
                        <p className="font-semibold">
                          {formatDate(banner.startDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Kết thúc:
                        </span>
                        <p className="font-semibold">
                          {formatDate(banner.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {banner.backgroundColor && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">BG:</span>
                          <div
                            className="h-6 w-12 rounded border-2 border-gray-300"
                            style={{ backgroundColor: banner.backgroundColor }}
                          />
                          <span className="font-mono text-xs">
                            {banner.backgroundColor}
                          </span>
                        </div>
                      )}
                      {banner.textColor && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Text:</span>
                          <div
                            className="h-6 w-12 rounded border-2 border-gray-300"
                            style={{ backgroundColor: banner.textColor }}
                          />
                          <span className="font-mono text-xs">
                            {banner.textColor}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleToggleStatus(banner.bannerId)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        banner.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {banner.isActive ? (
                        <>
                          <ToggleRight className="h-5 w-5" />
                          Tắt
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5" />
                          Bật
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(banner.bannerId)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowModal(false);
                document.body.style.overflow = 'unset';
              }}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingBanner ? "Chỉnh Sửa Banner" : "Thêm Banner Mới"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="input w-full"
                      placeholder="VD: Bộ Sưu Tập Mùa Đông 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phụ đề
                    </label>
                    <textarea
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className="input w-full"
                      rows={3}
                      placeholder="Mô tả ngắn về banner..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Hình Ảnh *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="input w-full"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link URL
                    </label>
                    <input
                      type="text"
                      value={formData.linkUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      className="input w-full"
                      placeholder="/products"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Nút
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonText: e.target.value })
                      }
                      className="input w-full"
                      placeholder="Xem ngay"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayOrder: parseInt(e.target.value),
                        })
                      }
                      className="input w-full"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu nền
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          backgroundColor: e.target.value,
                        })
                      }
                      className="input w-full h-12"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Kích hoạt banner
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBanner(null);
                      resetForm();
                      document.body.style.overflow = 'unset';
                    }}
                    className="flex-1 btn-outline"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingBanner ? "Cập Nhật" : "Tạo Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






