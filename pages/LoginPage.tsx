
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, LogIn, Loader2, User as UserIcon, Lock } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

interface LoginPageProps {
  onLogin: (user: User) => void;
  supabase: SupabaseClient;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, supabase }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // Truy vấn trực tiếp bảng profiles - Không liên quan Supabase Auth
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();

      if (dbError || !data) {
        console.log(dbError);
        setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
      } else {
        // Chuyển đổi dữ liệu từ DB sang kiểu User của App
        const loggedInUser: User = {
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          role: data.role,
          unit: data.unit
        };
        onLogin(loggedInUser);
      }
    } catch (err) {
      setError('Lỗi kết nối hệ thống. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a8a] px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-[#1e3a8a] rounded-3xl mb-4 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Phát Tiến Kaizen</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Hệ thống quản lý cải tiến nội bộ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 font-bold placeholder:font-normal"
                placeholder="Nhập username..."
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 font-bold"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4 shadow-blue-900/20"
          >
            {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            {isLoggingIn ? 'ĐANG KIỂM TRA...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-50 pt-6">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            PHAT TIEN CORPORATION &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
