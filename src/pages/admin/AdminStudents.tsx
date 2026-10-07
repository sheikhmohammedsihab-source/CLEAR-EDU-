import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Search,
  Mail,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { getAllStudents } from '../../lib/database';
import { Loading } from '../../components/Loading';
import { EmptyState } from '../../components/EmptyState';
import { ADMIN_UID } from '../../lib/constants';
import type { UserProfile } from '../../types';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadStudents() {
      try {
        setLoading(true);
        const list = await getAllStudents();
        if (isMounted) setStudents(list);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loading text="Loading student database records..." />;
  }

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.displayName && s.displayName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Registered Students
            </h1>
            <p className="text-xs text-slate-500">
              Directory of student accounts created in Firebase Realtime Database.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or email..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            students.length === 0
              ? 'When students log in with email or Google, their profile records appear here.'
              : 'No students match your search criteria.'
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-4 sm:px-6">Role &amp; UID</th>
                  <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                  <th className="py-3.5 px-4 sm:px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isAdminUser = student.uid === ADMIN_UID;
                  const joined = student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';
                  const lastLogin = student.lastLoginAt
                    ? new Date(student.lastLoginAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr key={student.uid} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {student.photoURL ? (
                            <img
                              src={student.photoURL}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {(student.displayName || student.email || 'S')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {student.displayName || 'Learner'}
                            </span>
                            <span className="text-slate-400 block truncate text-[11px]">
                              {student.email || 'No email provided'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          {isAdminUser ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <ShieldCheck className="w-3 h-3" /> System Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              <UserCheck className="w-3 h-3" /> Student
                            </span>
                          )}
                          <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                            {student.uid}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-slate-600 font-medium">
                        {joined}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-slate-600 font-medium">
                        {lastLogin}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Safety Notice Card */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500">
        <p className="leading-relaxed">
          <strong className="text-slate-700">Database Privacy Architecture:</strong> Student profile records are synchronized safely from Firebase Authentication without exposing private server service accounts or private API keys in client-side code.
        </p>
      </div>
    </div>
  );
};
