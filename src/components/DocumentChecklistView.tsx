import React, { useState } from 'react';
import { getTranslation } from '../data/translations.ts';

interface DocItem {
  id: string;
  name: string;
  issuingAuthority: string;
  purpose: string;
  link: string;
  essentialFor: string[];
}

const COMMON_DOCUMENTS: DocItem[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card (UIDAI)',
    issuingAuthority: 'Unique Identification Authority of India',
    purpose: 'Universal identity proof, biometric e-KYC, and primary key for Direct Benefit Transfer (DBT) into bank accounts.',
    link: 'https://myaadhaar.uidai.gov.in',
    essentialFor: ['All Central & State Schemes', 'PM-KISAN', 'Ayushman Bharat', 'PMAY', 'NSP'],
  },
  {
    id: 'ration-card',
    name: 'Ration Card (NFSA / State PDS)',
    issuingAuthority: 'Department of Food, Civil Supplies & Consumer Affairs',
    purpose: 'Family composition proof, subsidized foodgrains (Pradhan Mantri Garib Kalyan Anna Yojana), and BPL/AAY income verification.',
    link: 'https://nfsa.gov.in',
    essentialFor: ['Ayushman Bharat PM-JAY', 'PM Ujjwala Yojana', 'State Food Subsidies', 'BSKY'],
  },
  {
    id: 'income-cert',
    name: 'Income Certificate',
    issuingAuthority: 'Revenue Department / Tehsildar / Sub-Divisional Magistrate (SDM)',
    purpose: 'Verifies annual household income to establish eligibility for means-tested welfare concessions and scholarships.',
    link: 'https://services.india.gov.in',
    essentialFor: ['National Scholarship Portal', 'EWS Housing', 'Fee Waivers', 'State Health Schemes'],
  },
  {
    id: 'domicile-cert',
    name: 'Residence / Domicile Certificate',
    issuingAuthority: 'District Magistrate / Tehsildar',
    purpose: 'Proof of continuous residence in a specific State or Union Territory required for state-sponsored benefits.',
    link: 'https://services.india.gov.in',
    essentialFor: ['State Scholarships', 'Kalaignar Magalir Urimai', 'Gruha Lakshmi', 'Ladli Behna'],
  },
  {
    id: 'caste-cert',
    name: 'Caste / Community Certificate (SC / ST / OBC / EWS)',
    issuingAuthority: 'Revenue Authorities / District Welfare Officer',
    purpose: 'Validates entitlement for constitutional reservation quotas, specialized grants, and Stand-Up India business credit.',
    link: 'https://services.india.gov.in',
    essentialFor: ['Pre & Post-Matric Scholarships', 'Stand-Up India', 'PM Van Dhan', 'NSQF Concessions'],
  },
  {
    id: 'bank-passbook',
    name: 'Aadhaar-Seeded Bank Passbook (NPCI DBT Enabled)',
    issuingAuthority: 'Public / Private Sector Commercial Bank or India Post Payments Bank',
    purpose: 'Receives direct cash assistance via NPCI Aadhaar Payments Bridge without intermediaries or leakage.',
    link: 'https://www.npci.org.in',
    essentialFor: ['PM-KISAN', 'MGNREGA Wages', 'LPG Subsidies', 'Atal Pension', 'Cash Transfers'],
  },
  {
    id: 'land-records',
    name: 'Cultivable Land Records (Khata / Khatauni / Jamabandi / Dharani)',
    issuingAuthority: 'State Revenue / Land Records Department',
    purpose: 'Proof of landholding title required for agricultural income assistance, crop insurance, and solar pump subsidies.',
    link: 'https://dilrmp.gov.in',
    essentialFor: ['PM-KISAN', 'PM Fasal Bima Yojana', 'Rythu Bharosa', 'Kisan Credit Card'],
  },
  {
    id: 'udid-card',
    name: 'Unique Disability ID (UDID Smart Card)',
    issuingAuthority: 'Department of Empowerment of Persons with Disabilities',
    purpose: 'Nationwide recognized certificate of disability enabling access to assistive appliances, travel concessions, and reservations.',
    link: 'https://www.swavlambancard.gov.in',
    essentialFor: ['ADIP Scheme', 'Divyangjan Pension', 'Accessible Transport', 'Employment Reservations'],
  },
];

interface DocumentChecklistViewProps {
  currentLanguage?: string;
}

export const DocumentChecklistView: React.FC<DocumentChecklistViewProps> = ({ currentLanguage = 'en' }) => {
  const [readiness, setReadiness] = useState<Record<string, boolean>>({});
  const t = getTranslation(currentLanguage);

  const toggle = (id: string) => {
    setReadiness((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const readyCount = COMMON_DOCUMENTS.filter((d) => readiness[d.id]).length;
  const total = COMMON_DOCUMENTS.length;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 block mb-1">
            {t.nationalPortal}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            {t.checklistTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {t.checklistSubtitle}
          </p>
        </div>

        {/* Readiness Bar */}
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-700">
              {t.readinessStatus}: {readyCount} of {total} Ready
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Check off items as you verify your physical papers or DigiLocker certificates
            </div>
          </div>
          <div className="w-full sm:w-64 bg-slate-200 rounded-full h-3">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(readyCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMMON_DOCUMENTS.map((doc) => {
          const isReady = Boolean(readiness[doc.id]);
          return (
            <div
              key={doc.id}
              className={`rounded-lg border p-5 shadow-xs transition flex flex-col justify-between ${
                isReady
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isReady}
                      onChange={() => toggle(doc.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={isReady ? 'text-emerald-700' : 'text-slate-500'}>
                      {isReady ? 'Ready' : 'Pending'}
                    </span>
                  </label>
                </div>

                <div className="text-[11px] text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700">{t.issuingBody} </span>
                  {doc.issuingAuthority}
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {doc.purpose}
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] text-slate-600 mb-3">
                  <span className="font-semibold text-slate-700">{t.keySchemes} </span>
                  {doc.essentialFor.join(', ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{t.officialPortal}:</span>
                <a
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>{t.accessApply}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
