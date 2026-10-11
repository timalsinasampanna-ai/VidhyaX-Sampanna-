import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, Bell, AlertTriangle, Info, Check } from 'lucide-react';
import { Announcement } from '../../types';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [targetAudience, setTargetAudience] = useState<'all' | 'class_11' | 'class_12'>('all');

  const fetchAnnouncements = () => {
    api.getAnnouncements().then((a) => setAnnouncements(a));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createAnnouncement({
      title,
      content,
      priority,
      targetAudience,
      isPublished: true,
    });
    setShowModal(false);
    fetchAnnouncements();
    setTitle('');
    setContent('');
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await api.deleteAnnouncement(id);
    setDeleteConfirmId(null);
    fetchAnnouncements();
  };

  return (
    <AdminLayout
      title="Announcements &amp; Bulletins"
      subtitle="Publish academic routine updates, examination alerts, and syllabus announcements."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Total Bulletins: {announcements.length}</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>

        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300'
                        : ann.priority === 'important'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ann.priority}
                  </span>
                  <span className="text-slate-500 font-mono">
                    Target: {ann.targetAudience}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{ann.title}</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ann.content}</p>
              </div>

              <button
                onClick={() => setDeleteConfirmId(ann.id)}
                className="text-rose-400 hover:text-rose-300 p-2 rounded hover:bg-rose-950/30 self-end sm:self-start transition-colors cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-bold text-white text-sm">Delete Announcement?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this notice? Students will no longer see it in their alerts.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create Announcement</h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Notice Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NEB Grade 11 & 12 Board Exam Routine Update"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Target Audience</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="all">All Grades (11 &amp; 12)</option>
                      <option value="class_11">Grade 11 Only</option>
                      <option value="class_12">Grade 12 Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Detailed Content</label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type the full announcement message here..."
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Broadcast Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
