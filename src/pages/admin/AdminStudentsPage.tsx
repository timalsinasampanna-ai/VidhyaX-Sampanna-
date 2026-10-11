import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Search, User, Mail, Phone, School, CheckCircle2, ShoppingBag } from 'lucide-react';
import { UserProfile, PurchaseRequest } from '../../types';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.getStudents(), api.getPurchases()]).then(([stus, purs]) => {
      setStudents(stus);
      setPurchases(purs);
    });
  }, []);

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.collegeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Student Directory &amp; Enrolments"
      subtitle="View registered students, enrolled higher secondary institutions, and access status without exposing sensitive credentials."
    >
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, college, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">Total: {filtered.length} Students</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Purchased Packages</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((s) => {
                  const studentPurchases = purchases.filter(
                    (p) => p.userId === s.id && p.status === 'approved'
                  );
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                            {s.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{s.fullName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{s.phoneNumber || 'N/A'}</td>
                      <td className="p-4 max-w-[180px] truncate">{s.collegeName || 'Not specified'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          Class {s.grade || '11'}
                        </span>
                      </td>
                      <td className="p-4">
                        {studentPurchases.length > 0 ? (
                          <div className="space-y-1">
                            {studentPurchases.map((p) => (
                              <span
                                key={p.id}
                                className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]"
                              >
                                Grade {p.classGrade} (NPR {p.amountNpr})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Free tier</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
