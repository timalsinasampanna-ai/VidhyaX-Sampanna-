import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  QrCode,
  Image,
  Bell,
  BookOpen,
  FileText,
  Bookmark,
  CheckSquare,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Purchases Review', path: '/admin/purchases', icon: ShoppingBag },
    { label: 'Payment QR', path: '/admin/payment-settings', icon: QrCode },
    { label: 'Banners', path: '/admin/banners', icon: Image },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
    { label: 'Curriculum (Classes)', path: '/admin/classes', icon: BookOpen },
    { label: 'Subjects & Chapters', path: '/admin/subjects', icon: BookOpen },
    { label: 'PDF Materials', path: '/admin/materials', icon: FileText },
    { label: 'E-Books', path: '/admin/ebooks', icon: Bookmark },
    { label: 'Online Tests', path: '/admin/tests', icon: CheckSquare },
    { label: 'Audit & Settings', path: '/admin/settings', icon: Settings },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Administrator Access Required</h2>
        <p className="text-slate-400 max-w-md mb-6 text-sm">
          This portal is restricted to authorized administrative personnel ({' '}
          <code className="text-indigo-400">officialsampannatimalsina@gmail.com</code> ). Use the demo role switcher at the top to switch to Admin mode.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
        >
          Return to Vidhya X Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/70 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                VX
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Vidhya X Admin</span>
                <span className="text-[10px] text-indigo-400 font-mono">Sampanna HQ</span>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Back to Student View"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin identity footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <p className="font-semibold text-white truncate">{user?.fullName || 'Sampanna Timalsina'}</p>
          <p className="truncate text-slate-400 font-mono text-[10px]">officialsampannatimalsina@gmail.com</p>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-2 w-full py-1.5 flex items-center justify-center gap-1.5 text-rose-400 hover:bg-rose-950/30 rounded transition-colors text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
