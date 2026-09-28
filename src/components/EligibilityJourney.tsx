import React, { useState } from 'react';
import { UserProfile, STATES_AND_UTS, OCCUPATIONS, EDUCATION_LEVELS, Scheme } from '../data/constants.ts';
import { getTranslation } from '../data/translations.ts';
import { toolEligibilityChecker } from '../services/tools.ts';
import { SchemeCard } from './SchemeCard.tsx';

interface EligibilityJourneyProps {
  currentLanguage: string;
  initialState: string;
  onSelectScheme: (scheme: Scheme) => void;
  onViewDocuments: (scheme: Scheme) => void;
  onSendToChat: (prompt: string) => void;
}

export const EligibilityJourney: React.FC<EligibilityJourneyProps> = ({
  currentLanguage,
  initialState,
  onSelectScheme,
  onViewDocuments,
  onSendToChat,
}) => {
  const t = getTranslation(currentLanguage);

  const [profile, setProfile] = useState<UserProfile>({
    age: 28,
    state: initialState || 'All-India (Central)',
    occupation: OCCUPATIONS[0],
    education: EDUCATION_LEVELS[4],
    annualIncome: 180000,
    isStudent: false,
    gender: 'All',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/eligibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setResults(data.data);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('API eligibility check unavailable, running local checker:', err);
    }

    try {
      const localResult = toolEligibilityChecker(profile);
      setResults(localResult.data || []);
    } catch (localErr) {
      console.error('Local eligibility check failed:', localErr);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 block mb-1">
            {t.nationalPortal}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            {t.journeyTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {t.journeySubtitle}
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleEvaluate} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Age */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.ageYears}
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={profile.age ?? ''}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* State / UT */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.stateUt}
            </label>
            <select
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {STATES_AND_UTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.primaryOccupation}
            </label>
            <select
              value={profile.occupation}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {OCCUPATIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.educationLevel}
            </label>
            <select
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              {EDUCATION_LEVELS.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </select>
          </div>

          {/* Annual Family Income */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.annualIncome}
            </label>
            <input
              type="number"
              step="10000"
              min="0"
              value={profile.annualIncome ?? ''}
              onChange={(e) => setProfile({ ...profile, annualIncome: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. 200000"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {t.genderLabel}
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">{t.allGenders}</option>
              <option value="Female">{t.female}</option>
              <option value="Male">{t.male}</option>
              <option value="Transgender">{t.transgender}</option>
            </select>
          </div>

          {/* Student Status Toggle */}
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(profile.isStudent)}
                onChange={(e) => setProfile({ ...profile, isStudent: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{t.studentToggle}</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="sm:col-span-2 lg:col-span-3 pt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Checking Eligibility...' : t.findSchemesBtn}
            </button>

            <button
              type="button"
              onClick={() => {
                const prompt = `Please evaluate my eligibility for welfare schemes with: Age ${profile.age}, State ${profile.state}, Occupation ${profile.occupation}, Annual Income Rs ${profile.annualIncome}, Student Status: ${profile.isStudent ? 'Yes' : 'No'}.`;
                onSendToChat(prompt);
              }}
              className="px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
            >
              {t.consultAgentBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {results !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              {t.matchingSchemesTitle} ({results.length})
            </h3>
            <span className="text-xs text-slate-500">
              {t.showingVerified}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-600 text-xs">
              No specific schemes directly matched all exact criteria constraints. Try adjusting the income or state parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((item) => (
                <SchemeCard
                  key={item.id}
                  scheme={item}
                  currentLanguage={currentLanguage}
                  matchScore={item.matchScore}
                  matchReasons={item.matchReasons}
                  onSelect={onSelectScheme}
                  onViewDocuments={onViewDocuments}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
