import { getSupabaseClient } from '../lib/supabase';
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

export class SupabaseService {
  private get client() {
    return getSupabaseClient();
  }

  // Classes & Subjects
  async getClasses(): Promise<ClassItem[]> {
    const { data, error } = await this.client
      .from('classes')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      gradeNumber: row.grade_number,
      description: row.description,
      priceNpr: row.price_npr,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      imageUrl: row.image_url,
    }));
  }

  async getSubjects(classId?: string): Promise<SubjectItem[]> {
    let query = this.client.from('subjects').select('*').order('sort_order', { ascending: true });
    if (classId) query = query.eq('class_id', classId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      classId: row.class_id,
      name: row.name,
      code: row.code,
      description: row.description,
      iconName: row.icon_name,
      chapterCount: row.chapter_count || 0,
      isPopular: row.is_popular,
      sortOrder: row.sort_order,
    }));
  }

  async getChapters(subjectId?: string): Promise<ChapterItem[]> {
    let query = this.client.from('chapters').select('*').order('chapter_number', { ascending: true });
    if (subjectId) query = query.eq('subject_id', subjectId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      subjectId: row.subject_id,
      classId: row.class_id,
      title: row.title,
      chapterNumber: row.chapter_number,
      description: row.description,
      materialCount: row.material_count || 0,
    }));
  }

  async getCategories(): Promise<ContentCategory[]> {
    const { data, error } = await this.client.from('content_categories').select('*');
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      iconName: row.icon_name,
    }));
  }

  // Study Materials
  async getMaterials(filters?: {
    classId?: string;
    subjectId?: string;
    chapterId?: string;
    category?: string;
    search?: string;
    isPremium?: boolean;
  }): Promise<StudyMaterial[]> {
    let query = this.client.from('study_materials').select('*').eq('published', true);
    if (filters?.classId) query = query.eq('class_id', filters.classId);
    if (filters?.subjectId) query = query.eq('subject_id', filters.subjectId);
    if (filters?.chapterId) query = query.eq('chapter_id', filters.chapterId);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.isPremium !== undefined) query = query.eq('is_premium', filters.isPremium);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      classId: row.class_id,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      chapterId: row.chapter_id,
      chapterName: row.chapter_name,
      category: row.category,
      isPremium: row.is_premium,
      fileUrl: row.file_url,
      fileSizeBytes: row.file_size_bytes,
      pageCount: row.page_count,
      downloadCount: row.download_count,
      published: row.published,
      createdAt: row.created_at,
    }));
  }

  async getMaterialById(id: string): Promise<StudyMaterial | undefined> {
    const { data, error } = await this.client.from('study_materials').select('*').eq('id', id).single();
    if (error) return undefined;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      classId: data.class_id,
      subjectId: data.subject_id,
      subjectName: data.subject_name,
      chapterId: data.chapter_id,
      chapterName: data.chapter_name,
      category: data.category,
      isPremium: data.is_premium,
      fileUrl: data.file_url,
      fileSizeBytes: data.file_size_bytes,
      pageCount: data.page_count,
      downloadCount: data.download_count,
      published: data.published,
      createdAt: data.created_at,
    };
  }

  // Generate secure signed URL for private premium material
  async getSignedPdfUrl(filePath: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from('premium-materials')
      .createSignedUrl(filePath, 3600); // 1 hour expiration
    if (error) throw error;
    return data.signedUrl;
  }

  // Purchases
  async getPurchases(userId?: string): Promise<PurchaseRequest[]> {
    let query = this.client.from('purchases').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      studentName: row.student_name,
      studentEmail: row.student_email,
      packageId: row.package_id,
      packageName: row.package_name,
      classGrade: row.class_grade,
      amountNpr: row.amount_npr,
      paymentMethod: row.payment_method,
      transactionReference: row.transaction_reference,
      payerPhoneNumber: row.payer_phone_number,
      proofFilePath: row.proof_file_path,
      proofUrl: row.proof_url,
      status: row.status,
      adminNote: row.admin_note,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at,
    }));
  }

  async submitPurchaseRequest(params: {
    userId: string;
    studentName: string;
    studentEmail: string;
    classGrade: 11 | 12;
    paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
    transactionReference: string;
    payerPhoneNumber: string;
    proofFile?: File;
  }): Promise<PurchaseRequest> {
    let proofFilePath: string | undefined = undefined;

    if (params.proofFile) {
      const fileName = `${params.userId}/${Date.now()}_${params.proofFile.name}`;
      const { data: uploadData, error: uploadErr } = await this.client.storage
        .from('payment-proofs')
        .upload(fileName, params.proofFile, { upsert: false });
      if (uploadErr) throw uploadErr;
      proofFilePath = uploadData.path;
    }

    const { data, error } = await this.client
      .from('purchases')
      .insert({
        user_id: params.userId,
        student_name: params.studentName,
        student_email: params.studentEmail,
        package_id: `class-${params.classGrade}-full`,
        package_name: `Grade ${params.classGrade} Science Full Premium Notes`,
        class_grade: params.classGrade,
        amount_npr: 599, // Enforced on database constraint/trigger
        payment_method: params.paymentMethod,
        transaction_reference: params.transactionReference,
        payer_phone_number: params.payerPhoneNumber,
        proof_file_path: proofFilePath,
        status: 'pending_approval',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      studentName: data.student_name,
      studentEmail: data.student_email,
      packageId: data.package_id,
      packageName: data.package_name,
      classGrade: data.class_grade,
      amountNpr: data.amount_npr,
      paymentMethod: data.payment_method,
      transactionReference: data.transaction_reference,
      payerPhoneNumber: data.payer_phone_number,
      proofFilePath: data.proof_file_path,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async reviewPurchase(
    purchaseId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    adminEmail: string,
    adminNote?: string
  ): Promise<void> {
    // Calling Edge Function or authorized RPC
    const { error } = await this.client.rpc('review_purchase_request', {
      p_purchase_id: purchaseId,
      p_status: status,
      p_admin_id: adminId,
      p_admin_email: adminEmail,
      p_admin_note: adminNote,
    });
    if (error) throw error;
  }

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    const { data, error } = await this.client.from('payment_settings').select('*').single();
    if (error) throw error;
    return {
      merchantName: data.merchant_name,
      esewaId: data.esewa_id,
      qrImageUrl: data.qr_image_url,
      instructionText: data.instruction_text,
      contactSupportPhone: data.contact_support_phone,
      contactSupportEmail: data.contact_support_email,
      approvalTimelineHours: data.approval_timeline_hours,
    };
  }

  // Tests
  async getTests(classGrade?: 11 | 12): Promise<OnlineTest[]> {
    let query = this.client.from('tests').select('*, test_questions(*)').eq('is_published', true);
    if (classGrade) query = query.eq('class_grade', classGrade);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      classGrade: row.class_grade,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      durationMinutes: row.duration_minutes,
      totalQuestions: row.total_questions,
      totalMarks: row.total_marks,
      passPercentage: row.pass_percentage,
      isPublished: row.is_published,
      createdAt: row.created_at,
      questions: (row.test_questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.question_text,
        options: q.options,
        correctOptionIndex: q.correct_option_index,
        explanation: q.explanation,
        points: q.points,
      })),
    }));
  }

  async submitTestAttempt(params: {
    testId: string;
    userId: string;
    studentName: string;
    answers: Record<string, number>;
    timeSpentSeconds: number;
  }): Promise<TestAttempt> {
    // Invoke secure Supabase Edge Function to score answers without exposing solution keys
    const { data, error } = await this.client.functions.invoke('test-scoring', {
      body: params,
    });
    if (error) throw error;
    return data;
  }

  async getTestAttempts(userId?: string): Promise<TestAttempt[]> {
    let query = this.client.from('test_attempts').select('*').order('completed_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      testId: row.test_id,
      testTitle: row.test_title,
      userId: row.user_id,
      studentName: row.student_name,
      score: row.score,
      totalMarks: row.total_marks,
      percentage: row.percentage,
      isPassed: row.is_passed,
      timeSpentSeconds: row.time_spent_seconds,
      answers: row.answers,
      completedAt: row.completed_at,
    }));
  }

  // Banners & Announcements
  async getBanners(): Promise<PromotionalBanner[]> {
    const { data, error } = await this.client
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      imageUrl: row.image_url,
      ctaText: row.cta_text,
      ctaLink: row.cta_link,
      badgeText: row.badge_text,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await this.client
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      priority: row.priority,
      targetAudience: row.target_audience,
      isPublished: row.is_published,
      createdAt: row.created_at,
    }));
  }

  async getEbooks(classGrade?: 11 | 12): Promise<EbookItem[]> {
    let query = this.client.from('ebooks').select('*').order('created_at', { ascending: false });
    if (classGrade) query = query.eq('class_grade', classGrade);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      description: row.description,
      classGrade: row.class_grade,
      subjectName: row.subject_name,
      coverImageUrl: row.cover_image_url,
      fileUrl: row.file_url,
      fileSizeBytes: row.file_size_bytes,
      pageCount: row.page_count,
      isPremium: row.is_premium,
      createdAt: row.created_at,
    }));
  }
}

export const supabaseService = new SupabaseService();
