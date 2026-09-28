export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
];

export const SECTORS = [
  'Education',
  'Healthcare',
  'Women & Child Welfare',
  'Agriculture',
  'Employment',
  'Skill Development',
  'Housing',
  'Disability Support',
  'Senior Citizens',
  'Financial Support',
  'Entrepreneurship',
  'Social Welfare',
  'Rural Development',
  'Urban Development',
  'Food & Nutrition',
  'Pension & Social Security',
  'Fisheries & Animal Husbandry',
  'MSME',
  'Tribal Welfare',
  'Energy & Utilities',
] as const;

export type SectorType = typeof SECTORS[number];

export const STATES_AND_UTS = [
  'All-India (Central)',
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export interface Scheme {
  id: string;
  name: string;
  government: 'Central' | 'State';
  state: string;
  sector: SectorType;
  description: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    occupations?: string[];
    education?: string[];
    maxIncome?: number;
    studentOnly?: boolean;
    gender?: 'All' | 'Female' | 'Male' | 'Transgender';
    criteriaText: string;
  };
  benefits: string;
  documents: string[];
  applicationMethod: string;
  officialSource: string;
  applicationLink: string;
}

export interface UserProfile {
  age?: number;
  state?: string;
  occupation?: string;
  education?: string;
  annualIncome?: number;
  isStudent?: boolean;
  gender?: string;
}

export const OCCUPATIONS = [
  'Farmer / Agricultural Laborer',
  'Artisan / Craftsman',
  'Street Vendor / Small Trader',
  'Fisherman / Fisherfolk',
  'Construction Worker / Daily Wage',
  'Self Employed / Micro Entrepreneur',
  'Salaried Employee (Private)',
  'Student / Scholar',
  'Unemployed / Job Seeker',
  'Homemaker',
  'Retired / Senior Citizen',
  'Other',
];

export const EDUCATION_LEVELS = [
  'No Formal Schooling',
  'Primary (Up to Class 5)',
  'Middle School (Class 8)',
  'Secondary (Class 10 Pass)',
  'Higher Secondary (Class 12 Pass)',
  'Diploma / ITI Certificate',
  'Graduate (Bachelor Degree)',
  'Post Graduate / Doctorate',
];
