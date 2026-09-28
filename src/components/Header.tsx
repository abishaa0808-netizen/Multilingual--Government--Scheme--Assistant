import React from 'react';
import { LANGUAGES, STATES_AND_UTS } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  currentState: string;
  onStateChange: (state: string) => void;
  activeTab: 'catalog' | 'eligibility' | 'missing' | 'checklist';
  onTabChange: (tab: 'catalog' | 'eligibility' | 'missing' | 'checklist') => void;
  onOpenChat: () => void;
  onOpenVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentState,
  onStateChange,
  activeTab,
  onTabChange,
  onOpenChat,
  onOpenVoice,
}) => {
  const t = getTranslation(currentLanguage);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Ministry Band */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800 flex flex-wrap justify-between items-center text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 uppercase tracking-wider">
            {t.nationalPortal}
          </span>
          <span className="text-slate-600">|</span>
          <span>{t.schemeDiscovery}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>{t.highContrast}</span>
          <span className="text-slate-600">|</span>
          <span>{t.authenticLinks}</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Title / Identity */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-amber-500 rounded-sm" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {t.appTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-400 pl-4.5 mt-0.5">
            {t.appSubtitle}
          </p>
        </div>

        {/* Global Selectors & Voice / Chat Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* State / UT Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700">
            <label htmlFor="state-select" className="text-xs text-slate-400 font-medium">
              {t.stateUt}
            </label>
            <select
              id="state-select"
              value={currentState}
              onChange={(e) => onStateChange(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[130px] md:max-w-[170px] truncate"
            >
              {STATES_AND_UTS.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700">
            <label htmlFor="lang-select" className="text-xs text-slate-400 font-medium">
              {t.language}
            </label>
            <select
              id="lang-select"
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Dedicated Voice Assistant Button */}
          <button
            type="button"
            onClick={onOpenVoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 transition cursor-pointer shadow-xs"
            title="Open Voice Assistant with Speech Recognition"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Voice Assistant</span>
          </button>

          {/* Quick Chat Open Button */}
          <button
            type="button"
            onClick={onOpenChat}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer shadow-sm"
          >
            <span>{t.askAgent}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('catalog')}
            className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabCatalog}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('eligibility')}
            className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'eligibility'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabEligibility}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('missing')}
            className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'missing'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabMissing}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('checklist')}
            className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tabChecklist}
          </button>
        </div>
      </div>
    </header>
  );
};
