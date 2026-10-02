export type SupportedLanguage = 'en' | 'ar' | 'fr';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  playSolo: string;
  playLocal: string;
  playOnline: string;
  rulesAndGuide: string;
  settings: string;
  resumeGame: string;
  saveSlots: string;
  exportSave: string;
  importSave: string;
  language: string;
  boardTheme: string;
  soundVolume: string;
  musicVolume: string;
  muteAll: string;
  haptics: string;
  tilt3d: string;
  easy: string;
  normal: string;
  hard: string;
  rollDice: string;
  buyProperty: string;
  auctionProperty: string;
  endTurn: string;
  payBail: string;
  usePardon: string;
  inDetention: string;
  bankrupt: string;
  cash: string;
  netWorth: string;
  properties: string;
  manageAssets: string;
  mortgage: string;
  unmortgage: string;
  buildVilla: string;
  sellVilla: string;
  trade: string;
  proposeTrade: string;
  accept: string;
  reject: string;
  bid: string;
  pass: string;
  currentBid: string;
  highestBidder: string;
  timeRemaining: string;
  winnerTitle: string;
  backToMenu: string;
  playAgain: string;
  close: string;
  hostRoom: string;
  joinRoom: string;
  roomCode: string;
  ready: string;
  startGame: string;
  players: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'Empire City',
    tagline: 'High-Stakes Municipal Real Estate Strategy',
    playSolo: 'Solo vs Bots',
    playLocal: 'Local Wi-Fi / Hotspot',
    playOnline: 'Online Multiplayer',
    rulesAndGuide: 'Official Rulebook',
    settings: 'Settings & Audio',
    resumeGame: 'Resume Session',
    saveSlots: 'Save Slots',
    exportSave: 'Export Save (JSON)',
    importSave: 'Import Save',
    language: 'Language',
    boardTheme: 'Board Theme',
    soundVolume: 'SFX Volume',
    musicVolume: 'Music Volume',
    muteAll: 'Mute Audio',
    haptics: 'Haptic Feedback',
    tilt3d: '3D Perspective Tilt',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    rollDice: 'Roll Dice',
    buyProperty: 'Acquire Deed',
    auctionProperty: 'Send to Auction',
    endTurn: 'End Turn',
    payBail: 'Post $50 Bail',
    usePardon: 'Use Pardon Pass',
    inDetention: 'In City Detention',
    bankrupt: 'Bankrupt',
    cash: 'Liquid Cash',
    netWorth: 'Net Worth',
    properties: 'Deeds Owned',
    manageAssets: 'Manage Holdings',
    mortgage: 'Mortgage Deed',
    unmortgage: 'Lift Mortgage',
    buildVilla: 'Construct Villa',
    sellVilla: 'Dismantle Building',
    trade: 'Negotiate Trade',
    proposeTrade: 'Propose Contract',
    accept: 'Accept Deal',
    reject: 'Decline Deal',
    bid: 'Place Bid',
    pass: 'Pass',
    currentBid: 'Current High Bid',
    highestBidder: 'Leading Bidder',
    timeRemaining: 'Seconds Remaining',
    winnerTitle: 'Grand Chancellor of Empire City',
    backToMenu: 'Main Menu',
    playAgain: 'Play Again',
    close: 'Close',
    hostRoom: 'Host Room',
    joinRoom: 'Join Room',
    roomCode: 'Room Code',
    ready: 'Ready',
    startGame: 'Launch Game',
    players: 'Developers',
  },
  ar: {
    appName: 'مدينة الإمبراطورية',
    tagline: 'استراتيجية تجارة العقارات والبلديات الكبرى',
    playSolo: 'لعب فردي ضد الذكاء الاصطناعي',
    playLocal: 'شبكة واي فاي محلية / نقطة اتصال',
    playOnline: 'لعب جماعي عبر الإنترنت',
    rulesAndGuide: 'دليل القواعد الرسمية',
    settings: 'الإعدادات والصوت',
    resumeGame: 'استئناف اللعبة',
    saveSlots: 'خانة الحفظ',
    exportSave: 'تصدير الحفظ (JSON)',
    importSave: 'استيراد ملف حفظ',
    language: 'اللغة',
    boardTheme: 'طابع لوحة اللعب',
    soundVolume: 'صوت المؤثرات',
    musicVolume: 'صوت الموسيقى',
    muteAll: 'كتم جميع الأصوات',
    haptics: 'الاهتزاز اللمسي',
    tilt3d: 'منظور مائل ثلاثي الأبعاد',
    easy: 'سهل',
    normal: 'متوسط',
    hard: 'خبير',
    rollDice: 'رمي النرد',
    buyProperty: 'شراء العقار',
    auctionProperty: 'تحويل للمزاد العلني',
    endTurn: 'إنهاء الدور',
    payBail: 'دفع غرامة الكفالة (50$)',
    usePardon: 'استخدام تصريح العفو',
    inDetention: 'في حجز المدينة',
    bankrupt: 'مفلس',
    cash: 'السيولة النقدية',
    netWorth: 'صافي الثروة',
    properties: 'العقارات المملوكة',
    manageAssets: 'إدارة الممتلكات',
    mortgage: 'رهن العقار',
    unmortgage: 'فك الرهن',
    buildVilla: 'بناء فيلا بيئية',
    sellVilla: 'تفكيك مبنى',
    trade: 'التفاوض والتبادل',
    proposeTrade: 'تقديم عرض',
    accept: 'قبول العقد',
    reject: 'رفض العقد',
    bid: 'تقديم مزايدة',
    pass: 'انسحاب',
    currentBid: 'أعلى مزايدة حالية',
    highestBidder: 'المزايد الرائد',
    timeRemaining: 'الوقت المتبقي',
    winnerTitle: 'المستشار الأكبر لإمبراطورية المدينة',
    backToMenu: 'القائمة الرئيسية',
    playAgain: 'لعبة جديدة',
    close: 'إغلاق',
    hostRoom: 'إنشاء غرفة',
    joinRoom: 'انضمام إلى غرفة',
    roomCode: 'رمز الغرفة',
    ready: 'جاهز',
    startGame: 'بدء اللعبة',
    players: 'المطورون',
  },
  fr: {
    appName: 'Empire City',
    tagline: 'Stratégie Immobilière Municipale de Haut Vol',
    playSolo: 'Solo contre Bots',
    playLocal: 'Wi-Fi Local / Point d’Accès',
    playOnline: 'Multijoueur en Ligne',
    rulesAndGuide: 'Règles Officielles',
    settings: 'Paramètres & Audio',
    resumeGame: 'Reprendre la Session',
    saveSlots: 'Emplacements de Sauvegarde',
    exportSave: 'Exporter la Sauvegarde (JSON)',
    importSave: 'Importer une Sauvegarde',
    language: 'Langue',
    boardTheme: 'Thème du Plateau',
    soundVolume: 'Volume Effets',
    musicVolume: 'Volume Musique',
    muteAll: 'Couper le Son',
    haptics: 'Retour Haptique',
    tilt3d: 'Perspective 3D Inclinée',
    easy: 'Facile',
    normal: 'Normal',
    hard: 'Difficile',
    rollDice: 'Lancer les Dés',
    buyProperty: 'Acquérir le Titre',
    auctionProperty: 'Mettre aux Enchères',
    endTurn: 'Fin du Tour',
    payBail: 'Payer 50$ de Caution',
    usePardon: 'Utiliser un Passe de Grâce',
    inDetention: 'En Détention Municipale',
    bankrupt: 'Faillite',
    cash: 'Liquidités',
    netWorth: 'Valeur Nette',
    properties: 'Titres Possédés',
    manageAssets: 'Gérer le Patrimoine',
    mortgage: 'Hypothéquer',
    unmortgage: 'Lever l’Hypothèque',
    buildVilla: 'Construire une Villa',
    sellVilla: 'Démanteler un Bâtiment',
    trade: 'Négocier un Échange',
    proposeTrade: 'Proposer un Contrat',
    accept: 'Accepter l’Accord',
    reject: 'Décliner l’Accord',
    bid: 'Enchérir',
    pass: 'Passer',
    currentBid: 'Enchère Actuelle',
    highestBidder: 'Meilleur Enchérisseur',
    timeRemaining: 'Secondes Restantes',
    winnerTitle: 'Grand Chancelier d’Empire City',
    backToMenu: 'Menu Principal',
    playAgain: 'Rejouer',
    close: 'Fermer',
    hostRoom: 'Créer un Salon',
    joinRoom: 'Rejoindre un Salon',
    roomCode: 'Code du Salon',
    ready: 'Prêt',
    startGame: 'Lancer la Partie',
    players: 'Promoteurs',
  },
};
