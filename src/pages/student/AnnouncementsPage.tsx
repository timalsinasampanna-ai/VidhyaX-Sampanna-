import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Bell, Check, Clock, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { Announcement } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = () => {
    setLoading(true);
    api.getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await api.markAnnouncementRead(id);
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, readByCurrentUser: true } : a))
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Urgent Notice</span>
          </span>
        );
      case 'important':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Important</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
            General
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-slate-900 pb-5">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Academic Bulletins
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Official Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official NEB exam updates, newly released study materials, and academic schedule notices.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-2xl border transition-all ${
                ann.readByCurrentUser
                  ? 'bg-slate-900/40 border-slate-800 opacity-90'
                  : 'bg-slate-900/90 border-indigo-500/40 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(ann.priority)}
                  <span className="text-xs text-slate-400 font-mono">
                    Audience: {ann.targetAudience === 'all' ? 'All Grades' : `Grade ${ann.targetAudience.replace('class_', '')}`}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </span>

                  {!ann.readByCurrentUser && (
                    <button
                      onClick={() => handleMarkAsRead(ann.id)}
                      className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <h3 className="font-bold text-white text-base leading-snug">{ann.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            </div>
          ))}

          {announcements.length === 0 && !loading && (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
              No active announcements at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
