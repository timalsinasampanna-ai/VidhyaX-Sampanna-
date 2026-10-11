import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  TrendingUp,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminMetrics(), api.getPurchases()]).then(([m, p]) => {
      setMetrics(m);
      setRecentPurchases(p.slice(0, 5));
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout
      title="Administration Control Center"
      subtitle="Overview of registered students, eSewa payment approvals, and curriculum assets."
    >
      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">
              {metrics?.pendingPurchases ?? 0}
            </p>
            <Link
              to="/admin/purchases"
              className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Review Requests</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Approved Purchases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {metrics?.approvedPurchases ?? 0}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Total Rev: NPR {metrics?.totalRevenueNpr?.toLocaleString() ?? 0}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Registered Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono">
              {metrics?.totalStudents ?? 0}
            </p>
            <Link
              to="/admin/students"
              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Student Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Published Study PDFs</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono">
              {metrics?.totalMaterials ?? 0}
            </p>
            <Link
              to="/admin/materials"
              className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Materials</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Purchases Queue */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Payment Submissions</h2>
              <p className="text-xs text-slate-400">
                Latest student eSewa payment proof requests requiring verification.
              </p>
            </div>
            <Link
              to="/admin/purchases"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Review All Requests
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recentPurchases.map((pur) => (
              <div
                key={pur.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{pur.studentName}</span>
                    <span className="text-slate-400 font-mono">({pur.studentEmail})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>{pur.packageName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-400">Ref: {pur.transactionReference}</span>
                    <span aria-hidden="true">·</span>
                    <span>NPR {pur.amountNpr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      pur.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : pur.status === 'pending_approval'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {pur.status}
                  </span>

                  <Link
                    to="/admin/purchases"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Administrator Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/payment-settings"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 block"
          >
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Update eSewa QR Code</h3>
            <p className="text-xs text-slate-400">
              Configure official merchant number, QR image asset, and payout instructions.
            </p>
          </Link>

          <Link
            to="/admin/announcements"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 block"
          >
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Broadcast Notice</h3>
            <p className="text-xs text-slate-400">
              Publish urgent exam date routine updates or study guide notifications.
            </p>
          </Link>

          <Link
            to="/admin/materials"
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 block"
          >
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-sm">Upload Study Material</h3>
            <p className="text-xs text-slate-400">
              Add new PDF documents, categorize into Notes/PYQ, and toggle premium access.
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};
