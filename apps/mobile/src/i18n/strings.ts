import type { LText } from './types';

/**
 * UI strings for the prototype.
 * Kannada and Hindi are DRAFT translations and must be reviewed by native speakers
 * before any public release (see ADR 0011).
 */
export const strings = {
  appName: { en: 'KrishiSutra', kn: 'ಕೃಷಿಸೂತ್ರ', hi: 'कृषिसूत्र' },
  tagline: {
    en: 'Your farming assistant',
    kn: 'ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ',
    hi: 'आपका खेती सहायक',
  },
  chooseLanguage: {
    en: 'Choose your language',
    kn: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    hi: 'अपनी भाषा चुनें',
  },
  continue: { en: 'Continue', kn: 'ಮುಂದುವರಿಸಿ', hi: 'आगे बढ़ें' },

  // Prototype notice
  prototypeTitle: { en: 'Prototype', kn: 'ಮಾದರಿ ಆವೃತ್ತಿ', hi: 'प्रोटोटाइप' },
  prototypeBanner: {
    en: 'Prototype: crop details are sample placeholders, not farming advice.',
    kn: 'ಮಾದರಿ ಆವೃತ್ತಿ: ಬೆಳೆ ಮಾಹಿತಿ ಮಾದರಿ ಪಠ್ಯ ಮಾತ್ರ, ಕೃಷಿ ಸಲಹೆ ಅಲ್ಲ.',
    hi: 'प्रोटोटाइप: फसल की जानकारी केवल नमूना है, खेती की सलाह नहीं।',
  },
  prototypeAbout: {
    en: 'This early version shows how the app will look and work. Real, verified crop information from agricultural universities, ICAR and KVKs will be added before release.',
    kn: 'ಈ ಆರಂಭಿಕ ಆವೃತ್ತಿ ಆ್ಯಪ್ ಹೇಗೆ ಕಾಣುತ್ತದೆ ಮತ್ತು ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂಬುದನ್ನು ತೋರಿಸುತ್ತದೆ. ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳು, ICAR ಮತ್ತು KVK ಗಳಿಂದ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಬಿಡುಗಡೆಯ ಮೊದಲು ಸೇರಿಸಲಾಗುವುದು.',
    hi: 'यह शुरुआती संस्करण दिखाता है कि ऐप कैसा दिखेगा और कैसे काम करेगा। कृषि विश्वविद्यालयों, ICAR और KVK से सत्यापित जानकारी रिलीज़ से पहले जोड़ी जाएगी।',
  },

  // Tabs
  tabHome: { en: 'Home', kn: 'ಮುಖಪುಟ', hi: 'होम' },
  tabGrow: { en: 'Grow', kn: 'ಬೆಳೆಸಿ', hi: 'उगाएँ' },
  tabSuggest: { en: 'Suggest', kn: 'ಸಲಹೆ', hi: 'सुझाव' },
  tabMyCrops: { en: 'My Crops', kn: 'ನನ್ನ ಬೆಳೆಗಳು', hi: 'मेरी फसलें' },
  tabSettings: { en: 'Settings', kn: 'ಸೆಟ್ಟಿಂಗ್ಸ್', hi: 'सेटिंग्स' },

  // Home
  homeGreeting: { en: 'Namaskara!', kn: 'ನಮಸ್ಕಾರ!', hi: 'नमस्ते!' },
  homeWhatToGrow: {
    en: 'What should I grow?',
    kn: 'ನಾನು ಏನು ಬೆಳೆಯಬೇಕು?',
    hi: 'मुझे क्या उगाना चाहिए?',
  },
  homeWhatToGrowSub: {
    en: 'Tell us about your land and water',
    kn: 'ನಿಮ್ಮ ಜಮೀನು ಮತ್ತು ನೀರಿನ ಬಗ್ಗೆ ತಿಳಿಸಿ',
    hi: 'अपनी ज़मीन और पानी के बारे में बताएँ',
  },
  homeHowToGrow: {
    en: 'How to grow a crop',
    kn: 'ಬೆಳೆ ಬೆಳೆಯುವುದು ಹೇಗೆ',
    hi: 'फसल कैसे उगाएँ',
  },
  homeHowToGrowSub: {
    en: 'Step-by-step growing guide',
    kn: 'ಹಂತ ಹಂತದ ಮಾರ್ಗದರ್ಶಿ',
    hi: 'चरण-दर-चरण मार्गदर्शिका',
  },
  homeMyCropsSub: {
    en: 'Track the crops you are growing',
    kn: 'ನೀವು ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆಗಳನ್ನು ಗಮನಿಸಿ',
    hi: 'अपनी उगाई जा रही फसलों पर नज़र रखें',
  },
  comingSoon: { en: 'Coming soon', kn: 'ಶೀಘ್ರದಲ್ಲೇ', hi: 'जल्द आ रहा है' },
  featWeather: { en: 'Weather & alerts', kn: 'ಹವಾಮಾನ ಮತ್ತು ಎಚ್ಚರಿಕೆ', hi: 'मौसम और चेतावनी' },
  featSoil: { en: 'Soil health', kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', hi: 'मिट्टी स्वास्थ्य' },
  featMarket: { en: 'Market price', kn: 'ಮಾರುಕಟ್ಟೆ ದರ', hi: 'मंडी भाव' },
  featExpert: { en: 'Ask an expert', kn: 'ತಜ್ಞರನ್ನು ಕೇಳಿ', hi: 'विशेषज्ञ से पूछें' },

  // Grow
  growTitle: { en: 'Grow Crops', kn: 'ಬೆಳೆ ಬೆಳೆಸಿ', hi: 'फसल उगाएँ' },
  growSubtitle: {
    en: 'Choose a crop to get step-by-step growing guidance',
    kn: 'ಹಂತ ಹಂತದ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    hi: 'चरण-दर-चरण मार्गदर्शन के लिए फसल चुनें',
  },
  searchPlaceholder: {
    en: 'Search crop (e.g., Paddy, Tomato)',
    kn: 'ಬೆಳೆ ಹುಡುಕಿ (ಉದಾ: ಭತ್ತ, ಟೊಮೆಟೊ)',
    hi: 'फसल खोजें (जैसे: धान, टमाटर)',
  },
  all: { en: 'All', kn: 'ಎಲ್ಲಾ', hi: 'सभी' },
  categories: { en: 'Categories', kn: 'ವರ್ಗಗಳು', hi: 'श्रेणियाँ' },
  crops: { en: 'Crops', kn: 'ಬೆಳೆಗಳು', hi: 'फसलें' },
  noCropsYet: {
    en: 'Crops for this category will be added soon.',
    kn: 'ಈ ವರ್ಗದ ಬೆಳೆಗಳನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸೇರಿಸಲಾಗುವುದು.',
    hi: 'इस श्रेणी की फसलें जल्द जोड़ी जाएँगी।',
  },
  noResults: { en: 'No crops found', kn: 'ಯಾವುದೇ ಬೆಳೆ ಸಿಗಲಿಲ್ಲ', hi: 'कोई फसल नहीं मिली' },

  // Crop detail
  tabOverview: { en: 'Overview', kn: 'ಅವಲೋಕನ', hi: 'जानकारी' },
  tabSteps: { en: 'Steps', kn: 'ಹಂತಗಳು', hi: 'चरण' },
  tabCalendar: { en: 'Calendar', kn: 'ಕ್ಯಾಲೆಂಡರ್', hi: 'कैलेंडर' },
  tabCost: { en: 'Cost', kn: 'ವೆಚ್ಚ', hi: 'लागत' },
  tabTips: { en: 'Tips', kn: 'ಸಲಹೆಗಳು', hi: 'सुझाव' },
  growingProcedure: {
    en: 'Crop growing procedure',
    kn: 'ಬೆಳೆ ಬೆಳೆಯುವ ವಿಧಾನ',
    hi: 'फसल उगाने की विधि',
  },
  method: { en: 'Method', kn: 'ವಿಧಾನ', hi: 'विधि' },
  variety: { en: 'Variety', kn: 'ತಳಿ', hi: 'किस्म' },
  chooseVariety: { en: 'Choose a variety', kn: 'ತಳಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', hi: 'किस्म चुनें' },
  sampleVariety: { en: 'Sample variety', kn: 'ಮಾದರಿ ತಳಿ', hi: 'नमूना किस्म' },
  varietiesPending: {
    en: 'Real varieties recommended for Karnataka will be listed here from verified sources.',
    kn: 'ಕರ್ನಾಟಕಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ನಿಜವಾದ ತಳಿಗಳನ್ನು ಪರಿಶೀಲಿತ ಮೂಲಗಳಿಂದ ಇಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾಗುವುದು.',
    hi: 'कर्नाटक के लिए अनुशंसित असली किस्में सत्यापित स्रोतों से यहाँ दिखाई जाएँगी।',
  },
  duration: { en: 'Growing duration', kn: 'ಬೆಳೆ ಅವಧಿ', hi: 'फसल अवधि' },
  seasons: { en: 'Suitable seasons', kn: 'ಸೂಕ್ತ ಋತುಗಳು', hi: 'उपयुक्त मौसम' },
  soilNeeds: { en: 'Soil requirements', kn: 'ಮಣ್ಣಿನ ಅಗತ್ಯ', hi: 'मिट्टी की ज़रूरत' },
  waterNeeds: { en: 'Water requirements', kn: 'ನೀರಿನ ಅಗತ್ಯ', hi: 'पानी की ज़रूरत' },
  expectedYield: { en: 'Expected yield', kn: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ', hi: 'अनुमानित उपज' },
  costOfCultivation: {
    en: 'Cost of cultivation (per acre)',
    kn: 'ಬೇಸಾಯದ ವೆಚ್ಚ (ಪ್ರತಿ ಎಕರೆಗೆ)',
    hi: 'खेती की लागत (प्रति एकड़)',
  },
  pendingVerified: {
    en: 'Pending — will be added from a verified source',
    kn: 'ಬಾಕಿ — ಪರಿಶೀಲಿತ ಮೂಲದಿಂದ ಸೇರಿಸಲಾಗುವುದು',
    hi: 'लंबित — सत्यापित स्रोत से जोड़ा जाएगा',
  },
  notAvailable: { en: 'Not available', kn: 'ಲಭ್ಯವಿಲ್ಲ', hi: 'उपलब्ध नहीं' },
  calendarNote: {
    en: 'After you start this crop, each step will show real dates based on your sowing date.',
    kn: 'ಈ ಬೆಳೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿದ ನಂತರ, ಪ್ರತಿ ಹಂತಕ್ಕೂ ನಿಮ್ಮ ಬಿತ್ತನೆ ದಿನಾಂಕದ ಆಧಾರದ ಮೇಲೆ ನಿಜವಾದ ದಿನಾಂಕಗಳು ಕಾಣಿಸುತ್ತವೆ.',
    hi: 'फसल शुरू करने के बाद हर चरण आपकी बुवाई की तारीख के अनुसार असली तारीखें दिखाएगा।',
  },
  startTracking: {
    en: 'Start growing this crop',
    kn: 'ಈ ಬೆಳೆ ಬೆಳೆಯಲು ಪ್ರಾರಂಭಿಸಿ',
    hi: 'यह फसल उगाना शुरू करें',
  },
  alreadyTracking: {
    en: 'Open in My Crops',
    kn: 'ನನ್ನ ಬೆಳೆಗಳಲ್ಲಿ ತೆರೆಯಿರಿ',
    hi: 'मेरी फसलों में खोलें',
  },
  daysPending: { en: 'Days: pending', kn: 'ದಿನಗಳು: ಬಾಕಿ', hi: 'दिन: लंबित' },

  // Stage
  stepXofY: { en: 'Step {x} of {y}', kn: 'ಹಂತ {x} / {y}', hi: 'चरण {x} / {y}' },
  guide: { en: 'Guide', kn: 'ಮಾರ್ಗದರ್ಶಿ', hi: 'गाइड' },
  video: { en: 'Video', kn: 'ವೀಡಿಯೊ', hi: 'वीडियो' },
  images: { en: 'Images', kn: 'ಚಿತ್ರಗಳು', hi: 'चित्र' },
  howToDoIt: { en: 'How to do it?', kn: 'ಹೇಗೆ ಮಾಡುವುದು?', hi: 'कैसे करें?' },
  materials: {
    en: 'Materials & equipment',
    kn: 'ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ಉಪಕರಣಗಳು',
    hi: 'सामग्री और उपकरण',
  },
  commonMistakes: { en: 'Common mistakes', kn: 'ಸಾಮಾನ್ಯ ತಪ್ಪುಗಳು', hi: 'आम गलतियाँ' },
  warnings: { en: 'Important warnings', kn: 'ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು', hi: 'ज़रूरी चेतावनियाँ' },
  tip: { en: 'Expert tip', kn: 'ತಜ್ಞರ ಸಲಹೆ', hi: 'विशेषज्ञ सुझाव' },
  source: { en: 'Source', kn: 'ಮೂಲ', hi: 'स्रोत' },
  listen: { en: 'Listen', kn: 'ಕೇಳಿ', hi: 'सुनें' },
  stop: { en: 'Stop', kn: 'ನಿಲ್ಲಿಸಿ', hi: 'रोकें' },
  previous: { en: 'Previous', kn: 'ಹಿಂದಿನದು', hi: 'पिछला' },
  next: { en: 'Next', kn: 'ಮುಂದಿನದು', hi: 'अगला' },
  finish: { en: 'Finish', kn: 'ಮುಗಿಸಿ', hi: 'समाप्त' },
  stageDescription: {
    en: 'This step of growing {crop} is “{stage}”. A short, verified description will appear here.',
    kn: '{crop} ಬೆಳೆಯುವ ಈ ಹಂತ “{stage}”. ಪರಿಶೀಲಿತ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    hi: '{crop} उगाने का यह चरण “{stage}” है। सत्यापित संक्षिप्त विवरण यहाँ दिखेगा।',
  },
  sampleInstruction: {
    en: 'Sample instruction {n} — verified instruction will appear here.',
    kn: 'ಮಾದರಿ ಸೂಚನೆ {n} — ಪರಿಶೀಲಿತ ಸೂಚನೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    hi: 'नमूना निर्देश {n} — सत्यापित निर्देश यहाँ दिखेगा।',
  },
  samplePlaceholder: {
    en: 'Sample placeholder — to be added from a verified source.',
    kn: 'ಮಾದರಿ ಪಠ್ಯ — ಪರಿಶೀಲಿತ ಮೂಲದಿಂದ ಸೇರಿಸಲಾಗುವುದು.',
    hi: 'नमूना पाठ — सत्यापित स्रोत से जोड़ा जाएगा।',
  },
  sourcePending: {
    en: 'Will be cited from UAS / ICAR / KVK publications.',
    kn: 'UAS / ICAR / KVK ಪ್ರಕಟಣೆಗಳಿಂದ ಉಲ್ಲೇಖಿಸಲಾಗುವುದು.',
    hi: 'UAS / ICAR / KVK प्रकाशनों से उद्धृत किया जाएगा।',
  },
  videoPending: {
    en: 'A real farm demonstration video will appear here, with credit to its source.',
    kn: 'ನಿಜವಾದ ಕೃಷಿ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ವೀಡಿಯೊ ಅದರ ಮೂಲದ ಉಲ್ಲೇಖದೊಂದಿಗೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
    hi: 'असली खेत प्रदर्शन वीडियो उसके स्रोत के श्रेय के साथ यहाँ दिखेगा।',
  },
  imagesPending: {
    en: 'Real photos of this step will appear here.',
    kn: 'ಈ ಹಂತದ ನಿಜವಾದ ಫೋಟೋಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
    hi: 'इस चरण की असली तस्वीरें यहाँ दिखेंगी।',
  },
  speechUnavailable: {
    en: 'Voice for this language is not installed on this phone.',
    kn: 'ಈ ಭಾಷೆಯ ಧ್ವನಿ ಈ ಫೋನ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಆಗಿಲ್ಲ.',
    hi: 'इस भाषा की आवाज़ इस फ़ोन पर इंस्टॉल नहीं है।',
  },

  // Suggest (recommendation wizard)
  suggestTitle: {
    en: 'What should I grow?',
    kn: 'ನಾನು ಏನು ಬೆಳೆಯಬೇಕು?',
    hi: 'मुझे क्या उगाना चाहिए?',
  },
  wizardStep: { en: 'Question {x} of {y}', kn: 'ಪ್ರಶ್ನೆ {x} / {y}', hi: 'प्रश्न {x} / {y}' },
  qLocation: {
    en: 'Where is your land?',
    kn: 'ನಿಮ್ಮ ಜಮೀನು ಎಲ್ಲಿದೆ?',
    hi: 'आपकी ज़मीन कहाँ है?',
  },
  villagePlaceholder: { en: 'Village', kn: 'ಗ್ರಾಮ', hi: 'गाँव' },
  districtPlaceholder: { en: 'District', kn: 'ಜಿಲ್ಲೆ', hi: 'ज़िला' },
  stateKarnataka: { en: 'State: Karnataka', kn: 'ರಾಜ್ಯ: ಕರ್ನಾಟಕ', hi: 'राज्य: कर्नाटक' },
  gpsSoon: {
    en: 'Using your phone location will be added soon.',
    kn: 'ಫೋನ್ ಸ್ಥಳ ಬಳಸುವ ಸೌಲಭ್ಯ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ.',
    hi: 'फ़ोन की लोकेशन इस्तेमाल करने की सुविधा जल्द आएगी।',
  },
  qSoil: {
    en: 'What type of soil do you have?',
    kn: 'ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಯಾವುದು?',
    hi: 'आपकी मिट्टी किस प्रकार की है?',
  },
  qWater: {
    en: 'Where does your water come from?',
    kn: 'ನಿಮಗೆ ನೀರು ಎಲ್ಲಿಂದ ಸಿಗುತ್ತದೆ?',
    hi: 'आपको पानी कहाँ से मिलता है?',
  },
  chooseAll: { en: 'Choose all that apply', kn: 'ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ', hi: 'जो लागू हों, सभी चुनें' },
  qSoilTest: {
    en: 'Do you have a soil test report?',
    kn: 'ನಿಮ್ಮ ಬಳಿ ಮಣ್ಣು ಪರೀಕ್ಷಾ ವರದಿ ಇದೆಯೇ?',
    hi: 'क्या आपके पास मिट्टी जाँच रिपोर्ट है?',
  },
  soilTestHelp: {
    en: 'Optional. Enter values from your Soil Health Card if you have one.',
    kn: 'ಐಚ್ಛಿಕ. ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಇದ್ದರೆ ಅದರ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.',
    hi: 'वैकल्पिक। यदि आपके पास मृदा स्वास्थ्य कार्ड है तो उसके मान भरें।',
  },
  qSeason: {
    en: 'When do you want to sow?',
    kn: 'ನೀವು ಯಾವಾಗ ಬಿತ್ತನೆ ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
    hi: 'आप कब बुवाई करना चाहते हैं?',
  },
  qBudget: {
    en: 'How much can you invest? (optional)',
    kn: 'ನೀವು ಎಷ್ಟು ಹೂಡಿಕೆ ಮಾಡಬಹುದು? (ಐಚ್ಛಿಕ)',
    hi: 'आप कितना निवेश कर सकते हैं? (वैकल्पिक)',
  },
  budgetPlaceholder: { en: 'Amount in ₹', kn: 'ಮೊತ್ತ ₹ ನಲ್ಲಿ', hi: 'राशि ₹ में' },
  skip: { en: 'Skip', kn: 'ಬಿಟ್ಟುಬಿಡಿ', hi: 'छोड़ें' },
  back: { en: 'Back', kn: 'ಹಿಂದೆ', hi: 'वापस' },
  seeResults: { en: 'See suggestions', kn: 'ಸಲಹೆಗಳನ್ನು ನೋಡಿ', hi: 'सुझाव देखें' },
  startOver: { en: 'Start again', kn: 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ', hi: 'फिर से शुरू करें' },
  resultsTitle: { en: 'Your suggestions', kn: 'ನಿಮ್ಮ ಸಲಹೆಗಳು', hi: 'आपके सुझाव' },
  dataCompleteness: {
    en: 'Information provided',
    kn: 'ನೀಡಿದ ಮಾಹಿತಿ',
    hi: 'दी गई जानकारी',
  },
  missingInfo: { en: 'Missing information', kn: 'ಕಾಣೆಯಾದ ಮಾಹಿತಿ', hi: 'छूटी हुई जानकारी' },
  missingInfoHelp: {
    en: 'Adding this improves the accuracy of suggestions.',
    kn: 'ಇದನ್ನು ಸೇರಿಸಿದರೆ ಸಲಹೆಗಳ ನಿಖರತೆ ಹೆಚ್ಚುತ್ತದೆ.',
    hi: 'यह जोड़ने से सुझाव अधिक सटीक होंगे।',
  },
  allInfoGiven: {
    en: 'You gave all the information. Thank you!',
    kn: 'ನೀವು ಎಲ್ಲ ಮಾಹಿತಿ ನೀಡಿದ್ದೀರಿ. ಧನ್ಯವಾದಗಳು!',
    hi: 'आपने सारी जानकारी दे दी। धन्यवाद!',
  },
  resultsPrototypeNote: {
    en: 'In the full app, these 6 crops will be ranked by matching your answers with verified crop requirements, with reasons for each. In this prototype, suitability is not calculated yet.',
    kn: 'ಪೂರ್ಣ ಆ್ಯಪ್‌ನಲ್ಲಿ, ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿತ ಬೆಳೆ ಅಗತ್ಯಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ ಈ 6 ಬೆಳೆಗಳಿಗೆ ಕಾರಣಗಳೊಂದಿಗೆ ಕ್ರಮಾಂಕ ನೀಡಲಾಗುತ್ತದೆ. ಈ ಮಾದರಿಯಲ್ಲಿ ಸೂಕ್ತತೆಯನ್ನು ಇನ್ನೂ ಲೆಕ್ಕಹಾಕಲಾಗಿಲ್ಲ.',
    hi: 'पूरे ऐप में, आपके उत्तरों को सत्यापित फसल आवश्यकताओं से मिलाकर इन 6 फसलों को कारणों सहित क्रम दिया जाएगा। इस प्रोटोटाइप में उपयुक्तता की गणना अभी नहीं होती।',
  },
  supportedCropsNote: {
    en: 'Showing the 6 crops currently supported.',
    kn: 'ಪ್ರಸ್ತುತ ಬೆಂಬಲಿತ 6 ಬೆಳೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    hi: 'अभी समर्थित 6 फसलें दिखाई जा रही हैं।',
  },
  suitability: { en: 'Suitability', kn: 'ಸೂಕ್ತತೆ', hi: 'उपयुक्तता' },
  notCalculated: {
    en: 'Not calculated in prototype',
    kn: 'ಮಾದರಿಯಲ್ಲಿ ಲೆಕ್ಕಹಾಕಿಲ್ಲ',
    hi: 'प्रोटोटाइप में गणना नहीं',
  },
  whyRecommended: { en: 'Why?', kn: 'ಏಕೆ?', hi: 'क्यों?' },
  risks: { en: 'Risks', kn: 'ಅಪಾಯಗಳು', hi: 'जोखिम' },
  viewGuide: { en: 'View growing guide', kn: 'ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ', hi: 'खेती गाइड देखें' },
  labelVerified: { en: 'Verified', kn: 'ಪರಿಶೀಲಿತ', hi: 'सत्यापित' },
  labelEstimate: { en: 'Estimate', kn: 'ಅಂದಾಜು', hi: 'अनुमान' },
  labelPending: { en: 'Pending', kn: 'ಬಾಕಿ', hi: 'लंबित' },
  location: { en: 'Location', kn: 'ಸ್ಥಳ', hi: 'स्थान' },
  soilType: { en: 'Soil type', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ', hi: 'मिट्टी का प्रकार' },
  waterSource: { en: 'Water source', kn: 'ನೀರಿನ ಮೂಲ', hi: 'पानी का स्रोत' },
  soilTest: { en: 'Soil test', kn: 'ಮಣ್ಣು ಪರೀಕ್ಷೆ', hi: 'मिट्टी जाँच' },
  season: { en: 'Season', kn: 'ಋತು', hi: 'मौसम' },
  budget: { en: 'Budget', kn: 'ಬಜೆಟ್', hi: 'बजट' },
  soilTestTip: {
    en: 'Get your soil tested at the nearest soil testing lab or KVK.',
    kn: 'ಹತ್ತಿರದ ಮಣ್ಣು ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯ ಅಥವಾ KVK ಯಲ್ಲಿ ಮಣ್ಣು ಪರೀಕ್ಷಿಸಿ.',
    hi: 'नज़दीकी मिट्टी जाँच प्रयोगशाला या KVK में मिट्टी की जाँच कराएँ।',
  },

  // My crops
  myCropsTitle: { en: 'My Crops', kn: 'ನನ್ನ ಬೆಳೆಗಳು', hi: 'मेरी फसलें' },
  myCropsEmpty: {
    en: 'You are not tracking any crop yet. Open a crop in “Grow” and tap “Start growing this crop”.',
    kn: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆಯನ್ನು ಗಮನಿಸುತ್ತಿಲ್ಲ. “ಬೆಳೆಸಿ” ಯಲ್ಲಿ ಬೆಳೆಯನ್ನು ತೆರೆದು “ಈ ಬೆಳೆ ಬೆಳೆಯಲು ಪ್ರಾರಂಭಿಸಿ” ಒತ್ತಿರಿ.',
    hi: 'आप अभी किसी फसल पर नज़र नहीं रख रहे। “उगाएँ” में फसल खोलें और “यह फसल उगाना शुरू करें” दबाएँ।',
  },
  goToGrow: { en: 'Go to Grow', kn: 'ಬೆಳೆಸಿ ಗೆ ಹೋಗಿ', hi: 'उगाएँ पर जाएँ' },
  sowingDate: { en: 'Sowing date', kn: 'ಬಿತ್ತನೆ ದಿನಾಂಕ', hi: 'बुवाई की तारीख' },
  progress: { en: 'Progress', kn: 'ಪ್ರಗತಿ', hi: 'प्रगति' },
  stepsDone: { en: '{x} of {y} steps done', kn: '{y} ರಲ್ಲಿ {x} ಹಂತಗಳು ಮುಗಿದಿವೆ', hi: '{y} में से {x} चरण पूरे' },
  markDone: { en: 'Tap a step to mark it done', kn: 'ಮುಗಿದ ಹಂತವನ್ನು ಗುರುತಿಸಲು ಒತ್ತಿರಿ', hi: 'पूरा हुआ चरण चिह्नित करने के लिए दबाएँ' },
  openGuide: { en: 'Guide', kn: 'ಮಾರ್ಗದರ್ಶಿ', hi: 'गाइड' },
  removeCrop: { en: 'Remove this crop', kn: 'ಈ ಬೆಳೆಯನ್ನು ತೆಗೆದುಹಾಕಿ', hi: 'यह फसल हटाएँ' },
  confirmRemove: { en: 'Remove?', kn: 'ತೆಗೆದುಹಾಕುವುದೇ?', hi: 'हटाएँ?' },
  cancel: { en: 'Cancel', kn: 'ರದ್ದುಮಾಡಿ', hi: 'रद्द करें' },
  remindersSoon: {
    en: 'Activity reminders will be added soon.',
    kn: 'ಚಟುವಟಿಕೆ ಜ್ಞಾಪನೆಗಳನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸೇರಿಸಲಾಗುವುದು.',
    hi: 'गतिविधि रिमाइंडर जल्द जोड़े जाएँगे।',
  },
  started: { en: 'Started', kn: 'ಪ್ರಾರಂಭ', hi: 'शुरू' },

  // Settings
  settingsTitle: { en: 'Settings', kn: 'ಸೆಟ್ಟಿಂಗ್ಸ್', hi: 'सेटिंग्स' },
  language: { en: 'Language', kn: 'ಭಾಷೆ', hi: 'भाषा' },
  about: { en: 'About this app', kn: 'ಈ ಆ್ಯಪ್ ಬಗ್ಗೆ', hi: 'इस ऐप के बारे में' },
  version: { en: 'Version', kn: 'ಆವೃತ್ತಿ', hi: 'संस्करण' },
  translationDraft: {
    en: 'Kannada and Hindi text in this prototype are draft translations.',
    kn: 'ಈ ಮಾದರಿಯಲ್ಲಿನ ಕನ್ನಡ ಮತ್ತು ಹಿಂದಿ ಪಠ್ಯ ಕರಡು ಅನುವಾದಗಳು.',
    hi: 'इस प्रोटोटाइप में कन्नड़ और हिंदी पाठ मसौदा अनुवाद हैं।',
  },
} satisfies Record<string, LText>;

export type StringKey = keyof typeof strings;
