import React, { useState } from 'react';
import { SECTORS, Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';
import { SchemeCard } from './SchemeCard.tsx';

interface MissingSchemesFinderProps {
  currentLanguage: string;
  onSelectScheme: (scheme: Scheme) => void;
  onViewDocuments: (scheme: Scheme) => void;
  onSendToChat: (prompt: string) => void;
}

export const MissingSchemesFinder: React.FC<MissingSchemesFinderProps> = ({
  currentLanguage,
  onSelectScheme,
  onViewDocuments,
  onSendToChat,
}) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Agriculture']);
  const [isLoading, setIsLoading] = useState(false);
  const [missingResults, setMissingResults] = useState<any[] | null>(null);

  const t = getTranslation(currentLanguage);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleScanMissing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/missing-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectors: selectedSectors }),
      });
      const data = await res.json();
      setMissingResults(data.data || []);
    } catch (err) {
      console.error('Error finding missing schemes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 block mb-1">
            {t.nationalPortal}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            {t.missingTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {t.missingSubtitle}
          </p>
        </div>

        {/* Sector checklist */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            {t.missingSectorSelect}
          </label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sec) => {
              const isSelected = selectedSectors.includes(sec);
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => toggleSector(sec)}
                  className={`text-xs px-3 py-1.5 rounded border transition cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleScanMissing}
            disabled={isLoading || selectedSectors.length === 0}
            className="px-6 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Scanning...' : t.scanMissingBtn}
          </button>

          <button
            type="button"
            onClick={() => {
              const prompt = `What welfare schemes am I missing? I currently only follow these sectors: ${selectedSectors.join(', ')}. Which other government benefits should I explore?`;
              onSendToChat(prompt);
            }}
            className="px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            {t.askAgent}
          </button>
        </div>
      </div>

      {/* Results */}
      {missingResults !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {t.missingTitle} ({missingResults.length})
            </h3>
            <span className="text-xs text-slate-500">
              {t.showingVerified}
            </span>
          </div>

          <div className="space-y-6">
            {missingResults.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Opportunity Sector
                    </span>
                    <span className="text-slate-400">•</span>
                    <h4 className="text-base font-bold text-slate-900">{item.sector}</h4>
                  </div>
                  <p className="text-xs text-slate-700 bg-amber-50/70 border border-amber-200 rounded p-2.5">
                    <span className="font-semibold text-amber-900">Reason: </span>
                    {item.reason}
                  </p>
                </div>

                {item.recommendedSchemes && item.recommendedSchemes.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Recommended Schemes
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.recommendedSchemes.map((scheme: Scheme) => (
                        <SchemeCard
                          key={scheme.id}
                          scheme={scheme}
                          currentLanguage={currentLanguage}
                          onSelect={onSelectScheme}
                          onViewDocuments={onViewDocuments}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
