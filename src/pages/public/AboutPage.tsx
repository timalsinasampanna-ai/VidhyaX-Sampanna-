import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, GraduationCap, Award, Compass, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Our Mission</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            About Vidhya X
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Empowering Nepalese Grade 11 &amp; Grade 12 Science scholars with high-yield conceptual clarity, board exam mastery, and modern digital study tools.
          </p>
        </div>

        {/* Narrative */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-xl font-bold text-white">The Vidhya X Vision</h2>
          <p>
            Secondary school science education in Nepal is rigorous. Students preparing for the NEB (National Examinations Board) Grade 11 and Grade 12 examinations juggle intensive theoretical derivations, lab practicals, past ten-year questions, and entrance preparations for IOE Pulchowk, CEE Medical, and international universities.
          </p>
          <p>
            Vidhya X was created to cut through textbook clutter. Instead of hundreds of pages of disjointed photocopies, we curate crystal-clear chapter summaries, marked model answers, formula cheat sheets, and diagnostic online tests accessible anytime on mobile or desktop.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div className="space-y-2">
              <Compass className="w-6 h-6 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Curriculum Precision</h3>
              <p className="text-xs text-slate-400">
                100% compliant with CDC/NEB syllabus specifications for Physics, Chemistry, Biology, Mathematics, CS, English, and Nepali.
              </p>
            </div>

            <div className="space-y-2">
              <Award className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-white text-base">Board-Proven Insights</h3>
              <p className="text-xs text-slate-400">
                Every derivation highlights standard point allocation rubrics so students maximize marks during external examination checking.
              </p>
            </div>

            <div className="space-y-2">
              <HeartHandshake className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Affordable Access</h3>
              <p className="text-xs text-slate-400">
                Entire year-round premium access to all 8 subjects for just NPR 599 via local Nepal digital wallet (eSewa).
              </p>
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
            ST
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-white">Sampanna Timalsina</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Lead Academic Architect &amp; Founder
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading the development, pedagogical quality, and digital distribution of Vidhya X learning resources across all seven provinces of Nepal.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Contact: officialsampannatimalsina@gmail.com
            </p>
          </div>
        </div>

        {/* Action CTA */}
        <div className="text-center pt-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg text-sm transition-colors"
          >
            <span>Create Your Student Account</span>
            <GraduationCap className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
