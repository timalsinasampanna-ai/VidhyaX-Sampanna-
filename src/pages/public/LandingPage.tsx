import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  BookOpen,
  CheckCircle2,
  Atom,
  FlaskConical,
  Leaf,
  Dna,
  Calculator,
  Laptop,
  ArrowRight,
  Sparkles,
  Download,
  ShieldCheck,
  Award,
  ChevronRight,
  Star,
  Users,
} from 'lucide-react';
import { ClassItem, SubjectItem, Announcement } from '../../types';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<'11' | '12'>('11');

  useEffect(() => {
    Promise.all([api.getClasses(), api.getSubjects(), api.getAnnouncements()]).then(
      ([cls, subs, anns]) => {
        setClasses(cls);
        setSubjects(subs);
        setAnnouncements(anns.slice(0, 3));
      }
    );
  }, []);

  const gradeSubjects = subjects.filter((s) => s.classId === selectedGrade);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/25 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-xs font-medium text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nepal’s Premier Grade 11 &amp; 12 Science Education Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
                Master NEB Science with{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                  Unrivaled Clarity.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Comprehensive chapter notes, 10-year solved past papers, formula compendiums, and timed mock tests strictly mapped to the NEB syllabus for Grade 11 &amp; Grade 12 scholars.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={user ? '/dashboard' : '/signup'}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:gap-3"
                >
                  <span>{user ? 'Go to Student Dashboard' : 'Start Learning Today'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/study"
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl transition-colors"
                >
                  Browse Free Syllabus Notes
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-900 grid grid-cols-3 gap-4 text-xs text-slate-400">
                <div>
                  <p className="font-bold text-lg text-white font-mono">100%</p>
                  <p>NEB Syllabus Aligned</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-white font-mono">NPR 599</p>
                  <p>Full Session Package</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-white font-mono">8 Subjects</p>
                  <p>Physics to English</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                <img
                  src="/src/assets/images/vidhya_hero_science_1791696657665.jpg"
                  alt="Vidhya X High School Science Scholars Nepal"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="text-xs font-semibold text-indigo-300">Confidential Study Notes</span>
                  <h3 className="text-lg font-bold text-white">Full Grade 11 &amp; 12 Master Compendium</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Instant access via eSewa QR payment with verified administration approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Bar if any */}
      {announcements.length > 0 && (
        <section className="bg-slate-900/60 border-b border-slate-800/80 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase text-[10px]">
                Notice
              </span>
              <span className="text-slate-300 truncate">{announcements[0].title}</span>
            </div>
            <Link
              to="/announcements"
              className="text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-4 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Grade 11 & Grade 12 Dedicated Package Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Targeted Curriculum</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Choose Your Academic Stream
          </h2>
          <p className="text-slate-400 text-sm">
            Tailored specifically for Grade 11 and Grade 12 Science batches with complete theory notes, past paper solutions, and board model sets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Grade 11 Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden aspect-video border border-slate-800 mb-4">
                <img
                  src="/src/assets/images/grade_11_science_card_1791696667960.jpg"
                  alt="Grade 11 Science Curriculum"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">NEB Class 11</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Grade 11 Science Master Package</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Full Access</span>
                  <span className="text-2xl font-black text-white font-mono">NPR 599</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Foundational mechanics, stoichiometry, atomic quantum numbers, fluid cell biology, differential calculus, and C foundations.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 8 Subjects Covered (Physics, Chem, Bio/CS, Math, Eng, Nep)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10-Year Solved NEB Board Past Question Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant eSewa QR Verification &amp; Offline Download Access</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
              <Link
                to="/class/11"
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>View Full Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/checkout/class-11-full"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Get Grade 11 Access (NPR 599)
              </Link>
            </div>
          </div>

          {/* Grade 12 Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="rounded-xl overflow-hidden aspect-video border border-slate-800 mb-4">
                <img
                  src="/src/assets/images/grade_12_science_card_1791696679473.jpg"
                  alt="Grade 12 Science Curriculum"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">NEB Class 12</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Grade 12 Science Master Package</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Full Access</span>
                  <span className="text-2xl font-black text-white font-mono">NPR 599</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Board topper notes for Rotational Dynamics, Electromagnetism, Reaction Mechanisms, Human Physiology, Integral Calculus &amp; DBMS.
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>High-yield derivations with standard marking rubrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Targeted for NEB Board A+ &amp; Entrance Pre-requisites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Interactive Mock Test Series with Detailed Explanations</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
              <Link
                to="/class/12"
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>View Full Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/checkout/class-12-full"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Get Grade 12 Access (NPR 599)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Subject Explorer */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Curriculum Map</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Explore Subjects &amp; Chapters
              </h2>
            </div>

            {/* Grade Switcher Segmented Control */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setSelectedGrade('11')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedGrade === '11' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Grade 11
              </button>
              <button
                onClick={() => setSelectedGrade('12')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedGrade === '12' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Grade 12
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gradeSubjects.map((sub) => (
              <Link
                key={sub.id}
                to={`/study/${selectedGrade}/${sub.id}`}
                className="p-5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    {sub.name === 'Physics' ? (
                      <Atom className="w-5 h-5" />
                    ) : sub.name === 'Chemistry' ? (
                      <FlaskConical className="w-5 h-5" />
                    ) : sub.name === 'Botany' ? (
                      <Leaf className="w-5 h-5" />
                    ) : sub.name === 'Zoology' ? (
                      <Dna className="w-5 h-5" />
                    ) : sub.name.includes('Math') ? (
                      <Calculator className="w-5 h-5" />
                    ) : sub.name.includes('Computer') ? (
                      <Laptop className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.description}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{sub.chapterCount} Chapters</span>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Why Vidhya X */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">NEB Board-Ready Derivations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every physics derivation and chemistry reaction mechanism is mapped to official NEB marking criteria so you know exactly where points are earned.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Offline Study &amp; Clean PDF Viewer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with a distraction-free responsive browser PDF reader featuring zoom, page bookmarks, full-screen study mode, and watermarked security.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant eSewa QR Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay securely via Nepal’s digital wallet eSewa. Administrative review process takes 5-6 hours with human confirmation and audit transparency.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
