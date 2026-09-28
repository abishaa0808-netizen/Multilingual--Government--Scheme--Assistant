import schemesData from '../data/schemes.json' with { type: 'json' };
import { Scheme, UserProfile, SectorType } from '../data/constants.ts';

const schemes: Scheme[] = schemesData as unknown as Scheme[];

export interface ToolResult {
  toolName: string;
  querySummary: string;
  foundCount: number;
  data: any;
}

/**
 * Tool 1: Scheme Search
 * Searches schemes by keyword in name, description, benefits, or sector
 */
export function toolSchemeSearch(keyword: string): ToolResult {
  if (!keyword || !keyword.trim()) {
    return {
      toolName: 'Scheme Search',
      querySummary: 'All available schemes',
      foundCount: schemes.length,
      data: schemes.slice(0, 10),
    };
  }

  const query = keyword.toLowerCase().trim();

  // 1. Direct exact or substring match
  let matched = schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.sector.toLowerCase().includes(query) ||
      s.benefits.toLowerCase().includes(query) ||
      s.eligibility.criteriaText.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
  );

  // 2. Tokenized search if full phrase didn't yield matches
  if (matched.length === 0) {
    const tokens = query
      .replace(/[?.,!():/\\-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !['what', 'does', 'offer', 'about', 'tell', 'show', 'give', 'help', 'with', 'from', 'this', 'that'].includes(t));

    if (tokens.length > 0) {
      matched = schemes.filter((s) => {
        const text = `${s.name} ${s.description} ${s.sector} ${s.benefits} ${s.id}`.toLowerCase();
        return tokens.some((token) => text.includes(token));
      });
    }
  }

  return {
    toolName: 'Scheme Search',
    querySummary: `Search keyword: "${keyword}"`,
    foundCount: matched.length,
    data: matched,
  };
}

/**
 * Tool 2: Eligibility Checker
 * Evaluates a user profile against scheme rules
 */
export function toolEligibilityChecker(profile: UserProfile): ToolResult {
  const eligibleSchemes: Array<{ scheme: Scheme; matchScore: number; matchReasons: string[] }> = [];

  for (const s of schemes) {
    let matches = true;
    const matchReasons: string[] = [];
    let score = 10;

    // State check
    if (profile.state && profile.state !== 'All-India (Central)') {
      if (s.government === 'State' && s.state !== profile.state) {
        matches = false;
        continue;
      }
      if (s.government === 'State' && s.state === profile.state) {
        score += 20;
        matchReasons.push(`Eligible for ${s.state} state resident.`);
      }
    } else if (s.government === 'State') {
      // If user hasn't selected state, do not strictly exclude, but lower score
      score += 0;
    }

    // Age check
    if (profile.age !== undefined && profile.age !== null) {
      if (s.eligibility.minAge !== undefined && profile.age < s.eligibility.minAge) {
        matches = false;
        continue;
      }
      if (s.eligibility.maxAge !== undefined && profile.age > s.eligibility.maxAge) {
        matches = false;
        continue;
      }
      score += 10;
      matchReasons.push(`Age ${profile.age} fits required criteria.`);
    }

    // Income check
    if (profile.annualIncome !== undefined && profile.annualIncome !== null && s.eligibility.maxIncome !== undefined) {
      if (profile.annualIncome > s.eligibility.maxIncome) {
        matches = false;
        continue;
      }
      score += 15;
      matchReasons.push(`Income within ceiling limit of Rs ${s.eligibility.maxIncome.toLocaleString('en-IN')}.`);
    }

    // Student only
    if (s.eligibility.studentOnly) {
      if (profile.isStudent === false) {
        matches = false;
        continue;
      }
      if (profile.isStudent === true) {
        score += 15;
        matchReasons.push(`Student status verified.`);
      }
    }

    // Gender check
    if (s.eligibility.gender && s.eligibility.gender !== 'All') {
      if (profile.gender && profile.gender.toLowerCase() !== s.eligibility.gender.toLowerCase()) {
        matches = false;
        continue;
      }
      if (profile.gender && profile.gender.toLowerCase() === s.eligibility.gender.toLowerCase()) {
        score += 15;
        matchReasons.push(`Targeted benefit for ${s.eligibility.gender} citizens.`);
      }
    }

    // Occupation check
    if (s.eligibility.occupations && s.eligibility.occupations.length > 0) {
      if (profile.occupation) {
        const occMatch = s.eligibility.occupations.some(
          (occ) =>
            occ.toLowerCase().includes(profile.occupation!.toLowerCase()) ||
            profile.occupation!.toLowerCase().includes(occ.toLowerCase())
        );
        if (occMatch) {
          score += 25;
          matchReasons.push(`Direct occupation match for ${profile.occupation}.`);
        }
      }
    }

    if (matches) {
      eligibleSchemes.push({ scheme: s, matchScore: score, matchReasons });
    }
  }

  // Sort descending by match score
  eligibleSchemes.sort((a, b) => b.matchScore - a.matchScore);

  return {
    toolName: 'Eligibility Checker',
    querySummary: `Profile: Age ${profile.age ?? 'N/A'}, State: ${profile.state ?? 'Any'}, Occupation: ${profile.occupation ?? 'Any'}`,
    foundCount: eligibleSchemes.length,
    data: eligibleSchemes.map((item) => ({
      ...item.scheme,
      matchScore: item.matchScore,
      matchReasons: item.matchReasons,
    })),
  };
}

/**
 * Tool 3: State/UT Filter
 */
export function toolStateFilter(stateName: string): ToolResult {
  const normState = stateName.trim().toLowerCase();
  const matched = schemes.filter(
    (s) =>
      s.state.toLowerCase() === normState ||
      (normState !== 'all-india (central)' && s.government === 'Central') ||
      s.state.toLowerCase().includes(normState)
  );

  return {
    toolName: 'State/UT Filter',
    querySummary: `State / UT: ${stateName}`,
    foundCount: matched.length,
    data: matched,
  };
}

/**
 * Tool 4: Sector Filter
 */
export function toolSectorFilter(sectorName: string): ToolResult {
  const normSector = sectorName.trim().toLowerCase();
  const matched = schemes.filter(
    (s) =>
      s.sector.toLowerCase() === normSector ||
      s.sector.toLowerCase().includes(normSector) ||
      normSector.includes(s.sector.toLowerCase())
  );

  return {
    toolName: 'Sector Filter',
    querySummary: `Sector: ${sectorName}`,
    foundCount: matched.length,
    data: matched,
  };
}

/**
 * Tool 5: Scheme Details
 */
export function toolSchemeDetails(schemeIdentifier: string): ToolResult {
  const query = schemeIdentifier.trim().toLowerCase();
  const matched = schemes.find(
    (s) =>
      s.id.toLowerCase() === query ||
      s.name.toLowerCase().includes(query) ||
      query.includes(s.id.toLowerCase())
  );

  return {
    toolName: 'Scheme Details',
    querySummary: `Scheme: ${schemeIdentifier}`,
    foundCount: matched ? 1 : 0,
    data: matched || null,
  };
}

/**
 * Tool 6: Benefits
 */
export function toolBenefits(schemeIdentifier: string): ToolResult {
  const schemeResult = toolSchemeDetails(schemeIdentifier);
  const scheme = schemeResult.data as Scheme | null;

  return {
    toolName: 'Benefits',
    querySummary: `Benefits for: ${schemeIdentifier}`,
    foundCount: scheme ? 1 : 0,
    data: scheme
      ? {
          name: scheme.name,
          benefits: scheme.benefits,
          government: scheme.government,
          state: scheme.state,
          sector: scheme.sector,
        }
      : null,
  };
}

/**
 * Tool 7: Application Information
 */
export function toolApplicationInfo(schemeIdentifier: string): ToolResult {
  const schemeResult = toolSchemeDetails(schemeIdentifier);
  const scheme = schemeResult.data as Scheme | null;

  return {
    toolName: 'Application Information',
    querySummary: `Application info for: ${schemeIdentifier}`,
    foundCount: scheme ? 1 : 0,
    data: scheme
      ? {
          name: scheme.name,
          applicationMethod: scheme.applicationMethod,
          documentsRequired: scheme.documents,
          officialSource: scheme.officialSource,
          applicationLink: scheme.applicationLink,
        }
      : null,
  };
}

/**
 * Tool 8: Official Government Source
 */
export function toolOfficialSource(schemeIdentifier: string): ToolResult {
  const schemeResult = toolSchemeDetails(schemeIdentifier);
  const scheme = schemeResult.data as Scheme | null;

  return {
    toolName: 'Official Government Source',
    querySummary: `Official source verification: ${schemeIdentifier}`,
    foundCount: scheme ? 1 : 0,
    data: scheme
      ? {
          name: scheme.name,
          officialSource: scheme.officialSource,
          applicationLink: scheme.applicationLink,
          verified: true,
        }
      : null,
  };
}

/**
 * Tool 9: "What Am I Missing?"
 * Checks other relevant sectors automatically that a user might have overlooked!
 */
export function toolWhatAmIMissing(currentSectorsOrInterests: string[], profile?: UserProfile): ToolResult {
  const currentSet = new Set(currentSectorsOrInterests.map((s) => s.toLowerCase()));

  // Map related sectors that users frequently miss
  const missingSuggestions: Array<{
    sector: SectorType;
    reason: string;
    recommendedSchemes: Scheme[];
  }> = [];

  const crossSectorMap: Record<string, { sector: SectorType; reason: string }[]> = {
    agriculture: [
      { sector: 'Energy & Utilities', reason: 'Farmers can install subsidized solar rooftop & irrigation pumps via PM Surya Ghar & solar schemes.' },
      { sector: 'Pension & Social Security', reason: 'Unorganized workers and farmers can secure a guaranteed monthly pension through Atal Pension Yojana.' },
      { sector: 'Healthcare', reason: 'Farmer families can avail Rs 5 Lakh cashless hospital coverage under Ayushman Bharat (PM-JAY).' },
    ],
    msme: [
      { sector: 'Skill Development', reason: 'Artisans and small businesses can get toolkits and free advanced training via PM Vishwakarma.' },
      { sector: 'Energy & Utilities', reason: 'Micro units can slash electric power costs with subsidized solar systems.' },
      { sector: 'Entrepreneurship', reason: 'Special credit facilities exist under Stand-Up India for women and SC/ST founders.' },
    ],
    education: [
      { sector: 'Skill Development', reason: 'Students can take up free NSQF technical certifications with placement via Skill India.' },
      { sector: 'Women & Child Welfare', reason: 'Girl students can qualify for state incentive grants like Kanyashree or Sukanya Samriddhi.' },
    ],
    healthcare: [
      { sector: 'Disability Support', reason: 'Specialized assistive equipment and UDID smart cards offer lifelong health and transport aid.' },
      { sector: 'Senior Citizens', reason: 'Free Ayushman Vaya Vandana card is now available for all seniors aged 70+.' },
    ],
    housing: [
      { sector: 'Energy & Utilities', reason: 'New house owners can receive up to Rs 78,000 subsidy for rooftop solar installation.' },
      { sector: 'Women & Child Welfare', reason: 'Priority allotment and stamp duty concessions are provided for women co-owners.' },
    ],
  };

  // Find recommendations based on user's known sector
  for (const known of currentSectorsOrInterests) {
    const key = known.toLowerCase().split(' ')[0];
    const mappings = crossSectorMap[key] || crossSectorMap[known.toLowerCase()];
    if (mappings) {
      for (const m of mappings) {
        if (!currentSet.has(m.sector.toLowerCase())) {
          const recs = schemes.filter((s) => s.sector === m.sector).slice(0, 2);
          if (recs.length > 0) {
            missingSuggestions.push({
              sector: m.sector,
              reason: m.reason,
              recommendedSchemes: recs,
            });
            currentSet.add(m.sector.toLowerCase()); // prevent duplicate
          }
        }
      }
    }
  }

  // If no known sectors or still few suggestions, check universal safety net
  if (missingSuggestions.length === 0) {
    const defaultSectors: SectorType[] = ['Healthcare', 'Energy & Utilities', 'Pension & Social Security'];
    for (const sec of defaultSectors) {
      const recs = schemes.filter((s) => s.sector === sec).slice(0, 2);
      missingSuggestions.push({
        sector: sec,
        reason: 'Essential national safety net scheme available for all eligible households.',
        recommendedSchemes: recs,
      });
    }
  }

  return {
    toolName: 'What Am I Missing?',
    querySummary: 'Cross-sector untapped opportunities check',
    foundCount: missingSuggestions.length,
    data: missingSuggestions,
  };
}

export function getAllSchemes(): Scheme[] {
  return schemes;
}
