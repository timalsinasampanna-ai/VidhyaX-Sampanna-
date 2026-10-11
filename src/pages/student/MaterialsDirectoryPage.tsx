import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, FileText, Lock, ChevronRight } from 'lucide-react';
import { StudyMaterial } from '../../types';

export const MaterialsDirectoryPage: React.FC = () => {
  const { hasAccessToClass } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getMaterials().then((data) => setMaterials(data));
  }, []);

  const filtered = materials.filter((m) => {
    if (selectedGrade !== 'all' && m.classId !== selectedGrade) return false;
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.subjectName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Curriculum Documents
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Study Materials Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search across all chapter notes, 10-year board questions, and step-by-step solutions.
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, formula, subject..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Grades (11 &amp; 12)</option>
              <option value="11">Grade 11 Science</option>
              <option value="12">Grade 12 Science</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Notes">Notes</option>
              <option value="PYQ">Past Year Questions (PYQ)</option>
              <option value="Solutions">Solutions</option>
              <option value="Practice Questions">Practice Questions</option>
              <option value="Other Study Materials">Other Study Materials</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((mat) => {
            const hasAccess = hasAccessToClass(parseInt(mat.classId, 10) as 11 | 12);
            const canAccess = !mat.isPremium || hasAccess;

            return (
              <div
                key={mat.id}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-indigo-400">Class {mat.classId} · {mat.subjectName}</span>
                    {mat.isPremium ? (
                      canAccess ? (
                        <span className="text-[10px] font-bold text-emerald-400">Unlocked</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          Premium
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400">Free</span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{mat.pageCount} Pages · {mat.category}</span>
                  <Link
                    to={`/pdf/${mat.id}`}
                    className="text-indigo-400 group-hover:translate-x-1 transition-transform font-medium flex items-center gap-1"
                  >
                    <span>{canAccess ? 'Open PDF' : 'Preview'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
            No study materials found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
