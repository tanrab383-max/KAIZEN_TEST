
export enum UserRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  unit: string;
}

export enum KaizenSector {
  CONG_CU = 'Công cụ',
  NAMS = '5S',
  ATLD = 'ATLĐ',
  CSVC = 'CSVC',
  QUY_TRINH = 'Quy trình',
  KHAC = 'Ý tưởng khác'
}

export enum KaizenType {
  KAIZEN = 'Kaizen',
  YOKOTEN = 'Yokoten'
}

export enum KaizenBenefit {
  CSL = 'Hài lòng khách hàng',
  ESL = 'Hài lòng nhân viên',
  PROD = 'Tăng năng suất',
  COST = 'Giảm chi phí',
  NAMS = '5S',
  ATLD = 'ATLĐ',
  ENV = 'Môi trường',
  OTHER = 'Khác'
}

export interface AuditLog {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
}

export interface KaizenEntry {
  id: string;
  title: string;
  sector: KaizenSector;
  unit: string;
  date: string;
  type: KaizenType;
  sourceUnit?: string; // Đơn vị đã triển khai mẫu (Dành cho Yokoten)
  beforeState: string;
  beforeImages: string[]; 
  content: string;
  afterImages: string[];
  benefits: KaizenBenefit[];
  benefitNote?: string;
  impactDescription?: string;
  cost?: number;
  views?: number;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentFile?: File; 
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  history: AuditLog[];
}
