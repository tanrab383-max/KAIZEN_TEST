
import React from 'react';
import { 
  Book, 
  Info, 
  HelpCircle, 
  ShieldCheck, 
  Users, 
  Library, 
  CheckCircle2, 
  ArrowRight,
  Monitor,
  Smartphone,
  Zap,
  Star,
  Search,
  Filter,
  BarChart3,
  PlusCircle
} from 'lucide-react';

const DocsPage: React.FC = () => {
  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto space-y-16 pb-24">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-widest">
          <Book size={14} />
          <span>Documentation Center</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          Tài liệu & Hướng dẫn <span className="text-blue-900">Sử dụng</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
          Nền tảng tri thức số giúp lưu trữ, chia sẻ và thúc đẩy văn hóa cải tiến liên tục tại toàn bộ hệ thống đại lý Phát Tiến.
        </p>
      </div>

      {/* Product Overview */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <Info className="text-blue-900" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Giới thiệu về Thư viện Kaizen</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Mục tiêu Ứng dụng</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ứng dụng được thiết kế nhằm số hóa các hồ sơ cải tiến (Kaizen) và các bài học kinh nghiệm (Yokoten). Thay thế việc lưu trữ file cứng truyền thống bằng một thư viện hình ảnh trực quan, dễ dàng tra cứu và nhân rộng toàn hệ thống.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tính đa nền tảng</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Monitor size={16} />
                <span>PC & Laptop</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Smartphone size={16} />
                <span>Mobile (Web App)</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tương thích tốt trên cả máy tính bàn và điện thoại di động, giúp kỹ thuật viên có thể đăng tải ý tưởng ngay tại vị trí làm việc.
            </p>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <ShieldCheck className="text-blue-900" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Phân quyền Tài khoản</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 flex flex-col items-center text-center space-y-3">
            <div className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest">Viewer</div>
            <h4 className="font-bold text-gray-900">Người xem</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Chỉ có quyền xem thư viện và dashboard thống kê. Không thể đăng hoặc sửa nội dung.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col items-center text-center space-y-3">
            <div className="px-3 py-1 bg-blue-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Contributor</div>
            <h4 className="font-bold text-blue-900">Nhân viên</h4>
            <p className="text-xs text-blue-700 leading-relaxed">Có quyền đăng ý tưởng mới, xem thư viện và quản lý hồ sơ cá nhân của mình.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex flex-col items-center text-center space-y-3">
            <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Admin</div>
            <h4 className="font-bold text-purple-900">Quản trị viên</h4>
            <p className="text-xs text-purple-700 leading-relaxed">Toàn quyền hệ thống: Phê duyệt ý tưởng, quản lý người dùng, thống kê báo cáo.</p>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="space-y-12">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <HelpCircle className="text-blue-900" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Hướng dẫn Thao tác</h2>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">1</div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Search size={20} className="text-blue-900" />
              Tra cứu & Học tập (Thư viện)
            </h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Sử dụng <strong>Ô tìm kiếm</strong> để tìm ý tưởng theo tên.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Sử dụng <strong>Bộ lọc</strong> (Đơn vị, Lĩnh vực, Phân loại) để thu hẹp kết quả.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Sử dụng <strong>Sắp xếp</strong>: "Xem ít nhất" để hỗ trợ lan tỏa những ý tưởng mới chưa được chú ý.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">2</div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {/* Added missing import for PlusCircle from lucide-react */}
              <PlusCircle size={20} className="text-blue-900" />
              Đăng Ý tưởng mới
            </h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Chọn <strong>Loại ý tưởng</strong>: Kaizen (Tự sáng tạo) hoặc Yokoten (Học tập từ nơi khác).</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Nếu là <strong>Yokoten</strong>: Cần chọn rõ nguồn học tập (HVN, TMV, hoặc đơn vị khác).</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span>Tải ảnh <strong>Trước & Sau</strong>: Nên chụp cùng góc độ để thấy rõ sự khác biệt.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg">3</div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-900" />
              Theo dõi Bảng điều khiển (Dashboard)
            </h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span><strong>Thống kê Cá nhân</strong>: Xem số lượng ý tưởng bạn đã đóng góp và lượt xem.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span><strong>Toàn hệ thống</strong>: Xem bảng xếp hạng những ý tưởng có tầm ảnh hưởng nhất.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span><strong>Lọc theo thời gian</strong>: Dễ dàng xem báo cáo theo khoảng ngày cụ thể.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Notes */}
      <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 space-y-4">
        <h4 className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-widest text-xs">
          <Zap size={16} />
          Lưu ý quan trọng
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-amber-800 leading-relaxed">
          <p>Dữ liệu hình ảnh được tối ưu để tải nhanh, tuy nhiên nên chọn ảnh rõ nét để hồ sơ có chất lượng cao nhất.</p>
          <p>Khi đăng Yokoten, việc ghi rõ nguồn gốc (HVN, TMV, v.v.) giúp quản lý đánh giá được nguồn tri thức học tập phong phú của nhân viên.</p>
        </div>
      </div>

      {/* Footer Docs */}
      <div className="pt-12 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Phát Tiến Kaizen Library System &copy; 2025
        </p>
      </div>
    </div>
  );
};

export default DocsPage;
