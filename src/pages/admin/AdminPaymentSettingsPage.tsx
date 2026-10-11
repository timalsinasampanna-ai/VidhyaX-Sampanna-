import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { QrCode, CheckCircle2, Save, Upload, Info } from 'lucide-react';
import { PaymentSettings } from '../../types';

export const AdminPaymentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPaymentSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.updatePaymentSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading || !settings) {
    return (
      <AdminLayout title="eSewa Payment Configuration">
        <div className="text-xs text-slate-400">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Payment QR &amp; Gateway Configuration"
      subtitle="Manage the official merchant payment details displayed to students on checkout."
    >
      <div className="max-w-4xl space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Payment settings saved successfully! Changes are live across all student checkouts.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* QR Preview Column */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Payment QR Asset
            </h3>

            <div className="bg-white p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
              <img
                src={settings.qrImageUrl || '/src/assets/images/esewa_payment_qr_1791696688922.jpg'}
                alt="Active eSewa QR"
                className="w-full max-w-[220px] h-auto rounded"
              />
              <p className="text-[11px] font-bold text-slate-900 mt-2">
                Merchant: {settings.merchantName}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                QR Image URL / Storage Path
              </label>
              <input
                type="text"
                value={settings.qrImageUrl}
                onChange={(e) => setSettings({ ...settings, qrImageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Settings */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Official Merchant Name</label>
              <input
                type="text"
                value={settings.merchantName}
                onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">eSewa ID / Phone</label>
                <input
                  type="text"
                  value={settings.esewaId}
                  onChange={(e) => setSettings({ ...settings, esewaId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Approval Timeline</label>
                <input
                  type="text"
                  value={settings.approvalTimelineHours}
                  onChange={(e) => setSettings({ ...settings, approvalTimelineHours: e.target.value })}
                  placeholder="5–6 hours"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settings.contactSupportPhone}
                  onChange={(e) => setSettings({ ...settings, contactSupportPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.contactSupportEmail}
                  onChange={(e) => setSettings({ ...settings, contactSupportEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Student Instructions Text</label>
              <textarea
                rows={4}
                value={settings.instructionText}
                onChange={(e) => setSettings({ ...settings, instructionText: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Payment Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
