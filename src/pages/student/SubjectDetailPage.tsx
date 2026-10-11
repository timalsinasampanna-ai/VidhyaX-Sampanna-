import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  ChevronRight,
  FileText,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { SubjectItem, ChapterItem } from '../../types';

export const SubjectDetailPage: React.FC = () => {
  const { classId, subjectId } = useParams<{ classId: string; subjectId: string }>();
  const { hasAccessToClass } = useAuth();

  const [subject, setSubject] = useState<SubjectItem | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const gradeNumber = (classId === '12' ? 12 : 11) as 11 | 12;
  const hasAccess = hasAccessToClass(gradeNumber);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getSubjectById(subjectId || ''),
      api.getChapters(subjectId || ''),
    ]).then(([sub, chaps]) => {
      setSubject(sub || null);
      setChapters(chaps);
      setLoading(false);
    });
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/study" className="hover:text-white">Syllabus</Link>
          <span>/</span>
          <Link to={`/class/${classId}`} className="hover:text-white">Grade {classId}</Link>
          <span>/</span>
          <span className="text-white font-medium">{subject?.name || 'Subject'}</span>
        </div>

        {/* Header */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Grade {classId} Science · {subject?.code}
              </span>
              {hasAccess ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Full Access
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Free Previews Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{subject?.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {subject?.description}
            </p>
          </div>

          {!hasAccess && (
            <Link
              to={`/checkout/class-${classId}-full`}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shrink-0 transition-colors"
            >
              Unlock Full Notes (NPR 599)
            </Link>
          )}
        </div>

        {/* Chapters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Curriculum Chapters ({chapters.length})</h2>
            <span className="text-xs text-slate-500">Tap chapter to view Notes, PYQs &amp; Solutions</span>
          </div>

          <div className="space-y-3">
            {chapters.map((chap) => (
              <Link
                key={chap.id}
                to={`/study/${classId}/${subjectId}/${chap.id}`}
                className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    {chap.chapterNumber < 10 ? `0${chap.chapterNumber}` : chap.chapterNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {chap.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{chap.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                  <span className="hidden sm:inline font-mono">{chap.materialCount} Documents</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}

            {chapters.length === 0 && !loading && (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                No published chapters found for this subject yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
