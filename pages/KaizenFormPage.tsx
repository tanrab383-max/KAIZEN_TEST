
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  CheckCircle2, 
  Info,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Building2
} from 'lucide-react';
import { 
  KaizenEntry, 
  User, 
  KaizenSector, 
  KaizenType, 
  KaizenBenefit, 
  AuditLog,
  UserRole
} from '../types';
import { UNITS, SECTORS, BENEFITS, KAIZEN_TYPES, YOKOTEN_SOURCES } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface KaizenFormPageProps {
  onSave: (entry: KaizenEntry) => Promise<boolean>;
  user: User;
  kaizens?: KaizenEntry[];
}

const KaizenFormPage: React.FC<KaizenFormPageProps> = ({ onSave, user, kaizens = [] }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<KaizenEntry>>({
    title: '',
    sector: KaizenSector.CONG_CU,
    unit: user.unit || UNITS[0],
    date: new Date().toISOString().split('T')[0],
    type: KaizenType.KAIZEN,
    sourceUnit: YOKOTEN_SOURCES[0], // Mặc định đơn vị nguồn
    beforeState: '',
    beforeImages: [],
    content: '',
    afterImages: [],
    benefits: [],
    impactDescription: '',
    cost: 0,
    history: [],
    attachmentName: '',
    attachmentUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      const entry = kaizens.find(k => k.id === id);
      if (entry) {
        if (user.role === UserRole.VIEWER) {
          navigate('/');
          return;
        }
        setFormData(entry);
        setBeforeImages(entry.beforeImages || []);
        setAfterImages(entry.afterImages || []);
      }
    }
  }, [id, kaizens, isEditing, user, navigate]);

  const handleAiAssist = async () => {
    setAiError(null);
    if (!formData.title || !formData.content) {
      setAiError("Cần 'Tên ý tưởng' & 'Nội dung' để AI phân tích.");
      return;
    }

    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Bạn là một chuyên gia về Kaizen tại hệ thống đại lý ô tô xe máy Phát Tiến. 
      Dựa trên thông tin cải tiến sau:
      - Tên ý tưởng: ${formData.title}
      - Nội dung đã làm: ${formData.content}
      Hãy viết một đoạn văn ngắn (khoảng 100 từ) mô tả cụ thể về 'Hiệu quả và Tác động' của cải tiến này. 
      Yêu cầu: Văn phong chuyên nghiệp, tập trung vào: Tiết kiệm thời gian, tăng năng suất, an toàn lao động. Hãy đưa ra các con số giả định hợp lý.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response.text) {
        setFormData(prev => ({ ...prev, impactDescription: response.text }));
      }
    } catch (error) {
      setAiError("Lỗi kết nối AI.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Tên ý tưởng là bắt buộc';
    if (!formData.beforeState) newErrors.beforeState = 'Vui lòng mô tả hiện trạng';
    if (!formData.content) newErrors.content = 'Vui lòng mô tả nội dung cải tiến';
    if (!formData.benefits || formData.benefits.length === 0) newErrors.benefits = 'Chọn ít nhất một lợi ích';
    if (beforeImages.length === 0) newErrors.beforeImages = 'Cần hình ảnh hiện trạng';
    if (formData.type === KaizenType.YOKOTEN && !formData.sourceUnit) newErrors.sourceUnit = 'Vui lòng chọn đơn vị nguồn học tập';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'before') setBeforeImages(prev => [...prev, reader.result as string]);
          else setAfterImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachmentName: file.name,
        attachmentFile: file
      }));
    }
  };

  const toggleBenefit = (benefit: KaizenBenefit) => {
    const current = formData.benefits || [];
    if (current.includes(benefit)) {
      setFormData({ ...formData, benefits: current.filter(b => b !== benefit) });
    } else {
      setFormData({ ...formData, benefits: [...current, benefit] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      action: isEditing ? 'Chỉnh sửa Kaizen' : 'Tạo mới Kaizen',
    };

    const finalEntry: KaizenEntry = {
      ...(formData as KaizenEntry),
      id: isEditing ? id! : `new-${Date.now()}`, 
      beforeImages: beforeImages,
      afterImages: afterImages,
      createdBy: isEditing ? formData.createdBy! : user.id,
      createdAt: isEditing ? formData.createdAt! : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: isEditing ? formData.status! : 'ACTIVE',
      history: [...(formData.history || []), log],
      views: isEditing ? formData.views || 0 : 0
    };

    const success = await onSave(finalEntry);
    if (success) navigate('/');
    else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-900 font-bold transition-all">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {isEditing ? 'CHỈNH SỬA Ý TƯỞNG' : 'ĐĂNG Ý TƯỞNG KAIZEN'}
        </h1>
        <div className="w-10 lg:block hidden"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-black text-blue-900 flex items-center gap-2 uppercase tracking-tight">
            <Info size={22} />
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tên ý tưởng <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className={`w-full px-5 py-4 bg-gray-50 rounded-2xl border ${errors.title ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-100'} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-900`} 
                placeholder="Ví dụ: Thiết kế lại kệ để đồ bảo hộ..."
              />
              {errors.title && <p className="text-xs text-red-500 font-bold ml-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Lĩnh vực</label>
                <select value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value as KaizenSector })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-gray-900 appearance-none">
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Đơn vị triển khai <span className="text-blue-500 font-bold">(Của bạn)</span></label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-gray-900 appearance-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Loại ý tưởng</label>
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                  {KAIZEN_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t as KaizenType })} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${formData.type === t ? 'bg-white shadow-sm text-blue-900' : 'text-gray-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === KaizenType.YOKOTEN && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Building2 size={12} />
                    Đơn vị đã triển khai mẫu <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.sourceUnit} 
                    onChange={(e) => setFormData({ ...formData, sourceUnit: e.target.value })} 
                    className="w-full px-5 py-4 bg-orange-50 rounded-2xl border border-orange-100 outline-none font-bold text-gray-900 appearance-none"
                  >
                    {YOKOTEN_SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                  </select>
                  {errors.sourceUnit && <p className="text-xs text-red-500 font-bold ml-1">{errors.sourceUnit}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ngày thực hiện</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-gray-900" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-black text-red-600 flex items-center gap-2 uppercase tracking-tight">
            <AlertCircle size={22} />
            Hiện trạng & Hình ảnh Trước
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả hiện trạng (Trước) <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="Mô tả khó khăn, bất cập..." value={formData.beforeState} onChange={(e) => setFormData({ ...formData, beforeState: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none resize-none font-medium text-gray-900 focus:border-red-500 transition-all" />
              {errors.beforeState && <p className="text-xs text-red-500 font-bold ml-1">{errors.beforeState}</p>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {beforeImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setBeforeImages(beforeImages.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={14} /></button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer text-gray-400 hover:bg-gray-100 hover:border-blue-400 transition-all">
                <Upload size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Tải ảnh</span>
                <input type="file" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'before')} />
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-black text-green-600 flex items-center gap-2 uppercase tracking-tight">
            <CheckCircle2 size={22} />
            Nội dung Cải tiến & Sau
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung đã làm (Sau) <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="Mô tả chi tiết giải pháp..." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none resize-none font-medium text-gray-900 focus:border-green-500 transition-all" />
              {errors.content && <p className="text-xs text-red-500 font-bold ml-1">{errors.content}</p>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {afterImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setAfterImages(afterImages.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={14} /></button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer text-gray-400 hover:bg-gray-100 hover:border-blue-400 transition-all">
                <Upload size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Tải ảnh</span>
                <input type="file" multiple className="hidden" onChange={(e) => handleImageUpload(e, 'after')} />
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-black text-blue-900 flex items-center gap-2 uppercase tracking-tight">
              <Sparkles size={22} />
              Lợi ích & Hiệu quả
            </h3>
            <div className="flex flex-col items-end gap-2">
              <button 
                type="button" 
                onClick={handleAiAssist} 
                disabled={isAiThinking} 
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-800 text-white text-[10px] font-black rounded-xl disabled:opacity-50 shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 uppercase tracking-widest"
              >
                {isAiThinking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                AI VIẾT HỘ MÔ TẢ
              </button>
              {aiError && <span className="text-[10px] text-red-500 font-bold animate-bounce">{aiError}</span>}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Lợi ích đạt được <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {BENEFITS.map(b => (
                  <button 
                    key={b} 
                    type="button" 
                    onClick={() => toggleBenefit(b)} 
                    className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${formData.benefits?.includes(b) ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-500'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {errors.benefits && <p className="text-xs text-red-500 font-bold ml-1">{errors.benefits}</p>}
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả hiệu quả (Số liệu cụ thể)</label>
              <textarea 
                rows={4} 
                value={formData.impactDescription} 
                onChange={(e) => setFormData({...formData, impactDescription: e.target.value})} 
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-medium text-gray-900 focus:border-blue-500 transition-all" 
                placeholder="Ví dụ: Tiết kiệm 30 phút mỗi ngày, giảm 1 triệu chi phí/tháng..." 
              />
              {isAiThinking && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-blue-900" />
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Gemini đang viết...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Chi phí triển khai (VNĐ)</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-gray-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">File tài liệu (nếu có)</label>
                <label className="flex items-center gap-3 w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 cursor-pointer transition-all text-gray-500 overflow-hidden relative">
                  <FileText size={20} />
                  <span className="text-sm font-bold truncate">
                    {formData.attachmentName || 'Chọn file đính kèm...'}
                  </span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                  {formData.attachmentName && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setFormData({...formData, attachmentName: '', attachmentFile: undefined, attachmentUrl: ''}); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="fixed bottom-8 left-0 right-0 px-6 z-40 md:relative md:bottom-0 md:px-0">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-sm shadow-blue-900/40"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            {isSubmitting ? 'ĐANG LƯU DỮ LIỆU...' : 'LƯU HỒ SƠ CẢI TIẾN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KaizenFormPage;
