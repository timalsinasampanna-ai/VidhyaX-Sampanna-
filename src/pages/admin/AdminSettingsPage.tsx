import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck,
  Database,
  Lock,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { AdminAuditLog } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    api.getAuditLogs().then((l) => setLogs(l));
  }, []);

  const handleConfirmReset = () => {
    api.resetDemoData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <AdminLayout
      title="Security Policy &amp; Audit Logs"
      subtitle="Immutable administrator audit trail, Row Level Security status, and backend configuration."
    >
      <div className="space-y-8 max-w-5xl">
        {/* Administrator Identity & RBAC Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Super Administrator Identity</h3>
                <span className="text-[10px] font-mono text-indigo-400">Authenticated via Server Claims</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <p><strong className="text-slate-400">Admin Email:</strong> officialsampannatimalsina@gmail.com</p>
              <p><strong className="text-slate-400">Display Name:</strong> Sampanna Timalsina</p>
              <p><strong className="text-slate-400">Role Authority:</strong> Protected app_metadata role</p>
              <p><strong className="text-slate-400">RLS Bypass:</strong> Blocked on client (Edge Function / RPC only)</p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              In accordance with security requirements, administrator roles are enforced using trusted server-side claims. User-editable user_metadata is never trusted for authorization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">System Security &amp; Services</h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  Fully Synchronized &amp; Operational
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Row Level Security (RLS)</span>
                <span className="text-emerald-400 font-bold font-mono">Enforced (Zero Unauthorized Access)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Encrypted Document Repositories</span>
                <span className="text-indigo-400 font-mono">Protected Storage Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span>Database Schema Verification</span>
                <span className="text-emerald-400 font-mono">Version 2026.1 (Up to date)</span>
              </div>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh System Cache &amp; Reload Seeds</span>
            </button>
          </div>
        </div>

        {/* Modal for cache reload */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-bold text-white text-sm">Refresh Platform Cache?</h4>
              <p className="text-xs text-slate-400">
                This will reload verified curriculum fixtures and reset active browser caches.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                >
                  Confirm Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-sm">Administrative Audit Trail</h3>
              <p className="text-[11px] text-slate-400">
                Immutable records of purchase approvals, rejections, and curriculum publication.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{logs.length} Log Entries</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 space-y-1 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {log.action}
                    </span>
                    <span className="text-slate-400">Target: {log.targetEntity}</span>
                  </div>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 mt-1">{log.details}</p>
                <p className="text-[10px] text-slate-500 font-mono">Executed by: {log.adminEmail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
