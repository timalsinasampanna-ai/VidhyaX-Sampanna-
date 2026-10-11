import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Check,
  X,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { PurchaseRequest } from '../../types';

export const AdminPurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal for review
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPurchases = async () => {
    setLoading(true);
    const list = await api.getPurchases();
    setPurchases(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleOpenReview = (pur: PurchaseRequest, type: 'approved' | 'rejected') => {
    setSelectedPurchase(pur);
    setActionType(type);
    setReviewError(null);
    setAdminNote(type === 'approved' ? 'Transaction verified against eSewa statement.' : 'Invalid reference code or payment mismatch.');
  };

  const handleConfirmDecision = async () => {
    if (!selectedPurchase || !user) return;
    setIsProcessing(true);
    setReviewError(null);
    try {
      await api.reviewPurchase(
        selectedPurchase.id,
        actionType,
        user.id,
        user.email,
        adminNote
      );
      setSelectedPurchase(null);
      await fetchPurchases();
    } catch (err: any) {
      setReviewError(err.message || 'Verification update could not be applied. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = purchases.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        p.studentName.toLowerCase().includes(q) ||
        p.studentEmail.toLowerCase().includes(q) ||
        p.transactionReference.toLowerCase().includes(q) ||
        p.payerPhoneNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <AdminLayout
      title="eSewa Payment Proof Review"
      subtitle="Verify student mobile wallet transaction references, inspect screenshots, and approve access."
    >
      <div className="space-y-6">
        {/* Controls Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, email, Ref ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
              }`}
            >
              All ({purchases.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending_approval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterStatus === 'pending_approval' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400'
              }`}
            >
              Pending ({purchases.filter((p) => p.status === 'pending_approval').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterStatus === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="divide-y divide-slate-800">
            {filtered.map((pur) => (
              <div
                key={pur.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-800/30 transition-colors text-xs"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{pur.studentName}</span>
                    <span className="text-slate-400 font-mono">({pur.studentEmail})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pur.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : pur.status === 'pending_approval'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {pur.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Package:</span>
                      <span>Grade {pur.classGrade} Notes</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ref ID:</span>
                      <span className="text-indigo-400 font-bold">{pur.transactionReference}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payer Phone:</span>
                      <span>{pur.payerPhoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Amount:</span>
                      <span className="font-bold text-white">NPR {pur.amountNpr}</span>
                    </div>
                  </div>

                  {pur.adminNote && (
                    <p className="text-slate-400 text-[11px] bg-slate-950/60 p-2 rounded">
                      <strong className="text-slate-300">Admin Remark:</strong> {pur.adminNote}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {pur.proofUrl && (
                    <button
                      onClick={() => window.open(pur.proofUrl, '_blank')}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      <Image className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Screenshot</span>
                    </button>
                  )}

                  {pur.status === 'pending_approval' ? (
                    <>
                      <button
                        onClick={() => handleOpenReview(pur, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleOpenReview(pur, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-slate-500 text-[11px] font-mono">
                      {pur.reviewedBy && <span>By: {pur.reviewedBy.split('@')[0]}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for Decision */}
        {selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">
                {actionType === 'approved' ? 'Approve Premium Access' : 'Reject Payment Submission'}
              </h3>

              {reviewError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-950 rounded-lg text-xs space-y-1 font-mono text-slate-300">
                <p>Student: {selectedPurchase.studentName} ({selectedPurchase.studentEmail})</p>
                <p>Package: {selectedPurchase.packageName}</p>
                <p>eSewa Ref ID: <strong className="text-indigo-400">{selectedPurchase.transactionReference}</strong></p>
                <p>Amount: NPR {selectedPurchase.amountNpr}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Administrator Audit Note / Feedback to Student:
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecision}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded-lg font-bold text-xs text-white transition-colors ${
                    actionType === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Confirm ${actionType.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
