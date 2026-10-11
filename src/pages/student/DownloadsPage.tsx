import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Download,
  Lock,
  FileText,
  CheckCircle2,
  HardDrive,
  Search,
  ExternalLink,
} from 'lucide-react';
import { StudyMaterial } from '../../types';

export const DownloadsPage: React.FC = () => {
  const { hasAccessToClass } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  useEffect(() => {
    api.getMaterials().then((data) => setMaterials(data));
  }, []);

  const handleDownload = (mat: StudyMaterial) => {
    // Generate text/blob file
    const blob = new Blob(
      [
        `Vidhya X Education Nepal\nMaterial: ${mat.title}\nClass: Grade ${mat.classId}\nSubject: ${mat.subjectName}\nLicensed To Student Authorized Copy`,
      ],
      { type: 'application/pdf' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mat.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadedIds((prev) => [...prev, mat.id]);
  };

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Offline Study Storage
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Download Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Save complete chapter notes and solved past papers for offline revision.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter downloads..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Downloads Table / Cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>Document Title &amp; Syllabus Details</span>
            <span>File Size &amp; Action</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filtered.map((mat) => {
              const gradeNum = parseInt(mat.classId, 10) as 11 | 12;
              const hasAccess = hasAccessToClass(gradeNum);
              const canDownload = !mat.isPremium || hasAccess;
              const isDownloaded = downloadedIds.includes(mat.id);

              return (
                <div
                  key={mat.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                        <span className="font-mono text-indigo-400">Grade {mat.classId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mat.subjectName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{mat.category}</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm">{mat.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{mat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:self-center self-end text-xs">
                    <span className="font-mono text-slate-400">
                      {(mat.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </span>

                    {canDownload ? (
                      <button
                        onClick={() => handleDownload(mat)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                          isDownloaded
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to={`/checkout/class-${mat.classId}-full`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock Download</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
