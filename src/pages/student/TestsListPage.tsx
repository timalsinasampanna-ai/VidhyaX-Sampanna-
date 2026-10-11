import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Award, Clock, CheckCircle2, ChevronRight, Play, AlertCircle } from 'lucide-react';
import { OnlineTest, TestAttempt } from '../../types';

export const TestsListPage: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<OnlineTest[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<'all' | '11' | '12'>('all');

  useEffect(() => {
    Promise.all([
      api.getTests(),
      user ? api.getTestAttempts(user.id) : Promise.resolve([]),
    ]).then(([tList, atts]) => {
      setTests(tList);
      setAttempts(atts);
    });
  }, [user]);

  const filtered = tests.filter((t) => {
    if (selectedGrade !== 'all' && t.classGrade.toString() !== selectedGrade) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Diagnostic Assessments
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Online Science Mock Tests
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Timed objective question papers aligned with NEB evaluation patterns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setSelectedGrade('11')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === '11' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Grade 11
            </button>
            <button
              onClick={() => setSelectedGrade('12')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedGrade === '12' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Grade 12
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((test) => {
            const lastAttempt = attempts.find((a) => a.testId === test.id);

            return (
              <div
                key={test.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 space-y-5 transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-indigo-400 uppercase">
                      Class {test.classGrade} · {test.subjectName}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{test.durationMinutes} Mins</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-lg leading-snug">{test.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{test.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                    <span>{test.totalQuestions} Questions</span>
                    <span aria-hidden="true">·</span>
                    <span>{test.totalMarks} Marks</span>
                    <span aria-hidden="true">·</span>
                    <span>Pass: {test.passPercentage}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {lastAttempt ? (
                    <div className="text-xs">
                      <span className="text-slate-500 block">Previous Score:</span>
                      <span
                        className={`font-bold font-mono ${
                          lastAttempt.isPassed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {lastAttempt.score}/{lastAttempt.totalMarks} ({lastAttempt.percentage}%)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Not Attempted</span>
                  )}

                  <Link
                    to={`/tests/${test.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lastAttempt ? 'Retake Test' : 'Start Exam'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
