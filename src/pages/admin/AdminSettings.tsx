import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Bot,
  Sliders,
  ExternalLink,
  Info
} from 'lucide-react';
import { getAppConfig, updateAppConfig } from '../../lib/database';
import { ADMIN_UID } from '../../lib/constants';
import { Loading } from '../../components/Loading';
import type { AppConfig } from '../../types';

export const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAppConfig();
        setConfig(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      setErrorMessage(null);
      await updateAppConfig(config);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMessage(err?.message || 'Error updating configuration.');
    }
  };

  if (loading || !config) {
    return <Loading text="Loading platform configuration..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" />
              Platform Settings & App Config
            </h1>
            <p className="text-xs text-slate-500">
              Manage non-security general configurations and AI model identifiers stored under <code>appConfig/</code>.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Application configurations updated successfully in Firebase Realtime Database!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security Authority Warning */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Security Architecture Notice</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed">
          Admin authorization authority is strictly enforced at the database level by Realtime Database Security Rules matching UID <code className="font-mono font-bold text-amber-950">{ADMIN_UID}</code>. Security authority is never stored in public editable fields.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        {/* Exam Defaults */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Academic Exam Defaults</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Default Question Count per Chapter Test
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={config.defaultQuestionCount}
                onChange={(e) => setConfig({ ...config, defaultQuestionCount: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard number of MCQs generated per chapter exam assignment.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Default Pass Mark (%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={config.defaultPassMark}
                onChange={(e) => setConfig({ ...config, defaultPassMark: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Percentage required to earn the "Passed" certificate badge.
              </span>
            </div>
          </div>
        </div>

        {/* Clear Buddy AI Model Configuration */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Clear Buddy AI Configuration</span>
          </h2>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Active Gemini AI Model Identifier
            </label>
            <input
              type="text"
              value={config.aiModel}
              onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-medium"
              placeholder="gemini-3.8-flash"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Configurable layer so the AI model can be updated (e.g. <code>gemini-3.8-flash</code>) without altering codebase logic.
            </p>
          </div>
        </div>

        {/* Maintenance Mode & Feature Flags */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Platform Status & Controls</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 font-bold block text-sm">Scheduled Maintenance Mode</strong>
              <span className="text-slate-500 text-xs">
                Displays maintenance message banner to non-admin visitors.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Maintenance Banner Message</label>
            <input
              type="text"
              value={config.maintenanceMessage}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 font-bold block text-sm">Allow Public Guest Practice</strong>
              <span className="text-slate-500 text-xs">
                Permits students to practice question bank MCQs before creating an account.
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.allowPublicGuestPractice}
              onChange={(e) => setConfig({ ...config, allowPublicGuestPractice: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save App Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
