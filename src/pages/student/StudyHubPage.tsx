import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Atom,
  FlaskConical,
  Leaf,
  Dna,
  Calculator,
  Laptop,
  CheckCircle2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { SubjectItem } from '../../types';

export const StudyHubPage: React.FC = () => {
  const { hasAccessToClass } = useAuth();
  const [activeGrade, setActiveGrade] = useState<'11' | '12'>('11');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getSubjects(activeGrade).then((data) => setSubjects(data));
  }, [activeGrade]);

  const hasAccess = hasAccessToClass(activeGrade === '11' ? 11 : 12);

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Academic Syllabus
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              NEB Science Study Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select Grade and subject to view chapter notes, past paper solutions, and practice sets.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Grade Switcher Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveGrade('11')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeGrade === '11'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Grade 11 Science (8 Subjects)
          </button>
          <button
            onClick={() => setActiveGrade('12')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeGrade === '12'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Grade 12 Science (8 Subjects)
          </button>

          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Access Status:</span>
            {hasAccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unlocked</span>
              </span>
            ) : (
              <Link
                to={`/checkout/class-${activeGrade}-full`}
                className="text-amber-400 hover:underline font-semibold"
              >
                Unlock for NPR 599 →
              </Link>
            )}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((sub) => {
            const Icon = getSubjectIcon(sub.name);
            return (
              <Link
                key={sub.id}
                to={`/study/${activeGrade}/${sub.id}`}
                className="p-5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{sub.code}</span>
                    <h3 className="font-bold text-white text-lg mt-0.5 group-hover:text-indigo-300 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{sub.chapterCount} Chapters</span>
                  <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Browse</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
