import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, School, CheckCircle2, AlertCircle, Shield, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, isAdmin } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [grade, setGrade] = useState<'11' | '12' | 'both'>(user?.grade || '11');
  const [collegeName, setCollegeName] = useState(user?.collegeName || '');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Validate phone number
    const phoneRegex = /^(\+977)?[9][6-8]\d{8}$/;
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (cleanPhone && !phoneRegex.test(cleanPhone)) {
      setStatusMsg({
        type: 'error',
        text: 'Please enter a valid Nepal mobile number format (+97798XXXXXXXX or 98XXXXXXXX).',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        fullName,
        phoneNumber: cleanPhone,
        grade,
        collegeName,
      });

      if (error) {
        setStatusMsg({ type: 'error', text: error });
      } else {
        setStatusMsg({ type: 'success', text: 'Profile changes updated successfully!' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-slate-900 pb-5">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Student Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Account &amp; Security Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile and enrolled higher secondary college details.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-black text-2xl flex items-center justify-center">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.fullName || 'Student'}</h2>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                  Role: {user?.role || 'student'}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                    Admin Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Nepal Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+97798XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Current Class / Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="11">Grade 11 Science</option>
                  <option value="12">Grade 12 Science</option>
                  <option value="both">Both Grades (Alumni / Repeater)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">College / School</label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. St. Xavier's, Trinity"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security / Sign Out box */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Session Management</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign out from this device to protect your account.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
