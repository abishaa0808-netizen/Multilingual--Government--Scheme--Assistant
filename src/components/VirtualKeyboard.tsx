import React, { useState } from 'react';

interface VirtualKeyboardProps {
  languageCode: string;
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface LanguageAlphabet {
  vowels: string[];
  consonants: string[];
  matras: string[];
  numerals: string[];
}

export const COMPLETE_ALPHABETS: Record<string, LanguageAlphabet> = {
  // 1. Hindi
  hi: {
    vowels: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'],
    consonants: [
      'क', 'ख', 'ग', 'घ', 'ङ',
      'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण',
      'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म',
      'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह',
      'क्ष', 'त्र', 'ज्ञ', 'श्र',
      'ड़', 'ढ़', 'फ़', 'ज़'
    ],
    matras: ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', '्', 'ँ', '़', 'ऽ'],
    numerals: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 2. Bengali
  bn: {
    vowels: ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'],
    consonants: [
      'ক', 'খ', 'গ', 'ঘ', 'ঙ',
      'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
      'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
      'ত', 'থ', 'দ', 'ধ', 'ন',
      'প', 'ফ', 'ব', 'ভ', 'ম',
      'য', 'র', 'ল', 'ব',
      'শ', 'ষ', 'স', 'হ',
      'ড়', 'ঢ়', 'য়', 'ৎ',
      'ক্ষ', 'জ্ঞ'
    ],
    matras: ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', 'ং', 'ঃ', '্', 'ঁ'],
    numerals: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 3. Tamil
  ta: {
    vowels: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'],
    consonants: [
      'க', 'ங', 'ச', 'ஞ', 'ட', 'ண',
      'த', 'ந', 'ப', 'ம', 'ய', 'ர',
      'ல', 'வ', 'ழ', 'ள', 'ற', 'ன',
      'ஜ', 'ஷ', 'ஸ', 'ஹ', 'க்ஷ'
    ],
    matras: ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்'],
    numerals: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 4. Telugu
  te: {
    vowels: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'],
    consonants: [
      'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
      'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
      'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
      'త', 'థ', 'ద', 'ధ', 'న',
      'ప', 'ఫ', 'బ', 'భ', 'మ',
      'య', 'ర', 'ల', 'వ',
      'శ', 'ష', 'స', 'హ',
      'ళ', 'క్ష', 'ఱ'
    ],
    matras: ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', 'ః', '్'],
    numerals: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 5. Marathi
  mr: {
    vowels: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः', 'ॲ', 'ऑ'],
    consonants: [
      'क', 'ख', 'ग', 'घ', 'ङ',
      'च', 'छ', 'ज', 'झ', 'ञ',
      'ट', 'ठ', 'ड', 'ढ', 'ण',
      'त', 'थ', 'द', 'ध', 'न',
      'प', 'फ', 'ब', 'भ', 'म',
      'य', 'र', 'ल', 'व',
      'श', 'ष', 'स', 'ह',
      'ळ', 'क्ष', 'ज्ञ'
    ],
    matras: ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', '्', 'ॅ', 'ॉ', 'ँ'],
    numerals: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 6. Gujarati
  gu: {
    vowels: ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'ઋ', 'એ', 'ઐ', 'ઓ', 'ઔ', 'અં', 'અઃ'],
    consonants: [
      'ક', 'ખ', 'ગ', 'ઘ', 'ઙ',
      'ચ', 'છ', 'જ', 'ઝ', 'ઞ',
      'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ',
      'ત', 'થ', 'દ', 'ધ', 'ન',
      'પ', 'ફ', 'બ', 'ભ', 'મ',
      'ય', 'ર', 'લ', 'વ',
      'શ', 'ષ', 'સ', 'હ',
      'ળ', 'ક્ષ', 'જ્ઞ'
    ],
    matras: ['ા', 'િ', 'ી', 'ુ', 'ૂ', 'ૃ', 'ે', 'ૈ', 'ો', 'ૌ', 'ં', 'ઃ', '્', 'ઁ'],
    numerals: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 7. Kannada
  kn: {
    vowels: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಅಂ', 'ಅಃ'],
    consonants: [
      'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ',
      'ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ',
      'ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ',
      'ತ', 'ಥ', 'ದ', 'ಧ', 'ನ',
      'ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ',
      'ಯ', 'ರ', 'ಲ', 'ವ',
      'ಶ', 'ಷ', 'ಸ', 'ಹ',
      'ಳ', 'ಕ್ಷ', 'ಜ್ಞ'
    ],
    matras: ['ಾ', 'ಿ', 'ೀ', 'ು', 'ೂ', 'ೃ', 'ೆ', 'ೇ', 'ೈ', 'ೊ', 'ೋ', 'ೌ', 'ಂ', 'ಃ', '್'],
    numerals: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 8. Malayalam
  ml: {
    vowels: ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'അം', 'അഃ'],
    consonants: [
      'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ',
      'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ',
      'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ',
      'ത', 'ഥ', 'ദ', 'ധ', 'ന',
      'പ', 'ഫ', 'ബ', 'ഭ', 'മ',
      'യ', 'ര', 'ല', 'വ',
      'ശ', 'ഷ', 'സ', 'ഹ',
      'ള', 'ഴ', 'റ', 'ക്ഷ'
    ],
    matras: ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ', 'േ', 'ൈ', 'ൊ', 'ോ', 'ൌ', 'ം', 'ഃ', '്'],
    numerals: ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 9. Odia
  or: {
    vowels: ['ଅ', 'ଆ', 'ଇ', 'ଈ', 'ଉ', 'ଊ', 'ଋ', 'ଏ', 'ଐ', 'ଓ', 'ଔ', 'ଅଂ', 'ଅଃ'],
    consonants: [
      'କ', 'ଖ', 'ଗ', 'ଘ', 'ଙ',
      'ଚ', 'ଛ', 'ଜ', 'ଝ', 'ଞ',
      'ଟ', 'ଠ', 'ଡ', 'ଢ', 'ଣ',
      'ତ', 'ଥ', 'ଦ', 'ଧ', 'ନ',
      'ପ', 'ଫ', 'ବ', 'ଭ', 'ମ',
      'ଯ', 'ର', 'ଳ', 'ୱ',
      'ଶ', 'ଷ', 'ସ', 'ହ',
      'କ୍ଷ', 'ଜ୍ଞ', 'ୟ', 'ଡ଼', 'ଢ଼'
    ],
    matras: ['ା', 'ି', 'ୀ', 'ୁ', 'ୂ', 'ୃ', 'େ', 'ୈ', 'ୋ', 'ୌ', 'ଂ', 'ଃ', '୍', 'ଁ'],
    numerals: ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 10. Urdu
  ur: {
    vowels: ['ا', 'آ', 'و', 'ی', 'ے', 'ع', 'ء', 'ؤ', 'ئ'],
    consonants: [
      'ب', 'پ', 'ت', 'ٹ', 'ث',
      'ج', 'چ', 'ح', 'خ',
      'د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ',
      'س', 'ش', 'ص', 'ض', 'ط', 'ظ',
      'غ', 'ف', 'ق', 'ک', 'گ', 'ل',
      'م', 'ن', 'ں', 'و', 'ہ', 'ھ', 'ی', 'ے'
    ],
    matras: ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ّ', 'ْ', 'ۂ', 'ء'],
    numerals: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // 11. English
  en: {
    vowels: ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'],
    consonants: [
      'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
      'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z',
      'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
      'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'
    ],
    matras: ['.', ',', '?', '!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '+', '=', '/', ':', ';', '"', "'"],
    numerals: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  languageCode,
  onInsertChar,
  onBackspace,
  onClear,
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'consonants' | 'vowels' | 'matras' | 'numerals'>('all');

  if (!isOpen) return null;

  const alphabet = COMPLETE_ALPHABETS[languageCode] || COMPLETE_ALPHABETS['hi'];

  let displayedChars: string[] = [];
  if (activeCategory === 'all') {
    displayedChars = [
      ...alphabet.consonants,
      ...alphabet.vowels,
      ...alphabet.matras,
      ...alphabet.numerals,
    ];
  } else if (activeCategory === 'consonants') {
    displayedChars = alphabet.consonants;
  } else if (activeCategory === 'vowels') {
    displayedChars = alphabet.vowels;
  } else if (activeCategory === 'matras') {
    displayedChars = alphabet.matras;
  } else if (activeCategory === 'numerals') {
    displayedChars = alphabet.numerals;
  }

  const categoryLabels: Record<string, { all: string; consonants: string; vowels: string; matras: string; numerals: string }> = {
    hi: { all: 'सम्पूर्ण (All)', consonants: 'व्यंजन (Consonants)', vowels: 'स्वर (Vowels)', matras: 'मात्राएँ (Signs)', numerals: 'अंक (Digits)' },
    bn: { all: 'সম্পূর্ণ (All)', consonants: 'ব্যঞ্জনবর্ণ', vowels: 'স্বরবর্ণ', matras: 'মাত্রা ও কার', numerals: 'সংখ্যা' },
    ta: { all: 'அனைத்தும் (All)', consonants: 'மெய் எழுத்துக்கள்', vowels: 'உயிர் எழுத்துக்கள்', matras: 'குறியீடுகள்', numerals: 'எண்கள்' },
    te: { all: 'అన్నీ (All)', consonants: 'హల్లులు', vowels: 'అచ్చులు', matras: 'గుణింతాలు', numerals: 'అంకెలు' },
    mr: { all: 'सर्व (All)', consonants: 'व्यंजने', vowels: 'स्वर', matras: 'मात्रा', numerals: 'अंक' },
    gu: { all: 'બધા (All)', consonants: 'વ્યંજનો', vowels: 'સ્વરો', matras: 'માત્રાઓ', numerals: 'અંકો' },
    kn: { all: 'ಎಲ್ಲವೂ (All)', consonants: 'ವ್ಯಂಜನಗಳು', vowels: 'ಸ್ವರಗಳು', matras: 'ಗುಣಿತಾಕ್ಷರಗಳು', numerals: 'ಅಂಕಿಗಳು' },
    ml: { all: 'എല്ലാം (All)', consonants: 'വ്യഞ്ജനങ്ങൾ', vowels: 'സ്വരങ്ങൾ', matras: 'ചിഹ്നങ്ങൾ', numerals: 'അക്കങ്ങൾ' },
    or: { all: 'ସମସ୍ତ (All)', consonants: 'ବ୍ୟଞ୍ଜନବର୍ଣ୍ଣ', vowels: 'ସ୍ୱରବର୍ଣ୍ଣ', matras: 'ମାତ୍ରା', numerals: 'ଅଙ୍କ' },
    ur: { all: 'تمام (All)', consonants: 'حروف صحیح', vowels: 'حروف علت', matras: 'اعراب', numerals: 'اعداد' },
    en: { all: 'All Keys', consonants: 'Consonants', vowels: 'Vowels', matras: 'Symbols', numerals: 'Numbers' },
  };

  const labels = categoryLabels[languageCode] || categoryLabels['en'];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 shadow-2xl max-w-full text-xs animate-in fade-in zoom-in-95 duration-150">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">
            Full Multilingual Keyboard ({languageCode.toUpperCase()})
          </span>
          <span className="text-[10px] text-slate-400">
            ({displayedChars.length} characters)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onBackspace}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
          >
            Backspace
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-2.5 pb-2 border-b border-slate-800/80 text-[11px]">
        {(['all', 'consonants', 'vowels', 'matras', 'numerals'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded transition font-medium cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {labels[cat]}
          </button>
        ))}
      </div>

      {/* Characters Matrix */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
        {displayedChars.map((ch, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsertChar(ch)}
            className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-sm font-semibold border border-slate-700 transition cursor-pointer select-none active:scale-90"
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Bottom helper controls */}
      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <span>Click characters to type directly into search or chat box.</span>
        <button
          type="button"
          onClick={() => onInsertChar(' ')}
          className="px-4 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 font-semibold border border-slate-700 cursor-pointer"
        >
          Space Bar
        </button>
      </div>
    </div>
  );
};
