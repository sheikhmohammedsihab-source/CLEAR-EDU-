import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Eye,
  Sparkles,
  ExternalLink,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  getClass,
  getSubjects,
  getChapters,
  getPlaylists,
  getResources,
  createClass,
  updateClass,
  createResource,
  deleteResource,
  checkDuplicateYouTubeId,
} from '../../lib/database';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, formatDuration, loadYouTubeIFrameAPI } from '../../lib/youtube';
import { Loading } from '../../components/Loading';
import type { Subject, Chapter, Playlist, ClassItem, ClassResource, ResourceType } from '../../types';

export const AdminClassForm: React.FC = () => {
  const { classId } = useParams<{ classId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEditing = Boolean(classId);

  const initialSubject = searchParams.get('subjectId') || '';
  const initialChapter = searchParams.get('chapterId') || '';
  const initialPlaylist = searchParams.get('playlistId') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<ClassItem | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Class Form State
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [chapterId, setChapterId] = useState(initialChapter);
  const [playlistId, setPlaylistId] = useState(initialPlaylist);
  const [title, setTitle] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classNumber, setClassNumber] = useState<number | string>(1);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [durationText, setDurationText] = useState('');
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Resources state (Study materials, slides, PDFs)
  const [resources, setResources] = useState<ClassResource[]>([]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<ResourceType>('PDF');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [addingResource, setAddingResource] = useState(false);

  const previewPlayerRef = useRef<any>(null);

  // Load base data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [subList, chapList, playList] = await Promise.all([
          getSubjects(),
          getChapters(),
          getPlaylists(),
        ]);

        if (!isMounted) return;
        setSubjects(subList);
        setChapters(chapList);
        setPlaylists(playList);

        if (isEditing && classId) {
          const [existing, existingResources] = await Promise.all([
            getClass(classId),
            getResources(classId),
          ]);

          if (existing && isMounted) {
            setSubjectId(existing.subjectId);
            setChapterId(existing.chapterId);
            setPlaylistId(existing.playlistId || '');
            setTitle(existing.title);
            setTeacher(existing.teacher);
            setClassNumber(existing.classNumber);
            setYoutubeUrl(existing.youtubeUrl);
            setExtractedId(existing.youtubeId);
            setDurationSeconds(existing.durationSeconds);
            setDurationText(existing.duration || (existing.durationSeconds ? formatDuration(existing.durationSeconds) : ''));
            setDescription(existing.description || '');
            setOrder(existing.order || 1);
            setPublished(existing.published !== false);
            setFeatured(Boolean(existing.featured));
            setResources(existingResources);
          }
        } else {
          if (!subjectId && subList.length > 0) {
            setSubjectId(subList[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [classId, isEditing]);

  // When YouTube URL is pasted: extract ID, check duplicates, detect duration & fetch oEmbed title
  const handleUrlChange = async (url: string) => {
    setYoutubeUrl(url);
    const id = extractYouTubeVideoId(url);
    setExtractedId(id);
    setDuplicateWarning(null);

    if (id) {
      setFormError(null);

      // Check duplicates
      const existing = await checkDuplicateYouTubeId(id, classId);
      if (existing) {
        setDuplicateWarning(existing);
      }

      // Fetch YouTube Title via oEmbed when available
      try {
        const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          if (oembedData && oembedData.title && !title) {
            setTitle(oembedData.title);
          }
          if (oembedData && oembedData.author_name && (!teacher || teacher === 'Instructor')) {
            setTeacher(oembedData.author_name);
          }
        }
      } catch (e) {
        // oEmbed fallback silently ignored
      }

      // Auto-detect duration using YouTube IFrame API
      detectVideoDuration(id);
    }
  };

  const detectVideoDuration = (videoId: string) => {
    setDetectingDuration(true);
    loadYouTubeIFrameAPI()
      .then(() => {
        const dummyDiv = document.createElement('div');
        dummyDiv.id = `temp-yt-${Math.random().toString(36).substring(2, 7)}`;
        dummyDiv.style.display = 'none';
        document.body.appendChild(dummyDiv);

        const tempPlayer = new window.YT.Player(dummyDiv.id, {
          videoId,
          events: {
            onReady: (event: any) => {
              try {
                const dur = Math.round(event.target.getDuration() || 0);
                if (dur > 0) {
                  setDurationSeconds(dur);
                  setDurationText(formatDuration(dur));
                }
                event.target.destroy();
                dummyDiv.remove();
              } catch (e) {
                // ignore
              }
              setDetectingDuration(false);
            },
            onError: () => {
              setDetectingDuration(false);
              dummyDiv.remove();
            },
          },
        });
      })
      .catch(() => {
        setDetectingDuration(false);
      });
  };

  // Filter available chapters and playlists for selected subject
  const availableChapters = subjectId
    ? chapters.filter((c) => c.subjectId === subjectId)
    : chapters;

  const availablePlaylists = subjectId
    ? playlists.filter((p) => p.subjectId === subjectId)
    : playlists;

  useEffect(() => {
    if (subjectId && availableChapters.length > 0) {
      if (!chapterId || !availableChapters.some((c) => c.id === chapterId)) {
        setChapterId(availableChapters[0].id);
      }
    }
  }, [subjectId, availableChapters, chapterId]);

  // Add Resource
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResUrl.trim()) return;

    if (isEditing && classId) {
      try {
        setAddingResource(true);
        const resId = await createResource({
          classId,
          title: newResTitle.trim(),
          type: newResType,
          url: newResUrl.trim(),
          description: newResDesc.trim(),
          order: resources.length + 1,
          published: true,
        });

        setResources((prev) => [
          ...prev,
          {
            id: resId,
            classId,
            title: newResTitle.trim(),
            type: newResType,
            url: newResUrl.trim(),
            description: newResDesc.trim(),
            order: prev.length + 1,
            published: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ]);

        setNewResTitle('');
        setNewResUrl('');
        setNewResDesc('');
      } catch (err) {
        console.error('Failed to add resource:', err);
      } finally {
        setAddingResource(false);
      }
    } else {
      // Local state before class is created
      const tempId = `temp-${Date.now()}`;
      setResources((prev) => [
        ...prev,
        {
          id: tempId,
          classId: '',
          title: newResTitle.trim(),
          type: newResType,
          url: newResUrl.trim(),
          description: newResDesc.trim(),
          order: prev.length + 1,
          published: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      setNewResTitle('');
      setNewResUrl('');
      setNewResDesc('');
    }
  };

  const handleRemoveResource = async (resId: string) => {
    if (isEditing && !resId.startsWith('temp-')) {
      try {
        await deleteResource(resId);
      } catch (err) {
        console.error('Delete resource error:', err);
      }
    }
    setResources((prev) => prev.filter((r) => r.id !== resId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Class title is required.');
      return;
    }
    if (!subjectId) {
      setFormError('Please select a subject.');
      return;
    }
    if (!chapterId) {
      setFormError('Please select a chapter.');
      return;
    }
    if (!extractedId) {
      setFormError('Please enter a valid YouTube video URL.');
      return;
    }

    try {
      setSubmitting(true);
      let targetClassId = classId;

      if (isEditing && targetClassId) {
        await updateClass(targetClassId, {
          subjectId,
          chapterId,
          playlistId: playlistId || undefined,
          title: title.trim(),
          teacher: teacher.trim() || 'Instructor',
          classNumber,
          youtubeUrl: youtubeUrl.trim(),
          youtubeId: extractedId,
          durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
          duration: durationText.trim(),
          description: description.trim(),
          order: Number(order),
          published,
          featured,
        });
      } else {
        targetClassId = await createClass({
          subjectId,
          chapterId,
          playlistId: playlistId || undefined,
          title: title.trim(),
          teacher: teacher.trim() || 'Instructor',
          classNumber,
          youtubeUrl: youtubeUrl.trim(),
          youtubeId: extractedId,
          durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
          duration: durationText.trim(),
          provider: 'youtube',
          description: description.trim(),
          order: Number(order),
          published,
          featured,
        });

        // Save queued resources
        for (const res of resources) {
          await createResource({
            classId: targetClassId,
            title: res.title,
            type: res.type,
            url: res.url,
            description: res.description,
            order: res.order,
            published: true,
          });
        }
      }

      navigate('/admin/classes');
    } catch (err: any) {
      console.error('Error saving class:', err);
      setFormError(err.message || 'Failed to save class to database.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading class editor..." />;
  }

  const embedPreviewUrl = extractedId ? getYouTubeEmbedUrl(extractedId) : null;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/classes"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Class Lecture' : 'Curate New Class Lecture'}
          </h1>
          <p className="text-xs text-slate-500">
            Paste YouTube URL, auto-detect duration, assign playlist, and attach study notes.
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span>This YouTube video ID is already added to CLEAR EDU under:</span>
              <p className="font-bold text-amber-950 mt-0.5">"{duplicateWarning.title}"</p>
            </div>
          </div>
          <Link
            to={`/admin/classes/edit/${duplicateWarning.id}`}
            className="text-xs font-bold text-amber-900 underline shrink-0 hover:text-amber-700"
          >
            Edit Existing Class
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
            {/* Step 1: Paste YouTube URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  YouTube Video Link *
                </label>
                {extractedId && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID: {extractedId}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Supports watch links, youtu.be, shorts, or raw 11-char IDs. Duration will be detected automatically.
              </p>
            </div>

            {/* Subject, Chapter & Optional Playlist dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter *
                </label>
                <select
                  required
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  disabled={availableChapters.length === 0}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <option value="" disabled>
                    {availableChapters.length === 0 ? 'No chapters' : 'Select Chapter'}
                  </option>
                  {availableChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Playlist (Optional)
                </label>
                <select
                  value={playlistId}
                  onChange={(e) => setPlaylistId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Playlist (Direct)</option>
                  {availablePlaylists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class Number & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class # *
                </label>
                <input
                  type="text"
                  required
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Newton's 2nd Law of Motion & Momentum"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Teacher & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teacher / Instructor
                </label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="e.g. Dr. A. Rahman"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Detected Duration</span>
                  {detectingDuration && <span className="text-[10px] text-indigo-600 font-semibold animate-pulse">Detecting...</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={durationText}
                    onChange={(e) => setDurationText(e.target.value)}
                    placeholder="e.g. 1h 47m or 28m"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {durationSeconds ? (
                    <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400">
                      {durationSeconds}s
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Core Concepts
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topics covered in this lecture, formula derivations, key takeaways..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Order, Draft/Published & Featured */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sequential Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Published
                  </span>
                </label>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    ★ Featured
                  </span>
                </label>
              </div>
            </div>

            {/* Class Notes & Materials Attachment Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>CLASS NOTES &amp; MATERIALS</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Attach lecture slides, PDFs, formula sheets, or Google Drive links for students.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {resources.length} attached
                </span>
              </div>

              {/* Resource List */}
              {resources.length > 0 && (
                <div className="space-y-2">
                  {resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                            {res.type}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{res.title}</span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-indigo-600 truncate block mt-0.5"
                        >
                          {res.url}
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveResource(res.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Resource Form Block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  + Add Handout / Study Material Link
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value as ResourceType)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Slides">Slides</option>
                      <option value="Notes">Notes</option>
                      <option value="Document">Document</option>
                      <option value="Link">External Link</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      placeholder="Title e.g. Chapter 11 Important Formulas PDF"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    value={newResUrl}
                    onChange={(e) => setNewResUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or https://..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddResource}
                    disabled={!newResTitle.trim() || !newResUrl.trim() || addingResource}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-2xs disabled:opacity-50"
                  >
                    Attach Resource
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/admin/classes"
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !extractedId}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : isEditing ? 'Update Class' : 'Save Class'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (1 column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Admin Preview</span>
              </div>
              {extractedId && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  Validated
                </span>
              )}
            </div>

            {embedPreviewUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800">
                  <iframe
                    src={embedPreviewUrl}
                    title="Live Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-900 line-clamp-1">{title || 'Class Title Preview'}</p>
                  <p className="text-slate-500">Instructor: {teacher || 'Instructor Name'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Video ID: {extractedId}</p>
                  {durationText && (
                    <p className="text-[11px] font-bold text-indigo-600">
                      Duration: {durationText}
                    </p>
                  )}
                </div>

                {isEditing && classId && (
                  <Link
                    to={`/class/${classId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Preview as Student</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <PlayCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">No Video Preview</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Paste a valid YouTube link above to verify embedded playback.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <span className="font-bold block">Distraction-Free Video Guarantee</span>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              Official YouTube IFrame Player is embedded cleanly without custom click overlays or modifications. Real playback events enable multi-device resumption and accurate progress saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
