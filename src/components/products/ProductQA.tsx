import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, CheckCircle2, Send, Clock, User } from 'lucide-react';
import { ProductQuestion } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ProductQAProps {
  productId: string;
  productName: string;
}

export const ProductQA: React.FC<ProductQAProps> = ({ productId, productName }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await api.getProductQuestions(productId);
      setQuestions(res.questions);
    } catch (e) {
      console.error('Failed to load questions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.askQuestion(productId, {
        authorName: authorName.trim() || user?.name || 'Verified Collector',
        question: newQuestionText.trim()
      });
      setQuestions(prev => [res.question, ...prev]);
      setNewQuestionText('');
      setShowAskModal(false);
      setSuccessMsg('Your inquiry has been submitted! Our product specialists will respond shortly.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-zinc-950" />
            <h3 className="font-bold text-base text-zinc-950">Questions & Answers</h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Have an inquiry about sizing, acoustics, material durability, or care? Ask our atelier specialists.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ask Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h4 className="font-bold text-sm text-zinc-950 font-display">
                Ask a Question about &ldquo;{productName}&rdquo;
              </h4>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-zinc-400 hover:text-zinc-950 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">Your Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:outline-hidden px-3 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700">Your Question</label>
                <textarea
                  rows={4}
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="e.g. Does this include a carrying case? Can it connect to multiple Bluetooth devices simultaneously?"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:outline-hidden px-3 py-2 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newQuestionText.trim()}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Posting...' : 'Submit Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List of Questions */}
      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-400">Loading inquiries...</div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-zinc-200/80 p-6">
          <HelpCircle className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-zinc-900">No questions asked yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Be the first to ask a question about this item. Our curators and community will provide verified answers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  Q
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-sm text-zinc-950 leading-snug">{q.question}</h5>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                    <span>Asked by {q.authorName}</span>
                    <span>·</span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {q.answer ? (
                <div className="flex items-start gap-3 pl-2 sm:pl-4 pt-3 border-t border-zinc-100 bg-zinc-50/50 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-700 leading-relaxed font-normal">{q.answer}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-zinc-800">{q.answeredBy || 'Atelier Specialist'}</span>
                      {q.answeredAt && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400">
                            {new Date(q.answeredAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pl-9 text-xs text-zinc-400 italic">
                  Pending response from our atelier specialists.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
