import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Plus, Trash2, Edit3, Image, Check, X, ArrowUpDown } from 'lucide-react';
import { PromotionalBanner } from '../../types';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('Explore Now');
  const [ctaLink, setCtaLink] = useState('/class/11');
  const [badgeText, setBadgeText] = useState('New Release');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/vidhya_hero_science_1791696657665.jpg');

  const fetchBanners = () => {
    api.getBanners().then((b) => setBanners(b));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addBanner({
      title,
      subtitle,
      ctaText,
      ctaLink,
      badgeText,
      imageUrl,
      isActive: true,
      sortOrder: banners.length + 1,
    });
    setShowAddModal(false);
    fetchBanners();
    setTitle('');
    setSubtitle('');
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await api.deleteBanner(id);
    setDeleteConfirmId(null);
    fetchBanners();
  };

  const handleToggleActive = async (banner: PromotionalBanner) => {
    await api.updateBanner(banner.id, { isActive: !banner.isActive });
    fetchBanners();
  };

  return (
    <AdminLayout
      title="Promotional Banners Management"
      subtitle="Configure dashboard carousel banners, promo titles, and action links."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Total Banners: {banners.length}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((ban) => (
            <div
              key={ban.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                {ban.imageUrl && (
                  <div className="h-40 overflow-hidden bg-slate-950 relative">
                    <img
                      src={ban.imageUrl}
                      alt={ban.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleActive(ban)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          ban.isActive
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {ban.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  {ban.badgeText && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {ban.badgeText}
                    </span>
                  )}
                  <h3 className="font-bold text-white text-base">{ban.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{ban.subtitle}</p>
                  <p className="text-[11px] text-indigo-400 font-mono">
                    Link: {ban.ctaLink} ({ban.ctaText})
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Order: {ban.sortOrder}</span>
                <button
                  onClick={() => setDeleteConfirmId(ban.id)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Delete Banner"
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
              <h4 className="font-bold text-white text-sm">Delete Promotional Banner?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove this banner from the student dashboard carousel?
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
              <h3 className="text-lg font-bold text-white">Create Promotional Banner</h3>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Banner Headline</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NEB Grade 11 & 12 Board Special Edition"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Subtitle / Summary</label>
                  <textarea
                    rows={2}
                    required
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Short description of the offer or collection"
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">CTA Link Path</label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Image Asset Path</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
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
                    Save Banner
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
