import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PurchaseRequest } from '../../types';

export const PurchasesPage: React.FC = () => {
  const { user, refreshPurchases } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getPurchases(user.id);
      setPurchases(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRefresh = async () => {
    await refreshPurchases();
    await loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved &amp; Active</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review (5–6 hrs)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Transaction History
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              My Premium Purchases
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify your eSewa payment approval records and access entitlements.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white rounded-lg transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Informational Box */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Payments are manually verified by Vidhya X administrators to prevent fraudulent transaction code reuse. If your request has been pending for more than 6 hours, please reach out to <strong className="text-white">officialsampannatimalsina@gmail.com</strong> with your eSewa transaction receipt.
          </p>
        </div>

        {purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400">Request ID: {purchase.id}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{purchase.packageName}</h3>
                  </div>
                  <div>{getStatusBadge(purchase.status)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Amount Paid</span>
                    <span className="font-bold text-white font-mono text-sm">
                      NPR {purchase.amountNpr}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Method</span>
                    <span className="font-semibold text-slate-200 uppercase font-mono">
                      {purchase.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transaction Reference</span>
                    <span className="font-bold text-indigo-300 font-mono">
                      {purchase.transactionReference}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Submitted On</span>
                    <span className="text-slate-300">
                      {new Date(purchase.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {purchase.adminNote && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-400 font-semibold block mb-0.5">Administrator Remark:</span>
                    <p className="text-slate-300">{purchase.adminNote}</p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {purchase.reviewedBy
                      ? `Reviewed by ${purchase.reviewedBy} at ${new Date(purchase.reviewedAt!).toLocaleDateString()}`
                      : 'Under review by administration team'}
                  </span>

                  {purchase.status === 'approved' && (
                    <Link
                      to={`/class/${purchase.classGrade}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <span>Access Grade {purchase.classGrade} Notes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Purchases Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven’t submitted any premium notes requests yet. Unlock all 8 subjects for Grade 11 or Grade 12 for NPR 599.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/class/11"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
              >
                Grade 11 Package
              </Link>
              <Link
                to="/class/12"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg"
              >
                Grade 12 Package
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
