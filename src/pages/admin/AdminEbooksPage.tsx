import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { EbookItem } from '../../types';

export const AdminEbooksPage: React.FC = () => {
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [classGrade, setClassGrade] = useState<11 | 12>(11);
  const [subjectName, setSubjectName] = useState('Physics');

  const fetchEbooks = () => {
    api.getEbooks().then((eb) => setEbooks(eb));
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addEbook({
      title,
      author,
      publisher,
      description,
      classGrade,
      subjectName,
      fileUrl: '/mock/ebooks/sample.pdf',
      fileSizeBytes: 8500000,
      pageCount: 180,
      isPremium: true,
      coverImageUrl: '/src/assets/images/grade_11_science_card_1791696667960.jpg',
    });
    setShowAddModal(false);
    fetchEbooks();
    setTitle('');
    setAuthor('');
    setDescription('');
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await api.deleteEbook(id);
    setDeleteConfirmId(null);
    fetchEbooks();
  };

  return (
    <AdminLayout
      title="Reference E-Books Management"
      subtitle="Manage digital reference textbooks, author details, and student access."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Total Books: {ebooks.length}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New E-Book</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ebooks.map((eb) => (
            <div
              key={eb.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-400">
                    Grade {eb.classGrade} · {eb.subjectName}
                  </span>
                  <span className="text-slate-500 font-mono">{eb.pageCount} Pages</span>
                </div>
                <h3 className="font-bold text-white text-base">{eb.title}</h3>
                <p className="text-xs text-slate-400">
                  By {eb.author} {eb.publisher ? `· ${eb.publisher}` : ''}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">{eb.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    eb.isPremium
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {eb.isPremium ? 'Premium' : 'Free'}
                </span>

                <button
                  onClick={() => setDeleteConfirmId(eb.id)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Delete E-book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-bold text-white text-sm">Delete E-Book Listing?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this reference e-book from the student library?
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

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Add Reference E-Book</h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Higher Secondary Zoology Master Atlas"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Author Name</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Dr. B. R. Subedi"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Publisher</label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g. Heritage Publishers"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Class</label>
                    <select
                      value={classGrade}
                      onChange={(e) => setClassGrade(Number(e.target.value) as 11 | 12)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value={11}>Grade 11</option>
                      <option value={12}>Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
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
                    Save E-Book
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
