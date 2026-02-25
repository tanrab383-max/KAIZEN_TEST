
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft,
  ChevronRight, 
  Calendar, 
  Tag,
  Eye,
  Edit2,
  X,
  PlusCircle,
  Plus,
  Trash2,
  AlertCircle,
  FileDown,
  ArrowUpDown,
  SortDesc,
  Paperclip,
  Building2
} from 'lucide-react';
// Fix: Added KaizenType to imports
import { KaizenEntry, User, UserRole, KaizenType } from '../types';
import { UNITS, SECTORS, KAIZEN_TYPES, formatDisplayDate } from '../constants';

interface LibraryPageProps {
  kaizens: KaizenEntry[];
  user: User;
  onIncrementView: (id: string) => void;
  onUpdateStatus: (id: string, status: 'ACTIVE' | 'HIDDEN' | 'DELETED') => void;
}

const ITEMS_PER_PAGE = 9;

const ImageSlider: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 rounded-2xl">
        Không có hình ảnh
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative group aspect-video w-full overflow-hidden rounded-2xl bg-black/5">
      <img 
        src={images[currentIndex]} 
        alt={`Slider ${currentIndex}`}
        className="w-full h-full object-contain"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} className="text-blue-900" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} className="text-blue-900" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-blue-900' : 'w-1.5 bg-blue-900/30'}`}
              />
            ))}
          </div>
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-xs font-bold">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

const LibraryPage: React.FC<LibraryPageProps> = ({ kaizens, user, onIncrementView, onUpdateStatus }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('All');
  const [filterSector, setFilterSector] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'views-desc' | 'views-asc'>('date-desc');
  const [selectedKaizen, setSelectedKaizen] = useState<KaizenEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedKaizens = useMemo(() => {
    let result = kaizens.filter(k => {
      if (k.status === 'DELETED') return false;
      if (k.status !== 'ACTIVE' && user.role !== UserRole.ADMIN) return false;
      
      const matchesSearch = k.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = filterUnit === 'All' || k.unit === filterUnit;
      const matchesSector = filterSector === 'All' || k.sector === filterSector;
      const matchesType = filterType === 'All' || k.type === filterType;
      
      return matchesSearch && matchesUnit && matchesSector && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return b.date.localeCompare(a.date);
      } else if (sortBy === 'date-asc') {
        return a.date.localeCompare(b.date);
      } else if (sortBy === 'views-desc') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortBy === 'views-asc') {
        return (a.views || 0) - (b.views || 0);
      }
      return 0;
    });

    return result;
  }, [kaizens, searchTerm, filterUnit, filterSector, filterType, sortBy, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterUnit, filterSector, filterType, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedKaizens.length / ITEMS_PER_PAGE);
  const displayedKaizens = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedKaizens.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedKaizens, currentPage]);

  const handleOpenDetail = (kaizen: KaizenEntry) => {
    onIncrementView(kaizen.id);
    setSelectedKaizen(kaizen);
  };

  const handleExportSingle = (kaizen: KaizenEntry) => {
    const headers = ['Thông tin', 'Chi tiết'];
    const data = [
      ['Tên ý tưởng', `"${kaizen.title.replace(/"/g, '""')}"`],
      ['Đơn vị thực hiện', kaizen.unit],
      ['Lĩnh vực', kaizen.sector],
      ['Ngày thực hiện', formatDisplayDate(kaizen.date)],
      ['Phân loại', kaizen.type],
      ['Nguồn học tập', kaizen.sourceUnit || ''],
      ['Hiện trạng (Trước)', `"${kaizen.beforeState.replace(/\n/g, ' ').replace(/"/g, '""')}"`],
      ['Nội dung (Sau)', `"${kaizen.content.replace(/\n/g, ' ').replace(/"/g, '""')}"`],
      ['Lợi ích', `"${kaizen.benefits.join(', ')}"`],
      ['Mô tả hiệu quả', `"${(kaizen.impactDescription || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`],
      ['Chi phí', kaizen.cost ? `${kaizen.cost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'],
      ['Lượt xem', kaizen.views || 0],
    ];

    const BOM = '\uFEFF';
    const csvContent = [headers, ...data].map(r => r.join(',')).join('\n');
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kaizen-${kaizen.id}-${kaizen.unit}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAttachment = (kaizen: KaizenEntry) => {
    if (!kaizen.attachmentUrl) return;
    const link = document.createElement('a');
    link.href = kaizen.attachmentUrl;
    link.download = kaizen.attachmentName || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onUpdateStatus(deleteConfirmId, 'DELETED');
      setDeleteConfirmId(null);
    }
  };

  const canPost = user.role === UserRole.CONTRIBUTOR || user.role === UserRole.ADMIN;
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold text-blue-900">Thư viện Kaizen</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm tên ý tưởng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black font-medium"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canPost && (
            <button 
              onClick={() => navigate('/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle size={20} />
              <span>Đăng ý tưởng mới</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-100/50 p-6 rounded-2xl border border-dashed border-gray-300">
        <div className="flex flex-wrap gap-y-4 gap-x-8 items-center">
          <div className="flex items-center gap-2 text-blue-900">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Bộ lọc & Sắp xếp</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Đơn vị:</span>
              <select 
                value={filterUnit} 
                onChange={(e) => setFilterUnit(e.target.value)}
                className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-black"
              >
                <option value="All">Tất cả đơn vị</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Lĩnh vực:</span>
              <select 
                value={filterSector} 
                onChange={(e) => setFilterSector(e.target.value)}
                className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-black"
              >
                <option value="All">Tất cả lĩnh vực</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Loại:</span>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-black"
              >
                <option value="All">Tất cả loại</option>
                {KAIZEN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Sắp xếp:</span>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-900 min-w-[160px] text-blue-900 appearance-none"
                >
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                  <option value="views-desc">Xem nhiều nhất</option>
                  <option value="views-asc">Xem ít nhất</option>
                </select>
                <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-900 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={() => { setFilterUnit('All'); setFilterSector('All'); setFilterType('All'); setSearchTerm(''); setSortBy('date-desc'); }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedKaizens.map(kaizen => (
          <div 
            key={kaizen.id} 
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="aspect-video w-full bg-gray-200 relative overflow-hidden cursor-pointer" onClick={() => handleOpenDetail(kaizen)}>
              <img 
                src={kaizen.beforeImages[0]} 
                alt={kaizen.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${kaizen.type === 'Kaizen' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                  {kaizen.type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-sm text-white">
                  {kaizen.unit}
                </span>
                {kaizen.status === 'HIDDEN' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white">
                    ĐANG ẨN
                  </span>
                )}
              </div>
              {kaizen.attachmentName && (
                <div className="absolute bottom-2 right-2 bg-white/80 p-1.5 rounded-lg text-blue-900 shadow-sm">
                  <Paperclip size={14} />
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <h3 
                onClick={() => handleOpenDetail(kaizen)}
                className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] cursor-pointer hover:text-blue-700 hover:underline transition-all"
              >
                {kaizen.title}
              </h3>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={14} />
                  <span>{kaizen.sector}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 justify-end">
                  <Calendar size={14} />
                  <span>{formatDisplayDate(kaizen.date)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleOpenDetail(kaizen)}
                    className="flex items-center gap-1 text-sm font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                    <Eye size={12} className="text-blue-600" />
                    <span>{kaizen.views || 0} lượt xem</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {canPost && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/edit/${kaizen.id}`); }}
                      className="w-8 h-8 flex items-center justify-center bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-all shadow-md active:scale-90"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDeleteRequest(e, kaizen.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 transition-all shadow-md active:scale-90"
                      title="Xóa ý tưởng"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border transition-all ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-blue-900 border-blue-200 hover:bg-blue-50 active:scale-95'}`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page ? 'bg-blue-900 text-white shadow-lg scale-110' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border transition-all ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-blue-900 border-blue-200 hover:bg-blue-50 active:scale-95'}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Hiển thị {displayedKaizens.length} trên tổng số {filteredAndSortedKaizens.length} ý tưởng
          </p>
        </div>
      )}

      {selectedKaizen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto relative">
            <button 
              onClick={() => setSelectedKaizen(null)}
              className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-gray-100 rounded-full z-[70] transition-colors shadow-sm"
            >
              <X size={24} className="text-gray-900" />
            </button>
            
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider">
                        {selectedKaizen.sector}
                      </span>
                      <span className="text-sm text-gray-400">{formatDisplayDate(selectedKaizen.date)}</span>
                      <span className="text-sm text-blue-600 font-semibold">• {selectedKaizen.views || 0} lượt xem</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                      {selectedKaizen.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedKaizen.attachmentUrl && (
                      <button 
                        onClick={() => handleDownloadAttachment(selectedKaizen)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                      >
                        <Paperclip size={20} />
                        Tải tài liệu đính kèm
                      </button>
                    )}
                    <button 
                      onClick={() => handleExportSingle(selectedKaizen)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                    >
                      <FileDown size={20} />
                      Xuất báo cáo (CSV)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                      Hiện trạng (Trước)
                    </h4>
                    <div className="bg-red-50/50 p-5 rounded-2xl text-gray-700 border border-red-100 min-h-[100px]">
                      {selectedKaizen.beforeState}
                    </div>
                    <ImageSlider images={selectedKaizen.beforeImages} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      Kết quả (Sau)
                    </h4>
                    <div className="bg-green-50/50 p-5 rounded-2xl text-gray-700 border border-green-100 font-medium min-h-[100px]">
                      {selectedKaizen.content}
                    </div>
                    <ImageSlider images={selectedKaizen.afterImages || []} />
                  </div>
                </div>

                <div className="bg-blue-50/30 p-8 rounded-3xl space-y-6 border border-blue-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-blue-900/60 uppercase tracking-widest">Lợi ích đạt được:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedKaizen.benefits.map(b => (
                          <span key={b} className="px-4 py-1.5 bg-blue-900 text-white text-xs rounded-full font-bold">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {selectedKaizen.type === KaizenType.YOKOTEN && (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                          <Building2 size={16} />
                          Nguồn học tập:
                        </p>
                        <div className="px-4 py-2 bg-orange-100 text-orange-900 rounded-xl font-bold inline-block border border-orange-200">
                          {selectedKaizen.sourceUnit}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">Chi tiết hiệu quả & Chi phí</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedKaizen.impactDescription || 'Chưa có mô tả chi tiết hiệu quả.'}</p>
                  </div>

                  <div className="flex flex-wrap gap-8 text-sm pt-6 border-t border-blue-100">
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-gray-400 font-medium mb-1">Chi phí triển khai</p>
                      <p className="text-xl font-black text-blue-900">
                        {selectedKaizen.cost ? `${selectedKaizen.cost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                      </p>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-gray-400 font-medium mb-1">Đơn vị thực hiện</p>
                      <p className="text-xl font-black text-gray-800">{selectedKaizen.unit}</p>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-gray-400 font-medium mb-1">Phân loại</p>
                      <p className={`text-xl font-black uppercase ${selectedKaizen.type === 'Kaizen' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {selectedKaizen.type}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => handleExportSingle(selectedKaizen)}
                    className="flex items-center gap-3 px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm"
                  >
                    <Download size={20} />
                    Tải hồ sơ ý tưởng chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
