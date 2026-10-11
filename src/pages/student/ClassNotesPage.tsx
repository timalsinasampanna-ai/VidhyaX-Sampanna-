import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
  Atom,
  FlaskConical,
  Leaf,
  Dna,
  Calculator,
  Laptop,
  ArrowRight,
  ShieldCheck,
  FileText,
  ChevronRight,
  Download,
} from 'lucide-react';
import { ClassItem, SubjectItem, StudyMaterial, PurchaseRequest } from '../../types';

interface ClassNotesPageProps {
  forcedGrade?: 11 | 12;
}

export const ClassNotesPage: React.FC<ClassNotesPageProps> = ({ forcedGrade }) => {
  const params = useParams<{ classId?: string }>();
  const gradeNumber: 11 | 12 = forcedGrade || (params.classId === '12' ? 12 : 11);

  const { user, hasAccessToClass, purchases } = useAuth();
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = hasAccessToClass(gradeNumber);
  const userPurchase = purchases.find((p) => p.classGrade === gradeNumber);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getClasses(),
      api.getSubjects(gradeNumber.toString()),
      api.getMaterials({ classId: gradeNumber.toString() }),
    ]).then(([classes, subs, mats]) => {
      const currentClass = classes.find((c) => c.gradeNumber === gradeNumber) || null;
      setClassData(currentClass);
      setSubjects(subs);
      setMaterials(mats);
      setLoading(false);
    });
  }, [gradeNumber]);

  const getStatusDisplay = () => {
    if (hasAccess) {
      return {
        label: 'Approved & Unlocked',
        icon: CheckCircle2,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        description: 'You have full unlimited access to all subjects, PYQ papers, and offline downloads.',
      };
    }
    if (!userPurchase) {
      return {
        label: 'Not Purchased',
        icon: Lock,
        color: 'text-slate-400 bg-slate-800 border-slate-700',
        description: 'Purchase full session package for NPR 599 to unlock all chapter notes and solutions.',
      };
    }
    if (userPurchase.status === 'pending_approval') {
      return {
        label: 'Pending Approval',
        icon: Clock,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        description: `Your payment request (Ref: ${userPurchase.transactionReference}) is currently in the review queue. Approval usually takes 5–6 hours.`,
      };
    }
    if (userPurchase.status === 'rejected') {
      return {
        label: 'Payment Rejected',
        icon: AlertCircle,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        description: `Review note: ${userPurchase.adminNote || 'Transaction reference not found in eSewa account.'} Please contact support or resubmit.`,
      };
    }
    return {
      label: 'Payment Submitted',
      icon: Clock,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      description: 'Transaction submitted. Awaiting verification.',
    };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  const getSubjectIcon = (name: string) => {
    if (name.includes('Physics')) return Atom;
    if (name.includes('Chemistry')) return FlaskConical;
    if (name.includes('Botany')) return Leaf;
    if (name.includes('Zoology')) return Dna;
    if (name.includes('Math')) return Calculator;
    if (name.includes('Computer')) return Laptop;
    return BookOpen;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/study" className="hover:text-white">Syllabus</Link>
          <span>/</span>
          <span className="text-white font-medium">Grade {gradeNumber} Science</span>
        </div>

        {/* Hero Title & Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              NEB Curriculum · Class {gradeNumber}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Grade {gradeNumber} Science Full Academic Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {classData?.description ||
                `Complete NEB Grade ${gradeNumber} Science syllabus covering all 8 subjects: Physics, Chemistry, Biology, Mathematics, Computer Science, English, and Nepali.`}
            </p>

            {/* Status Alert Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${status.color}`}>
              <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase tracking-wider">Status:</span>
                  <span className="font-bold">{status.label}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{status.description}</p>
              </div>
            </div>
          </div>

          {/* Premium Package Price Action Box */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                  Full Session Access
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Grade {gradeNumber} Master Notes
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Package Price</span>
                <span className="text-2xl font-black text-white font-mono">NPR 599</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All 8 Science Subjects Unlocked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10-Year Solved NEB Board Past Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Textbook Solutions &amp; Formula Compendiums</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Offline PDF Downloads &amp; Reading Position</span>
              </div>
            </div>

            <div className="pt-2">
              {hasAccess ? (
                <div className="w-full py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Full Access Active</span>
                </div>
              ) : userPurchase?.status === 'pending_approval' ? (
                <Link
                  to="/purchases"
                  className="w-full py-2.5 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-300 text-center font-bold text-xs block transition-colors hover:bg-amber-600/30"
                >
                  View Pending Request
                </Link>
              ) : (
                <Link
                  to={`/checkout/class-${gradeNumber}-full`}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Purchase Full Notes (NPR 599)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 8 Subjects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white">Curriculum Subjects (8)</h2>
              <p className="text-xs text-slate-400">
                Click any subject to browse chapters, derivations, model answers, and PYQ sets.
              </p>
            </div>
            <Link to="/study" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View Syllabus Matrix →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => {
              const Icon = getSubjectIcon(sub.name);
              return (
                <Link
                  key={sub.id}
                  to={`/study/${gradeNumber}/${sub.id}`}
                  className="p-5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{sub.code}</span>
                        {hasAccess ? (
                          <span className="text-[10px] text-emerald-400 font-semibold">Unlocked</span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-semibold">Free &amp; Premium</span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base mt-1 group-hover:text-indigo-300 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{sub.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>{sub.chapterCount} Chapters</span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                      Browse →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Chapter Materials for this Grade */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Highlighted Materials</h2>
            <Link to="/materials" className="text-xs text-indigo-400 hover:text-indigo-300">
              Browse All ({materials.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((mat) => {
              const canView = !mat.isPremium || hasAccess;
              return (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                        <span>{mat.subjectName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mat.category}</span>
                      </div>
                      <h4 className="font-semibold text-white text-sm">
                        <Link to={`/pdf/${mat.id}`} className="hover:text-indigo-300 transition-colors">
                          {mat.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{mat.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {mat.isPremium && !hasAccess && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        Premium
                      </span>
                    )}
                    <Link
                      to={`/pdf/${mat.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                    >
                      {canView ? 'Open' : 'Preview'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
