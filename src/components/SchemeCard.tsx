import React from 'react';
import { Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';

interface SchemeCardProps {
  scheme: Scheme;
  currentLanguage?: string;
  onSelect: (scheme: Scheme) => void;
  onViewDocuments: (scheme: Scheme) => void;
  matchScore?: number;
  matchReasons?: string[];
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  currentLanguage = 'en',
  onSelect,
  onViewDocuments,
  matchScore,
  matchReasons,
}) => {
  const t = getTranslation(currentLanguage);

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-400 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
      <div>
        {/* Header tags */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide ${
              scheme.government === 'Central'
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {scheme.government === 'Central' ? t.centralGovt : t.stateGovt}
          </span>
          <span className="text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-medium">
            {scheme.state}
          </span>
          <span className="text-[11px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-medium">
            {scheme.sector}
          </span>
          {matchScore !== undefined && (
            <span className="text-[11px] bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200 font-semibold ml-auto">
              {t.matchScore}: {matchScore}%
            </span>
          )}
        </div>

        {/* Scheme Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
          {scheme.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
          {scheme.description}
        </p>

        {/* Match Reasons if provided */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded p-2 text-[11px] text-emerald-800 space-y-0.5">
            <span className="font-semibold block">{t.eligibility}</span>
            {matchReasons.slice(0, 2).map((r, i) => (
              <div key={i}>• {r}</div>
            ))}
          </div>
        )}

        {/* Key Highlights */}
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5 mb-4 text-xs space-y-1.5">
          <div>
            <span className="font-semibold text-slate-700">{t.benefits} </span>
            <span className="text-slate-600 line-clamp-2">{scheme.benefits}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">{t.eligibility} </span>
            <span className="text-slate-600 line-clamp-2">{scheme.eligibility.criteriaText}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(scheme)}
            className="font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
          >
            {t.schemeDetails}
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => onViewDocuments(scheme)}
            className="font-medium text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
          >
            {t.requiredDocuments} ({scheme.documents.length})
          </button>
        </div>

        <a
          href={scheme.applicationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded transition"
        >
          <span>{t.officialPortal}</span>
          <span className="text-[10px] text-slate-500">↗</span>
        </a>
      </div>
    </div>
  );
};
