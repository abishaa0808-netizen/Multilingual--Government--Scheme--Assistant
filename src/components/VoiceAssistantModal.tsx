import React, { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';
import { runGovernmentSchemeAgent } from '../services/agent.ts';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  currentState: string;
  onSendToChat: (prompt: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  currentState,
  onSendToChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const t = getTranslation(currentLanguage);
  const langObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
      }
      setIsListening(false);
      setIsSpeaking(false);
      setStatusMessage('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = langObj.speechCode;

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage(`Listening in ${langObj.name}... Speak now.`);
        };

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setTranscript(text);
          if (text) {
            setStatusMessage('Speech detected. Click Ask Agent or continue speaking.');
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errCode = event?.error;
          if (errCode === 'no-speech') {
            setStatusMessage('No speech detected. Tap Speak to try again or click a sample question below.');
          } else if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
            setStatusMessage('Microphone access is not permitted in this browser window. You can click any sample voice question below.');
          } else if (errCode === 'audio-capture') {
            setStatusMessage('No microphone hardware detected. Try clicking a sample question below.');
          } else if (errCode === 'aborted') {
            setStatusMessage('');
          } else {
            setStatusMessage('Voice recognition paused. Tap Speak to try again.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        setStatusMessage('Speech recognition initialized in fallback mode.');
      }
    } else {
      setStatusMessage('Speech recognition is not supported in this browser. You can use the quick sample questions below.');
    }
  }, [isOpen, currentLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setStatusMessage('Speech recognition is not available in this browser. Please click a sample question below.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      setStatusMessage('Listening stopped.');
    } else {
      setTranscript('');
      setAgentResponse('');
      try {
        recognitionRef.current.lang = langObj.speechCode;
        recognitionRef.current.start();
        setIsListening(true);
        setStatusMessage(`Listening in ${langObj.name}... Speak now.`);
      } catch (e) {
        setIsListening(false);
        setStatusMessage('Could not start microphone. Try clicking a sample voice query below.');
      }
    }
  };

  const handleProcessVoiceQuery = async (queryText?: string) => {
    const textToQuery = queryText || transcript;
    if (!textToQuery.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Agent searching verified welfare database...');

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }

    try {
      let reply = '';
      try {
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToQuery,
            language: currentLanguage,
            state: currentState,
            sessionId: `voice_${Date.now()}`,
          }),
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            reply = data.reply || '';
          }
        }
      } catch (e) {
        console.warn('API call failed, running local voice agent:', e);
      }

      if (!reply) {
        const agentData = await runGovernmentSchemeAgent({
          message: textToQuery,
          language: currentLanguage,
          state: currentState,
          sessionId: `voice_${Date.now()}`,
        });
        reply = agentData.reply || 'No information found for this query.';
      }

      setAgentResponse(reply);
      setStatusMessage('Answer retrieved. Playing audio readout.');

      // Trigger spoken output
      speakText(reply);
    } catch (err) {
      setAgentResponse('Unable to retrieve scheme details. Please try another question.');
      setStatusMessage('Query error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setStatusMessage('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/(https?:\/\/[^\s]+)/g, '').replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langObj.speechCode;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMessage('Audio playback completed.');
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setStatusMessage('Audio playback stopped.');
  };

  const sampleVoicePrompts: Record<string, string[]> = {
    en: [
      'What schemes are available for farmers?',
      'Am I eligible for PM-JAY Ayushman Bharat?',
      'Required documents for PM Mudra loan',
      'What welfare schemes am I missing?',
    ],
    hi: [
      'किसानों के लिए कौन सी योजनाएं हैं?',
      'क्या मैं आयुष्मान भारत कार्ड के लिए पात्र हूँ?',
      'पीएम मुद्रा लोन के लिए कौन से दस्तावेज़ चाहिए?',
      'मुझसे कौन सी सरकारी योजनाएं छूट रही हैं?',
    ],
    bn: [
      'কৃষকদের জন্য কী কী সরকারি প্রকল্প রয়েছে?',
      'আমি কি আয়ুষ্মান ভারত কার্ড পেতে পারি?',
      'পিএম মুদ্রা লোনের প্রয়োজনীয় নথি কী?',
      'আমার কোন কোন প্রকল্প মিস হচ্ছে?',
    ],
    mr: [
      'शेतकऱ्यांसाठी कोणत्या योजना उपलब्ध आहेत?',
      'मी आयुष्यमान भारत योजनेसाठी पात्र आहे का?',
      'मुद्रा कर्जासाठी काय कागदपत्रे लागतात?',
      'माझ्याकडून कोणत्या योजना राहून गेल्या आहेत?',
    ],
    te: [
      'రైతులకు ఏ ప్రభుత్వ పథకాలు ఉన్నాయి?',
      'నేను ఆయుష్మాన్ భారత్ కార్డుకు అర్హుడినా?',
      'పీఎం ముద్ర లోన్ కావలసిన పత్రాలు ఏమిటి?',
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
      'શું હું આયુષ્માન ભારત યોજના માટે પાત્ર છું?',
      'મુદ્રા લોન માટે જરૂરી દસ્તાવેજો કયા છે?',
      'હું કઈ યોજનાઓ ચૂકી રહ્યો છું?',
    ],
    ur: [
      'کسانوں کے لیے کون سی اسکیمیں دستیاب ہیں؟',
      'کیا میں آیوشمان بھارت کا اہل ہوں؟',
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

  const currentSamplePrompts = sampleVoicePrompts[currentLanguage] || sampleVoicePrompts['en'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <h3 className="font-bold text-sm tracking-wide">
                Voice Scheme Assistant ({langObj.name})
              </h3>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hands-free Speech Recognition & Voice Output in {langObj.nativeName} ({langObj.speechCode})
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded font-bold cursor-pointer"
          >
            [X]
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Language selector inside voice modal */}
          <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
            <span className="font-semibold text-slate-700">{t.language}</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Big Microphone Push Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-lg transition transform active:scale-95 cursor-pointer border-2 ${
                isListening
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
              }`}
            >
              <span className="text-sm">{isListening ? 'Stop' : 'Speak'}</span>
              <span className="text-[10px] opacity-80">{isListening ? 'Listening' : 'Tap to Talk'}</span>
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded w-full">
              {statusMessage}
            </div>
          )}

          {/* Transcript Box */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-left min-h-[60px] text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
              Spoken Transcript:
            </span>
            <p className="text-slate-800 font-medium whitespace-pre-wrap">
              {transcript || '(Your spoken question will appear here...)'}
            </p>
          </div>

          {/* Action to Submit Voice Query */}
          {transcript && !isProcessing && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleProcessVoiceQuery()}
                className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Ask Agent This Question
              </button>
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="px-3 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* One-click Sample Voice Questions (accessible even if mic permission is blocked) */}
          <div className="w-full text-left pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Quick Voice Questions (Click to Ask):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentSamplePrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(promptText);
                    handleProcessVoiceQuery(promptText);
                  }}
                  className="text-left text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2.5 py-1 text-slate-800 transition cursor-pointer"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Spoken Response Preview */}
          {agentResponse && (
            <div className="w-full bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-left text-xs max-h-40 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">
                  Agent Voice Reply:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? stopSpeaking() : speakText(agentResponse))}
                    className="text-blue-800 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    {isSpeaking ? 'Stop Audio' : 'Replay Voice'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSendToChat(transcript);
                    }}
                    className="text-slate-700 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Open in Chat Widget
                  </button>
                </div>
              </div>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                {agentResponse}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Uses browser Web Speech API for recognition and synthesis
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
