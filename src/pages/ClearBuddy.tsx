import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Plus,
  MessageSquare,
  Bot,
  User,
  Tag,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import {
  getChatSessions,
  createChatSession,
  getChatMessages,
  sendChatMessage,
} from '../lib/database';
import { queryClearBuddy, AIContext } from '../lib/ai';
import { Loading } from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import type { ChatSession, ChatMessage } from '../types';

export const ClearBuddy: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Read URL Context Parameters
  const paramSubject = searchParams.get('subject') || '';
  const paramChapter = searchParams.get('chapter') || '';
  const paramClassName = searchParams.get('class') || '';
  const paramQuestion = searchParams.get('question') || '';
  const paramUserAnswer = searchParams.get('userAnswer') || '';
  const paramCorrectAnswer = searchParams.get('correctAnswer') || '';
  const paramWeakTopics = searchParams.get('weakTopics') ? searchParams.get('weakTopics')!.split(',') : [];

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-guest');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load chat sessions
  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      if (!currentUser) {
        // Guest user session setup
        const guestSession: ChatSession = {
          id: 'guest-session-1',
          uid: 'guest',
          title: paramChapter ? `Study: ${paramChapter}` : 'Study Session',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([guestSession]);
        setActiveSessionId(guestSession.id);

        // Load local guest messages if any
        try {
          const stored = sessionStorage.getItem('clearedu_guest_chat');
          if (stored && isMounted) {
            setMessages(JSON.parse(stored));
          }
        } catch (e) {
          // ignore
        }
        return;
      }

      try {
        setLoading(true);
        const userSessions = await getChatSessions(currentUser.uid);
        if (!isMounted) return;

        if (userSessions.length > 0) {
          setSessions(userSessions);
          setActiveSessionId(userSessions[0].id);
        } else {
          const initialTitle = paramChapter ? `Study: ${paramChapter}` : 'SSC Study Session';
          try {
            const newId = await createChatSession(currentUser.uid, initialTitle);
            if (isMounted) {
              setActiveSessionId(newId);
              setSessions([{ id: newId, uid: currentUser.uid, title: initialTitle, createdAt: Date.now(), updatedAt: Date.now() }]);
            }
          } catch (e) {
            const fallbackId = `session-${Date.now()}`;
            setActiveSessionId(fallbackId);
            setSessions([{ id: fallbackId, uid: currentUser.uid, title: initialTitle, createdAt: Date.now(), updatedAt: Date.now() }]);
          }
        }
      } catch (err) {
        console.warn('Failed to load remote chat sessions, using local session:', err);
        const fallbackSession: ChatSession = {
          id: `local-${Date.now()}`,
          uid: currentUser.uid,
          title: 'Study Session',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([fallbackSession]);
        setActiveSessionId(fallbackSession.id);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Load messages whenever active session changes
  useEffect(() => {
    let isMounted = true;
    async function loadMessages() {
      if (!currentUser || activeSessionId.startsWith('guest') || activeSessionId.startsWith('local')) return;
      try {
        const msgs = await getChatMessages(currentUser.uid, activeSessionId);
        if (isMounted && msgs.length > 0) {
          setMessages(msgs);
        }
      } catch (e) {
        console.warn('Failed to load chat messages from DB:', e);
      }
    }

    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [currentUser, activeSessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleCreateNewSession = async () => {
    const newTitle = `Study Session ${sessions.length + 1}`;
    const newId = `session-${Date.now()}`;

    if (currentUser) {
      try {
        const dbId = await createChatSession(currentUser.uid, newTitle);
        setActiveSessionId(dbId);
        setSessions((prev) => [
          { id: dbId, uid: currentUser.uid, title: newTitle, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ]);
        setMessages([]);
        return;
      } catch (e) {
        console.warn('Database session create error, fallback to local:', e);
      }
    }

    setActiveSessionId(newId);
    setSessions((prev) => [
      { id: newId, uid: currentUser?.uid || 'guest', title: newTitle, createdAt: Date.now(), updatedAt: Date.now() },
      ...prev,
    ]);
    setMessages([]);
    try {
      sessionStorage.removeItem('clearedu_guest_chat');
    } catch (e) {}
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || sending) return;

    setErrorMessage(null);
    setSending(true);
    setInputPrompt('');

    const contextObj: AIContext = {
      subjectName: paramSubject,
      chapterName: paramChapter,
      className: paramClassName,
      questionText: paramQuestion,
      userAnswer: paramUserAnswer,
      correctAnswer: paramCorrectAnswer,
      weakTopics: paramWeakTopics,
    };

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: activeSessionId,
      role: 'user',
      content: textToSend,
      createdAt: Date.now(),
      context: {
        subjectName: paramSubject,
        chapterName: paramChapter,
      },
    };

    // Update local UI immediately
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      if (!currentUser) {
        try {
          sessionStorage.setItem('clearedu_guest_chat', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Save to Firebase in background if logged in
    if (currentUser && !activeSessionId.startsWith('guest')) {
      sendChatMessage(currentUser.uid, activeSessionId, userMessage).catch((e) => {
        console.warn('Could not persist message to database:', e);
      });
    }

    // Call AI
    try {
      const aiReply = await queryClearBuddy(textToSend, contextObj);

      const assistantMessage: ChatMessage = {
        id: `reply-${Date.now()}`,
        sessionId: activeSessionId,
        role: 'assistant',
        content: aiReply,
        createdAt: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        if (!currentUser) {
          try {
            sessionStorage.setItem('clearedu_guest_chat', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (currentUser && !activeSessionId.startsWith('guest')) {
        sendChatMessage(currentUser.uid, activeSessionId, assistantMessage).catch((e) => {
          console.warn('Could not persist reply to database:', e);
        });
      }
    } catch (err: any) {
      console.error('Clear Buddy AI error:', err);
      setErrorMessage(err?.message || 'Clear Buddy encountered an issue. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const hasContext = Boolean(paramSubject || paramChapter || paramQuestion);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-20">
      {/* Context Indicator Banner */}
      {hasContext && (
        <div className="bg-indigo-50/90 border border-indigo-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <strong className="font-bold">Active Academic Context:</strong>
            <span className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700 font-medium">
              {paramSubject} {paramChapter ? `• ${paramChapter}` : ''}
            </span>
            {paramQuestion && (
              <span className="text-slate-600 truncate max-w-xs hidden sm:inline">
                "{paramQuestion.substring(0, 45)}..."
              </span>
            )}
          </div>
          <Link
            to="/clear-buddy"
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px]"
          >
            Clear Context
          </Link>
        </div>
      )}

      {/* Guest notice banner */}
      {!currentUser && (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>You are chatting as a guest learner. Sign in to save and sync your study sessions across devices.</span>
          </div>
          <Link to="/login" className="font-bold text-indigo-600 hover:underline shrink-0 flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[580px]">
        {/* Left Sidebar: Study Sessions */}
        <div className="hidden md:flex md:col-span-1 border-r border-slate-200/80 p-4 flex-col bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Study Sessions
            </h3>
            <button
              onClick={handleCreateNewSession}
              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
              title="New Session"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSessionId === sess.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{sess.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3 Columns: Active Conversation Area */}
        <div className="md:col-span-3 flex flex-col h-[620px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  CLEAR BUDDY
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded">
                    Online & Ready
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  NCTB Class 9-10 • SSC Academic Study Assistant
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateNewSession}
              className="md:hidden p-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSendMessage(paramQuestion ? 'Why did I get this question wrong? Please explain step-by-step.' : 'Explain the key formulas and concepts of this chapter')}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:border-indigo-400 hover:text-indigo-600 shrink-0 transition-colors cursor-pointer"
            >
              💡 {paramQuestion ? 'Why is my answer wrong?' : 'Explain Formulas & Concepts'}
            </button>
            <button
              onClick={() => handleSendMessage('Give me 5 board standard practice questions with explanations')}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:border-indigo-400 hover:text-indigo-600 shrink-0 transition-colors cursor-pointer"
            >
              📝 5 Practice Questions
            </button>
            <button
              onClick={() => handleSendMessage('What should I study next to prepare for the board exam?')}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:border-indigo-400 hover:text-indigo-600 shrink-0 transition-colors cursor-pointer"
            >
              🎯 What should I study next?
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Ask Clear Buddy anything</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Stuck on a tricky concept, need a formula derivation, or want to review why an exam question was incorrect? Tap any quick action above or type below.
                </p>
                {paramQuestion && (
                  <button
                    onClick={() => handleSendMessage(`Please explain this question and why the correct answer is option "${paramCorrectAnswer}": "${paramQuestion}"`)}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Analyze Question Mistake
                  </button>
                )}
              </div>
            ) : (
              messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isAssistant
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-slate-50 border border-slate-200 text-slate-800 shadow-xs'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>Clear Buddy is generating your response...</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  paramChapter
                    ? `Ask about ${paramChapter} or formulas...`
                    : 'Ask about any physics, math or chemistry topic...'
                }
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || sending}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
