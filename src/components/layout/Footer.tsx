import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, GraduationCap, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                V
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Vidhya <span className="text-indigo-400">X</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nepal’s dedicated digital learning sanctuary for NEB Grade 11 and Grade 12 Science scholars. High-yield concept notes, past board questions, and timed mock assessments.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Kathmandu, Bagmati Province, Nepal</span>
            </div>
          </div>

          {/* Academic Pathways */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Academic Paths</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/class/11" className="hover:text-white transition-colors">
                  Grade 11 Science (Full Syllabus)
                </Link>
              </li>
              <li>
                <Link to="/class/12" className="hover:text-white transition-colors">
                  Grade 12 Science (Full Syllabus)
                </Link>
              </li>
              <li>
                <Link to="/study" className="hover:text-white transition-colors">
                  NEB Board PYQ Collections
                </Link>
              </li>
              <li>
                <Link to="/materials" className="hover:text-white transition-colors">
                  Physics &amp; Chemistry Master Notes
                </Link>
              </li>
              <li>
                <Link to="/ebooks" className="hover:text-white transition-colors">
                  Recommended Science Reference Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Services & Tests */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Assessment &amp; Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/tests" className="hover:text-white transition-colors">
                  Online Diagnostic Mock Tests
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="hover:text-white transition-colors">
                  Offline Download Center
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors">
                  NEB Examination Routine Notices
                </Link>
              </li>
              <li>
                <Link to="/purchases" className="hover:text-white transition-colors">
                  eSewa Payment Verification Help
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Teaching Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Admin Support */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform Integrity</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Protected by Vidhya X Cloud Security with strict data encryption and authenticated access controls. Content and transactions are verified end-to-end.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">officialsampannatimalsina@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>+977-9841234567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Vidhya X Education Nepal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">NEB Grade 11 &amp; 12 Syllabus Compliant</span>
            <span aria-hidden="true">·</span>
            <Link to="/about" className="hover:text-slate-400">
              Platform Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
