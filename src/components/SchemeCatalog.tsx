import React, { useState, useEffect } from 'react';
import { SECTORS, STATES_AND_UTS, Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';
import { SchemeCard } from './SchemeCard.tsx';
import { VirtualKeyboard } from './VirtualKeyboard.tsx';

interface SchemeCatalogProps {
  currentLanguage: string;
  currentState: string;
  onStateChange: (state: string) => void;
  onSelectScheme: (scheme: Scheme) => void;
  onViewDocuments: (scheme: Scheme) => void;
  onSendToChat: (prompt: string) => void;
}

export const SchemeCatalog: React.FC<SchemeCatalogProps> = ({
  currentLanguage,
  currentState,
  onStateChange,
  onSelectScheme,
  onViewDocuments,
  onSendToChat,
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedGovt, setSelectedGovt] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);

  const t = getTranslation(currentLanguage);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (currentState && currentState !== 'All-India (Central)') params.append('state', currentState);
      if (selectedSector && selectedSector !== 'All') params.append('sector', selectedSector);
      if (selectedGovt && selectedGovt !== 'All') params.append('government', selectedGovt);

      const res = await fetch(`/api/schemes?${params.toString()}`);
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [currentState, selectedSector, selectedGovt]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="space-y-6">
      {/* Banner / Hero */}
      <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
              {t.nationalPortal}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">{t.schemeDiscovery}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {t.tabCatalog}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {t.appSubtitle}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[260px] flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs focus-within:ring-1 focus-within:ring-amber-500">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowSearchKeyboard((prev) => !prev)}
              className="ml-2 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-medium transition cursor-pointer"
              title="Full Virtual Indian Language Keyboard"
            >
              {t.virtualKeyboard}
            </button>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
          >
            {t.searchBtn}
          </button>

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(fetchSchemes, 50);
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              {t.resetBtn}
            </button>
          )}
        </form>

        {/* Multilingual Virtual Keyboard overlay */}
        <div className="mt-3">
          <VirtualKeyboard
            languageCode={currentLanguage}
            isOpen={showSearchKeyboard}
            onClose={() => setShowSearchKeyboard(false)}
            onInsertChar={(ch) => setSearchQuery((prev) => prev + ch)}
            onBackspace={() => setSearchQuery((prev) => prev.slice(0, -1))}
            onClear={() => setSearchQuery('')}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Government Level & State Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">{t.govtLevel}</span>
            <div className="flex gap-1.5">
              {[
                { key: 'All', label: t.allGovt },
                { key: 'Central', label: t.centralGovt },
                { key: 'State', label: t.stateGovt },
              ].map((lvl) => (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => setSelectedGovt(lvl.key)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition cursor-pointer ${
                    selectedGovt === lvl.key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.stateUt}</span>
            <select
              value={currentState}
              onChange={(e) => onStateChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none cursor-pointer"
            >
              {STATES_AND_UTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 20 Sectors Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {t.selectSector} ({SECTORS.length}):
            </span>
            {selectedSector !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedSector('All')}
                className="text-xs text-blue-700 hover:underline font-medium cursor-pointer"
              >
                {t.clearSectorFilter}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSector('All')}
              className={`text-xs px-2.5 py-1 rounded border transition cursor-pointer font-medium ${
                selectedSector === 'All'
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.allSectors}
            </button>
            {SECTORS.map((sector) => {
              const isSelected = selectedSector === sector;
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => setSelectedSector(sector)}
                  className={`text-xs px-2.5 py-1 rounded border transition cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-900">
            {t.availableSchemes} ({schemes.length})
          </span>
          <span>{t.showingVerified}</span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 text-xs">
            Loading...
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-600 text-xs space-y-2">
            <p className="font-bold text-slate-800">No schemes found matching the selected filters.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedSector('All');
                setSelectedGovt('All');
                setSearchQuery('');
                onStateChange('All-India (Central)');
              }}
              className="mt-2 px-4 py-1.5 rounded bg-slate-900 text-white font-medium cursor-pointer"
            >
              {t.resetBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                currentLanguage={currentLanguage}
                onSelect={onSelectScheme}
                onViewDocuments={onViewDocuments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
