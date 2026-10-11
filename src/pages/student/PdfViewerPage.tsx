import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { PdfViewer } from '../../components/pdf/PdfViewer';
import { StudyMaterial } from '../../types';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

export const PdfViewerPage: React.FC = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const { hasAccessToClass } = useAuth();

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!materialId) return;
    setLoading(true);
    api.getMaterialById(materialId).then((m) => {
      setMaterial((m as StudyMaterial) || null);
      setLoading(false);
    });
  }, [materialId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Loading document reader...
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Document Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested study material does not exist or may have been unlisted.
        </p>
        <Link
          to="/materials"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Materials
        </Link>
      </div>
    );
  }

  const gradeNumber = (material.classId === '12' ? 12 : 11) as 11 | 12;
  const hasAccess = hasAccessToClass(gradeNumber);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Syllabus</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Grade {material.classId} · {material.subjectName} · {material.category}
            </span>
            {!hasAccess && material.isPremium && (
              <Link
                to={`/checkout/class-${material.classId}-full`}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Unlock Grade {material.classId} (NPR 599)
              </Link>
            )}
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <PdfViewer
          material={material}
          hasAccess={hasAccess}
          onUpgradeClick={() => navigate(`/checkout/class-${material.classId}-full`)}
        />
      </div>
    </div>
  );
};
