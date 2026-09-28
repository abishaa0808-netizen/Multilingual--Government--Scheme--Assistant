import React, { useState } from 'react';
import { Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';

interface DocumentChecklistModalProps {
  scheme: Scheme | null;
  currentLanguage?: string;
  onClose: () => void;
}

export const DocumentChecklistModal: React.FC<DocumentChecklistModalProps> = ({
  scheme,
  currentLanguage = 'en',
  onClose,
}) => {
  if (!scheme) return null;
  const t = getTranslation(currentLanguage);

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const total = scheme.documents.length;
  const readyCount = scheme.documents.filter((d) => checkedDocs[d]).length;

  const copyChecklist = () => {
    const lines = [
      `Document Readiness Checklist for: ${scheme.name}`,
      `Scheme Portal: ${scheme.applicationLink}`,
      `Status: ${readyCount}/${total} Documents Prepared`,
      '',
      ...scheme.documents.map((d) => `[${checkedDocs[d] ? 'X' : ' '}] ${d}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              {t.checklistTitle}
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-md">
              {scheme.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded font-bold cursor-pointer"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded p-2.5">
            <span className="font-semibold text-slate-700">
              {t.readinessStatus}: {readyCount} of {total} Ready
            </span>
            <div className="w-32 bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${total > 0 ? (readyCount / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Check the documents you currently hold in original or self-attested digital format before visiting the portal or Common Service Centre (CSC):
          </p>

          <div className="space-y-2">
            {scheme.documents.map((doc, idx) => {
              const isChecked = Boolean(checkedDocs[doc]);
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDoc(doc)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className={`font-medium ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {doc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5 text-[11px] text-amber-900">
            <span className="font-bold">Officer Verification Tip: </span>
            Ensure your name and date of birth in your Bank Passbook match your Aadhaar Card exactly to avoid Direct Benefit Transfer (DBT) rejection.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={copyChecklist}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            {copied ? t.checklistCopied : t.copyChecklist}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
