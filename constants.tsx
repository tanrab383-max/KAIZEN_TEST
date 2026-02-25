
import { KaizenSector, KaizenType, KaizenBenefit } from './types';

export const UNITS = [
  'TNK', 'TTG', 'TBT', 'TAS', 'HPTN', 'HLAN', 'HBHA', 'MVL', 'VP-PTC'
];

export const YOKOTEN_SOURCES = [
  ...UNITS, 'HVN', 'TMV', 'Khác'
];

export const SECTORS = Object.values(KaizenSector);
export const KAIZEN_TYPES = Object.values(KaizenType);
export const BENEFITS = Object.values(KaizenBenefit);

export const APP_COLORS = {
  primary: '#1e3a8a', // Deep Blue (Phat Tien)
  secondary: '#3b82f6', // Bright Blue
  accent: '#f59e0b', // Amber
  background: '#f8fafc',
  text: '#1e293b'
};

/**
 * Chuyển đổi định dạng ngày từ yyyy-mm-dd sang dd-mm-yyyy
 */
export const formatDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr; // Trả về nguyên bản nếu không đúng định dạng yyyy-mm-dd
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};
