
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setSubmitSuccess(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Điện thoại",
      content: "+84 123 456 789",
      subContent: "Thứ 2 - Chủ nhật, 8:00 - 22:00",
      color: "from-blue-500 to-blue-600",
      href: "tel:+84123456789",
    },
    {
      icon: Mail,
      title: "Email",
      content: "support@fashionstore.vn",
      subContent: "Phản hồi trong 24h",
      color: "from-purple-500 to-purple-600",
      href: "mailto:support@fashionstore.vn",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: "123 Đường ABC, Quận 1",
      subContent: "TP. Hồ Chí Minh, Việt Nam",
      color: "from-green-500 to-green-600",
      href: "https://maps.google.com",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      content: "8:00 - 22:00",
      subContent: "Tất cả các ngày trong tuần",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", color: "hover:text-blue-600", href: "#" },
    { icon: Instagram, name: "Instagram", color: "hover:text-pink-600", href: "#" },
    { icon: Twitter, name: "Twitter", color: "hover:text-sky-500", href: "#" },
    { icon: Youtube, name: "Youtube", color: "hover:text-red-600", href: "#" },
  ];

  const faqs = [
    {
      question: "Làm sao để đặt hàng?",
      answer: "Bạn có thể đặt hàng trực tiếp trên website hoặc liên hệ với chúng tôi qua hotline.",
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng.",
    },
    {
      question: "Có ship hàng toàn quốc không?",
      answer: "Có, chúng tôi giao hàng toàn quốc với thời gian 2-5 ngày làm việc.",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">LIÊN HỆ</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chúng Tôi Luôn
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                Sẵn Sàng Hỗ Trợ
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Có thắc mắc hoặc cần hỗ trợ? Hãy liên hệ với chúng tôi, chúng tôi sẽ phản hồi
              trong thời gian sớm nhất!
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-20 relative z-10">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.href}
                target={info.href?.startsWith("http") ? "_blank" : undefined}
                rel={info.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <info.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {info.title}
                </h3>
                <p className="text-gray-900 font-medium mb-1">
                  {info.content}
                </p>
                <p className="text-sm text-gray-600">
                  {info.subContent}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-primary-600" />
                  Gửi Tin Nhắn
                </h2>
                <p className="text-lg text-gray-600">
                  Điền thông tin vào form dưới đây, chúng tôi sẽ liên hệ lại sớm nhất có thể
                </p>
              </div>

              {submitSuccess ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Gửi thành công!
                  </h3>
                  <p className="text-green-700">
                    Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                        placeholder="0123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Chủ đề *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="order">Đặt hàng</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="complaint">Khiếu nại</option>
                        <option value="partnership">Hợp tác</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Nội dung *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        Gửi tin nhắn
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-[4/3] bg-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4932653199953!2d106.70427631533435!3d10.774999192320687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5a8bb742a49b3dee!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJDhuqFpIGjhu41jIFF14buRYyBnaWEgVFAuSENN!5e0!3m2!1svi!2s!4v1635234567890!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Store Location"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Kết Nối Với Chúng Tôi
                </h3>
                <p className="text-gray-600 mb-6">
                  Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Câu Hỏi Thường Gặp
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bạn Cần Hỗ Trợ Ngay?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Gọi ngay hotline của chúng tôi để được tư vấn miễn phí
              </p>
              <a
                href="tel:+84123456789"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105"
              >
                <Phone className="h-5 w-5" />
                +84 123 456 789
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}