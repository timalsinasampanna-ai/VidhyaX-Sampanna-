import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import { Plus, CheckSquare, Clock, Trash2, Award, X, AlertCircle } from 'lucide-react';
import { OnlineTest, TestQuestion } from '../../types';

export const AdminTestsPage: React.FC = () => {
  const [tests, setTests] = useState<OnlineTest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for new test
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classGrade, setClassGrade] = useState<11 | 12>(11);
  const [subjectName, setSubjectName] = useState('Physics');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passPercentage, setPassPercentage] = useState(50);
  const [questions, setQuestions] = useState<
    Array<{ questionText: string; options: string[]; correctOptionIndex: number; points: number }>
  >([
    {
      questionText: 'What is the SI unit of electric potential difference?',
      options: ['Ampere (A)', 'Volt (V)', 'Coulomb (C)', 'Ohm (Ω)'],
      correctOptionIndex: 1,
      points: 1,
    },
    {
      questionText: 'According to NEB syllabus, the dimensional formula for Work is:',
      options: ['[M L T⁻¹]', '[M L² T⁻²]', '[M L T⁻²]', '[M² L T⁻²]'],
      correctOptionIndex: 1,
      points: 1,
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    api.getTests().then((t) => setTests(t));
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'questionText') {
      updated[idx].questionText = value;
    } else if (field === 'correctOptionIndex') {
      updated[idx].correctOptionIndex = Number(value);
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleSaveTest = () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Please provide an examination title.');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setFormError(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]?.trim()) {
          setFormError(`Question #${i + 1} Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          return;
        }
      }
    }

    const newTest: OnlineTest = {
      id: `test-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `NEB Grade ${classGrade} ${subjectName} examination questions paper.`,
      classGrade,
      subjectId: `subj-${subjectName.toLowerCase()}`,
      subjectName,
      durationMinutes: Number(durationMinutes),
      totalQuestions: questions.length,
      totalMarks: questions.reduce((sum, q) => sum + (q.points || 1), 0),
      passPercentage: Number(passPercentage),
      isPublished: true,
      createdAt: new Date().toISOString(),
      questions: questions.map((q, idx) => ({
        id: `q-cust-${idx + 1}-${Date.now()}`,
        questionText: q.questionText.trim(),
        options: [
          q.options[0]?.trim() || '',
          q.options[1]?.trim() || '',
          q.options[2]?.trim() || '',
          q.options[3]?.trim() || '',
        ] as [string, string, string, string],
        correctOptionIndex: q.correctOptionIndex,
        points: q.points || 1,
      })),
    };

    setTests([newTest, ...tests]);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  const handleDeleteTest = (id: string) => {
    setTests(tests.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <AdminLayout
      title="Online Tests &amp; Question Banks"
      subtitle="Configure objective examination papers, pass criteria, and question scoring."
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Total Exams: {tests.length}</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test Paper</span>
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase">
                    Grade {test.classGrade} · {test.subjectName}
                  </span>
                  <h3 className="font-bold text-white text-base mt-0.5">{test.title}</h3>
                </div>

                <div className="flex items-center gap-4 font-mono text-slate-400">
                  <span>{test.durationMinutes} Mins</span>
                  <span>·</span>
                  <span>{test.totalQuestions} Questions</span>
                  <span>·</span>
                  <span className="text-emerald-400">Pass: {test.passPercentage}%</span>
                  <button
                    onClick={() => setDeleteConfirmId(test.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">{test.description}</p>

              {/* Questions Preview */}
              {test.questions && test.questions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">
                    Questions Summary (Correct answers masked from student until test submission):
                  </span>
                  <div className="space-y-1.5">
                    {test.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex justify-between items-center"
                      >
                        <span className="text-slate-200 truncate max-w-lg">
                          Q{idx + 1}. {q.questionText}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold shrink-0">
                          Option {String.fromCharCode(65 + q.correctOptionIndex)} (+{q.points} pts)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-bold text-white text-sm">Delete Examination Paper?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this test? All question bank entries for this test will be removed.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTest(deleteConfirmId)}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Test Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto my-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Create New Test Paper</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Test Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Physics Chapter 3: Laws of Motion Test"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject</label>
                  <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Basic Mathematics">Basic Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Class</label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(Number(e.target.value) as 11 | 12)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={11}>Grade 11 Science</option>
                    <option value={12}>Grade 12 Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Test instructions and NEB exam weightage details..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Question Items ({questions.length})
                  </h4>
                  <button
                    onClick={handleAddQuestion}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">Question #{qIdx + 1}</span>
                        {questions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-slate-500 hover:text-rose-400 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                        placeholder="Enter the question text..."
                        className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white text-xs"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', optIdx)}
                              className="accent-indigo-500"
                              title="Mark as correct answer"
                            />
                            <span className="font-mono text-slate-400 text-[10px]">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="flex-1 p-1.5 rounded bg-slate-900 border border-slate-800 text-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTest}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Publish Examination
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
