
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Library, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Users,
  LayoutDashboard,
  BookOpen,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';
import { User, UserRole, KaizenEntry } from './types';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import KaizenFormPage from './pages/KaizenFormPage';
import AdminDashboard from './pages/AdminDashboard';
import ContributorDashboard from './pages/ContributorDashboard';
import DocsPage from './pages/DocsPage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://djtnzzynaefetszhjhtb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__JeZa0PO1uYZOG559DjiWw_qB7HVlWo";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }> = ({ to, icon, label, onClick, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-blue-800 text-white shadow-inner font-bold' : 'text-blue-100 hover:bg-blue-800/50'}`}
    onClick={onClick}
  >
    <span className={active ? 'text-white' : 'text-blue-300'}>{icon}</span>
    <span>{label}</span>
  </Link>
);

const AppContent: React.FC<{ 
  user: User | null, 
  users: User[],
  kaizens: KaizenEntry[],
  isLoading: boolean,
  onLogin: (u: User) => void,
  onLogout: () => void,
  onSaveKaizen: (e: KaizenEntry) => Promise<boolean>,
  onIncrementView: (id: string) => void,
  onUpdateStatus: (id: string, s: any) => void,
  onAddUser: (u: User) => Promise<string | null>,
  onDeleteUser: (id: string) => Promise<string | null>
}> = ({ user, users, kaizens, isLoading, onLogin, onLogout, onSaveKaizen, onIncrementView, onUpdateStatus, onAddUser, onDeleteUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <LoginPage onLogin={onLogin} supabase={supabase} />;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a8a] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#1e3a8a] font-black text-xl shadow-lg">PT</div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tighter">PHÁT TIẾN</h1>
                <p className="text-[10px] text-blue-300 uppercase tracking-widest font-black">Kaizen System</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {user.role === UserRole.ADMIN && (
              <div className="mb-6">
                <div className="px-4 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Quản trị</div>
                <SidebarLink to="/admin?tab=ideas" icon={<BarChart3 size={20} />} label="Báo cáo" active={location.pathname === '/admin' && !location.search.includes('tab=users')} onClick={() => setIsSidebarOpen(false)} />
                <SidebarLink to="/admin?tab=users" icon={<Users size={20} />} label="Nhân viên" active={location.search.includes('tab=users')} onClick={() => setIsSidebarOpen(false)} />
              </div>
            )}

            <div className="my-6">
              <div className="px-4 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Thư viện</div>
              <SidebarLink to="/" icon={<Library size={20} />} label="Thư viện Kaizen" active={isActive('/')} onClick={() => setIsSidebarOpen(false)} />
              {user.role !== UserRole.VIEWER && (
                <SidebarLink to="/new" icon={<PlusCircle size={20} />} label="Đăng ý tưởng" active={isActive('/new')} onClick={() => setIsSidebarOpen(false)} />
              )}
            </div>

            <SidebarLink to="/docs" icon={<BookOpen size={20} />} label="Hướng dẫn" active={isActive('/docs')} onClick={() => setIsSidebarOpen(false)} />
          </nav>

          <div className="p-4 bg-blue-950/40">
            <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-blue-800/30 rounded-2xl border border-blue-700/30 shadow-inner">
              <div className="w-10 h-10 bg-white text-blue-900 rounded-xl flex items-center justify-center shadow-lg font-black text-lg">
                {user.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">{user.fullName}</p>
                <p className="text-[9px] text-blue-300 uppercase font-black">{user.username}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-red-500/20 active:scale-95">
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-bold">PT</div>
            <span className="font-bold text-blue-900 uppercase">Phát Tiến</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="fixed top-6 right-6 z-[100] bg-white/90 px-4 py-2 rounded-full shadow-xl border flex items-center gap-2 text-xs font-bold text-blue-900 animate-pulse">
              <RefreshCw size={14} className="animate-spin" />
              Đang đồng bộ...
            </div>
          )}
          <Routes>
            <Route path="/" element={<LibraryPage kaizens={kaizens} user={user} onIncrementView={onIncrementView} onUpdateStatus={onUpdateStatus} />} />
            <Route path="/dashboard" element={<ContributorDashboard kaizens={kaizens} user={user} />} />
            <Route path="/new" element={<KaizenFormPage onSave={onSaveKaizen} user={user} />} />
            <Route path="/edit/:id" element={<KaizenFormPage onSave={onSaveKaizen} user={user} kaizens={kaizens} />} />
            <Route path="/admin" element={<AdminDashboard kaizens={kaizens} users={users} onUpdateStatus={onUpdateStatus} onAddUser={onAddUser} onDeleteUser={onDeleteUser} />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [kaizens, setKaizens] = useState<KaizenEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pt_kaizen_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('pt_kaizen_user');
      }
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: kData } = await supabase.from('kaizens').select('*').order('created_at', { ascending: false });
      if (kData) {
        setKaizens(kData.map(k => ({
          id: k.id,
          title: k.title,
          sector: k.sector,
          unit: k.unit,
          date: k.date,
          type: k.type,
          sourceUnit: k.target_unit, // Ánh xạ từ cột target_unit trong DB
          beforeState: k.before_state,
          beforeImages: k.before_images || [],
          content: k.content,
          afterImages: k.after_images || [],
          benefits: k.benefits || [],
          impactDescription: k.impact_description,
          cost: k.cost,
          views: k.views,
          attachmentName: k.attachment_name,
          attachmentUrl: k.attachment_url,
          createdBy: k.created_by,
          createdAt: k.created_at,
          updatedAt: k.updated_at,
          status: k.status,
          history: k.history || []
        })));
      }

      const { data: pData } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (pData) {
        setUsers(pData.map(p => ({
          id: p.id,
          username: p.username,
          fullName: p.full_name,
          role: p.role as UserRole,
          unit: p.unit
        })));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const channel = supabase.channel('sync-all').on('postgres_changes', { event: '*', schema: 'public', table: 'kaizens' }, () => fetchData()).on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('pt_kaizen_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pt_kaizen_user');
  };

  const saveKaizen = async (entry: KaizenEntry): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      let finalAttachmentUrl = entry.attachmentUrl;

      if (entry.attachmentFile) {
        const file = entry.attachmentFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('kaizen-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error("LỖI: Bucket 'kaizen-files' chưa được tạo. Vui lòng vào Supabase Dashboard -> Storage -> Tạo Bucket tên 'kaizen-files' và để Public.");
          }
          if (uploadError.message.includes('row-level security')) {
            throw new Error("LỖI QUYỀN HẠN (RLS): Bạn đã tạo Bucket nhưng chưa cấp quyền Upload. Vui lòng vào Storage -> Policies của bucket 'kaizen-files' để cấu hình.");
          }
          throw new Error("Lỗi upload file: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from('kaizen-files')
          .getPublicUrl(filePath);
        
        finalAttachmentUrl = urlData.publicUrl;
      }

      const isNew = entry.id.includes('new-'); 
      const payload: any = {
        title: entry.title,
        sector: entry.sector,
        unit: entry.unit,
        date: entry.date,
        type: entry.type,
        target_unit: entry.sourceUnit, // Lưu sourceUnit vào cột target_unit
        before_state: entry.beforeState,
        before_images: entry.beforeImages,
        content: entry.content,
        after_images: entry.afterImages,
        benefits: entry.benefits,
        impact_description: entry.impactDescription,
        cost: entry.cost,
        attachment_name: entry.attachmentName,
        attachment_url: finalAttachmentUrl,
        created_by: isNew ? user.id : entry.createdBy, 
        status: entry.status,
        history: entry.history,
        updated_at: new Date().toISOString()
      };

      const trySave = async (data: any) => {
        if (isNew) return await supabase.from('kaizens').insert([data]);
        return await supabase.from('kaizens').update(data).eq('id', entry.id);
      };

      let { error: dbError } = await trySave(payload);

      if (dbError && (dbError.message.includes('attachment_name') || dbError.message.includes('attachment_url'))) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.attachment_name;
        delete fallbackPayload.attachment_url;
        const { error: retryError } = await trySave(fallbackPayload);
        if (!retryError) {
          alert("LƯU Ý: Ý tưởng đã được lưu thành công, nhưng thông tin tài liệu đính kèm bị bỏ qua vì Database chưa cập nhật cột 'attachment_name'.");
          fetchData();
          return true;
        } else {
          dbError = retryError;
        }
      }

      if (dbError) throw dbError;
      
      fetchData();
      return true;
    } catch (e: any) {
      alert(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (newUser: User): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert([{
        username: newUser.username,
        password: newUser.password,
        full_name: newUser.fullName,
        role: newUser.role,
        unit: newUser.unit
      }]);

      if (error) throw error;
      fetchData();
      return null;
    } catch (e: any) {
      return e.message;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<string | null> => {
    if (userId === user?.id) return "Bạn không thể tự xóa tài khoản của chính mình!";
    setIsLoading(true);
    try {
      const { count } = await supabase
        .from('kaizens')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      if (count && count > 0) {
        setIsLoading(false);
        return `Không thể xóa: Nhân viên này đang là tác giả của ${count} ý tưởng Kaizen.`;
      }

      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      fetchData();
      return null;
    } catch (e: any) {
      return e.message;
    } finally {
      setIsLoading(false);
    }
  };

  const incrementView = async (id: string) => {
    const target = kaizens.find(k => k.id === id);
    if (target) {
      await supabase.from('kaizens').update({ views: (target.views || 0) + 1 }).eq('id', id);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('kaizens').update({ status }).eq('id', id);
    fetchData();
  };

  return (
    <Router>
      <AppContent 
        user={user} users={users} kaizens={kaizens} isLoading={isLoading}
        onLogin={handleLogin} onLogout={handleLogout} onSaveKaizen={saveKaizen}
        onIncrementView={incrementView} onUpdateStatus={updateStatus}
        onAddUser={addUser} onDeleteUser={deleteUser}
      />
    </Router>
  );
};

export default App;
