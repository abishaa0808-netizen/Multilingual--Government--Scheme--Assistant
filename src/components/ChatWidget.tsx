import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';
import { VirtualKeyboard } from './VirtualKeyboard.tsx';

interface ToolTrace {
  toolName: string;
  querySummary: string;
  foundCount: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolsUsed?: ToolTrace[];
}

interface ChatWidgetProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  currentState: string;
  isOpen: boolean;
  onToggle: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  currentLanguage,
  onLanguageChange,
  currentState,
  isOpen,
  onToggle,
  externalPrompt,
  onClearExternalPrompt,
  onOpenVoiceAssistant,
}) => {
  const t = getTranslation(currentLanguage);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('gov_assistant_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Welcome to the Multilingual Government Scheme Assistant. I am an Agentic AI system that selects verified tools to search Central & State welfare schemes, evaluate your eligibility, provide document checklists, and verify official links.`,
        timestamp: Date.now(),
        toolsUsed: [
          {
            toolName: 'Official Government Source',
            querySummary: 'National welfare database initialized',
            foundCount: 36,
          },
        ],
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('gov_assistant_session_id') || `sess_${Math.random().toString(36).substring(2, 9)}`;
  });
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save history and session
  useEffect(() => {
    localStorage.setItem('gov_assistant_chat_history', JSON.stringify(messages));
    localStorage.setItem('gov_assistant_session_id', sessionId);
  }, [messages, sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  // Handle external prompts
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      if (!isOpen) {
        onToggle();
      }
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langObj = LANGUAGES.find((l) => l.code === currentLanguage);
      recognition.lang = langObj ? langObj.speechCode : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (_event: any) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      if (onOpenVoiceAssistant) {
        onOpenVoiceAssistant();
      }
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        const langObj = LANGUAGES.find((l) => l.code === currentLanguage);
        recognitionRef.current.lang = langObj ? langObj.speechCode : 'en-IN';
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/(https?:\/\/[^\s]+)/g, '').replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langObj = LANGUAGES.find((l) => l.code === currentLanguage);
    utterance.lang = langObj ? langObj.speechCode : 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setActiveTools(['Scheme Search', 'Eligibility Checker', 'Official Source']);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          language: currentLanguage,
          state: currentState,
          sessionId: sessionId,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Information retrieved.',
        timestamp: Date.now(),
        toolsUsed: data.toolsUsed || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error connecting to the welfare scheme database. Please try again or check your search keywords.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setActiveTools([]);
    }
  };

  const startNewConversation = () => {
    if (window.confirm('Start a new session? This will clear current conversation history.')) {
      const newSess = `sess_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSess);
      const welcome: Message = {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content: 'New conversation started. How may I assist you with Central or State government welfare schemes today?',
        timestamp: Date.now(),
      };
      setMessages([welcome]);
      localStorage.setItem('gov_assistant_session_id', newSess);
    }
  };

  const toggleToolsExpand = (msgId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const localizedPrompts: Record<string, string[]> = {
    en: [
      'What schemes are available for farmers in Tamil Nadu?',
      'Am I eligible for PM-JAY Ayushman Bharat card?',
      'Required documents for PM Mudra small business loan',
      'What schemes am I missing?',
    ],
    hi: [
      'तमिलनाडु में किसानों के लिए कौन सी योजनाएं हैं?',
      'क्या मैं आयुष्मान भारत कार्ड के लिए पात्र हूँ?',
      'पीएम मुद्रा लोन के लिए कौन से दस्तावेज़ चाहिए?',
      'मुझसे कौन सी सरकारी योजनाएं छूट रही हैं?',
    ],
    bn: [
      'কৃষকদের জন্য কী কী সরকারি প্রকল্প রয়েছে?',
      'আমি কি আয়ুষ্মান ভারত কার্ডের জন্য যোগ্য?',
      'পিএম মুদ্রা লোনের জন্য কী কী নথি প্রয়োজন?',
      'আমার কী কী প্রকল্প মিস হচ্ছে?',
    ],
    mr: [
      'शेतकऱ्यांसाठी कोणत्या योजना उपलब्ध आहेत?',
      'मी आयुष्यमान भारत कार्डसाठी पात्र आहे का?',
      'मुद्रा कर्जासाठी कोणती कागदपत्रे लागतात?',
      'माझ्याकडून कोणत्या योजना राहून गेल्या आहेत?',
    ],
    te: [
      'రైతులకు ఏ ప్రభుత్వ పథకాలు అందుబాటులో ఉన్నాయి?',
      'నేను ఆయుష్మాన్ భారత్ కార్డుకు అర్హుడినా?',
      'పీఎం ముద్ర లోన్ కోసం కావలసిన పత్రాలు ఏమిటి?',
      'నేను ఏ పథకాలను కోల్పోతున్నాను?',
    ],
    ta: [
      'விவசாயிகளுக்கான அரசு திட்டங்கள் என்னென்ன?',
      'ஆயுஷ்மான் பாரத் அட்டைக்கு நான் தகுதியுடையவரா?',
      'முத்ரா கடனுக்கு தேவையான ஆவணங்கள் என்ன?',
      'நான் தவறவிட்ட திட்டங்கள் எவை?',
    ],
    gu: [
      'ખેડૂતો માટે કઈ સરકારી યોજનાઓ છે?',
      'શું હું આયુષ્માન ભારત કાર્ડ માટે પાત્ર છું?',
      'મુદ્રા લોન માટે કયા દસ્તાવેજો જોઈએ?',
      'હું કઈ યોજનાઓ ચૂકી રહ્યો છું?',
    ],
    ur: [
      'کسانوں کے لیے کون سی اسکیمیں دستیاب ہیں؟',
      'کیا میں آیوشمان بھارت کارڈ کا اہل ہوں؟',
      'مدرا لون کے لیے کون سے دستاویزات درکار ہیں؟',
      'مجھ سے کون سی اسکیمیں چھوٹ رہی ہیں؟',
    ],
    kn: [
      'ರೈತರಿಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಲಭ್ಯವಿವೆ?',
      'ನಾನು ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕಾರ್ಡ್‌ಗೆ ಅರ್ಹನೇ?',
      'ಮುದ್ರಾ ಸಾಲಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
      'ನಾನು ಯಾವ ಯೋಜನೆಗಳನ್ನು ಕಳೆದುಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ?',
    ],
    or: [
      'କୃଷକମାନଙ୍କ ପାଇଁ କେଉଁ ସରକାରୀ ଯୋଜନା ରହିଛି?',
      'ମୁଁ ଆୟୁଷ୍ମାନ ଭାରତ କାର୍ଡ ପାଇଁ ଯୋଗ୍ୟ କି?',
      'ପିଏମ ମୁଦ୍ରା ଋଣ ପାଇଁ କେଉଁ ଦଲିଲ ଦରକାର?',
      'ମୋର କେଉଁ ଯୋଜନା ବାଦ୍ ପଡ଼ୁଛି?',
    ],
    ml: [
      'കർഷകർക്കായി എന്തൊക്കെ പദ്ധതികൾ ലഭ്യമാണ്?',
      'ഞാൻ ആയുഷ്മാൻ ഭാരത് കാർഡിന് അർഹനാണോ?',
      'മുദ്ര ലോണിന് ആവശ്യമായ രേഖകൾ എന്തൊക്കെ?',
      'എനിക്ക് നഷ്ടപ്പെടുന്ന പദ്ധതികൾ ഏവ?',
    ],
  };

  const samplePrompts = localizedPrompts[currentLanguage] || localizedPrompts['en'];

  return (
    <>
      {/* Floating Toggle Button at Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center">
        <button
          type="button"
          onClick={onToggle}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl border border-slate-700 transition flex items-center gap-2 cursor-pointer active:scale-95 hover:border-amber-500"
          aria-label="Toggle Government Scheme Assistant Chatbot"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wide">
            {isOpen ? t.close : t.askAgent}
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
            {currentLanguage.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Floating Chat Panel Appearing Above the Button */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-40 w-[94vw] sm:w-[440px] md:w-[480px] h-[580px] max-h-[82vh] bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Multilingual Government Scheme Assistant Panel"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                  {t.chatTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span>Session: {sessionId}</span>
                <span>•</span>
                <span>State: {currentState.replace(' (Central)', '')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {onOpenVoiceAssistant && (
                <button
                  type="button"
                  onClick={onOpenVoiceAssistant}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 transition cursor-pointer"
                  title="Open Dedicated Voice Assistant"
                >
                  Voice Mode
                </button>
              )}
              <button
                type="button"
                onClick={startNewConversation}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                title="Start a new conversation session"
              >
                {t.newChatBtn}
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="text-slate-400 hover:text-white p-1 rounded font-bold cursor-pointer"
                title="Close chat panel"
              >
                [X]
              </button>
            </div>
          </div>

          {/* Subheader: Quick Language Selector */}
          <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium text-[11px]">{t.language}</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const hasTools = Boolean(msg.toolsUsed && msg.toolsUsed.length > 0);
              const isToolsExpanded = Boolean(expandedTools[msg.id]);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-lg p-3 leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-900'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {/* Tool Badges on Assistant Messages */}
                    {isAssistant && hasTools && (
                      <div className="mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {msg.toolsUsed!.map((tTool, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200"
                              >
                                Tool: {tTool.toolName}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleToolsExpand(msg.id)}
                            className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                          >
                            {isToolsExpanded ? t.hideTrace : t.viewTrace}
                          </button>
                        </div>

                        {/* Detailed Tool Execution Trace */}
                        {isToolsExpanded && (
                          <div className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-[10px] text-slate-700 space-y-1">
                            <span className="font-bold text-slate-800 block">Agent Execution Trace:</span>
                            {msg.toolsUsed!.map((tTool, idx) => (
                              <div key={idx} className="flex justify-between border-b border-slate-100 pb-1">
                                <span>{tTool.toolName} ({tTool.querySummary})</span>
                                <span className="font-semibold text-emerald-700">{tTool.foundCount} verified items</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line break-words text-slate-800">
                      {msg.content}
                    </div>

                    {/* Speech Output Button on Assistant Messages */}
                    {isAssistant && (
                      <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.content)}
                          className="text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>{isSpeaking ? t.voiceReadoutStop : t.voiceReadout}</span>
                        </button>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Active Tool Invocation Status */}
            {isProcessing && (
              <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs text-amber-900 shadow-xs animate-pulse">
                <div className="font-bold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>{t.agentThinking}</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>• Scanning schemes in sector & state database</div>
                  <div>• Evaluating demographic eligibility thresholds</div>
                  <div>• Formulating multilingual response in {currentLanguage.toUpperCase()}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length < 3 && (
            <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="whitespace-nowrap bg-white hover:bg-slate-200 border border-slate-300 rounded px-2.5 py-1 text-slate-700 cursor-pointer transition"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Multilingual Virtual Keyboard overlay with full alphabet */}
          <div className="px-3 bg-slate-100">
            <VirtualKeyboard
              languageCode={currentLanguage}
              isOpen={showKeyboard}
              onClose={() => setShowKeyboard(false)}
              onInsertChar={(ch) => setInput((prev) => prev + ch)}
              onBackspace={() => setInput((prev) => prev.slice(0, -1))}
              onClear={() => setInput('')}
            />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-slate-800">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none"
                  disabled={isProcessing}
                />

                {/* Soft Multilingual Keyboard Toggle (Full Alphabet) */}
                <button
                  type="button"
                  onClick={() => setShowKeyboard((prev) => !prev)}
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium border transition cursor-pointer ml-1 ${
                    showKeyboard
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Toggle Full Indian Alphabet Virtual Keyboard"
                >
                  {t.virtualKeyboard}
                </button>

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium border transition cursor-pointer ml-1 ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isListening ? t.voiceListen : t.voiceStop}
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition cursor-pointer"
              >
                {t.sendBtn}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
