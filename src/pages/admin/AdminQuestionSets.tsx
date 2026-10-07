import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';
import { getSubjects, getChapters } from '../../lib/database';
import { Loading } from '../../components/Loading';
import type { QuestionSet, Subject, Chapter } from '../../types';

export const AdminQuestionSets: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock initial demo sets or real sets from DB
  const [sets, setSets] = useState<QuestionSet[]>([
    {
      id: "set-phy-motion-01",
      title: "Physics Motion Board Model Test 2026",
      description: "Comprehensive 20-question practice set covering velocity, acceleration, and falling bodies.",
      subjectId: "physics",
      chapterId: "phy-chap-02",
      questionIds: ["q-phy-02-01", "q-phy-02-02", "q-phy-02-03", "q-phy-02-04", "q-phy-02-05"],
      durationSeconds: 1200,
      totalMarks: 20,
      passMark: 50,
      published: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [subList, chapList] = await Promise.all([
          getSubjects(),
          getChapters()
        ]);
        setSubjects(subList);
        setChapters(chapList);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading text="Loading question sets..." />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Special Question Sets
            </h1>
            <p className="text-xs text-slate-500">
              Curate custom model tests and board preparation question collections.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Pass Mark</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sets.map((s) => {
                const subObj = subjects.find((sub) => sub.id === s.subjectId);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {s.title}
                      {s.description && (
                        <div className="text-[11px] text-slate-500 font-normal line-clamp-1">{s.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{subObj?.name || s.subjectId}</td>
                    <td className="py-3 px-4 font-mono font-medium">{s.questionIds.length} MCQs</td>
                    <td className="py-3 px-4 font-mono">{Math.round(s.durationSeconds / 60)}m</td>
                    <td className="py-3 px-4 font-mono">{s.passMark}%</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Published
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
