import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { OnlineTest } from '../../types';

export const TestExamPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<OnlineTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    api.getTestById(testId).then((t) => {
      if (t) {
        setTest(t);
        setTimeLeftSeconds(t.durationMinutes * 60);
      }
      setLoading(false);
    });
  }, [testId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!started || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, timeLeftSeconds]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleAutoSubmit = async () => {
    await performSubmission();
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const performSubmission = async () => {
    if (!test || !user) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const timeSpent = test.durationMinutes * 60 - timeLeftSeconds;
      const attempt = await api.submitTestAttempt({
        testId: test.id,
        userId: user.id,
        studentName: user.fullName,
        answers,
        timeSpentSeconds: Math.max(timeSpent, 1),
      });
      navigate(`/results/${attempt.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to submit examination paper. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Loading examination suite...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Examination not found.
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const answeredCount = Object.keys(answers).length;

  if (!started) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Test Instructions · Class {test.classGrade} {test.subjectName}
            </span>
            <h1 className="text-2xl font-black text-white">{test.title}</h1>
            <p className="text-xs text-slate-300 leading-relaxed">{test.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-center">
            <div>
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <span className="font-bold text-white text-base">{test.durationMinutes} Mins</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Questions</span>
              <span className="font-bold text-white text-base">{test.totalQuestions}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pass Mark</span>
              <span className="font-bold text-emerald-400 text-base">{test.passPercentage}%</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold text-slate-200">Standard Test Guidelines:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Each question carries equal marks. There is no negative marking for incorrect guesses.</li>
              <li>You may jump back and forward between questions using the question selector.</li>
              <li>When the timer expires, your selections are auto-submitted and graded.</li>
              <li>Correct answers and detailed pedagogical explanations are revealed after submission.</li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
          >
            I Agree · Begin Online Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Test Header with Live Timer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-white text-base">{test.title}</h2>
            <p className="text-xs text-slate-400">
              Answered {answeredCount} of {questions.length} questions
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${
                minutes < 2
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-950 text-indigo-300 border-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Exam</span>
            </button>
          </div>
        </div>

        {/* Question Palette Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400 mr-2 font-mono">Questions:</span>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950'
                    : isAnswered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Stage */}
        {currentQ && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-mono text-indigo-400 font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{currentQ.points} Points</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* MCQ Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="leading-relaxed flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Prev / Next */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-xs text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-xs text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Submit Examination?</h3>
              {submitError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                You have answered <strong className="text-white">{answeredCount}</strong> out of{' '}
                <strong className="text-white">{questions.length}</strong> questions. Once submitted, your score and detailed answers will be calculated immediately.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Continue Test
                </button>
                <button
                  onClick={performSubmission}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
