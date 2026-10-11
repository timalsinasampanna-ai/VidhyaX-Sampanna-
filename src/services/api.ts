import { isSupabaseConfigured } from '../lib/supabase';
import { mockService } from './mockService';
import { supabaseService } from './supabaseService';
import { StudyMaterial } from '../types';

export const isDemoMode = !isSupabaseConfigured();

// Helper to safely execute Supabase call, falling back to mock data if the database tables have not been created yet in the user's project
async function withFallback<T>(supabaseCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  if (isDemoMode) {
    return fallbackCall();
  }
  try {
    const result = await supabaseCall();
    if (Array.isArray(result) && result.length === 0) {
      // If table is empty (unseeded), provide standard mock dataset
      return fallbackCall();
    }
    return result;
  } catch (err: any) {
    console.warn('Supabase query failed (possibly tables not migrated yet), using seed fallback:', err?.message);
    return fallbackCall();
  }
}

// Unified API facade
export const api = {
  isDemo: isDemoMode,

  getClasses: () => withFallback(() => supabaseService.getClasses(), () => mockService.getClasses()),
  getSubjects: (classId?: string) => withFallback(() => supabaseService.getSubjects(classId), () => mockService.getSubjects(classId)),
  getSubjectById: (id: string) => mockService.getSubjectById(id),
  getChapters: (subjectId?: string) => withFallback(() => supabaseService.getChapters(subjectId), () => mockService.getChapters(subjectId)),
  getChapterById: (id: string) => mockService.getChapterById(id),
  getCategories: () => withFallback(() => supabaseService.getCategories(), () => mockService.getCategories()),

  getMaterials: (filters?: any) => withFallback(() => supabaseService.getMaterials(filters), () => mockService.getMaterials(filters)),
  getMaterialById: (id: string): Promise<StudyMaterial | undefined> => withFallback(() => supabaseService.getMaterialById(id), () => mockService.getMaterialById(id)),
  addMaterial: (mat: any) => mockService.addMaterial(mat),
  updateMaterial: (id: string, updates: any) => mockService.updateMaterial(id, updates),
  deleteMaterial: (id: string) => mockService.deleteMaterial(id),

  getPurchases: (userId?: string) => withFallback(() => supabaseService.getPurchases(userId), () => mockService.getPurchases(userId)),
  getPurchaseById: (id: string) => mockService.getPurchaseById(id),
  submitPurchaseRequest: (params: any) =>
    withFallback(
      () => supabaseService.submitPurchaseRequest(params),
      () => mockService.submitPurchaseRequest(params)
    ),
  reviewPurchase: (purchaseId: string, status: any, adminId: string, adminEmail: string, note?: string) =>
    withFallback(
      () => supabaseService.reviewPurchase(purchaseId, status, adminId, adminEmail, note).then(() => mockService.reviewPurchase(purchaseId, status, adminId, adminEmail, note)),
      () => mockService.reviewPurchase(purchaseId, status, adminId, adminEmail, note)
    ),

  getPaymentSettings: () => withFallback(() => supabaseService.getPaymentSettings(), () => mockService.getPaymentSettings()),
  updatePaymentSettings: (updates: any) => mockService.updatePaymentSettings(updates),

  getBanners: () => withFallback(() => supabaseService.getBanners(), () => mockService.getBanners()),
  addBanner: (banner: any) => mockService.addBanner(banner),
  updateBanner: (id: string, updates: any) => mockService.updateBanner(id, updates),
  deleteBanner: (id: string) => mockService.deleteBanner(id),

  getAnnouncements: () => withFallback(() => supabaseService.getAnnouncements(), () => mockService.getAnnouncements()),
  markAnnouncementRead: (id: string) => mockService.markAnnouncementRead(id),
  createAnnouncement: (ann: any) => mockService.createAnnouncement(ann),
  deleteAnnouncement: (id: string) => mockService.deleteAnnouncement(id),

  getEbooks: (classGrade?: 11 | 12) => withFallback(() => supabaseService.getEbooks(classGrade), () => mockService.getEbooks(classGrade)),
  addEbook: (ebook: any) => mockService.addEbook(ebook),
  deleteEbook: (id: string) => mockService.deleteEbook(id),

  getTests: (classGrade?: 11 | 12) => withFallback(() => supabaseService.getTests(classGrade), () => mockService.getTests(classGrade)),
  getTestById: (id: string) => mockService.getTestById(id),
  submitTestAttempt: (params: any) =>
    withFallback(
      () => supabaseService.submitTestAttempt(params),
      () => mockService.submitTestAttempt(params)
    ),
  getTestAttempts: (userId?: string) => withFallback(() => supabaseService.getTestAttempts(userId), () => mockService.getTestAttempts(userId)),
  getAttemptById: (id: string) => mockService.getAttemptById(id),

  getStudents: () => mockService.getStudents(),
  getAdminMetrics: () => mockService.getAdminMetrics(),
  getAuditLogs: () => mockService.getAuditLogs(),
  resetDemoData: () => mockService.resetDemoData(),
};
