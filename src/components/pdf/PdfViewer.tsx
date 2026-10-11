import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  FileText,
  AlertCircle,
  Bookmark,
  Share2,
} from 'lucide-react';
import { StudyMaterial } from '../../types';

interface PdfViewerProps {
  material: StudyMaterial;
  hasAccess: boolean;
  onUpgradeClick?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ material, hasAccess, onUpgradeClick }) => {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`vidhya_x_read_pos_${material.id}`);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = material.pageCount || 16;

  // Save reading position
  useEffect(() => {
    try {
      localStorage.setItem(`vidhya_x_read_pos_${material.id}`, currentPage.toString());
    } catch {
      // ignore
    }
  }, [material.id, currentPage]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleDownload = () => {
    if (!hasAccess && material.isPremium) {
      if (onUpgradeClick) onUpgradeClick();
      return;
    }
    // Simulate safe authorized download
    const blob = new Blob([`Vidhya X Academic Material: ${material.title}\nClass: ${material.classId}\nSubject: ${material.subjectName}\nLicense: Authorized Student Single-User Study Copy`], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'w-full min-h-[640px]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 select-none">
        {/* Document Info */}
        <div className="flex items-center gap-2 max-w-sm truncate">
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold text-white truncate">{material.title}</span>
          {material.isPremium && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">
              Premium
            </span>
          )}
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-transparent"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="tabular-nums px-2 font-mono">
            Page <span className="text-white font-semibold">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-40 text-slate-300 disabled:hover:bg-transparent"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-40"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 font-mono text-[11px] hover:text-white"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-40"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              hasAccess || !material.isPremium
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/40 border border-amber-500/40'
            }`}
          >
            {hasAccess || !material.isPremium ? (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{downloadSuccess ? 'Downloaded!' : 'Download PDF'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Full Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Document Stage */}
      <div className="flex-1 bg-slate-950/70 p-6 flex items-center justify-center overflow-auto relative">
        {/* Academic Page Sheet */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className={`bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 relative select-text transition-all ${
            fitMode === 'width' ? 'w-full max-w-3xl min-h-[960px]' : 'w-[680px] min-h-[880px]'
          }`}
        >
          {/* Subtle Security Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4 select-none rotate-[-30deg]">
            <span className="text-4xl font-black text-slate-900 tracking-widest uppercase">
              VIDHYA X · LICENSED COPY
            </span>
          </div>

          {/* Academic Header */}
          <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase">
                NEB Curriculum · Grade {material.classId} Science
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {material.subjectName || 'Science'} — {material.chapterName || 'Core Topic'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">{material.title}</p>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <span>Section {currentPage}</span>
              <br />
              <span>Doc ID: {material.id.slice(0, 10)}</span>
            </div>
          </div>

          {/* Render Academic Content Body according to current page */}
          <div className="space-y-6 text-sm text-slate-800 leading-relaxed font-sans">
            {currentPage === 1 ? (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
                    1. Fundamental Principles &amp; Overview
                  </h3>
                  <p className="text-slate-700">
                    This unit presents a rigorous synthesis of high-yield conceptual foundations mandated by the National Examinations Board (NEB) syllabus. Key analytical models, mathematical derivations, and schematic diagrams are structured for maximum retention.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                    Key Theoretical Axiom:
                  </h4>
                  <div className="font-mono text-xs bg-slate-900 text-indigo-200 p-3 rounded overflow-x-auto">
                    {material.subjectName === 'Physics'
                      ? 'F_net = m * (dv/dt)  |  L = I * ω = constant (in isolated system)  |  E_total = 1/2 k A^2'
                      : material.subjectName === 'Chemistry'
                      ? 'k = A * exp(-Ea / RT)  |  pH = -log10[H+]  |  PV = nRT (Ideal Gas Equation)'
                      : material.subjectName === 'Basic Mathematics'
                      ? '∫ (1 / √(a^2 - x^2)) dx = sin^(-1)(x/a) + C  |  lim (x→0) [sin(x) / x] = 1'
                      : 'DNA → (Transcription) → mRNA → (Translation) → Functional Polypeptide Chain'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2">2. Step-by-Step Analytical Derivation</h4>
                  <p className="text-slate-700 mb-2">
                    Consider an idealized physical system subjected to external boundary constraints. Integrating the governing differential balance:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    <li>Step 1: Set up the differential equation with standard initial conditions at t = 0.</li>
                    <li>Step 2: Separate the variables across the spatial and temporal coordinates.</li>
                    <li>Step 3: Evaluate definite limits using NEB standardized constants (g = 9.8 m/s², R = 8.314 J/mol·K).</li>
                  </ul>
                </div>
              </>
            ) : currentPage === 2 ? (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
                    2. Solved Past NEB Board Problems (2072 - 2081 BS)
                  </h3>
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-xs text-amber-950 mb-4">
                    <p className="font-bold mb-1">Question (NEB 2080 Set B, 4 Marks):</p>
                    <p>
                      Explain the underlying physical / chemical mechanism governing this process. Deduce an expression for the net efficiency and compute the numerical result when initial parameter values are doubled.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">Standard Marking Scheme Solution:</h4>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    <strong>Solution:</strong> By invoking the principle of conservation of energy and applying first-order perturbations, we establish that the system response scales quadratically with respect to the amplitude.
                  </p>
                  <div className="p-3 bg-slate-100 rounded text-xs font-mono text-slate-800">
                    Result: Ratio = (2)^2 / 1 = 4.00 (Hence the output parameter increases by 300%).
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
                    Section {currentPage}: Advanced Exam Practice &amp; Memory Shortcuts
                  </h3>
                  <p className="text-slate-700 text-xs">
                    This section focuses on rapid recall mnemonic techniques and common pitfalls where students lose marks during board checking.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-indigo-700 block mb-1">Common Pitfall</span>
                    <p className="text-xs text-slate-600">
                      Omitting SI units in final answers results in a 0.5 mark deduction per numerical question. Always write units explicitly.
                    </p>
                  </div>
                  <div className="p-3 rounded border border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-emerald-700 block mb-1">Pro Tip</span>
                    <p className="text-xs text-slate-600">
                      Draw diagrams with a sharp pencil and label parts on the right side with parallel horizontal arrows.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Academic Footer */}
          <div className="border-t border-slate-200 pt-4 mt-8 flex justify-between items-center text-[10px] text-slate-400">
            <span>Vidhya X Education Nepal · Confidential Examination Notes</span>
            <span className="font-mono">Page {currentPage} of {totalPages}</span>
          </div>

          {/* Premium Lock Overlay for subsequent pages if not unlocked */}
          {!hasAccess && material.isPremium && currentPage > 2 && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-10 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Premium Study Material Locked</h4>
              <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                Pages 3 to {totalPages} contain complete derivations, unreleased NEB question banks, and numerical solutions. Unlock full access to Grade {material.classId} for just NPR 599.
              </p>
              <button
                onClick={onUpgradeClick}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg text-sm transition-transform hover:scale-105"
              >
                Unlock Grade {material.classId} Full Package (NPR 599)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Disclaimer Note */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Notice: Content protected by copyright. Screen capture watermark active.</span>
        </span>
        <span className="font-mono">Grade {material.classId} · {material.category}</span>
      </div>
    </div>
  );
};
