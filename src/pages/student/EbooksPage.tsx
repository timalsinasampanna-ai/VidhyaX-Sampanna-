import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Bookmark, Lock, BookOpen, Search, ChevronRight, User } from 'lucide-react';
import { EbookItem } from '../../types';

export const EbooksPage: React.FC = () => {
  const { hasAccessToClass } = useAuth();
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<'all' | '11' | '12'>('all');
  const [search, setSearch] = useState('');
  const [readingBook, setReadingBook] = useState<EbookItem | null>(null);

  useEffect(() => {
    api.getEbooks().then((data) => setEbooks(data));
  }, []);

  const filtered = ebooks.filter((eb) => {
    if (selectedGrade !== 'all' && eb.classGrade.toString() !== selectedGrade) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!eb.title.toLowerCase().includes(q) && !eb.author.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Digital Reference Library
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              NEB Science E-Books
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Recommended textbook compendiums, numerical guides, and high-yield diagram atlases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setSelectedGrade('11')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === '11' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Grade 11
            </button>
            <button
              onClick={() => setSelectedGrade('12')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === '12' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Grade 12
            </button>
          </div>
        </div>

        {/* Ebooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((eb) => {
            const hasAccess = hasAccessToClass(eb.classGrade);
            const canRead = !eb.isPremium || hasAccess;

            return (
              <div
                key={eb.id}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
              >
                <div>
                  {eb.coverImageUrl && (
                    <div className="aspect-4/3 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                      <img
                        src={eb.coverImageUrl}
                        alt={eb.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-400">
                        Grade {eb.classGrade} · {eb.subjectName}
                      </span>
                      {eb.isPremium && !hasAccess ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          Premium Book
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                      {eb.title}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{eb.author}</span>
                      </p>
                      {eb.publisher && <p className="text-[11px] text-slate-500">{eb.publisher}</p>}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {eb.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{eb.pageCount} Pages</span>
                  {canRead ? (
                    <button
                      onClick={() => setReadingBook(eb)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
                    >
                      Read Online
                    </button>
                  ) : (
                    <Link
                      to={`/checkout/class-${eb.classGrade}-full`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-medium transition-colors"
                    >
                      Unlock Access
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ebook Reader Modal */}
        {readingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                    Grade {readingBook.classGrade} Science · {readingBook.subjectName}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{readingBook.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">By {readingBook.author}</p>
                </div>
                <button
                  onClick={() => setReadingBook(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Pages: {readingBook.pageCount}</span>
                  <span>File Size: {(readingBook.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  <span className="text-emerald-400">Digital Edition Verified</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {readingBook.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Included Chapters &amp; High-Yield Topic Index
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Unit 1: Theory Foundations</span>
                    <span className="text-indigo-400 text-[10px] font-mono">pp. 1–45</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Unit 2: Board Exam Numericals</span>
                    <span className="text-indigo-400 text-[10px] font-mono">pp. 46–120</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Unit 3: Formula Derivations</span>
                    <span className="text-indigo-400 text-[10px] font-mono">pp. 121–190</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">Unit 4: Model Questions Bank</span>
                    <span className="text-indigo-400 text-[10px] font-mono">pp. 191–{readingBook.pageCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setReadingBook(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Close
                </button>
                <Link
                  to="/pdf/mat-001"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Open Full Screen Reader
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
