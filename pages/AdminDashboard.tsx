
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  CheckCircle, 
  EyeOff, 
  Trash2, 
  AlertTriangle,
  FileText,
  TrendingUp,
  LayoutDashboard,
  AlertCircle,
  Eye,
  Calendar,
  Filter,
  X,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  UserPlus,
  Users,
  Settings,
  Lock,
  CheckCircle2,
  Info,
  Database,
  Terminal,
  Copy
} from 'lucide-react';
import { KaizenEntry, User, UserRole } from '../types';
import { UNITS, SECTORS, APP_COLORS, formatDisplayDate } from '../constants';

interface AdminDashboardProps {
  kaizens: KaizenEntry[];
  users: User[];
  onUpdateStatus: (id: string, status: 'ACTIVE' | 'HIDDEN' | 'DELETED') => void;
  onAddUser: (user: User) => Promise<string | null>;
  onDeleteUser: (userId: string) => Promise<string | null>;
}

type SortConfig = {
  key: keyof KaizenEntry | 'views';
  direction: 'asc' | 'desc';
} | null;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ kaizens, users, onUpdateStatus, onAddUser, onDeleteUser }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'ideas';
  
  const [activeTab, setActiveTab] = useState<'IDEAS' | 'USERS' | 'DB'>('IDEAS');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    const tab = tabParam.toUpperCase();
    if (tab === 'USERS') setActiveTab('USERS');
    else if (tab === 'DB') setActiveTab('DB');
    else setActiveTab('IDEAS');
  }, [tabParam]);
  
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.CONTRIBUTOR,
    unit: UNITS[0]
  });

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredAdminKaizens = useMemo(() => {
    let result = kaizens.filter(k => {
      if (k.status === 'DELETED') return false;
      const kDate = k.date; 
      if (startDate && kDate < startDate) return false;
      if (endDate && kDate > endDate) return false;
      return true;
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
  }, [kaizens, startDate, endDate, sortConfig]);

  const stats = useMemo(() => {
    const total = filteredAdminKaizens.length;
    const kaizenCount = filteredAdminKaizens.filter(k => k.type === 'Kaizen').length;
    const yokotenCount = filteredAdminKaizens.filter(k => k.type === 'Yokoten').length;
    const activeCount = filteredAdminKaizens.filter(k => k.status === 'ACTIVE').length;
    const avgCost = total > 0 ? filteredAdminKaizens.reduce((acc, curr) => acc + (curr.cost || 0), 0) / total : 0;
    return { total, kaizenCount, yokotenCount, activeCount, avgCost };
  }, [filteredAdminKaizens]);

  const unitData = useMemo(() => {
    return UNITS.map(unit => ({
      name: unit,
      count: filteredAdminKaizens.filter(k => k.unit === unit).length
    })).filter(u => u.count > 0);
  }, [filteredAdminKaizens]);

  const sectorData = useMemo(() => {
    return SECTORS.map(sector => ({
      name: sector,
      value: filteredAdminKaizens.filter(k => k.sector === sector).length
    })).filter(s => s.value > 0);
  }, [filteredAdminKaizens]);

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

  const handleTabChange = (tab: 'IDEAS' | 'USERS' | 'DB') => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username || !userFormData.password || !userFormData.fullName) return;
    setIsSubmittingUser(true);

    const newUser: User = {
      id: '',
      ...userFormData
    };

    const error = await onAddUser(newUser);
    if (feedback) setFeedback(null);
    if (error) {
      setFeedback({ message: `Lỗi: ${error}`, type: 'error' });
    } else {
      setFeedback({ message: "Đã tạo tài khoản thành công!", type: 'success' });
      setIsAddUserModalOpen(false);
      setUserFormData({
        username: '',
        password: '',
        fullName: '',
        role: UserRole.CONTRIBUTOR,
        unit: UNITS[0]
      });
    }
    setIsSubmittingUser(false);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const error = await onDeleteUser(userToDelete.id);
    if (error) {
      setFeedback({ message: error, type: 'error' });
    } else {
      setFeedback({ message: "Đã xóa người dùng thành công.", type: 'success' });
    }
    setUserToDelete(null);
  };

  const PIE_COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const SQL_MIGRATION = `-- Lệnh SQL nâng cấp bảng 'kaizens'
-- Chạy lệnh này trong SQL Editor của Supabase

ALTER TABLE kaizens ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE kaizens ADD COLUMN IF NOT EXISTS attachment_url TEXT;

COMMENT ON COLUMN kaizens.attachment_name IS 'Tên file đính kèm (PDF, Docx...)';
COMMENT ON COLUMN kaizens.attachment_url IS 'Đường dẫn tải file từ Storage';`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setFeedback({ message: "Đã sao chép lệnh SQL vào bộ nhớ tạm!", type: 'success' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative">
      {feedback && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          <span className="font-bold">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-4 hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản trị hệ thống</h1>
            <p className="text-sm text-gray-500">Thống kê & Quản lý tài khoản nhân viên</p>
          </div>
        </div>
      </div>

      <div className="flex p-1 bg-gray-200 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => handleTabChange('IDEAS')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'IDEAS' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutDashboard size={18} />
          Báo cáo
        </button>
        <button 
          onClick={() => handleTabChange('USERS')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'USERS' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={18} />
          Người dùng
        </button>
        <button 
          onClick={() => handleTabChange('DB')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'DB' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Database size={18} />
          Database Fix
        </button>
      </div>

      {activeTab === 'IDEAS' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col lg:flex-row items-end gap-6">
              <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <Calendar size={14} className="text-blue-900" />
                    Từ ngày
                  </label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <Calendar size={14} className="text-blue-900" />
                    Đến ngày
                  </label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm font-bold" />
                </div>
              </div>
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border bg-gray-50 border-gray-200 text-gray-400">
                <RotateCcw size={18} />
                <span>Hiển thị tất cả</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng ý tưởng</p>
              <p className="text-3xl font-black text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kaizen</p>
              <p className="text-3xl font-black text-blue-600">{stats.kaizenCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yokoten</p>
              <p className="text-3xl font-black text-orange-600">{stats.yokotenCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi phí TB</p>
              <p className="text-2xl font-black text-gray-900">{stats.avgCost.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Ý tưởng theo đơn vị</h3>
                <TrendingUp size={20} className="text-blue-900" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Phân bổ lĩnh vực</h3>
                <FileText size={20} className="text-blue-900" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b">
                    <th className="px-8 py-5 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('title')}><div className="flex items-center gap-2">Tên ý tưởng {getSortIcon('title')}</div></th>
                    <th className="px-6 py-5">Đơn vị</th>
                    <th className="px-6 py-5">Ngày thực hiện</th>
                    <th className="px-6 py-5">Lượt xem</th>
                    <th className="px-6 py-5">Trạng thái</th>
                    <th className="px-8 py-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdminKaizens.map(k => (
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-gray-900 text-sm">{k.title}</td>
                      <td className="px-6 py-5 font-bold text-blue-900 text-xs">{k.unit}</td>
                      <td className="px-6 py-5 text-xs font-medium text-gray-500">{formatDisplayDate(k.date)}</td>
                      <td className="px-6 py-5 text-blue-600 font-black text-sm">{k.views || 0}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${k.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {k.status === 'ACTIVE' ? 'Hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onUpdateStatus(k.id, k.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE')} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all" title={k.status === 'ACTIVE' ? 'Ẩn hồ sơ' : 'Hiện hồ sơ'}>
                            {k.status === 'ACTIVE' ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-blue-600" />}
                          </button>
                          <button onClick={() => setDeleteConfirmId(k.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa vĩnh viễn"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Danh sách nhân viên</h3>
            <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-blue-900 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
              <UserPlus size={20} /> Tạo tài khoản
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b">
                    <th className="px-8 py-5">Họ tên</th>
                    <th className="px-6 py-5">Tên đăng nhập</th>
                    <th className="px-6 py-5">Đơn vị</th>
                    <th className="px-6 py-5">Quyền hạn</th>
                    <th className="px-8 py-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-gray-900 text-sm">{u.fullName}</td>
                      <td className="px-6 py-5 text-gray-500 font-medium text-sm">{u.username}</td>
                      <td className="px-6 py-5 text-blue-900 font-bold text-xs">{u.unit}</td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">{u.role}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => setUserToDelete(u)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DB' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-200 space-y-6">
            <div className="flex items-center gap-4 text-amber-800">
              <div className="p-3 bg-amber-200 rounded-2xl">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Sửa lỗi thiếu cột (Column Missing)</h3>
                <p className="text-sm font-medium">Nếu bạn gặp lỗi 'Could not find the attachment_name column', hãy thực hiện theo các bước bên dưới.</p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-900 text-white flex items-center justify-center shrink-0 font-black">1</div>
                <div className="space-y-2">
                  <p className="font-bold text-amber-900">Mở Supabase SQL Editor</p>
                  <p className="text-xs text-amber-800">Truy cập bảng điều khiển Supabase của dự án, chọn biểu tượng <strong>SQL Editor</strong> ở thanh bên trái.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-900 text-white flex items-center justify-center shrink-0 font-black">2</div>
                <div className="space-y-4 w-full">
                  <p className="font-bold text-amber-900">Sao chép & Chạy lệnh bên dưới</p>
                  <div className="relative group">
                    <pre className="w-full p-6 bg-gray-900 text-green-400 rounded-3xl overflow-x-auto text-xs font-mono leading-relaxed shadow-2xl">
                      <code>{SQL_MIGRATION}</code>
                    </pre>
                    <button 
                      onClick={() => copyToClipboard(SQL_MIGRATION)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black"
                    >
                      <Copy size={16} /> SAO CHÉP
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-900 text-white flex items-center justify-center shrink-0 font-black">3</div>
                <div className="space-y-2">
                  <p className="font-bold text-amber-900">Làm mới trình duyệt</p>
                  <p className="text-xs text-amber-800">Sau khi nhấn <strong>Run</strong> trong SQL Editor, quay lại ứng dụng và F5 trang web để hệ thống nhận diện cấu trúc mới.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-black text-gray-900 uppercase flex items-center gap-2">
              <Info size={18} className="text-blue-900" />
              Tại sao lại có lỗi này?
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ứng dụng vừa cập nhật tính năng "Tài liệu đính kèm" (File đính kèm). Các phiên bản cũ của Database chưa có sẵn 2 cột <code className="bg-gray-100 px-1 rounded font-bold">attachment_name</code> và <code className="bg-gray-100 px-1 rounded font-bold">attachment_url</code>. Việc chạy lệnh SQL trên sẽ bổ sung các cột này vào bảng <strong>kaizens</strong> mà không làm mất dữ liệu hiện có.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase">Xác nhận xóa tài khoản?</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Bạn đang chuẩn bị xóa tài khoản của <strong>{userToDelete.fullName}</strong>. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all uppercase text-xs tracking-widest">Hủy bỏ</button>
              <button onClick={handleConfirmDeleteUser} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 text-center animate-in zoom-in duration-200">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase">Xác nhận xóa ý tưởng?</h3>
              <p className="text-gray-500 mt-2 text-sm">Hồ sơ này sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn có chắc chắn?</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all uppercase text-xs tracking-widest">Hủy</button>
              <button onClick={() => { onUpdateStatus(deleteConfirmId, 'DELETED'); setDeleteConfirmId(null); }} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg uppercase text-xs tracking-widest">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tạo tài khoản mới</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input type="text" required value={userFormData.fullName} onChange={e => setUserFormData({...userFormData, fullName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Nhập tên nhân viên..." />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" required value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                  <input type="password" required value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đơn vị</label>
                  <select value={userFormData.unit} onChange={e => setUserFormData({...userFormData, unit: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quyền hạn</label>
                  <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none">
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button disabled={isSubmittingUser} type="submit" className="w-full py-5 bg-blue-900 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95 transition-all uppercase text-sm tracking-widest mt-4">
                {isSubmittingUser ? <RotateCcw className="animate-spin" size={20}/> : <UserPlus size={20}/>}
                XÁC NHẬN TẠO TÀI KHOẢN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
