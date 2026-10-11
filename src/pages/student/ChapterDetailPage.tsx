import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Lock,
  Download,
  CheckCircle2,
  ChevronRight,
  History,
  HelpCircle,
  FolderArchive,
  BookOpen,
} from 'lucide-react';
import { ChapterItem, StudyMaterial, ContentCategoryType } from '../../types';

export const ChapterDetailPage: React.FC = () => {
  const { classId, subjectId, chapterId } = useParams<{
    classId: string;
    subjectId: string;
    chapterId: string;
  }>();

  const { hasAccessToClass } = useAuth();
  const [chapter, setChapter] = useState<ChapterItem | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const gradeNumber = (classId === '12' ? 12 : 11) as 11 | 12;
  const hasAccess = hasAccessToClass(gradeNumber);

  const categories: ContentCategoryType[] = [
    'Notes',
    'PYQ',
    'Solutions',
    'Practice Questions',
    'Other Study Materials',
  ];

  useEffect(() => {
    Promise.all([
      api.getChapterById(chapterId || ''),
      api.getMaterials({ chapterId }),
    ]).then(([chap, mats]) => {
      setChapter(chap || null);
      setMaterials(mats);
    });
  }, [chapterId]);

  const filteredMaterials =
    activeCategory === 'all'
      ? materials
      : materials.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to={`/class/${classId}`} className="hover:text-white">Grade {classId}</Link>
          <span>/</span>
          <Link to={`/study/${classId}/${subjectId}`} className="hover:text-white">Subject</Link>
          <span>/</span>
          <span className="text-white font-medium">{chapter?.title || 'Chapter'}</span>
        </div>

        {/* Chapter Header */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Chapter {chapter?.chapterNumber}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{chapter?.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {chapter?.description}
          </p>
        </div>

        {/* Content Categories Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Materials ({materials.length})
          </button>
          {categories.map((cat) => {
            const count = materials.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Materials List */}
        <div className="space-y-3">
          {filteredMaterials.map((mat) => {
            const canAccess = !mat.isPremium || hasAccess;
            return (
              <div
                key={mat.id}
                className="p-5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                      <span className="font-medium text-indigo-300">{mat.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{mat.pageCount} Pages</span>
                      <span aria-hidden="true">·</span>
                      <span>{(mat.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <h3 className="font-bold text-white text-base">
                      <Link to={`/pdf/${mat.id}`} className="hover:text-indigo-300 transition-colors">
                        {mat.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                      {mat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {mat.isPremium ? (
                    canAccess ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Premium</span>
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      Free Access
                    </span>
                  )}

                  <Link
                    to={`/pdf/${mat.id}`}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <span>{canAccess ? 'Open PDF' : 'Preview Note'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
              No materials under "{activeCategory}" found for this chapter yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
