import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { TestAttempt, OnlineTest } from '../../types';
import confetti from 'canvas-confetti';

export const TestResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<OnlineTest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    api.getAttemptById(attemptId).then(async (att) => {
      if (att) {
        setAttempt(att);
        const t = await api.getTestById(att.testId);
        setTest(t || null);
        if (att.isPassed) {
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    });
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Loading assessment results...
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Result Not Found</h2>
        <Link to="/tests" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs">
          Return to Tests
        </Link>
      </div>
    );
  }

  const questions = test.questions || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Result Score Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Diagnostic Result · Grade {test.classGrade} {test.subjectName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{test.title}</h1>
            <p className="text-xs text-slate-400">
              Completed on {new Date(attempt.completedAt).toLocaleString()} by {attempt.studentName}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  attempt.isPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {attempt.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{attempt.isPassed ? 'Passed (Eligible)' : 'Needs Improvement'}</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Pass Criterion: {test.passPercentage}%
              </span>
            </div>
          </div>

          {/* Big Score Dial */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 min-w-[180px]">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
              {attempt.percentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono mt-1">
              {attempt.score} / {attempt.totalMarks} Points
            </span>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Question Review &amp; Scientific Explanations</h2>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const studentAnswerIdx = attempt.answers[q.id];
              const isCorrect = studentAnswerIdx === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border space-y-4 ${
                    isCorrect
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : 'bg-slate-900/60 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-indigo-400 font-bold">Question {idx + 1}</span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{q.points} pts)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm sm:text-base leading-relaxed">
                    {q.questionText}
                  </h3>

                  {/* Options Review */}
                  <div className="space-y-2 pt-1 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = studentAnswerIdx === optIdx;
                      const isTargetCorrect = q.correctOptionIndex === optIdx;

                      let itemStyle = 'bg-slate-950 border-slate-800 text-slate-300';
                      if (isTargetCorrect) {
                        itemStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 font-semibold';
                      } else if (isChosen && !isCorrect) {
                        itemStyle = 'bg-rose-500/10 border-rose-500/50 text-rose-200';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between ${itemStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded font-mono font-bold text-center leading-5 bg-slate-800 text-slate-300">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          <div className="text-[11px] font-mono">
                            {isTargetCorrect && <span className="text-emerald-400">Correct Answer</span>}
                            {isChosen && !isTargetCorrect && (
                              <span className="text-rose-400">Your Selection</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Scientific Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-indigo-400 block text-[11px] uppercase tracking-wider">
                        NEB Examiner Explanation:
                      </span>
                      <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-900">
          <Link
            to="/tests"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
          >
            All Online Tests
          </Link>

          <Link
            to={`/tests/${test.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake This Exam</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
