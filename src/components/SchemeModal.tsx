import React from 'react';
import { Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';

interface SchemeModalProps {
  scheme: Scheme | null;
  currentLanguage?: string;
  onClose: () => void;
  onOpenChecklist: (scheme: Scheme) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  scheme,
  currentLanguage = 'en',
  onClose,
  onOpenChecklist,
}) => {
  if (!scheme) return null;
  const t = getTranslation(currentLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-300 max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                {scheme.government === 'Central' ? t.centralGovt : t.stateGovt}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">{scheme.state}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">{scheme.sector}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold leading-tight">{scheme.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition font-bold text-base cursor-pointer ml-4"
          >
            [X]
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-800">
          <div>
            <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-slate-500">
              {t.schemeDetails}
            </h4>
            <p className="text-slate-700 leading-relaxed">{scheme.description}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-slate-500">
              {t.benefits}
            </h4>
            <p className="text-slate-800 font-medium leading-relaxed">{scheme.benefits}</p>
          </div>

          <div className="bg-blue-50/60 rounded-lg p-4 border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-1 text-xs uppercase tracking-wide">
              {t.eligibility}
            </h4>
            <p className="text-slate-700 leading-relaxed mb-2">{scheme.eligibility.criteriaText}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-blue-200/60 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Min Age: </span>
                {scheme.eligibility.minAge ?? 'None'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Max Age: </span>
                {scheme.eligibility.maxAge ?? 'No limit'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Income Limit: </span>
                {scheme.eligibility.maxIncome ? `Rs ${scheme.eligibility.maxIncome.toLocaleString('en-IN')}` : 'None'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">{t.genderLabel}: </span>
                {scheme.eligibility.gender ?? 'All'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Coverage: </span>
                {scheme.state}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wide text-slate-500">
              Application Method
            </h4>
            <p className="text-slate-700 leading-relaxed">{scheme.applicationMethod}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide text-slate-500">
                {t.requiredDocuments}
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChecklist(scheme);
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                {t.tabChecklist}
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
              {scheme.documents.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-100 rounded p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{t.issuingBody} </span>
            {scheme.officialSource}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            {t.close}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChecklist(scheme);
              }}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition cursor-pointer"
            >
              {t.requiredDocuments}
            </button>
            <a
              href={scheme.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t.officialPortal}</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
