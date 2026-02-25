
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Trophy, 
  Eye, 
  PlusCircle, 
  Edit2, 
  LayoutDashboard,
  CheckCircle2,
  Zap,
  ChevronRight,
  Globe,
  User as UserIcon,
  Search,
  Calendar,
  RotateCcw,
  FileText,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { KaizenEntry, User, UserRole } from '../types';
import { formatDisplayDate } from '../constants';

interface ContributorDashboardProps {
  kaizens: KaizenEntry[];
  user: User;
}

type SortConfig = {
  key: keyof KaizenEntry | 'views';
  direction: 'asc' | 'desc';
} | null;

const ContributorDashboard: React.FC<ContributorDashboardProps> = ({ kaizens, user }) => {
  const navigate = useNavigate();
  
  // Chế độ xem: 'PERSONAL' (Cá nhân) hoặc 'GLOBAL' (Toàn hệ thống)
  // Người xem mặc định vào Global
  const [viewMode, setViewMode] = useState<'PERSONAL' | 'GLOBAL'>(
    user.role === UserRole.VIEWER ? 'GLOBAL' : 'PERSONAL'
  );

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Lấy danh sách gốc dựa trên chế độ xem
  const baseKaizens = useMemo(() => {
    if (viewMode === 'PERSONAL') {
      return kaizens.filter(k => k.createdBy === user.id && k.status !== 'DELETED');
    }
    // Chế độ Global: Xem tất cả ý tưởng của mọi người (chỉ các ý tưởng ACTIVE)
    return kaizens.filter(k => k.status === 'ACTIVE');
  }, [kaizens, user.id, viewMode]);

  // Áp dụng bộ lọc tìm kiếm và ngày tháng
  const filteredKaizens = useMemo(() => {
    let result = baseKaizens.filter(k => {
      const matchesSearch = k.title.toLowerCase().includes(searchTerm.toLowerCase());
      const kDate = k.date;
      const matchesStart = !startDate || kDate >= startDate;
      const matchesEnd = !endDate || kDate <= endDate;
      return matchesSearch && matchesStart && matchesEnd;
    });

    if (sortConfig !== null) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [baseKaizens, searchTerm, startDate, endDate, sortConfig]);

  const stats = useMemo(() => {
    const totalViews = baseKaizens.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const kaizenCount = baseKaizens.filter(k => k.type === 'Kaizen').length;
    const yokotenCount = baseKaizens.filter(k => k.type === 'Yokoten').length;
    
    return {
      total: baseKaizens.length,
      views: totalViews,
      kaizenCount,
      yokotenCount
    };
  }, [baseKaizens]);

  const impactData = useMemo(() => {
    return [...baseKaizens]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(k => ({
        name: k.title.length > 20 ? k.title.substring(0, 20) + '...' : k.title,
        views: k.views || 0
      }));
  }, [baseKaizens]);

  const requestSort = (key: keyof KaizenEntry | 'views') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown size={14} className="text-gray-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const canPost = user.role === UserRole.CONTRIBUTOR || user.role === UserRole.ADMIN;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg">
            <Trophy size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chào {user.fullName}!</h1>
            <p className="text-gray-500">
              {viewMode === 'PERSONAL' 
                ? 'Cảm ơn bạn đã đóng góp những ý tưởng cải tiến tuyệt vời.' 
                : 'Khám phá tri thức cải tiến từ toàn bộ hệ thống Phát Tiến.'}
            </p>
          </div>
        </div>
        
        {canPost && (
          <button 
            onClick={() => navigate('/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={20} />
            Đăng ý tưởng mới
          </button>
        )}
      </div>

      {/* Chế độ xem Tabs */}
      {user.role !== UserRole.VIEWER && (
        <div className="flex p-1 bg-gray-200 rounded-2xl w-fit">
          <button 
            onClick={() => setViewMode('PERSONAL')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'PERSONAL' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserIcon size={18} />
            Cá nhân
          </button>
          <button 
            onClick={() => setViewMode('GLOBAL')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'GLOBAL' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Globe size={18} />
            Toàn hệ thống
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-blue-50 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 size={120} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
            {viewMode === 'PERSONAL' ? 'Đã đóng góp' : 'Tổng ý tưởng hệ thống'}
          </p>
          <p className="text-2xl md:text-4xl font-black text-blue-900 mt-2">{stats.total}</p>
          <p className="text-[10px] text-blue-600 mt-2 font-semibold">Sáng kiến tích cực</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-green-50 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Eye size={120} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng lượt xem</p>
          <p className="text-2xl md:text-4xl font-black text-green-600 mt-2">{stats.views}</p>
          <p className="text-[10px] text-green-600 mt-2 font-semibold">Giá trị lan tỏa</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-orange-50 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Zap size={120} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Loại Kaizen</p>
          <p className="text-2xl md:text-4xl font-black text-blue-600 mt-2">{stats.kaizenCount}</p>
          <p className="text-[10px] text-gray-400 mt-2">Sáng tạo tại chỗ</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-purple-50 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <LayoutDashboard size={120} />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Loại Yokoten</p>
          <p className="text-2xl md:text-4xl font-black text-purple-600 mt-2">{stats.yokotenCount}</p>
          <p className="text-[10px] text-gray-400 mt-2">Học tập & nhân rộng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800">
              {viewMode === 'PERSONAL' ? 'Top ý tưởng của bạn' : 'Ý tưởng nổi bật hệ thống'}
            </h3>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full uppercase">Theo lượt xem</span>
          </div>
          {impactData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '11px', fontWeight: 600, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="views" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
              Chưa có dữ liệu thống kê
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col justify-center text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <FileText size={32} />
          </div>
          <h4 className="text-xl font-bold text-blue-900 uppercase">Thư viện Tri thức</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            {viewMode === 'PERSONAL' 
              ? 'Tất cả ý tưởng của bạn đều đóng góp vào sự phát triển chung của Phát Tiến. Hãy tiếp tục sáng tạo!'
              : 'Dữ liệu được cập nhật từ tất cả các đơn vị trong hệ thống. Hãy sử dụng bộ lọc để tìm kiếm ý tưởng bạn quan tâm.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 py-3 bg-white text-blue-900 font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Khám phá Thư viện Ảnh
          </button>
        </div>
      </div>

      {/* Danh sách ý tưởng với bộ lọc */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            {viewMode === 'PERSONAL' ? 'Danh sách ý tưởng của tôi' : 'Toàn bộ ý tưởng hệ thống'}
          </h3>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-full">
            Kết quả: {filteredKaizens.length} hồ sơ
          </div>
        </div>

        {/* Bộ lọc tinh gọn */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm tên ý tưởng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-200">
            <Calendar size={18} className="text-gray-400" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                title="Từ ngày"
              />
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                title="Đến ngày"
              />
            </div>
          </div>

          <button 
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all text-sm"
          >
            <RotateCcw size={18} />
            Đặt lại bộ lọc
          </button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest border-b">
                  <th className="px-6 py-5 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('title')}>
                    <div className="flex items-center gap-2">Tên ý tưởng {getSortIcon('title')}</div>
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('unit')}>
                    <div className="flex items-center gap-2">Đơn vị {getSortIcon('unit')}</div>
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('date')}>
                    <div className="flex items-center gap-2">Ngày thực hiện {getSortIcon('date')}</div>
                  </th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('views')}>
                    <div className="flex items-center gap-2">Lượt xem {getSortIcon('views')}</div>
                  </th>
                  <th className="px-6 py-5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKaizens.length > 0 ? (
                  filteredKaizens.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900 line-clamp-1 text-sm">{k.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{k.sector}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-blue-900">{k.unit}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-gray-500">{formatDisplayDate(k.date)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                          <Eye size={14} />
                          {k.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate('/')}
                            className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                            title="Xem tại Thư viện"
                          >
                            <ChevronRight size={18} />
                          </button>
                          {viewMode === 'PERSONAL' && canPost && (
                            <button 
                              onClick={() => navigate(`/edit/${k.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-900 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                      Không tìm thấy dữ liệu phù hợp với khoảng thời gian đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;
