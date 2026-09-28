import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { SchemeCatalog } from './components/SchemeCatalog.tsx';
import { EligibilityJourney } from './components/EligibilityJourney.tsx';
import { MissingSchemesFinder } from './components/MissingSchemesFinder.tsx';
import { DocumentChecklistView } from './components/DocumentChecklistView.tsx';
import { SchemeModal } from './components/SchemeModal.tsx';
import { DocumentChecklistModal } from './components/DocumentChecklistModal.tsx';
import { ChatWidget } from './components/ChatWidget.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { Scheme, SECTORS } from './data/constants.ts';
import { getTranslation } from './data/translations.ts';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [currentState, setCurrentState] = useState<string>('All-India (Central)');
  const [activeTab, setActiveTab] = useState<'catalog' | 'eligibility' | 'missing' | 'checklist'>('catalog');

  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [checklistScheme, setChecklistScheme] = useState<Scheme | null>(null);

  // Floating Chat Widget state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  // Dedicated Voice Assistant Modal state
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);

  const t = getTranslation(currentLanguage);

  const handleSendToChat = (prompt: string) => {
    setExternalPrompt(prompt);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white relative">
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentState={currentState}
        onStateChange={setCurrentState}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        {activeTab === 'catalog' && (
          <SchemeCatalog
            currentLanguage={currentLanguage}
            currentState={currentState}
            onStateChange={setCurrentState}
            onSelectScheme={setSelectedScheme}
            onViewDocuments={setChecklistScheme}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'eligibility' && (
          <EligibilityJourney
            currentLanguage={currentLanguage}
            initialState={currentState}
            onSelectScheme={setSelectedScheme}
            onViewDocuments={setChecklistScheme}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'missing' && (
          <MissingSchemesFinder
            currentLanguage={currentLanguage}
            onSelectScheme={setSelectedScheme}
            onViewDocuments={setChecklistScheme}
            onSendToChat={handleSendToChat}
          />
        )}

        {activeTab === 'checklist' && (
          <DocumentChecklistView currentLanguage={currentLanguage} />
        )}
      </main>

      {/* Floating Chatbot Widget placed in bottom-right corner */}
      <ChatWidget
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentState={currentState}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        externalPrompt={externalPrompt}
        onClearExternalPrompt={() => setExternalPrompt(null)}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
      />

      {/* Dedicated Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentState={currentState}
        onSendToChat={handleSendToChat}
      />

      {/* Scheme Detail Modal */}
      <SchemeModal
        scheme={selectedScheme}
        currentLanguage={currentLanguage}
        onClose={() => setSelectedScheme(null)}
        onOpenChecklist={(s) => setChecklistScheme(s)}
      />

      {/* Scheme-Specific Document Checklist Modal */}
      <DocumentChecklistModal
        scheme={checklistScheme}
        currentLanguage={currentLanguage}
        onClose={() => setChecklistScheme(null)}
      />

      {/* National Portal Official Style Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-100 text-sm">
                {t.appTitle}
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {t.appSubtitle}
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                {t.authenticLinks}
              </div>
            </div>

            {/* Col 2: Sectors */}
            <div>
              <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5">
                {t.selectSector}
              </h5>
              <ul className="space-y-1 text-[11px]">
                {SECTORS.slice(0, 5).map((sec) => (
                  <li key={sec} className="hover:text-slate-200 transition">
                    {sec}
                  </li>
                ))}
                <li
                  className="text-amber-500 hover:underline cursor-pointer"
                  onClick={() => setActiveTab('catalog')}
                >
                  View all 20 sectors...
                </li>
              </ul>
            </div>

            {/* Col 3: Official Portals */}
            <div>
              <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5">
                {t.officialPortal}
              </h5>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    National Portal of India
                  </a>
                </li>
                <li>
                  <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    myScheme Platform
                  </a>
                </li>
                <li>
                  <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    National Scholarship Portal
                  </a>
                </li>
                <li>
                  <a href="https://pmjay.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Ayushman Bharat (PM-JAY)
                  </a>
                </li>
                <li>
                  <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    PM-KISAN Samman Nidhi
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Voice & Languages */}
            <div>
              <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2.5">
                Voice & Multilingual Controls
              </h5>
              <p className="text-[11px] text-slate-400 mb-3">
                {t.language} {currentLanguage.toUpperCase()} • Speech synthesis and recognition active.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 py-2 rounded text-xs font-semibold transition cursor-pointer"
                >
                  Open Voice Assistant
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded text-xs font-semibold transition cursor-pointer"
                >
                  Open Floating Assistant
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-500 gap-2">
            <div>
              {t.nationalPortal} • {t.schemeDiscovery}
            </div>
            <div>
              {t.highContrast} • {t.authenticLinks}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
