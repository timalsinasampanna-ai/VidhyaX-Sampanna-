import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  BookOpen,
  ShoppingBag,
  Award,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bookmark,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PromotionalBanner, StudyMaterial, TestAttempt, PurchaseRequest } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user, hasAccessToClass, purchases } = useAuth();
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [recentMaterials, setRecentMaterials] = useState<StudyMaterial[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.getBanners(),
      api.getMaterials({ limit: 4 }),
      user ? api.getTestAttempts(user.id) : Promise.resolve([]),
    ]).then(([bans, mats, atts]) => {
      setBanners(bans);
      setRecentMaterials(mats.slice(0, 4));
      setRecentAttempts(atts.slice(0, 3));
    });
  }, [user]);

  // Auto rotate banners every 6 seconds if multiple
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const hasGrade11 = hasAccessToClass(11);
  const hasGrade12 = hasAccessToClass(12);

  const grade11Purchase = purchases.find((p) => p.classGrade === 11);
  const grade12Purchase = purchases.find((p) => p.classGrade === 12);

  const getStatusBadge = (purchase?: PurchaseRequest, hasAccess?: boolean) => {
    if (hasAccess) {
      return (
        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Unlocked (Approved)</span>
        </span>
      );
    }
    if (!purchase) {
      return <span className="text-xs text-slate-400">Not Purchased</span>;
    }
    if (purchase.status === 'pending_approval') {
      return (
        <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Admin Approval (5–6 hrs)</span>
        </span>
      );
    }
    if (purchase.status === 'rejected') {
      return (
        <span className="text-xs text-rose-400 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Payment Rejected (See remarks)</span>
        </span>
      );
    }
    return <span className="text-xs text-slate-400">Processing</span>;
  };

  const filteredMaterials = searchQuery
    ? recentMaterials.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentMaterials;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Namaste, {user?.fullName || 'Scholar'}!
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.collegeName ? `${user.collegeName} · ` : ''}
              {user?.grade ? `Grade ${user.grade} Science` : 'NEB Science Stream'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, chapters..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Promotional Carousel */}
        {banners.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`transition-opacity duration-500 ${
                  idx === activeBannerIdx ? 'block' : 'hidden'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  <div className="p-6 sm:p-8 md:col-span-7 space-y-3">
                    {banner.badgeText && (
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {banner.badgeText}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {banner.title}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                      {banner.subtitle}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={banner.ctaLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {banner.imageUrl && (
                    <div className="md:col-span-5 h-48 md:h-full min-h-[180px]">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Carousel navigation dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-6 flex items-center gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeBannerIdx ? 'bg-indigo-400 w-5' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Academic Streams Status (Grade 11 & Grade 12 Cards) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Enrolled Curriculums</h2>
            <Link to="/purchases" className="text-xs text-indigo-400 hover:text-indigo-300">
              View Purchase Receipts →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade 11 Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 uppercase">Class 11 Science</span>
                  {getStatusBadge(grade11Purchase, hasGrade11)}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Grade 11 Full Master Notes</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Physics, Chemistry, Botany, Zoology, Math, Computer Science, English &amp; Nepali.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to="/class/11"
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <span>Explore 8 Subjects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {hasGrade11 ? (
                  <Link
                    to="/class/11"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    View Unlocked Notes
                  </Link>
                ) : (
                  <Link
                    to="/checkout/class-11-full"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Unlock Full (NPR 599)
                  </Link>
                )}
              </div>
            </div>

            {/* Grade 12 Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 uppercase">Class 12 Science</span>
                  {getStatusBadge(grade12Purchase, hasGrade12)}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Grade 12 Full Master Notes</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Board exam high-yield derivations, past 10 years solved papers, and numerical banks.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to="/class/12"
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <span>Explore 8 Subjects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {hasGrade12 ? (
                  <Link
                    to="/class/12"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    View Unlocked Notes
                  </Link>
                ) : (
                  <Link
                    to="/checkout/class-12-full"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Unlock Full (NPR 599)
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recently Opened / Featured Materials */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recommended Study Materials</h2>
              <Link to="/materials" className="text-xs text-indigo-400 hover:text-indigo-300">
                View All Materials ({recentMaterials.length}+) →
              </Link>
            </div>

            <div className="space-y-3">
              {filteredMaterials.map((mat) => {
                const canAccess = !mat.isPremium || hasAccessToClass(parseInt(mat.classId, 10) as 11 | 12);
                return (
                  <div
                    key={mat.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                          <span>Grade {mat.classId}</span>
                          <span aria-hidden="true">·</span>
                          <span>{mat.subjectName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{mat.category}</span>
                        </div>
                        <h4 className="font-semibold text-white text-sm hover:text-indigo-300 transition-colors">
                          <Link to={`/pdf/${mat.id}`}>{mat.title}</Link>
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{mat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {mat.isPremium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                          {canAccess ? 'Unlocked' : 'Premium'}
                        </span>
                      )}
                      <Link
                        to={`/pdf/${mat.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
                      >
                        Open Reader
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test History & Quick Shortcuts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Shortcuts */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Center</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/study"
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center gap-1.5 text-center text-slate-300 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium">Syllabus Hub</span>
                </Link>
                <Link
                  to="/tests"
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center gap-1.5 text-center text-slate-300 transition-colors"
                >
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Online Tests</span>
                </Link>
                <Link
                  to="/ebooks"
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center gap-1.5 text-center text-slate-300 transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium">E-Books</span>
                </Link>
                <Link
                  to="/downloads"
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center gap-1.5 text-center text-slate-300 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span className="font-medium">Downloads</span>
                </Link>
              </div>
            </div>

            {/* Test Attempts History */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Test Scores</h3>
                <Link to="/tests" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Take Test →
                </Link>
              </div>

              {recentAttempts.length > 0 ? (
                <div className="space-y-2.5">
                  {recentAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <div className="max-w-[170px] truncate">
                        <p className="font-medium text-white truncate">{att.testTitle}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(att.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold font-mono ${
                            att.isPassed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {att.score}/{att.totalMarks} ({att.percentage}%)
                        </span>
                        <Link
                          to={`/results/${att.id}`}
                          className="block text-[10px] text-indigo-400 hover:underline"
                        >
                          Review answers
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  <p>No tests attempted yet.</p>
                  <Link to="/tests" className="text-indigo-400 font-medium mt-1 inline-block">
                    Start a Diagnostic Test
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
