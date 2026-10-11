import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { BookOpen, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { ClassItem, SubjectItem, ChapterItem } from '../../types';

export const AdminCurriculumPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'chapters'>('classes');

  useEffect(() => {
    Promise.all([api.getClasses(), api.getSubjects(), api.getChapters()]).then(
      ([c, s, ch]) => {
        setClasses(c);
        setSubjects(s);
        setChapters(ch);
      }
    );
  }, []);

  return (
    <AdminLayout
      title="Curriculum CMS (Classes, Subjects &amp; Chapters)"
      subtitle="Organize syllabus structure, package pricing, and chapter hierarchies."
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'subjects' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'chapters' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chapters ({chapters.length})
          </button>
        </div>

        {/* Classes Table */}
        {activeTab === 'classes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <span className="font-semibold text-white">Configured Academic Grades</span>
              <span className="text-slate-400 font-mono">Price Enforced: NPR 599</span>
            </div>
            <div className="divide-y divide-slate-800">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                  <div>
                    <span className="font-bold text-white text-sm">{cls.name}</span>
                    <p className="text-slate-400 mt-0.5">{cls.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      NPR {cls.priceNpr}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      Sort: {cls.sortOrder}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Table */}
        {activeTab === 'subjects' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <span className="font-semibold text-white">All 16 Subjects (Grade 11 &amp; 12)</span>
              <span className="text-slate-400 font-mono">NEB Aligned</span>
            </div>
            <div className="divide-y divide-slate-800">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{sub.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        Grade {sub.classId} · {sub.code}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{sub.description}</p>
                  </div>
                  <span className="font-mono text-indigo-400">{sub.chapterCount} Chapters</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapters Table */}
        {activeTab === 'chapters' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <span className="font-semibold text-white">Published Syllabus Chapters</span>
              <span className="text-slate-400 font-mono">Total: {chapters.length}</span>
            </div>
            <div className="divide-y divide-slate-800">
              {chapters.map((chap) => (
                <div key={chap.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold">Ch. {chap.chapterNumber}</span>
                      <span className="font-bold text-white">{chap.title}</span>
                      <span className="text-slate-500 font-mono text-[10px]">(Class {chap.classId})</span>
                    </div>
                    <p className="text-slate-400">{chap.description}</p>
                  </div>
                  <span className="font-mono text-slate-400">{chap.materialCount} Docs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
