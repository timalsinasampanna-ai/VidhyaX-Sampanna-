export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  grade?: '11' | '12' | 'both';
  collegeName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Grade 11"
  gradeNumber: 11 | 12;
  description: string;
  priceNpr: number; // 599
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
}

export interface SubjectItem {
  id: string;
  classId: string; // "11" or "12"
  name: string; // "Physics", "Chemistry", "Botany", etc.
  code: string; // "PHY-11"
  description: string;
  iconName: string;
  chapterCount: number;
  isPopular?: boolean;
  sortOrder: number;
}

export interface ChapterItem {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  chapterNumber: number;
  description: string;
  materialCount: number;
}

export type ContentCategoryType = 'Notes' | 'PYQ' | 'Solutions' | 'Practice Questions' | 'Other Study Materials';

export interface ContentCategory {
  id: string;
  name: ContentCategoryType;
  description: string;
  iconName: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  classId: '11' | '12';
  subjectId: string;
  subjectName?: string;
  chapterId: string;
  chapterName?: string;
  category: ContentCategoryType;
  isPremium: boolean;
  fileUrl: string; // Storage path or preview URL
  fileSizeBytes: number;
  pageCount: number;
  downloadCount: number;
  published: boolean;
  createdAt: string;
}

export type PurchaseStatus = 'not_purchased' | 'payment_submitted' | 'pending_approval' | 'approved' | 'rejected';

export interface PurchaseRequest {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  packageId: string; // "class-11-full" or "class-12-full"
  packageName: string;
  classGrade: 11 | 12;
  amountNpr: number; // 599
  paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
  transactionReference: string;
  payerPhoneNumber: string;
  proofFilePath?: string;
  proofUrl?: string;
  status: PurchaseStatus;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PaymentSettings {
  merchantName: string;
  esewaId: string;
  qrImageUrl: string;
  instructionText: string;
  contactSupportPhone: string;
  contactSupportEmail: string;
  approvalTimelineHours: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaText: string;
  ctaLink: string;
  badgeText?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'all' | 'class_11' | 'class_12';
  isPublished: boolean;
  createdAt: string;
  readByCurrentUser?: boolean;
}

export interface EbookItem {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  description: string;
  classGrade: 11 | 12;
  subjectName: string;
  coverImageUrl?: string;
  fileUrl: string;
  fileSizeBytes: number;
  pageCount: number;
  isPremium: boolean;
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, or 3 (masked from student in live exams)
  explanation?: string;
  points: number;
}

export interface OnlineTest {
  id: string;
  title: string;
  description: string;
  classGrade: 11 | 12;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passPercentage: number;
  isPublished: boolean;
  questions?: TestQuestion[];
  createdAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  answers: Record<string, number>; // questionId -> chosenOptionIndex
  completedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetEntity: string;
  entityId: string;
  details: string;
  timestamp: string;
}
