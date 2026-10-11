import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, FileText, Lock, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { StudyMaterial, SubjectItem, ChapterItem } from '../../types';

export const AdminMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState<'11' | '12'>('11');
  const [subjectId, setSubjectId] = useState('phy-11');
  const [chapterId, setChapterId] = useState('ch-phy11-1');
  const [category, setCategory] = useState<any>('Notes');
  const [isPremium, setIsPremium] = useState(true);
  const [pageCount, setPageCount] = useState(16);

  const fetchAll = () => {
    Promise.all([api.getMaterials(), api.getSubjects(), api.getChapters()]).then(
      ([m, s, ch]) => {
        setMaterials(m);
        setSubjects(s);
        setChapters(ch);
      }
    );
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selSub = subjects.find((s) => s.id === subjectId);
    const selChap = chapters.find((c) => c.id === chapterId);

    await api.addMaterial({
      title,
      description,
      classId,
      subjectId,
      subjectName: selSub?.name || 'Physics',
      chapterId,
      chapterName: selChap?.title || 'Mechanics',
      category,
      isPremium,
      fileUrl: `/mock/docs/${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSizeBytes: 2800000,
      pageCount: Number(pageCount),
      published: true,
    });

    setShowAddModal(false);
    fetchAll();
    setTitle('');
    setDescription('');
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await api.deleteMaterial(id);
    setDeleteConfirmId(null);
    fetchAll();
  };

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="PDF Materials &amp; Study Notes CMS"
      subtitle="Upload chapter notes, designate free/premium tier status, and publish to students."
    >
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PDF documents..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors self-end sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>

        {/* Materials Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="divide-y divide-slate-800 text-xs">
            {filtered.map((mat) => (
              <div
                key={mat.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] mb-0.5">
                      <span className="text-indigo-400">Class {mat.classId}</span>
                      <span>·</span>
                      <span>{mat.subjectName}</span>
                      <span>·</span>
                      <span>{mat.category}</span>
                      <span>·</span>
                      <span>{mat.pageCount} Pages</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">{mat.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{mat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      mat.isPremium
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {mat.isPremium ? 'Premium (Locked)' : 'Free Access'}
                  </span>

                  <button
                    onClick={() => setDeleteConfirmId(mat.id)}
                    className="p-1.5 rounded hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-bold text-white text-sm">Delete Study Material?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this PDF material? Students will no longer have access to view or download it.
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

        {/* Modal for adding material */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Upload New Study Material PDF</h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wave Optics: Young's Double Slit Derivation"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Class Grade</label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="Notes">Notes</option>
                      <option value="PYQ">PYQ (Past Year Questions)</option>
                      <option value="Solutions">Solutions</option>
                      <option value="Practice Questions">Practice Questions</option>
                      <option value="Other Study Materials">Other Study Materials</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Subject</label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Page Count</label>
                    <input
                      type="number"
                      value={pageCount}
                      onChange={(e) => setPageCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Summary Description</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Highlight the key topics, equations or NEB year covered"
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrem"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                  />
                  <label htmlFor="isPrem" className="text-slate-300 font-medium cursor-pointer">
                    Lock as Premium (Requires Grade {classId} package access)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Save &amp; Publish PDF
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
