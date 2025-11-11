
import { Link } from "react-router-dom";
import {
  Heart,
  Award,
  Users,
  ShoppingBag,
  Star,
  CheckCircle,
  Target,
  Sparkles,
  Phone,
} from "lucide-react";

export function AboutPage() {
  const stats = [
    { icon: Users, label: "Khách hàng", value: "50,000+", color: "from-blue-500 to-blue-600" },
    { icon: ShoppingBag, label: "Sản phẩm", value: "1,000+", color: "from-purple-500 to-purple-600" },
    { icon: Award, label: "Thương hiệu", value: "100+", color: "from-green-500 to-green-600" },
    { icon: Star, label: "Đánh giá", value: "4.9/5", color: "from-yellow-500 to-yellow-600" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Đam Mê",
      description: "Chúng tôi yêu thích thời trang và luôn đặt tâm huyết vào từng sản phẩm",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: CheckCircle,
      title: "Chất Lượng",
      description: "Cam kết 100% sản phẩm chính hãng với chất lượng cao nhất",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Sáng Tạo",
      description: "Không ngừng đổi mới và cập nhật xu hướng thời trang mới nhất",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Khách Hàng",
      description: "Đặt khách hàng làm trung tâm và mang đến trải nghiệm tốt nhất",
      color: "from-purple-500 to-violet-500",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Thành Lập",
      description: "Khởi đầu với ước mơ mang thời trang đến mọi người",
    },
    {
      year: "2021",
      title: "Mở Rộng",
      description: "Ra mắt website và hệ thống phân phối toàn quốc",
    },
    {
      year: "2022",
      title: "Phát Triển",
      description: "Đạt 25,000 khách hàng và mở rộng danh mục sản phẩm",
    },
    {
      year: "2023",
      title: "Bứt Phá",
      description: "Top 10 thương hiệu thời trang trực tuyến uy tín",
    },
    {
      year: "2024",
      title: "Đổi Mới",
      description: "Ra mắt ứng dụng di động và AI shopping assistant",
    },
  ];

  const team = [
    {
      name: "Nguyễn Văn A",
      role: "CEO & Founder",
      image: "https://ui-avatars.com/api/?name=Nguyen+Van+A&size=200&background=3b82f6&color=fff",
    },
    {
      name: "Trần Thị B",
      role: "Creative Director",
      image: "https://ui-avatars.com/api/?name=Tran+Thi+B&size=200&background=8b5cf6&color=fff",
    },
    {
      name: "Lê Văn C",
      role: "Marketing Director",
      image: "https://ui-avatars.com/api/?name=Le+Van+C&size=200&background=10b981&color=fff",
    },
    {
      name: "Phạm Thị D",
      role: "Operations Manager",
      image: "https://ui-avatars.com/api/?name=Pham+Thi+D&size=200&background=f59e0b&color=fff",
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
              <span className="font-semibold">VỀ CHÚNG TÔI</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Câu Chuyện Của
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                Chúng Tôi
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Hành trình mang đến những trải nghiệm thời trang tuyệt vời nhất cho khách hàng
              Việt Nam từ năm 2020 đến nay
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

      {/* Stats Section */}
      <section className="py-16 -mt-20 relative z-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Hành Trình Của Chúng Tôi
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Chúng tôi bắt đầu với một ước mơ đơn giản: mang đến những sản phẩm thời trang
                  chất lượng cao với giá cả phải chăng cho mọi người tại Việt Nam.
                </p>
                <p>
                  Từ một cửa hàng nhỏ, chúng tôi đã không ngừng phát triển và ngày nay trở thành
                  một trong những nền tảng thương mại điện tử thời trang hàng đầu với hơn 50,000
                  khách hàng tin tưởng.
                </p>
                <p>
                  Với đội ngũ tận tâm và đam mê, chúng tôi cam kết mang đến trải nghiệm mua sắm
                  tuyệt vời nhất, từ chất lượng sản phẩm đến dịch vụ chăm sóc khách hàng.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                  alt="Fashion Store"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary-500 rounded-full blur-3xl opacity-30" />
              <div className="absolute -top-6 -left-6 h-32 w-32 bg-purple-500 rounded-full blur-3xl opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-lg text-gray-600">
              Những giá trị định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cột Mốc Phát Triển
            </h2>
            <p className="text-lg text-gray-600">
              Hành trình phát triển của chúng tôi qua từng năm
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="group relative flex gap-8 items-start"
                >
                  {/* Timeline Line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-[47px] top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-primary-200" />
                  )}

                  {/* Year Badge */}
                  <div className="flex-shrink-0 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform relative z-10">
                    {milestone.year}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Những con người tâm huyết đằng sau thành công
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="group text-center"
              >
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sẵn Sàng Khám Phá?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Tham gia cùng hàng ngàn khách hàng đã tin tưởng chọn chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 hover:scale-105"
              >
                Mua sắm ngay
                <ShoppingBag className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                Liên hệ với chúng tôi
                <Phone className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}