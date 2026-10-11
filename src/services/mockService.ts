import {
  UserProfile,
  ClassItem,
  SubjectItem,
  ChapterItem,
  ContentCategory,
  StudyMaterial,
  PurchaseRequest,
  PaymentSettings,
  PromotionalBanner,
  Announcement,
  EbookItem,
  OnlineTest,
  TestAttempt,
  AdminAuditLog,
} from '../types';
import {
  INITIAL_ADMIN_PROFILE,
  DEMO_STUDENT_PROFILE,
  DEMO_STUDENT_GRADE12,
  MOCK_CLASSES,
  MOCK_SUBJECTS,
  MOCK_CHAPTERS,
  MOCK_CATEGORIES,
  MOCK_MATERIALS,
  MOCK_PAYMENT_SETTINGS,
  MOCK_PURCHASES,
  MOCK_BANNERS,
  MOCK_ANNOUNCEMENTS,
  MOCK_EBOOKS,
  MOCK_TESTS,
  MOCK_ATTEMPTS,
  MOCK_AUDIT_LOGS,
} from './mock/mockData';

// Local storage key prefixes for mock state persistence
const STORAGE_PREFIX = 'vidhya_x_demo_';

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

class MockService {
  private classes: ClassItem[] = getStored('classes', MOCK_CLASSES);
  private subjects: SubjectItem[] = getStored('subjects', MOCK_SUBJECTS);
  private chapters: ChapterItem[] = getStored('chapters', MOCK_CHAPTERS);
  private categories: ContentCategory[] = getStored('categories', MOCK_CATEGORIES);
  private materials: StudyMaterial[] = getStored('materials', MOCK_MATERIALS);
  private paymentSettings: PaymentSettings = getStored('payment_settings', MOCK_PAYMENT_SETTINGS);
  private purchases: PurchaseRequest[] = getStored('purchases', MOCK_PURCHASES);
  private banners: PromotionalBanner[] = getStored('banners', MOCK_BANNERS);
  private announcements: Announcement[] = getStored('announcements', MOCK_ANNOUNCEMENTS);
  private ebooks: EbookItem[] = getStored('ebooks', MOCK_EBOOKS);
  private tests: OnlineTest[] = getStored('tests', MOCK_TESTS);
  private attempts: TestAttempt[] = getStored('attempts', MOCK_ATTEMPTS);
  private auditLogs: AdminAuditLog[] = getStored('audit_logs', MOCK_AUDIT_LOGS);
  private students: UserProfile[] = getStored('students', [DEMO_STUDENT_PROFILE, DEMO_STUDENT_GRADE12]);

  // Classes & Subjects
  async getClasses(): Promise<ClassItem[]> {
    return [...this.classes];
  }

  async getSubjects(classId?: string): Promise<SubjectItem[]> {
    if (!classId) return [...this.subjects];
    return this.subjects.filter((s) => s.classId === classId);
  }

  async getSubjectById(subjectId: string): Promise<SubjectItem | undefined> {
    return this.subjects.find((s) => s.id === subjectId);
  }

  async getChapters(subjectId?: string): Promise<ChapterItem[]> {
    if (!subjectId) return [...this.chapters];
    return this.chapters.filter((c) => c.subjectId === subjectId);
  }

  async getChapterById(chapterId: string): Promise<ChapterItem | undefined> {
    return this.chapters.find((c) => c.id === chapterId);
  }

  async getCategories(): Promise<ContentCategory[]> {
    return [...this.categories];
  }

  // Materials
  async getMaterials(filters?: {
    classId?: string;
    subjectId?: string;
    chapterId?: string;
    category?: string;
    search?: string;
    isPremium?: boolean;
  }): Promise<StudyMaterial[]> {
    let result = [...this.materials];
    if (filters?.classId) result = result.filter((m) => m.classId === filters.classId);
    if (filters?.subjectId) result = result.filter((m) => m.subjectId === filters.subjectId);
    if (filters?.chapterId) result = result.filter((m) => m.chapterId === filters.chapterId);
    if (filters?.category) result = result.filter((m) => m.category === filters.category);
    if (filters?.isPremium !== undefined) result = result.filter((m) => m.isPremium === filters.isPremium);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return result;
  }

  async getMaterialById(id: string): Promise<StudyMaterial | undefined> {
    return this.materials.find((m) => m.id === id);
  }

  async addMaterial(material: Omit<StudyMaterial, 'id' | 'createdAt' | 'downloadCount'>): Promise<StudyMaterial> {
    const newMat: StudyMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.materials.unshift(newMat);
    setStored('materials', this.materials);
    return newMat;
  }

  async updateMaterial(id: string, updates: Partial<StudyMaterial>): Promise<StudyMaterial | undefined> {
    const idx = this.materials.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.materials[idx] = { ...this.materials[idx], ...updates };
    setStored('materials', this.materials);
    return this.materials[idx];
  }

  async deleteMaterial(id: string): Promise<boolean> {
    this.materials = this.materials.filter((m) => m.id !== id);
    setStored('materials', this.materials);
    return true;
  }

  // Purchases
  async getPurchases(userId?: string): Promise<PurchaseRequest[]> {
    if (!userId) return [...this.purchases];
    return this.purchases.filter((p) => p.userId === userId);
  }

  async getPurchaseById(id: string): Promise<PurchaseRequest | undefined> {
    return this.purchases.find((p) => p.id === id);
  }

  async submitPurchaseRequest(params: {
    userId: string;
    studentName: string;
    studentEmail: string;
    classGrade: 11 | 12;
    paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
    transactionReference: string;
    payerPhoneNumber: string;
    proofUrl?: string;
  }): Promise<PurchaseRequest> {
    const newPurchase: PurchaseRequest = {
      id: `pur-${Date.now()}`,
      userId: params.userId,
      studentName: params.studentName,
      studentEmail: params.studentEmail,
      packageId: `class-${params.classGrade}-full`,
      packageName: `Grade ${params.classGrade} Science Full Premium Notes`,
      classGrade: params.classGrade,
      amountNpr: 599, // Server-enforced price
      paymentMethod: params.paymentMethod,
      transactionReference: params.transactionReference,
      payerPhoneNumber: params.payerPhoneNumber,
      proofUrl: params.proofUrl,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
    };
    this.purchases.unshift(newPurchase);
    setStored('purchases', this.purchases);
    return newPurchase;
  }

  async reviewPurchase(
    purchaseId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    adminEmail: string,
    adminNote?: string
  ): Promise<PurchaseRequest | undefined> {
    const purchase = this.purchases.find((p) => p.id === purchaseId);
    if (!purchase) return undefined;
    purchase.status = status;
    purchase.reviewedBy = adminEmail;
    purchase.reviewedAt = new Date().toISOString();
    if (adminNote) purchase.adminNote = adminNote;

    // Log to admin audit log
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      adminId,
      adminEmail,
      action: status === 'approved' ? 'APPROVE_PURCHASE' : 'REJECT_PURCHASE',
      targetEntity: 'purchases',
      entityId: purchaseId,
      details: `${status.toUpperCase()} request for ${purchase.packageName} by ${purchase.studentName} (Ref: ${purchase.transactionReference}).`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);

    setStored('purchases', this.purchases);
    setStored('audit_logs', this.auditLogs);
    return purchase;
  }

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    return { ...this.paymentSettings };
  }

  async updatePaymentSettings(updates: Partial<PaymentSettings>): Promise<PaymentSettings> {
    this.paymentSettings = { ...this.paymentSettings, ...updates };
    setStored('payment_settings', this.paymentSettings);
    return this.paymentSettings;
  }

  // Banners
  async getBanners(): Promise<PromotionalBanner[]> {
    return [...this.banners].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async addBanner(banner: Omit<PromotionalBanner, 'id' | 'createdAt'>): Promise<PromotionalBanner> {
    const newB: PromotionalBanner = {
      ...banner,
      id: `ban-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.banners.push(newB);
    setStored('banners', this.banners);
    return newB;
  }

  async updateBanner(id: string, updates: Partial<PromotionalBanner>): Promise<PromotionalBanner | undefined> {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.banners[idx] = { ...this.banners[idx], ...updates };
    setStored('banners', this.banners);
    return this.banners[idx];
  }

  async deleteBanner(id: string): Promise<boolean> {
    this.banners = this.banners.filter((b) => b.id !== id);
    setStored('banners', this.banners);
    return true;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return [...this.announcements];
  }

  async markAnnouncementRead(id: string): Promise<void> {
    const a = this.announcements.find((item) => item.id === id);
    if (a) {
      a.readByCurrentUser = true;
      setStored('announcements', this.announcements);
    }
  }

  async createAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const newA: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.announcements.unshift(newA);
    setStored('announcements', this.announcements);
    return newA;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    setStored('announcements', this.announcements);
    return true;
  }

  // E-books
  async getEbooks(classGrade?: 11 | 12): Promise<EbookItem[]> {
    if (!classGrade) return [...this.ebooks];
    return this.ebooks.filter((e) => e.classGrade === classGrade);
  }

  async addEbook(ebook: Omit<EbookItem, 'id' | 'createdAt'>): Promise<EbookItem> {
    const newEb: EbookItem = {
      ...ebook,
      id: `ebk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.ebooks.unshift(newEb);
    setStored('ebooks', this.ebooks);
    return newEb;
  }

  async deleteEbook(id: string): Promise<boolean> {
    this.ebooks = this.ebooks.filter((e) => e.id !== id);
    setStored('ebooks', this.ebooks);
    return true;
  }

  // Tests
  async getTests(classGrade?: 11 | 12): Promise<OnlineTest[]> {
    let result = [...this.tests];
    if (classGrade) result = result.filter((t) => t.classGrade === classGrade);
    return result;
  }

  async getTestById(id: string): Promise<OnlineTest | undefined> {
    return this.tests.find((t) => t.id === id);
  }

  async submitTestAttempt(params: {
    testId: string;
    userId: string;
    studentName: string;
    answers: Record<string, number>;
    timeSpentSeconds: number;
  }): Promise<TestAttempt> {
    const test = this.tests.find((t) => t.id === params.testId);
    if (!test) throw new Error('Test not found');

    let score = 0;
    const questions = test.questions || [];
    questions.forEach((q) => {
      const selected = params.answers[q.id];
      if (selected === q.correctOptionIndex) {
        score += q.points;
      }
    });

    const percentage = Math.round((score / test.totalMarks) * 100);
    const isPassed = percentage >= test.passPercentage;

    const newAttempt: TestAttempt = {
      id: `att-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      userId: params.userId,
      studentName: params.studentName,
      score,
      totalMarks: test.totalMarks,
      percentage,
      isPassed,
      timeSpentSeconds: params.timeSpentSeconds,
      answers: params.answers,
      completedAt: new Date().toISOString(),
    };

    this.attempts.unshift(newAttempt);
    setStored('attempts', this.attempts);
    return newAttempt;
  }

  async getTestAttempts(userId?: string): Promise<TestAttempt[]> {
    if (!userId) return [...this.attempts];
    return this.attempts.filter((a) => a.userId === userId);
  }

  async getAttemptById(id: string): Promise<TestAttempt | undefined> {
    return this.attempts.find((a) => a.id === id);
  }

  // Students & Admin Directory
  async getStudents(): Promise<UserProfile[]> {
    return [...this.students];
  }

  async getAdminMetrics() {
    const pendingPurchases = this.purchases.filter((p) => p.status === 'pending_approval').length;
    const approvedPurchases = this.purchases.filter((p) => p.status === 'approved').length;
    const rejectedPurchases = this.purchases.filter((p) => p.status === 'rejected').length;
    const totalMaterials = this.materials.length;
    const totalStudents = this.students.length;
    const activeBanners = this.banners.filter((b) => b.isActive).length;

    return {
      totalStudents,
      pendingPurchases,
      approvedPurchases,
      rejectedPurchases,
      totalMaterials,
      activeBanners,
      totalRevenueNpr: approvedPurchases * 599,
    };
  }

  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return [...this.auditLogs];
  }

  // Reset demo storage to fresh defaults
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_PREFIX + 'classes');
    localStorage.removeItem(STORAGE_PREFIX + 'subjects');
    localStorage.removeItem(STORAGE_PREFIX + 'chapters');
    localStorage.removeItem(STORAGE_PREFIX + 'materials');
    localStorage.removeItem(STORAGE_PREFIX + 'purchases');
    localStorage.removeItem(STORAGE_PREFIX + 'payment_settings');
    localStorage.removeItem(STORAGE_PREFIX + 'banners');
    localStorage.removeItem(STORAGE_PREFIX + 'announcements');
    localStorage.removeItem(STORAGE_PREFIX + 'ebooks');
    localStorage.removeItem(STORAGE_PREFIX + 'tests');
    localStorage.removeItem(STORAGE_PREFIX + 'attempts');
    localStorage.removeItem(STORAGE_PREFIX + 'audit_logs');
    localStorage.removeItem(STORAGE_PREFIX + 'students');

    this.classes = [...MOCK_CLASSES];
    this.subjects = [...MOCK_SUBJECTS];
    this.chapters = [...MOCK_CHAPTERS];
    this.materials = [...MOCK_MATERIALS];
    this.paymentSettings = { ...MOCK_PAYMENT_SETTINGS };
    this.purchases = [...MOCK_PURCHASES];
    this.banners = [...MOCK_BANNERS];
    this.announcements = [...MOCK_ANNOUNCEMENTS];
    this.ebooks = [...MOCK_EBOOKS];
    this.tests = [...MOCK_TESTS];
    this.attempts = [...MOCK_ATTEMPTS];
    this.auditLogs = [...MOCK_AUDIT_LOGS];
    this.students = [DEMO_STUDENT_PROFILE, DEMO_STUDENT_GRADE12];
  }
}

export const mockService = new MockService();
