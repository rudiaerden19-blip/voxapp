// ============================================
// MODULE SYSTEM - Branche-specifieke features
// ============================================

export type ModuleId = 
  | 'appointments'    // Afspraken/Agenda
  | 'menu'            // Menu/Producten
  | 'orders'          // Bestellingen
  | 'reservations'    // Reserveringen (tafels/kamers)
  | 'services'        // Diensten met duur/prijs
  | 'staff'           // Medewerkers
  | 'workorders'      // Werkorders/taken
  | 'members'         // Lidmaatschappen
  | 'properties'      // Vastgoed/panden
  | 'patients'        // Patiëntendossiers
  | 'vehicles';       // Voertuigen

export interface Module {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  navItem: {
    href: string;
    label: string;
    icon: string;
  };
}

// Veld configuratie per module
export interface ModuleFieldConfig {
  // Menu/Products module
  menu?: {
    showDuration?: boolean;        // Toon duur veld
    showCategory?: boolean;        // Toon categorie
    showDescription?: boolean;     // Toon beschrijving
    showOptions?: boolean;         // Toon opties (sauzen, extra's)
    defaultCategories?: string[];  // Standaard categorieën
    namePlaceholder?: string;      // Placeholder voor naam
    categoryPlaceholder?: string;  // Placeholder voor categorie
  };
  // Services module
  services?: {
    showDuration?: boolean;
    showPrice?: boolean;
    showStaffLink?: boolean;       // Koppel aan medewerker
    defaultDurations?: number[];   // Standaard duraties in minuten
    namePlaceholder?: string;
  };
  // Appointments module
  appointments?: {
    defaultSlotsPerHour?: number;
    defaultStartHour?: number;
    defaultEndHour?: number;
    showService?: boolean;         // Toon dienst keuze
    showStaff?: boolean;           // Toon medewerker keuze
    showNotes?: boolean;           // Toon notities
  };
  // Staff module
  staff?: {
    showEmail?: boolean;
    showPhone?: boolean;
    showSpecialization?: boolean;  // Specialisatie (dokter, kapper)
    showSchedule?: boolean;        // Werkrooster
    specializationLabel?: string;  // "Specialisatie", "Functie", etc.
  };
  // Patients module
  patients?: {
    showBirthdate?: boolean;
    showInsurance?: boolean;       // Zorgverzekering
    showAllergies?: boolean;
    showMedicalHistory?: boolean;
  };
  // Vehicles module
  vehicles?: {
    showLicensePlate?: boolean;
    showMileage?: boolean;
    showLastService?: boolean;
  };
  // Workorders module
  workorders?: {
    showVehicle?: boolean;         // Link naar voertuig
    showParts?: boolean;           // Onderdelen
    showLabor?: boolean;           // Arbeid/uren
  };
}

export interface BusinessTypeConfig {
  id: string;
  name: string;
  icon: string;
  category: 'horeca' | 'zorg' | 'beauty' | 'diensten' | 'retail' | 'vastgoed' | 'overig';
  modules: ModuleId[];
  aiContext: string;  // Extra context voor AI assistent
  terminology: {
    product?: string;      // "product", "gerecht", "behandeling"
    products?: string;     // meervoud
    appointment?: string;  // "afspraak", "reservering", "consult"
    customer?: string;     // "klant", "patiënt", "gast"
  };
  // Module-specifieke veld configuratie
  fieldConfig?: ModuleFieldConfig;
}

// Alle beschikbare modules
export const MODULES: Record<ModuleId, Module> = {
  appointments: {
    id: 'appointments',
    name: 'Afspraken',
    description: 'Agenda en afsprakenbeheer',
    icon: '📅',
    navItem: { href: '/dashboard/appointments', label: 'Afspraken', icon: 'Calendar' },
  },
  menu: {
    id: 'menu',
    name: 'Menu',
    description: 'Producten en prijzen',
    icon: '🍕',
    navItem: { href: '/dashboard/producten', label: 'Menu', icon: 'UtensilsCrossed' },
  },
  orders: {
    id: 'orders',
    name: 'Bestellingen',
    description: 'Inkomende bestellingen',
    icon: '📦',
    navItem: { href: '/dashboard/orders', label: 'Bestellingen', icon: 'ShoppingBag' },
  },
  reservations: {
    id: 'reservations',
    name: 'Reserveringen',
    description: 'Tafel- of kamerreserveringen',
    icon: '🪑',
    navItem: { href: '/dashboard/reservations', label: 'Reserveringen', icon: 'CalendarCheck' },
  },
  services: {
    id: 'services',
    name: 'Diensten',
    description: 'Diensten met duur en prijs',
    icon: '💇',
    navItem: { href: '/dashboard/services', label: 'Diensten', icon: 'Scissors' },
  },
  staff: {
    id: 'staff',
    name: 'Medewerkers',
    description: 'Team en planning',
    icon: '👥',
    navItem: { href: '/dashboard/staff', label: 'Team', icon: 'Users' },
  },
  workorders: {
    id: 'workorders',
    name: 'Werkorders',
    description: 'Taken en werkbonnen',
    icon: '🔧',
    navItem: { href: '/dashboard/workorders', label: 'Werkorders', icon: 'Wrench' },
  },
  members: {
    id: 'members',
    name: 'Leden',
    description: 'Lidmaatschappen en abonnementen',
    icon: '💳',
    navItem: { href: '/dashboard/members', label: 'Leden', icon: 'CreditCard' },
  },
  properties: {
    id: 'properties',
    name: 'Panden',
    description: 'Vastgoed en bezichtigingen',
    icon: '🏠',
    navItem: { href: '/dashboard/properties', label: 'Panden', icon: 'Home' },
  },
  patients: {
    id: 'patients',
    name: 'Patiënten',
    description: 'Patiëntendossiers',
    icon: '📋',
    navItem: { href: '/dashboard/patients', label: 'Patiënten', icon: 'FileText' },
  },
  vehicles: {
    id: 'vehicles',
    name: 'Voertuigen',
    description: 'Voertuigregistratie',
    icon: '🚗',
    navItem: { href: '/dashboard/vehicles', label: 'Voertuigen', icon: 'Car' },
  },
};

// Configuratie per business type
export const BUSINESS_TYPES: Record<string, BusinessTypeConfig> = {
  // ========== HORECA ==========
  frituur: {
    id: 'frituur',
    name: 'Frituur',
    icon: '🍟',
    category: 'horeca',
    modules: ['menu', 'orders'],
    aiContext: 'Je bent een vriendelijke medewerker van een Belgische frituur. Je kent alle snacks, frietjes en sauzen. Typische producten: frikandel, bicky burger, stoofvleeskroket, curryworst. Sauzen zijn vaak inbegrepen of extra.',
    terminology: { product: 'snack', products: 'snacks', customer: 'klant' },
  },
  pizzeria: {
    id: 'pizzeria',
    name: "Pizzeria",
    icon: '🍕',
    category: 'horeca',
    modules: ['menu', 'orders', 'reservations'],
    aiContext: "Je werkt bij een pizzeria. Je kent alle pizza's, pasta's en bijgerechten. Vraag naar formaat (klein/medium/groot) en extra toppings.",
    terminology: { product: 'gerecht', products: 'gerechten', customer: 'klant' },
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    category: 'horeca',
    modules: ['menu', 'orders', 'reservations', 'staff'],
    aiContext: 'Je bent gastvrouw/gastheer van een restaurant. Je kan tafels reserveren, het menu uitleggen en dieetwensen noteren. Vraag altijd naar allergieën.',
    terminology: { product: 'gerecht', products: 'gerechten', customer: 'gast', appointment: 'reservering' },
  },
  kebab: {
    id: 'kebab',
    name: 'Kebabzaak',
    icon: '🥙',
    category: 'horeca',
    modules: ['menu', 'orders'],
    aiContext: 'Je werkt bij een kebabzaak. Typische producten: durum, pita, schotel, lahmacun. Vraag naar vlees (kip/rund/mix), saus en groenten.',
    terminology: { product: 'gerecht', products: 'gerechten', customer: 'klant' },
  },
  hotel: {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    category: 'horeca',
    modules: ['reservations', 'staff'],
    aiContext: 'Je bent receptionist van een hotel. Je helpt met kamerreserveringen, check-in/out tijden, en faciliteiten. Vraag naar aankomst/vertrekdatum en aantal personen.',
    terminology: { customer: 'gast', appointment: 'reservering' },
  },

  // ========== BEAUTY & WELLNESS ==========
  kapper: {
    id: 'kapper',
    name: 'Kapsalon',
    icon: '💇',
    category: 'beauty',
    modules: ['appointments', 'services', 'staff'],
    aiContext: 'Je bent receptionist van een kapsalon. Je plant afspraken voor knippen, kleuren, föhnen, etc. Vraag wie de voorkeur kapper is en wat voor behandeling.',
    terminology: { product: 'behandeling', products: 'behandelingen', appointment: 'afspraak', customer: 'klant' },
  },
  beautysalon: {
    id: 'beautysalon',
    name: 'Beautysalon',
    icon: '💅',
    category: 'beauty',
    modules: ['appointments', 'services', 'staff'],
    aiContext: 'Je werkt bij een beautysalon. Behandelingen: manicure, pedicure, gezichtsbehandeling, waxen, wimperextensions. Vraag naar gewenste behandeling en eventuele allergieën.',
    terminology: { product: 'behandeling', products: 'behandelingen', appointment: 'afspraak', customer: 'klant' },
  },
  fitness: {
    id: 'fitness',
    name: 'Fitnessstudio',
    icon: '🏋️',
    category: 'beauty',
    modules: ['members', 'appointments', 'staff'],
    aiContext: 'Je werkt bij een fitnessstudio. Je helpt met lidmaatschappen, proeftrainingen, en groepslessen. Vraag naar fitnessdoelen en ervaring.',
    terminology: { appointment: 'afspraak', customer: 'lid' },
  },

  // ========== ZORG ==========
  ziekenhuis: {
    id: 'ziekenhuis',
    name: 'Ziekenhuis',
    icon: '🏥',
    category: 'zorg',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke en behulpzame receptionist van een ziekenhuis. Wees warm en professioneel. Bij afspraken vraag je: naam, telefoonnummer, gewenste datum/tijd, en reden van bezoek. Bij vragen over adres/locatie: geef het echte adres. Bij vragen over openingsuren: geef de echte tijden. Bij verzetten: "Ja natuurlijk, mag ik uw naam en telefoonnummer?" Als iets complex is: "Ik verbind u door met een collega."',
    terminology: { product: 'onderzoek', products: 'onderzoeken', appointment: 'afspraak', customer: 'patiënt' },
  },
  tandarts: {
    id: 'tandarts',
    name: 'Tandarts',
    icon: '🦷',
    category: 'zorg',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke receptionist van een tandartspraktijk. Wees warm en behulpzaam. Bij afspraken vraag je: naam, telefoonnummer, gewenste datum/tijd. Bij vragen over adres: geef het echte adres. Bij openingsuren: geef de echte tijden. Bij verzetten: "Ja hoor, mag ik uw naam en telefoonnummer?" Bij tandpijn: toon begrip en probeer snel een afspraak te regelen.',
    terminology: { product: 'behandeling', products: 'behandelingen', appointment: 'afspraak', customer: 'patiënt' },
  },
  dokter: {
    id: 'dokter',
    name: 'Dokterspraktijk',
    icon: '👨‍⚕️',
    category: 'zorg',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke en behulpzame receptionist van een dokterspraktijk. Wees warm en professioneel. Bij afspraken vraag je: naam, telefoonnummer, gewenste datum/tijd, en reden van bezoek. Bij vragen over adres/locatie: geef het echte adres van de praktijk. Bij vragen over openingsuren: geef de echte openingstijden. Bij het verzetten van afspraken: zeg "Ja natuurlijk, mag ik uw naam en telefoonnummer?" Als iets te complex is: "Ik verbind u door met een collega die u verder kan helpen."',
    terminology: { appointment: 'consult', customer: 'patiënt' },
  },
  opticien: {
    id: 'opticien',
    name: 'Opticien',
    icon: '👓',
    category: 'zorg',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke medewerker van een opticien. Wees behulpzaam en deskundig. Bij afspraken voor oogmeting vraag je: naam, telefoonnummer, gewenste datum/tijd. Bij vragen over adres: geef het echte adres. Bij openingsuren: geef de echte tijden. Help actief met vragen over brillen, lenzen en oogmetingen.',
    terminology: { product: 'product', products: 'producten', appointment: 'afspraak', customer: 'klant' },
  },
  dierenkliniek: {
    id: 'dierenkliniek',
    name: 'Dierenkliniek',
    icon: '🐕',
    category: 'zorg',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een warme en dierenvriendelijke receptionist van een dierenkliniek. Help baasjes actief. Bij afspraken vraag je: naam baasje, naam en soort dier, telefoonnummer, gewenste datum/tijd, klacht of reden. Geef het echte adres en openingstijden. Bij spoed: toon begrip en plan direct in. Je handelt alles zelf af.',
    terminology: { appointment: 'afspraak', customer: 'baasje' },
  },

  // ========== DIENSTEN ==========
  garage: {
    id: 'garage',
    name: 'Garage',
    icon: '🚗',
    category: 'diensten',
    modules: ['appointments', 'workorders', 'vehicles'],
    aiContext: 'Je werkt bij een autogarage. Je plant afspraken voor onderhoud, APK/keuring, reparaties. Vraag naar merk, model en kilometerstand. Vraag of ze een vervangwagen nodig hebben.',
    terminology: { appointment: 'afspraak', customer: 'klant' },
  },
  loodgieter: {
    id: 'loodgieter',
    name: 'Loodgieter',
    icon: '🔧',
    category: 'diensten',
    modules: ['appointments', 'workorders'],
    aiContext: 'Je bent een behulpzame receptionist van een loodgietersbedrijf. Bij problemen toon begrip en handel snel. Vraag: naam, adres waar we moeten komen, telefoonnummer, beschrijving van het probleem, wanneer we kunnen langskomen. Bij spoed (waterlek, gaslek): prioriteit geven en snel inplannen. Geef echte bedrijfsinfo. Je regelt alles zelf.',
    terminology: { appointment: 'afspraak', customer: 'klant' },
  },
  schoonmaak: {
    id: 'schoonmaak',
    name: 'Schoonmaakbedrijf',
    icon: '🧹',
    category: 'diensten',
    modules: ['appointments', 'workorders'],
    aiContext: 'Je werkt bij een schoonmaakbedrijf. Vraag naar type pand (woning/kantoor), grootte, en gewenste frequentie. Plan een vrijblijvende offerte-afspraak.',
    terminology: { appointment: 'afspraak', customer: 'klant' },
  },
  advocaat: {
    id: 'advocaat',
    name: 'Advocatenkantoor',
    icon: '⚖️',
    category: 'diensten',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een professionele en discrete receptionist van een advocatenkantoor. Wees kalm en behulpzaam. Bij afspraken vraag je: naam, telefoonnummer, kort waar het over gaat (zonder details te eisen), gewenste datum/tijd. Geef het echte adres en kantooruren. Je handelt alles zelf af en bent discreet over de aard van zaken.',
    terminology: { appointment: 'consult', customer: 'cliënt' },
  },
  boekhouder: {
    id: 'boekhouder',
    name: 'Boekhoudkantoor',
    icon: '📊',
    category: 'diensten',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke receptionist van een boekhoudkantoor. Wees behulpzaam en professioneel. Bij afspraken vraag je: naam, bedrijfsnaam indien van toepassing, telefoonnummer, waar u hulp bij nodig heeft, gewenste datum/tijd. Geef het echte adres en kantooruren. Je handelt alles zelf af. Ken de diensten: belastingaangifte, BTW, boekhouding, jaarrekening.',
    terminology: { appointment: 'afspraak', customer: 'klant' },
  },

  // ========== RETAIL ==========
  bloemenwinkel: {
    id: 'bloemenwinkel',
    name: 'Bloemenwinkel',
    icon: '💐',
    category: 'retail',
    modules: ['menu', 'orders'],
    aiContext: 'Je werkt bij een bloemenwinkel. Je helpt met boeketten, planten, en bezorging. Vraag naar gelegenheid (verjaardag, rouw, huwelijk), budget, en bezorgadres.',
    terminology: { product: 'product', products: 'producten', customer: 'klant' },
  },

  // ========== VASTGOED ==========
  immo: {
    id: 'immo',
    name: 'Immobiliënkantoor',
    icon: '🏠',
    category: 'vastgoed',
    modules: ['appointments', 'properties', 'staff'],
    aiContext: 'Je bent receptionist van een immobiliënkantoor. Je plant bezichtigingen en beantwoordt vragen over panden. Vraag naar koop of huur, budget, en gewenste regio.',
    terminology: { appointment: 'bezichtiging', customer: 'klant' },
  },

  // ========== OVERIG ==========
  other: {
    id: 'other',
    name: 'Overig',
    icon: '🏢',
    category: 'overig',
    modules: ['appointments', 'staff'],
    aiContext: 'Je bent een vriendelijke receptionist. Je helpt klanten met afspraken en algemene vragen over het bedrijf.',
    terminology: { product: 'product', products: 'producten', appointment: 'afspraak', customer: 'klant' },
  },
};

// Helper functies
export function getBusinessType(typeId: string): BusinessTypeConfig {
  return BUSINESS_TYPES[typeId] || BUSINESS_TYPES.other;
}

export function getActiveModules(typeId: string): Module[] {
  const businessType = getBusinessType(typeId);
  return businessType.modules.map(moduleId => MODULES[moduleId]);
}

export function hasModule(typeId: string, moduleId: ModuleId): boolean {
  const businessType = getBusinessType(typeId);
  return businessType.modules.includes(moduleId);
}

export function getTerminology(typeId: string): BusinessTypeConfig['terminology'] {
  return getBusinessType(typeId).terminology;
}

export function getAIContext(typeId: string): string {
  return getBusinessType(typeId).aiContext;
}

// Alle business types gegroepeerd per categorie
export function getBusinessTypesByCategory(): Record<string, BusinessTypeConfig[]> {
  const grouped: Record<string, BusinessTypeConfig[]> = {};
  
  Object.values(BUSINESS_TYPES).forEach(bt => {
    if (!grouped[bt.category]) grouped[bt.category] = [];
    grouped[bt.category].push(bt);
  });
  
  return grouped;
}

export const CATEGORY_NAMES: Record<string, string> = {
  horeca: 'Horeca',
  zorg: 'Zorg & Medisch',
  beauty: 'Beauty & Wellness',
  diensten: 'Dienstverlening',
  retail: 'Retail',
  vastgoed: 'Vastgoed',
  overig: 'Overig',
};

// Genereer AI template op basis van business type
export function getBrancheTemplate(businessType: string, businessName: string): { greeting: string; capabilities: string; style: string } {
  const config = getBusinessType(businessType);
  const term = config.terminology;
  
  // Genereer greeting op basis van type
  let greeting = `Goedendag, ${config.name.toLowerCase()} ${businessName}. Waarmee kan ik u helpen?`;
  
  // Specifieke greetings per categorie
  if (config.category === 'horeca') {
    greeting = `Hallo, welkom bij ${businessName}. Wilt u iets bestellen of heeft u een vraag?`;
  } else if (config.category === 'zorg') {
    greeting = `Goedendag, ${config.name.toLowerCase()} ${businessName}. Waarmee kan ik u van dienst zijn?`;
  } else if (config.category === 'beauty') {
    greeting = `Hallo, welkom bij ${businessName}. Wilt u een ${term.appointment || 'afspraak'} maken?`;
  }
  
  // Capabilities op basis van actieve modules
  const capabilities: string[] = [];
  if (hasModule(businessType, 'appointments')) capabilities.push(`Ik plan ${term.appointment || 'afspraken'}`);
  if (hasModule(businessType, 'menu')) capabilities.push(`Ik ken ons menu en prijzen`);
  if (hasModule(businessType, 'orders')) capabilities.push(`Ik neem bestellingen aan`);
  if (hasModule(businessType, 'reservations')) capabilities.push(`Ik maak reserveringen`);
  if (hasModule(businessType, 'services')) capabilities.push(`Ik ken onze ${term.products || 'diensten'} en tarieven`);
  
  const capabilitiesText = capabilities.length > 0 
    ? capabilities.join('. ') + '.'
    : 'Ik help met vragen en verwijs door waar nodig.';
  
  return {
    greeting,
    capabilities: capabilitiesText,
    style: config.aiContext,
  };
}

// FAQ templates per business type
export function getFAQTemplate(businessType: string): Array<{ question: string; answer: string }> {
  const typeId = businessType.toLowerCase();
  
  // ===========================================
  // MEDISCHE PRAKTIJKEN (DOKTER, ZIEKENHUIS)
  // 150+ FAQs voor complete dekking
  // ===========================================
  if (typeId === 'dokter' || typeId === 'ziekenhuis') {
    return [
      // ===== CONTACT & LOCATIE =====
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren. Een moment.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons volledige adres zodat u ons gemakkelijk kunt vinden.' },
      { question: 'Wat is het telefoonnummer?', answer: 'U spreekt met ons telefoonnummer. Kan ik u verder helpen?' },
      { question: 'Hebben jullie een e-mailadres?', answer: 'Ja, voor niet-dringende vragen kunt u ons mailen. Ik geef u het adres.' },
      { question: 'Zijn jullie vandaag open?', answer: 'Ja, wij zijn vandaag geopend. Kan ik een afspraak voor u maken?' },
      { question: 'Zijn jullie op zaterdag open?', answer: 'Op zaterdag hebben we beperkte openingsuren. Wilt u een afspraak?' },
      { question: 'Zijn jullie op zondag open?', answer: 'Zondag zijn we gesloten. Bij spoed kunt u de huisartsenpost bellen.' },
      { question: 'Zijn jullie op feestdagen open?', answer: 'Op feestdagen zijn we gesloten. Bij spoed: huisartsenpost of 112.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid voor patiënten in de buurt.' },
      { question: 'Moet ik betalen voor parkeren?', answer: 'Ik informeer u over de parkeermogelijkheden bij ons.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja, onze praktijk is volledig rolstoeltoegankelijk.' },
      { question: 'Is er een lift?', answer: 'Ja, onze praktijk is toegankelijk voor minder mobiele patiënten.' },
      { question: 'Kan ik met de bus komen?', answer: 'Ja, er is een bushalte op loopafstand. Wilt u de details?' },
      { question: 'Hoe kom ik bij jullie?', answer: 'Ik geef u graag de routebeschrijving. Komt u met auto of OV?' },
      
      // ===== AFSPRAKEN MAKEN =====
      { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk, dat regel ik graag voor u. Mag ik uw naam?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'U bent aan het juiste adres! Mag ik uw naam om een afspraak te maken?' },
      { question: 'Kan ik vandaag nog terecht?', answer: 'Voor dringende zaken proberen we u vandaag te helpen. Wat zijn uw klachten?' },
      { question: 'Kan ik morgen een afspraak krijgen?', answer: 'Ik kijk of er morgen plek is. Heeft u voorkeur voor een tijdstip?' },
      { question: 'Kan ik online een afspraak maken?', answer: 'Ja, via onze website. Maar ik kan het ook nu direct regelen.' },
      { question: 'Kan ik een spoedafspraak krijgen?', answer: 'Wat zijn uw klachten? Dan bekijk ik of u vandaag terecht kunt.' },
      { question: 'Hoe lang duurt een consult?', answer: 'Een standaard consult duurt 15-20 minuten.' },
      { question: 'Kan ik een langere afspraak maken?', answer: 'Ja, bij meerdere klachten kan ik een dubbel consult inplannen.' },
      { question: 'Kan ik een afspraak maken voor mijn kind?', answer: 'Ja, kinderen zijn welkom. Komt u zelf mee als ouder?' },
      { question: 'Kan ik een afspraak maken voor mijn partner?', answer: 'Ja, met toestemming van uw partner. Mag ik de naam?' },
      { question: 'Bij welke dokter kan ik terecht?', answer: 'Ik kijk welke arts beschikbaar is. Heeft u een voorkeur?' },
      { question: 'Werken jullie op afspraak?', answer: 'Ja, wij werken alleen op afspraak. Zal ik er een maken?' },
      { question: 'Wat als ik te laat kom?', answer: 'Bel ons even, we bekijken of het consult nog door kan gaan.' },
      { question: 'Hoe lang van tevoren moet ik bellen?', answer: 'Voor niet-dringende zaken adviseren we enkele dagen vooruit.' },
      
      // ===== AFSPRAKEN WIJZIGEN =====
      { question: 'Ik wil mijn afspraak verzetten', answer: 'Geen probleem. Mag ik uw naam en het huidige tijdstip?' },
      { question: 'Hoe verzet ik mijn afspraak?', answer: 'Dat regel ik voor u. Wanneer zou u willen komen?' },
      { question: 'Ik moet mijn afspraak annuleren', answer: 'Dat is jammer. Mag ik uw naam? Wilt u een nieuwe afspraak?' },
      { question: 'Kan ik mijn afspraak verplaatsen naar volgende week?', answer: 'Ik kijk wat er beschikbaar is. Welke dag heeft uw voorkeur?' },
      { question: 'Zijn er kosten voor annuleren?', answer: 'Bij annulering binnen 24 uur kunnen kosten in rekening worden gebracht.' },
      { question: 'Krijg ik een herinnering?', answer: 'Ja, u ontvangt een sms of e-mail herinnering voor uw afspraak.' },
      { question: 'Ik heb geen bevestiging ontvangen', answer: 'Ik check uw afspraak en stuur opnieuw een bevestiging.' },
      
      // ===== SPOED & NOODGEVALLEN =====
      { question: 'Het is dringend', answer: 'Ik help u direct. Kunt u kort beschrijven wat er aan de hand is?' },
      { question: 'Ik heb nu een dokter nodig', answer: 'Wat zijn uw klachten? Ik bekijk of u direct terecht kunt.' },
      { question: 'Wat doe ik bij spoed?', answer: 'Bij levensbedreigende situaties bel 112. Anders help ik u nu.' },
      { question: 'Wanneer moet ik 112 bellen?', answer: 'Bij bewusteloosheid, hartklachten, ernstige ademnood, zware bloedingen.' },
      { question: 'Mijn kind is ziek', answer: 'Ik begrijp uw bezorgdheid. Wat zijn de klachten? Heeft het koorts?' },
      { question: 'Ik heb hoge koorts', answer: 'Hoe hoog is de koorts en hoelang heeft u dit al? Ik kijk of u vandaag kunt komen.' },
      { question: 'Wat is het nummer van de huisartsenpost?', answer: 'Ik geef u het nummer van de huisartsenpost voor buiten kantooruren.' },
      { question: 'Zijn jullie nu gesloten?', answer: 'Als we gesloten zijn, kunt u de huisartsenpost bellen voor spoed.' },
      
      // ===== HUISBEZOEK =====
      { question: 'Kan de dokter bij mij thuis komen?', answer: 'Voor patiënten die niet kunnen komen doen we huisbezoeken. Wat is de situatie?' },
      { question: 'Hoe vraag ik een huisbezoek aan?', answer: 'Bel voor 10 uur voor een huisbezoek dezelfde dag. Wat is de reden?' },
      { question: 'Wanneer komt de dokter bij huisbezoek?', answer: 'Meestal in de ochtend of vroege middag. We bellen vooraf.' },
      { question: 'Mijn moeder kan niet komen', answer: 'Ik noteer een huisbezoek. Wat is het adres en wat zijn de klachten?' },
      
      // ===== VIDEOCONSULT =====
      { question: 'Kan ik videoconsult doen?', answer: 'Ja, voor sommige klachten bieden we videoconsulten. Wat is uw vraag?' },
      { question: 'Hoe werkt videoconsult?', answer: 'U ontvangt een link per mail en belt via computer of telefoon.' },
      { question: 'Ik wil liever beeldbellen', answer: 'Dat kan! Ik plan een videoconsult in. Wanneer past het u?' },
      
      // ===== RECEPTEN & MEDICATIE =====
      { question: 'Ik heb een herhaalrecept nodig', answer: 'Welk medicijn heeft u nodig? Ik regel het recept.' },
      { question: 'Mijn medicijnen zijn op', answer: 'Ik maak een herhaalrecept aan. Welk medicijn en naar welke apotheek?' },
      { question: 'Hoe vraag ik een recept aan?', answer: 'Dat kan telefonisch. Welk medicijn heeft u nodig?' },
      { question: 'Hoe lang duurt het voor mijn recept klaar is?', answer: 'Herhaalrecepten zijn binnen 24-48 werkuren klaar bij de apotheek.' },
      { question: 'Kan ik mijn recept bij elke apotheek ophalen?', answer: 'Ja, wij sturen het naar de apotheek van uw keuze.' },
      { question: 'Ik heb bijwerkingen van mijn medicijnen', answer: 'Dat is belangrijk om te bespreken. Ik plan een afspraak met de arts.' },
      { question: 'Ik ga op vakantie en heb medicijnen nodig', answer: 'Vraag tijdig uw vakantiemedicatie aan, liefst 2 weken vooraf.' },
      { question: 'Moet ik langskomen voor een recept?', answer: 'Voor herhaalrecepten niet altijd. Soms is controle wel nodig.' },
      
      // ===== LABRESULTATEN =====
      { question: 'Zijn mijn uitslagen al binnen?', answer: 'Mag ik uw naam? Dan kijk ik of de resultaten er zijn.' },
      { question: 'Hoe krijg ik mijn labresultaten?', answer: 'We bellen bij afwijkingen. Anders kunt u bellen of online inzien.' },
      { question: 'Moet ik nuchter komen voor bloedonderzoek?', answer: 'Voor sommige testen wel. Ik check wat voor u geldt.' },
      { question: 'Waar kan ik bloed laten prikken?', answer: 'Bij ons in de praktijk of bij een laboratorium in de buurt.' },
      { question: 'Hoelang duurt het voor de uitslag er is?', answer: 'Meestal binnen enkele werkdagen, afhankelijk van het onderzoek.' },
      
      // ===== VERWIJZINGEN =====
      { question: 'Ik heb een verwijzing nodig', answer: 'Waarvoor heeft u een verwijzing nodig? De arts kan deze uitschrijven na consult.' },
      { question: 'Hoe lang is mijn verwijzing geldig?', answer: 'Meestal 3-6 maanden, afhankelijk van de specialist.' },
      { question: 'Kan ik zelf een specialist kiezen?', answer: 'Ja, u mag zelf kiezen naar welk ziekenhuis of welke specialist.' },
      { question: 'Ik wil een second opinion', answer: 'Dat is uw recht. De arts kan een verwijzing maken voor een andere specialist.' },
      
      // ===== VACCINATIES =====
      { question: 'Ik wil een griepprik', answer: 'De griepprik is er vanaf oktober. Ik plan een afspraak voor u.' },
      { question: 'Kom ik in aanmerking voor de griepprik?', answer: '65-plussers, chronisch zieken en zwangeren wel. Wat is uw situatie?' },
      { question: 'Ik ga op reis en heb vaccinaties nodig', answer: 'Maak tijdig een afspraak. Waar gaat u naartoe en wanneer?' },
      { question: 'Welke vaccinaties hebben jullie?', answer: 'Griep, tetanus, reisvaccinaties en meer. Wat heeft u nodig?' },
      { question: 'Moet ik betalen voor vaccinaties?', answer: 'Sommige zijn gratis, andere niet. Ik informeer u over de kosten.' },
      
      // ===== KOSTEN & VERZEKERING =====
      { question: 'Wat kost een consult?', answer: 'Het consult wordt meestal vergoed door uw zorgverzekering.' },
      { question: 'Welke verzekeringen accepteren jullie?', answer: 'Alle Belgische en Nederlandse zorgverzekeringen.' },
      { question: 'Moet ik mijn verzekeringspas meenemen?', answer: 'Ja, neem altijd uw ID en verzekeringspas mee.' },
      { question: 'Ik heb geen verzekering', answer: 'Neem contact op zodat we de mogelijkheden kunnen bespreken.' },
      { question: 'Krijg ik een factuur?', answer: 'De factuur gaat meestal rechtstreeks naar uw verzekering.' },
      { question: 'Worden alle behandelingen vergoed?', answer: 'De meeste wel. Vraag naar specifieke behandelingen.' },
      
      // ===== INSCHRIJVING =====
      { question: 'Ik wil me inschrijven als patiënt', answer: 'Welkom! Ik noteer uw gegevens. Mag ik uw naam en geboortedatum?' },
      { question: 'Nemen jullie nieuwe patiënten aan?', answer: 'Ja, nieuwe patiënten zijn welkom. Wilt u zich inschrijven?' },
      { question: 'Wat heb ik nodig voor inschrijving?', answer: 'Uw ID, verzekeringspas en eventueel gegevens van uw vorige huisarts.' },
      { question: 'Ik ben verhuisd en zoek een huisarts', answer: 'Welkom in onze praktijk! Ik help u met de inschrijving.' },
      { question: 'Kan ik van huisarts wisselen?', answer: 'Ja, u bent vrij om een andere huisarts te kiezen.' },
      
      // ===== DOSSIER & PRIVACY =====
      { question: 'Kan ik mijn dossier opvragen?', answer: 'Ja, u kunt een kopie van uw dossier aanvragen bij de praktijk.' },
      { question: 'Zijn mijn gegevens veilig?', answer: 'Ja, wij werken volgens de AVG/GDPR privacyrichtlijnen.' },
      { question: 'Kan mijn dossier worden overgedragen?', answer: 'Ja, bij verhuizing dragen we uw dossier over naar uw nieuwe huisarts.' },
      { question: 'Wie heeft toegang tot mijn dossier?', answer: 'Alleen uw behandelend artsen en geautoriseerd personeel.' },
      { question: 'Ik wil mijn adres wijzigen', answer: 'Dat noteer ik voor u. Wat is uw nieuwe adres?' },
      { question: 'Ik heb een nieuw telefoonnummer', answer: 'Ik pas uw gegevens aan. Wat is het nieuwe nummer?' },
      
      // ===== SPECIFIEKE KLACHTEN =====
      { question: 'Ik heb koorts', answer: 'Hoe hoog is de koorts? Hoelang heeft u dit al? Ik kijk of u vandaag kunt komen.' },
      { question: 'Ik voel me niet lekker', answer: 'Wat zijn uw klachten? Dan kan ik inschatten of u moet komen.' },
      { question: 'Ik heb griep', answer: 'Rust en vocht zijn belangrijk. Bij verergering maken we een afspraak.' },
      { question: 'Ik heb buikpijn', answer: 'Hoe erg is de pijn? Bij ernstige pijn plannen we snel een afspraak.' },
      { question: 'Ik heb hoofdpijn', answer: 'Is het erger dan normaal? Bij ongewone hoofdpijn kunt u beter komen.' },
      { question: 'Ik heb rugpijn', answer: 'Bij uitstraling naar de benen of lang aanhouden, maak ik een afspraak.' },
      { question: 'Ik heb huiduitslag', answer: 'Ik plan een afspraak. U kunt eventueel een foto meesturen.' },
      { question: 'Ik heb oorpijn', answer: 'Ik maak een afspraak zodat de arts kan kijken.' },
      { question: 'Ik heb keelpijn', answer: 'Bij koorts of ernstige pijn kunt u beter langskomen.' },
      { question: 'Ik ben gestoken door een insect', answer: 'Bij allergische reactie direct contact. Anders observeer de plek.' },
      { question: 'Ik heb me gesneden', answer: 'Is de wond diep of stopt het bloeden niet? Dan moet u langskomen.' },
      { question: 'Ik heb me gebrand', answer: 'Koel direct met lauw water. Bij ernstige brandwonden moet u komen.' },
      { question: 'Ik ben gevallen', answer: 'Heeft u pijn of zwelling? Kunt u normaal bewegen?' },
      { question: 'Ik heb last van mijn ogen', answer: 'Wat voor klachten heeft u? Roodheid, jeuk, wazig zien?' },
      { question: 'Ik slaap slecht', answer: 'Hoelang speelt dit? Bij aanhoudende problemen maken we een afspraak.' },
      { question: 'Ik ben moe', answer: 'Aanhoudende vermoeidheid kan onderzocht worden. Wilt u een afspraak?' },
      { question: 'Ik heb stress', answer: 'Dat is lastig. De arts kan met u bespreken wat er mogelijk is.' },
      { question: 'Ik voel me somber', answer: 'Het is goed dat u belt. Ik plan een afspraak om dit te bespreken.' },
      
      // ===== ALGEMEEN =====
      { question: 'Wat moet ik meenemen?', answer: 'Uw ID, verzekeringspas en eventuele medische documenten.' },
      { question: 'Behandelen jullie kinderen?', answer: 'Ja, wij behandelen patiënten van alle leeftijden.' },
      { question: 'Behandelen jullie ouderen?', answer: 'Ja, wij bieden zorg voor alle leeftijden.' },
      { question: 'Spreken jullie Engels?', answer: 'Ja, onze artsen spreken ook Engels.' },
      { question: 'Spreken jullie Frans?', answer: 'Neem contact op voor informatie over taalmogelijkheden.' },
      { question: 'Hoeveel artsen werken er?', answer: 'Ik geef u informatie over ons team van artsen.' },
      { question: 'Wie is de hoofdarts?', answer: 'Ik vertel u graag meer over onze artsen.' },
      { question: 'Werken jullie met stagiairs?', answer: 'Soms wel. U kunt altijd vragen om alleen de vaste arts te spreken.' },
      { question: 'Hebben jullie een website?', answer: 'Ja, daar vindt u alle informatie. Ik geef u het adres.' },
      { question: 'Bedankt voor de hulp', answer: 'Graag gedaan! Nog een fijne dag en tot ziens.' },
      { question: 'Tot ziens', answer: 'Tot ziens en een goede dag!' },
    ];
  }
  
  // ===========================================
  // TANDARTS - 50+ FAQs
  // ===========================================
  if (typeId === 'tandarts') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk! Mag ik uw naam? Is het voor controle of heeft u klachten?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Dat regel ik nu voor u. Mag ik uw naam?' },
      { question: 'Kan ik vandaag nog terecht?', answer: 'Heeft u pijn? Bij spoed proberen we u vandaag te helpen.' },
      { question: 'Hoe vaak moet ik komen?', answer: 'Wij adviseren minimaal 2x per jaar een controle.' },
      { question: 'Wanneer was mijn laatste controle?', answer: 'Mag ik uw naam? Dan zoek ik het voor u op.' },
      { question: 'Ik wil mijn afspraak verzetten', answer: 'Geen probleem. Mag ik uw naam en wanneer wilt u komen?' },
      { question: 'Hoe lang duurt een controle?', answer: 'Een controle duurt ongeveer 20-30 minuten.' },
      { question: 'Hoe lang duurt een gebitsreiniging?', answer: 'Ongeveer 30-45 minuten.' },
      
      // Spoed & Pijn
      { question: 'Ik heb kiespijn', answer: 'Dat is vervelend. Hoe erg is de pijn? Ik kijk of u vandaag kunt komen.' },
      { question: 'Ik heb erge tandpijn', answer: 'Ik plan zo snel mogelijk een spoedafspraak. Mag ik uw naam?' },
      { question: 'Mijn tand is afgebroken', answer: 'Bewaar het stukje indien mogelijk. Ik maak een spoedafspraak.' },
      { question: 'Mijn vulling is eruit gevallen', answer: 'Dat moet snel gerepareerd worden. Wanneer kunt u komen?' },
      { question: 'Mijn kroon zit los', answer: 'Ik plan een afspraak om dit te repareren.' },
      { question: 'Ik heb een abces', answer: 'Dat is urgent. Ik maak direct een afspraak voor u.' },
      { question: 'Wat doe ik bij kiespijn buiten kantooruren?', answer: 'Bel de tandartsenpost voor spoedhulp. Ik geef u het nummer.' },
      { question: 'Ik heb gezwollen tandvlees', answer: 'Dat moet bekeken worden. Ik plan een afspraak.' },
      
      // Behandelingen
      { question: 'Doen jullie aan bleken?', answer: 'Ja, wij bieden professionele tandenbleking aan. Wilt u info?' },
      { question: 'Wat kost tanden bleken?', answer: 'Ik geef u graag informatie over de kosten en opties.' },
      { question: 'Bieden jullie implantaten aan?', answer: 'Ja, wij plaatsen implantaten. Wilt u een consult?' },
      { question: 'Bieden jullie kronen aan?', answer: 'Ja, kronen en bruggen behoren tot onze behandelingen.' },
      { question: 'Doen jullie wortelkanaalbehandelingen?', answer: 'Ja, wij voeren wortelkanaalbehandelingen uit.' },
      { question: 'Bieden jullie orthodontie aan?', answer: 'Ja, wij bieden beugels en aligners. Wilt u een consult?' },
      { question: 'Hebben jullie Invisalign?', answer: 'Neem contact op voor informatie over onzichtbare beugels.' },
      { question: 'Kan ik facings krijgen?', answer: 'Ja, wij plaatsen facings/veneers. Ik plan een consult.' },
      { question: 'Doen jullie extracties?', answer: 'Ja, het trekken van tanden en kiezen doen wij.' },
      { question: 'Vervangen jullie amalgaamvullingen?', answer: 'Ja, wij kunnen oude vullingen vervangen door witte.' },
      { question: 'Bieden jullie mondbescherming aan?', answer: 'Ja, voor sport. Wij maken ook knarsbitjes.' },
      
      // Kinderen
      { question: 'Behandelen jullie kinderen?', answer: 'Ja, kinderen zijn welkom vanaf de eerste tandjes.' },
      { question: 'Vanaf welke leeftijd kan mijn kind komen?', answer: 'Vanaf ongeveer 2 jaar voor gewenning, vanaf 4 voor controles.' },
      { question: 'Mijn kind is bang voor de tandarts', answer: 'Wij hebben ervaring met angstige kinderen en nemen de tijd.' },
      { question: 'Krijgen kinderen fluoride?', answer: 'Ja, fluoride wordt bij kinderen aangebracht ter bescherming.' },
      
      // Angst
      { question: 'Ik ben bang voor de tandarts', answer: 'Dat begrijpen we. We hebben ervaring met angstpatiënten en werken rustig.' },
      { question: 'Hebben jullie lachgas?', answer: 'Neem contact op voor informatie over verdoving en lachgas.' },
      { question: 'Kan ik verdoofd worden?', answer: 'Ja, wij verdoven bij behandelingen. Bij extreme angst zijn er extra opties.' },
      
      // Kosten & Verzekering
      { question: 'Wat kost een controle?', answer: 'Grotendeels vergoed door de verzekering. Vraag naar eigen bijdrage.' },
      { question: 'Welke verzekeringen accepteren jullie?', answer: 'Alle gangbare zorgverzekeringen.' },
      { question: 'Moet ik mijn verzekeringspas meenemen?', answer: 'Ja, neem uw ID en verzekeringspas mee.' },
      { question: 'Wordt bleken vergoed?', answer: 'Bleken is cosmetisch en wordt meestal niet vergoed.' },
      { question: 'Worden implantaten vergoed?', answer: 'Gedeeltelijk, afhankelijk van uw verzekering.' },
      
      // Preventie
      { question: 'Hoe voorkom ik gaatjes?', answer: '2x daags poetsen, flossen en regelmatig controleren.' },
      { question: 'Hoe vaak moet ik poetsen?', answer: '2x per dag, 2 minuten met fluoridetandpasta.' },
      { question: 'Moet ik flossen?', answer: 'Ja, dagelijks flossen of ragers gebruiken voor tussen de tanden.' },
      { question: 'Welke tandpasta raden jullie aan?', answer: 'Tandpasta met fluoride. De tandarts adviseert graag.' },
      
      // Praktisch
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons adres zodat u ons kunt vinden.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid in de buurt.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja, onze praktijk is toegankelijk.' },
      { question: 'Wat moet ik meenemen?', answer: 'Uw ID en verzekeringspas.' },
      { question: 'Bedankt voor de hulp', answer: 'Graag gedaan! Tot ziens.' },
    ];
  }
  
  // ===========================================
  // OPTICIEN - 45+ FAQs
  // ===========================================
  if (typeId === 'opticien') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk! Is het voor een oogmeting of iets anders?' },
      { question: 'Hoe maak ik een afspraak voor oogmeting?', answer: 'Dat regel ik nu voor u. Wanneer past het?' },
      { question: 'Kan ik vandaag nog langskomen?', answer: 'Ik kijk of er vandaag nog plek is voor een oogmeting.' },
      { question: 'Kan ik zonder afspraak langskomen?', answer: 'Voor brillen kijken wel, voor oogmeting adviseren we een afspraak.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons adres.' },
      
      // Oogmeting
      { question: 'Hoe lang duurt een oogmeting?', answer: 'Een oogmeting duurt ongeveer 20-30 minuten.' },
      { question: 'Wat kost een oogmeting?', answer: 'Vaak gratis bij aankoop van een bril. Ik informeer u.' },
      { question: 'Hoe vaak moet ik mijn ogen laten testen?', answer: 'Wij adviseren elke 2 jaar een oogmeting, of eerder bij klachten.' },
      { question: 'Ik zie slechter dan vroeger', answer: 'Maak een afspraak voor een oogmeting. We kijken wat er aan de hand is.' },
      { question: 'Doen jullie oogtesten voor rijbewijs?', answer: 'Ja, we kunnen een oogtest voor uw rijbewijs doen.' },
      { question: 'Moet ik nuchter komen?', answer: 'Nee, dat is niet nodig voor een oogmeting.' },
      
      // Brillen
      { question: 'Hoe lang duurt het maken van een bril?', answer: 'Meestal 1-2 weken, afhankelijk van de glazen.' },
      { question: 'Welke merken hebben jullie?', answer: 'We hebben diverse merken. Kom gerust kijken!' },
      { question: 'Kan ik mijn oude montuur hergebruiken?', answer: 'Vaak wel. We checken of het nog geschikt is.' },
      { question: 'Mijn bril is kapot', answer: 'Kom langs, we kijken of we het kunnen repareren.' },
      { question: 'Kan ik mijn bril laten repareren?', answer: 'Ja, kleine reparaties zijn vaak gratis en direct.' },
      { question: 'Mijn bril zit niet lekker', answer: 'Kom langs, we stellen hem gratis voor u af.' },
      { question: 'Kan ik mijn bril laten aanpassen?', answer: 'Ja, brillen verstellen is gratis bij ons.' },
      { question: 'Bieden jullie progressieve glazen?', answer: 'Ja, multifocale glazen in alle kwaliteiten.' },
      { question: 'Wat zijn progressieve glazen?', answer: 'Glazen voor zowel veraf als dichtbij, zonder zichtbare lijn.' },
      { question: 'Bieden jullie zonnebrillen op sterkte?', answer: 'Ja, in diverse merken en modellen.' },
      { question: 'Hebben jullie sportbrillen?', answer: 'Ja, ook op sterkte voor diverse sporten.' },
      { question: 'Bieden jullie kinderbrillen aan?', answer: 'Ja, met speciale stevige kindermonturen.' },
      { question: 'Hebben jullie computerbrillen?', answer: 'Ja, speciaal voor beeldschermwerk.' },
      
      // Contactlenzen
      { question: 'Passen jullie contactlenzen aan?', answer: 'Ja, met professionele aanpassing en gebruiksinstructie.' },
      { question: 'Ik wil overstappen naar lenzen', answer: 'Maak een afspraak voor een lenzenpas. We leggen alles uit.' },
      { question: 'Kan ik lenzen bestellen?', answer: 'Ja, ook online nabestellen als u al klant bent.' },
      { question: 'Mijn lenzen zijn bijna op', answer: 'Ik noteer een nabestelling. Welke lenzen gebruikt u?' },
      { question: 'Welke lenzen zijn het beste?', answer: 'Dat hangt af van uw ogen en gebruik. We adviseren u graag.' },
      
      // Kosten & Verzekering
      { question: 'Wordt mijn bril vergoed?', answer: 'Gedeeltelijk, afhankelijk van uw verzekering. Ik informeer u.' },
      { question: 'Welke verzekeringen accepteren jullie?', answer: 'Alle gangbare zorgverzekeringen.' },
      { question: 'Wat kost een nieuwe bril?', answer: 'Dat hangt af van montuur en glazen. We hebben elke prijsklasse.' },
      { question: 'Hebben jullie een garantie?', answer: 'Ja, we geven garantie op onze brillen.' },
      
      // Praktisch
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid in de buurt.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja, onze winkel is toegankelijk.' },
      { question: 'Bedankt voor de hulp', answer: 'Graag gedaan! Tot ziens.' },
    ];
  }
  
  // ===========================================
  // ADVOCAAT - 50+ FAQs
  // ===========================================
  if (typeId === 'advocaat') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ons kantoor is op werkdagen geopend. Ik geef u de exacte uren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Dat regel ik voor u. Waar gaat uw zaak over?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of via e-mail. Ik kan nu een afspraak inplannen.' },
      { question: 'Kan ik vandaag nog langskomen?', answer: 'Ik kijk of er vandaag beschikbaarheid is. Wat is de urgentie?' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons kantooradres.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid bij ons kantoor.' },
      
      // Kosten
      { question: 'Wat kost een eerste gesprek?', answer: 'Het eerste kennismakingsgesprek is vaak een vast tarief. Ik geef u de details.' },
      { question: 'Werken jullie op uurtarief?', answer: 'Ja, onze tarieven hangen af van de zaak. Ik informeer u graag.' },
      { question: 'Wat zijn jullie tarieven?', answer: 'De tarieven variëren per zaak. Ik laat de advocaat u informeren.' },
      { question: 'Bieden jullie pro-deo aan?', answer: 'In bepaalde gevallen is rechtsbijstand mogelijk. Wat is uw situatie?' },
      { question: 'Hoe werkt rechtsbijstand?', answer: 'Wij werken met de meeste rechtsbijstandverzekeraars samen.' },
      { question: 'Wordt dit vergoed door mijn verzekering?', answer: 'Heeft u een rechtsbijstandverzekering? Dan kunnen we dit checken.' },
      { question: 'Moet ik vooraf betalen?', answer: 'Meestal vragen we een voorschot. De advocaat legt dit uit.' },
      { question: 'Krijg ik een kostenraming?', answer: 'Ja, we geven altijd vooraf een inschatting van de kosten.' },
      
      // Specialisaties
      { question: 'Op welke gebieden zijn jullie gespecialiseerd?', answer: 'Ik geef u een overzicht van onze rechtsgebieden.' },
      { question: 'Doen jullie familierecht?', answer: 'Ja, wij behandelen echtscheidingen, voogdij en alimentatie.' },
      { question: 'Helpen jullie bij echtscheiding?', answer: 'Ja, wij begeleiden echtscheidingen. Wilt u een afspraak?' },
      { question: 'Helpen jullie bij arbeidsgeschillen?', answer: 'Ja, wij adviseren bij ontslag, conflicten en contracten.' },
      { question: 'Ik ben ontslagen', answer: 'Dat is vervelend. We kunnen uw rechten bekijken. Wanneer was het ontslag?' },
      { question: 'Doen jullie strafrecht?', answer: 'Neem contact op voor informatie over strafrechtelijke bijstand.' },
      { question: 'Helpen jullie bij huurgeschillen?', answer: 'Ja, wij behandelen huur- en vastgoedgeschillen.' },
      { question: 'Doen jullie ondernemingsrecht?', answer: 'Ja, wij adviseren bedrijven over contracten en geschillen.' },
      { question: 'Helpen jullie bij erfenissen?', answer: 'Ja, wij behandelen erfrecht en nalatenschappen.' },
      { question: 'Doen jullie letselschade?', answer: 'Neem contact op voor informatie over letselschadezaken.' },
      
      // Proces
      { question: 'Hoe lang duurt een zaak?', answer: 'Dat hangt af van de complexiteit. We geven u een inschatting.' },
      { question: 'Moet ik naar de rechtbank?', answer: 'Niet altijd. Vaak proberen we eerst buiten de rechter om op te lossen.' },
      { question: 'Kunnen jullie mij vertegenwoordigen in de rechtbank?', answer: 'Ja, dat is onze kerntaak.' },
      { question: 'Bieden jullie mediation aan?', answer: 'Ja, als alternatief voor een rechtszaak.' },
      { question: 'Wat is mediation?', answer: 'Een bemiddelingsgesprek om samen tot een oplossing te komen.' },
      { question: 'Kan ik een second opinion krijgen?', answer: 'Ja, neem vrijblijvend contact op voor een tweede mening.' },
      
      // Praktisch
      { question: 'Wat moet ik meenemen?', answer: 'Alle relevante documenten en uw ID.' },
      { question: 'Kan ik documenten mailen?', answer: 'Ja, u kunt documenten veilig per e-mail sturen.' },
      { question: 'Zijn gesprekken vertrouwelijk?', answer: 'Ja, alles wat u bespreekt valt onder het beroepsgeheim.' },
      { question: 'Behandelen jullie bedrijven?', answer: 'Ja, wij adviseren zowel particulieren als bedrijven.' },
      { question: 'Hoe snel krijg ik reactie?', answer: 'Wij streven naar reactie binnen 24-48 uur op werkdagen.' },
      
      // Specifieke situaties
      { question: 'Ik heb een brief van een deurwaarder', answer: 'Dat is urgent. Maak een afspraak zodat we dit kunnen bekijken.' },
      { question: 'Ik word gedagvaard', answer: 'Neem direct contact op, we helpen u met de procedure.' },
      { question: 'Ik wil een contract laten opstellen', answer: 'Wij stellen contracten op. Waar gaat het over?' },
      { question: 'Kan ik een contract laten nakijken?', answer: 'Ja, we reviewen contracten voor u ondertekent.' },
      { question: 'Ik heb een aanmaning gekregen', answer: 'Laat ons dit bekijken. Wat staat erin?' },
      
      // Afsluiting
      { question: 'Zijn jullie aangesloten bij de Orde?', answer: 'Ja, al onze advocaten zijn ingeschreven bij de Orde.' },
      { question: 'Hoeveel advocaten werken er?', answer: 'Ik vertel u graag over ons team.' },
      { question: 'Bedankt', answer: 'Graag gedaan. Nog een fijne dag!' },
    ];
  }
  
  // ===========================================
  // BOEKHOUDER / ACCOUNTANT - 50+ FAQs
  // ===========================================
  if (typeId === 'boekhouder') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ons kantoor is op werkdagen geopend. Ik geef u de exacte uren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Dat regel ik voor u. Waar kan ik u mee helpen?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of via e-mail. Ik plan nu een afspraak.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons kantooradres.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid bij ons kantoor.' },
      { question: 'Wat kost een eerste gesprek?', answer: 'Het eerste kennismakingsgesprek is vrijblijvend.' },
      
      // Belastingaangifte
      { question: 'Helpen jullie bij belastingaangifte?', answer: 'Ja, voor particulieren en bedrijven. Wilt u een afspraak?' },
      { question: 'Wanneer is de deadline voor belastingaangifte?', answer: 'We informeren u tijdig over alle deadlines.' },
      { question: 'Ik moet mijn aangifte nog doen', answer: 'Geen probleem, we helpen u. Wanneer kunt u langskomen?' },
      { question: 'Kan ik uitstel krijgen voor mijn aangifte?', answer: 'Vaak wel. Wij regelen dit voor u.' },
      { question: 'Ik heb een brief van de belastingdienst', answer: 'Maak een afspraak, we bekijken dit samen.' },
      { question: 'Kan ik nog terugkrijgen van de belasting?', answer: 'We bekijken uw situatie en optimaliseren waar mogelijk.' },
      { question: 'Helpen jullie bij BTW-aangifte?', answer: 'Ja, wij verzorgen al uw BTW-aangiftes.' },
      { question: 'Wanneer moet ik BTW betalen?', answer: 'Afhankelijk van uw periode. We sturen u tijdig een herinnering.' },
      
      // Boekhouding
      { question: 'Kunnen jullie mijn boekhouding doen?', answer: 'Ja, volledig of gedeeltelijk. We bespreken wat u nodig heeft.' },
      { question: 'Wat kost boekhouding per maand?', answer: 'Afhankelijk van de omvang. Ik geef u een offerte.' },
      { question: 'Werken jullie met boekhoudprogrammas?', answer: 'Ja, wij werken met diverse pakketten en cloudsoftware.' },
      { question: 'Kunnen jullie facturen voor mij versturen?', answer: 'Ja, dat kan onderdeel zijn van onze dienstverlening.' },
      { question: 'Hoe lever ik mijn administratie aan?', answer: 'Digitaal, per post of u brengt het langs.' },
      { question: 'Ik heb een achterstand in mijn boekhouding', answer: 'Geen probleem, we werken dit samen bij.' },
      
      // ZZP / Starters
      { question: 'Bieden jullie boekhouding voor ZZP aan?', answer: 'Ja, we helpen veel zelfstandigen. Wilt u info?' },
      { question: 'Ik wil een bedrijf starten', answer: 'We adviseren over rechtsvorm, inschrijving en meer.' },
      { question: 'Welke rechtsvorm is het beste?', answer: 'Dat hangt af van uw situatie. We bespreken de opties.' },
      { question: 'Helpen jullie bij het oprichten van een BV?', answer: 'Ja, we begeleiden het volledige proces.' },
      { question: 'Wat kost een BV oprichten?', answer: 'Ik geef u een overzicht van de kosten en stappen.' },
      
      // Loon & Personeel
      { question: 'Kunnen jullie loonstroken maken?', answer: 'Ja, we verzorgen de complete loonadministratie.' },
      { question: 'Ik heb een werknemer aangenomen', answer: 'We regelen de loonadministratie voor u.' },
      { question: 'Helpen jullie bij personeelsadministratie?', answer: 'Ja, van loonstroken tot jaaropgaves.' },
      
      // Advies
      { question: 'Geven jullie fiscaal advies?', answer: 'Ja, we helpen u belasting te optimaliseren.' },
      { question: 'Kunnen jullie mijn financiën analyseren?', answer: 'Ja, we maken financiële rapportages en analyses.' },
      { question: 'Ik wil investeren in mijn bedrijf', answer: 'We bespreken de financiële gevolgen en mogelijkheden.' },
      { question: 'Helpen jullie bij subsidieaanvragen?', answer: 'Neem contact op, we bekijken welke subsidies van toepassing zijn.' },
      
      // Non-profit
      { question: 'Werken jullie voor vzws?', answer: 'Ja, we helpen verenigingen en stichtingen.' },
      { question: 'Helpen jullie non-profit organisaties?', answer: 'Ja, we kennen de specifieke regels voor non-profits.' },
      
      // Controle
      { question: 'Ik heb een belastingcontrole', answer: 'We begeleiden u volledig tijdens de controle.' },
      { question: 'Wat doe ik bij een controle?', answer: 'Maak direct een afspraak, we bereiden u voor.' },
      
      // Praktisch
      { question: 'Hoe snel krijg ik reactie?', answer: 'Wij streven naar reactie binnen 24-48 uur op werkdagen.' },
      { question: 'Zijn jullie erkend?', answer: 'Ja, wij zijn erkende boekhouders/accountants.' },
      { question: 'Kunnen jullie online werken?', answer: 'Ja, we werken veel digitaal en kunnen videobellen.' },
      { question: 'Bedankt', answer: 'Graag gedaan. Nog een fijne dag!' },
    ];
  }
  
  // ===========================================
  // DIERENKLINIEK / DIERENARTS - 50+ FAQs
  // ===========================================
  if (typeId === 'dierenkliniek') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk! Voor welk dier en wat is de reden?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Dat regel ik nu voor u. Wat is de naam van uw huisdier?' },
      { question: 'Kan ik vandaag nog langskomen?', answer: 'Is het dringend? Ik kijk of er vandaag plek is.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons adres.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid bij de kliniek.' },
      
      // Spoed
      { question: 'Het is dringend!', answer: 'Wat is er aan de hand? Ik help u direct.' },
      { question: 'Mijn hond is ziek', answer: 'Wat zijn de symptomen? Ik kijk of u snel kunt komen.' },
      { question: 'Mijn kat eet niet', answer: 'Hoelang al niet? Bij meer dan 24 uur adviseer ik een afspraak.' },
      { question: 'Mijn huisdier heeft iets ingeslikt', answer: 'Dat kan gevaarlijk zijn. Kom zo snel mogelijk langs.' },
      { question: 'Mijn hond heeft diarree', answer: 'Hoelang al? Bij bloed of uitdroging direct komen.' },
      { question: 'Mijn kat is aangereden', answer: 'Kom direct! Probeer het dier rustig te houden.' },
      { question: 'Wat doe ik bij spoed buiten kantooruren?', answer: 'Bel ons spoednummer. Ik geef u het nummer.' },
      { question: 'Zijn jullie 24 uur open?', answer: 'Nee, maar we hebben een spoednummer voor noodgevallen.' },
      
      // Dieren
      { question: 'Welke dieren behandelen jullie?', answer: 'Honden, katten en andere huisdieren.' },
      { question: 'Behandelen jullie konijnen?', answer: 'Ja, wij behandelen ook konijnen en knaagdieren.' },
      { question: 'Behandelen jullie vogels?', answer: 'Neem contact op voor informatie over vogelbehandelingen.' },
      { question: 'Behandelen jullie reptielen?', answer: 'Neem contact op, we bekijken of we kunnen helpen.' },
      
      // Vaccinaties
      { question: 'Welke vaccinaties heeft mijn hond nodig?', answer: 'De basisentingen tegen hondenziekte, parvo en kennelhoest.' },
      { question: 'Welke vaccinaties heeft mijn kat nodig?', answer: 'Tegen kattenziekte, niesziekte en leucose.' },
      { question: 'Wanneer moet mijn puppy geënt worden?', answer: 'Vanaf 6-8 weken. We plannen het vaccinatieschema.' },
      { question: 'Mijn hond moet geënt worden', answer: 'Ik plan een vaccinatieafspraak. Wanneer past het?' },
      { question: 'Moet mijn kat jaarlijks geënt worden?', answer: 'Ja, sommige vaccinaties moeten jaarlijks herhaald.' },
      
      // Castratie & Sterilisatie
      { question: 'Doen jullie castratie?', answer: 'Ja, voor honden en katten. Ik plan een afspraak.' },
      { question: 'Wat kost castratie?', answer: 'Ik geef u de tarieven voor uw dier.' },
      { question: 'Wanneer kan mijn hond gecastreerd worden?', answer: 'Meestal vanaf 6 maanden. We adviseren u.' },
      { question: 'Doen jullie sterilisatie?', answer: 'Ja, we plannen dit op afspraak.' },
      
      // Chippen & Paspoort
      { question: 'Bieden jullie chippen aan?', answer: 'Ja, met registratie in de database.' },
      { question: 'Moet mijn huisdier gechipt worden?', answer: 'Ja, het is verplicht. We kunnen dit direct doen.' },
      { question: 'Kunnen jullie een dierenpaspoort maken?', answer: 'Ja, nodig voor reizen naar het buitenland.' },
      { question: 'Ik ga op reis met mijn hond', answer: 'Maak tijdig een afspraak voor paspoort en vaccinaties.' },
      
      // Behandelingen
      { question: 'Bieden jullie gebitsverzorging?', answer: 'Ja, tandenreiniging en extracties.' },
      { question: 'Kunnen jullie nagels knippen?', answer: 'Ja, tijdens consult of als aparte afspraak.' },
      { question: 'Bieden jullie echografie aan?', answer: 'Ja, voor diagnostiek en drachtigheidsonderzoek.' },
      { question: 'Kunnen jullie bloed afnemen?', answer: 'Ja, voor bloedonderzoek en diagnose.' },
      { question: 'Doen jullie operaties?', answer: 'Ja, diverse operaties. We bespreken de mogelijkheden.' },
      { question: 'Bieden jullie röntgen aan?', answer: 'Ja, we hebben röntgenapparatuur.' },
      
      // Medicijnen & Voeding
      { question: 'Mijn dier heeft medicijnen nodig', answer: 'We schrijven voor en hebben de meeste medicijnen op voorraad.' },
      { question: 'De medicijnen van mijn hond zijn op', answer: 'Ik noteer een herhaalrecept. Welk medicijn?' },
      { question: 'Hebben jullie dierenvoeding?', answer: 'Ja, dieetvoeding en supplementen.' },
      { question: 'Welk voer is het beste?', answer: 'De dierenarts adviseert u graag over voeding.' },
      
      // Controles
      { question: 'Hoe vaak moet mijn huisdier gecontroleerd worden?', answer: 'Minimaal jaarlijks voor controle en vaccinaties.' },
      { question: 'Mijn hond moet op controle', answer: 'Ik plan een controleafspraak. Wanneer past het?' },
      
      // Kosten
      { question: 'Wat kost een consult?', answer: 'Ik informeer u over onze tarieven.' },
      { question: 'Kan ik pinnen?', answer: 'Ja, we accepteren alle gangbare betaalmethoden.' },
      { question: 'Hebben jullie een dierenverzekering?', answer: 'Nee, maar we kunnen wel adviseren over verzekeringen.' },
      
      // Afsluiting
      { question: 'Bedankt', answer: 'Graag gedaan! Doe de groetjes aan uw huisdier.' },
    ];
  }
  
  // ===========================================
  // LOODGIETER / INSTALLATEUR - 50+ FAQs
  // ===========================================
  if (typeId === 'loodgieter') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie werktijden?', answer: 'Ik geef u onze werktijden. Bij spoed komen we ook buiten kantooruren.' },
      { question: 'Ik heb een loodgieter nodig', answer: 'Ik help u direct. Wat is het probleem?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Dat regel ik nu. Wanneer past het u?' },
      { question: 'Kunnen jullie vandaag komen?', answer: 'Ik kijk of we vandaag kunnen plannen. Is het dringend?' },
      { question: 'Hoe snel kunnen jullie komen?', answer: 'Vaak dezelfde of volgende werkdag. Bij spoed eerder.' },
      { question: 'In welke regio werken jullie?', answer: 'Ik geef u ons werkgebied.' },
      
      // Spoed
      { question: 'Ik heb een lekkage!', answer: 'Sluit de hoofdkraan af indien mogelijk. Ik plan een spoedafspraak.' },
      { question: 'Komen jullie ook bij spoed?', answer: 'Ja, we hebben een spoeddienst. Wat is er aan de hand?' },
      { question: 'Mijn wc is verstopt', answer: 'Dat lossen we op. Wanneer kunnen we langskomen?' },
      { question: 'Mijn afvoer is verstopt', answer: 'We komen ontstoppen. Is het keuken of badkamer?' },
      { question: 'Ik ruik gas!', answer: 'DIRECT ramen open, geen elektra bedienen, naar buiten! Bel de gasdienst.' },
      { question: 'Ik heb geen warm water', answer: 'Dat is vervelend. Ik plan een afspraak om de boiler te checken.' },
      { question: 'Mijn verwarming doet het niet', answer: 'We komen kijken. Heeft u de thermostaat gecheckt?' },
      { question: 'Er komt water uit het plafond', answer: 'Sluit de hoofdkraan af. We komen zo snel mogelijk.' },
      { question: 'Werken jullie in het weekend?', answer: 'Bij spoed wel. Voor regulier werk op werkdagen.' },
      
      // Diensten - Lekkages
      { question: 'Repareren jullie lekkages?', answer: 'Ja, alle soorten lekkages in leidingen en kranen.' },
      { question: 'Mijn kraan lekt', answer: 'We komen dit repareren. Welke kraan is het?' },
      { question: 'Mijn toilet lekt', answer: 'We lossen dit op. Lekt het bij de afvoer of de toevoer?' },
      { question: 'Kunnen jullie leidingwerk repareren?', answer: 'Ja, reparatie en vervanging van leidingen.' },
      
      // Diensten - Installatie
      { question: 'Installeren jullie badkamers?', answer: 'Ja, complete badkamerrenovaties.' },
      { question: 'Plaatsen jullie boilers?', answer: 'Ja, verkoop, installatie en onderhoud van boilers.' },
      { question: 'Installeren jullie CV-ketels?', answer: 'Ja, alle merken CV-ketels.' },
      { question: 'Plaatsen jullie kranen?', answer: 'Ja, alle soorten kranen in keuken en badkamer.' },
      { question: 'Installeren jullie vloerverwarming?', answer: 'Ja, aanleg en reparatie van vloerverwarming.' },
      { question: 'Kunnen jullie een toilet plaatsen?', answer: 'Ja, we plaatsen en vervangen toiletten.' },
      { question: 'Installeren jullie douches?', answer: 'Ja, douchecabines, regendouches, alles.' },
      { question: 'Plaatsen jullie wastafels?', answer: 'Ja, wastafels en wasbakken.' },
      { question: 'Doen jullie aan waterontharders?', answer: 'Ja, installatie en onderhoud van waterontharders.' },
      
      // Diensten - Onderhoud
      { question: 'Doen jullie CV-onderhoud?', answer: 'Ja, jaarlijks onderhoud is aan te raden.' },
      { question: 'Wanneer moet de CV gecontroleerd worden?', answer: 'Jaarlijks voor optimale werking en veiligheid.' },
      { question: 'Ontstoppen jullie riolen?', answer: 'Ja, met professioneel materiaal.' },
      { question: 'Kunnen jullie afvoeren reinigen?', answer: 'Ja, we reinigen verstopte afvoeren.' },
      
      // Offertes & Kosten
      { question: 'Wat kost een loodgieter?', answer: 'Dat hangt af van de klus. Ik geef u een indicatie.' },
      { question: 'Wat zijn de voorrijkosten?', answer: 'Ik informeer u over onze voorrijkosten.' },
      { question: 'Kunnen jullie een offerte maken?', answer: 'Ja, we maken vrijblijvende offertes.' },
      { question: 'Komen jullie eerst kijken?', answer: 'Bij grote klussen komen we vrijblijvend kijken voor offerte.' },
      { question: 'Geven jullie garantie?', answer: 'Ja, we geven garantie op al ons werk.' },
      
      // Praktisch
      { question: 'Werken jullie voor bedrijven?', answer: 'Ja, particulier en zakelijk.' },
      { question: 'Zijn jullie erkend?', answer: 'Ja, wij zijn gecertificeerde installateurs.' },
      { question: 'Hoe betaal ik?', answer: 'Contant, pin of factuur. Diverse betaalmethoden.' },
      { question: 'Krijg ik een factuur?', answer: 'Ja, u ontvangt altijd een factuur.' },
      
      // Algemeen
      { question: 'Hebben jullie een website?', answer: 'Ja, ik geef u het adres.' },
      { question: 'Bedankt', answer: 'Graag gedaan. Tot ziens!' },
    ];
  }
  
  // ===========================================
  // RESTAURANT / HORECA - 50+ FAQs
  // ===========================================
  if (typeId === 'restaurant' || typeId === 'frituur' || typeId === 'pizzeria' || typeId === 'kebab' || typeId === 'snackbar') {
    return [
      // Contact & Openingsuren
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren.' },
      { question: 'Zijn jullie vandaag open?', answer: 'Ja, we zijn vandaag geopend! Tot hoe laat kan ik u helpen?' },
      { question: 'Tot hoe laat zijn jullie open?', answer: 'Ik geef u onze sluitingstijd.' },
      { question: 'Zijn jullie op zondag open?', answer: 'Ik check onze zondagsuren voor u.' },
      { question: 'Zijn jullie op feestdagen open?', answer: 'Dat verschilt per feestdag. Ik geef u de info.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons adres.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid in de buurt.' },
      
      // Reserveringen
      { question: 'Ik wil reserveren', answer: 'Ja natuurlijk! Voor hoeveel personen en wanneer?' },
      { question: 'Kan ik een tafel reserveren?', answer: 'Ja, voor wanneer wilt u reserveren?' },
      { question: 'Moet ik reserveren?', answer: 'Voor groepen en in het weekend raden we reserveren aan.' },
      { question: 'Kan ik een groepsreservering maken?', answer: 'Ja, voor hoeveel personen?' },
      { question: 'Ik wil mijn reservering annuleren', answer: 'Geen probleem. Onder welke naam staat de reservering?' },
      { question: 'Ik wil mijn reservering wijzigen', answer: 'Dat kan. Wat wilt u veranderen?' },
      { question: 'Hebben jullie plek voor vanavond?', answer: 'Ik kijk of er plek is. Met hoeveel personen komt u?' },
      
      // Bestellen
      { question: 'Kan ik telefonisch bestellen?', answer: 'Ja, wat wilt u bestellen?' },
      { question: 'Ik wil bestellen', answer: 'Wat mag het zijn?' },
      { question: 'Hebben jullie bezorging?', answer: 'Ja, wij bezorgen. Wat is uw adres?' },
      { question: 'Wat zijn de bezorgkosten?', answer: 'Ik geef u de bezorgkosten voor uw adres.' },
      { question: 'Vanaf welk bedrag leveren jullie?', answer: 'Ik vertel u ons minimum bestelbedrag.' },
      { question: 'Hoe lang duurt de bezorging?', answer: 'Gemiddeld 30-45 minuten, afhankelijk van drukte.' },
      { question: 'Kan ik afhalen?', answer: 'Ja, afhalen kan. Wanneer wilt u het ophalen?' },
      { question: 'Hoe laat is mijn bestelling klaar?', answer: 'Meestal binnen 15-20 minuten na bestelling.' },
      { question: 'Kan ik online bestellen?', answer: 'Ja, via onze website of app.' },
      { question: 'Kan ik met pin betalen?', answer: 'Ja, wij accepteren pin, contant en vaak ook creditcard.' },
      
      // Menu
      { question: 'Hebben jullie een menukaart?', answer: 'Ja, ik kan u over onze gerechten vertellen.' },
      { question: 'Wat zijn jullie specialiteiten?', answer: 'Ik vertel u graag over onze populaire gerechten.' },
      { question: 'Hebben jullie vegetarische opties?', answer: 'Ja, wij hebben vegetarische gerechten.' },
      { question: 'Hebben jullie veganistische opties?', answer: 'Ja, wij hebben veganistische keuzes.' },
      { question: 'Hebben jullie glutenvrije opties?', answer: 'Ja, vraag naar onze glutenvrije gerechten.' },
      { question: 'Zijn er allergenen in jullie eten?', answer: 'Wij kunnen u informeren over allergenen.' },
      { question: 'Wat kost een ...?', answer: 'Ik geef u de prijs.' },
      { question: 'Hebben jullie een kindermenu?', answer: 'Ja, wij hebben kinderporties.' },
      { question: 'Hebben jullie dagmenu?', answer: 'Vraag naar onze dagaanbiedingen.' },
      { question: 'Hebben jullie lunch?', answer: 'Ja, onze lunchkaart is beschikbaar.' },
      
      // Specifieke gerechten
      { question: 'Hebben jullie pizza?', answer: 'Ja, wij hebben diverse pizzas.' },
      { question: 'Hebben jullie friet?', answer: 'Ja, wij hebben verse friet.' },
      { question: 'Welke sauzen hebben jullie?', answer: 'Wij hebben diverse sauzen. Ik noem ze op.' },
      { question: 'Hebben jullie desserts?', answer: 'Ja, wij hebben desserts.' },
      { question: 'Hebben jullie drankjes?', answer: 'Ja, frisdranken, bier, wijn, etc.' },
      
      // Praktisch
      { question: 'Is er een toilet?', answer: 'Ja, er is een toilet voor klanten.' },
      { question: 'Hebben jullie wifi?', answer: 'Ja, we hebben gratis wifi voor klanten.' },
      { question: 'Is er een terras?', answer: 'Ik informeer u over ons terras.' },
      { question: 'Zijn jullie kindvriendelijk?', answer: 'Ja, kinderen zijn welkom.' },
      { question: 'Kan ik met een groep komen?', answer: 'Ja, reserveer vooraf voor grotere groepen.' },
      
      // Feedback
      { question: 'Ik heb een klacht', answer: 'Dat spijt ons. Vertel me wat er is gebeurd.' },
      { question: 'Mijn bestelling klopt niet', answer: 'Excuses daarvoor. Wat is er mis?' },
      { question: 'Bedankt', answer: 'Graag gedaan! Eet smakelijk en tot ziens!' },
    ];
  }
  
  // ===========================================
  // KAPPER / SCHOONHEIDSSALON - 40+ FAQs
  // ===========================================
  if (typeId === 'kapper' || typeId === 'schoonheidssalon' || typeId === 'nagelsalon' || typeId === 'spa' || typeId === 'massagesalon') {
    return [
      // Contact & Afspraken
      { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze openingsuren.' },
      { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk! Voor welke behandeling?' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Dat regel ik nu voor u. Wat wilt u laten doen?' },
      { question: 'Kan ik vandaag nog terecht?', answer: 'Ik kijk of er vandaag nog plek is.' },
      { question: 'Moet ik reserveren?', answer: 'Ja, wij werken op afspraak.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons adres.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid in de buurt.' },
      
      // Afspraken wijzigen
      { question: 'Ik wil mijn afspraak verzetten', answer: 'Geen probleem. Naar wanneer wilt u verplaatsen?' },
      { question: 'Ik moet annuleren', answer: 'Dat is jammer. Wilt u een nieuwe afspraak maken?' },
      { question: 'Hoe lang van tevoren moet ik afzeggen?', answer: 'Liefst 24 uur van tevoren.' },
      
      // Behandelingen
      { question: 'Welke behandelingen bieden jullie?', answer: 'Ik geef u een overzicht van onze behandelingen.' },
      { question: 'Hoe lang duurt een knipbeurt?', answer: 'Ongeveer 30-45 minuten.' },
      { question: 'Hoe lang duurt verven?', answer: 'Ongeveer 1,5 tot 2 uur, afhankelijk van de behandeling.' },
      { question: 'Doen jullie ook heren?', answer: 'Ja, wij knippen ook heren.' },
      { question: 'Doen jullie ook kinderen?', answer: 'Ja, kinderen zijn welkom.' },
      { question: 'Bieden jullie gezichtsbehandelingen?', answer: 'Ja, we hebben diverse gezichtsbehandelingen.' },
      { question: 'Doen jullie nagels?', answer: 'Ja, manicure en pedicure.' },
      { question: 'Bieden jullie massage?', answer: 'Ja, we hebben verschillende massages.' },
      { question: 'Doen jullie wenkbrauwen?', answer: 'Ja, epileren en shapen.' },
      { question: 'Bieden jullie harsen/waxen?', answer: 'Ja, voor verschillende lichaamsdelen.' },
      
      // Prijzen
      { question: 'Wat kost knippen?', answer: 'Ik geef u onze knipprijzen.' },
      { question: 'Wat kost verven?', answer: 'Dat hangt af van de behandeling. Ik informeer u.' },
      { question: 'Hebben jullie een prijslijst?', answer: 'Ja, ik geef u de prijzen.' },
      { question: 'Kan ik pinnen?', answer: 'Ja, we accepteren pin en contant.' },
      
      // Specifiek
      { question: 'Werken jullie met afspraak of inloop?', answer: 'Wij werken op afspraak.' },
      { question: 'Hebben jullie cadeaubonnen?', answer: 'Ja, cadeaubonnen zijn beschikbaar.' },
      { question: 'Gebruiken jullie specifieke producten?', answer: 'Ja, wij werken met professionele producten.' },
      { question: 'Bedankt', answer: 'Graag gedaan! Tot ziens!' },
    ];
  }
  
  // ===========================================
  // DEFAULT FAQs - voor alle overige types
  // ===========================================
  return [
    { question: 'Wat zijn jullie openingsuren?', answer: 'Ik geef u graag onze exacte openingsuren.' },
    { question: 'Waar zijn jullie gevestigd?', answer: 'Ik geef u ons volledige adres.' },
    { question: 'Ik wil een afspraak maken', answer: 'Ja natuurlijk! Wanneer past het u?' },
    { question: 'Hoe maak ik een afspraak?', answer: 'Dat regel ik nu voor u.' },
    { question: 'Kan ik mijn afspraak verzetten?', answer: 'Ja, neem tijdig contact op.' },
    { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parkeergelegenheid in de buurt.' },
    { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Neem contact op voor informatie over toegankelijkheid.' },
    { question: 'Wat zijn de kosten?', answer: 'Ik informeer u graag over onze tarieven.' },
    { question: 'Kan ik pinnen?', answer: 'Ja, we accepteren diverse betaalmethoden.' },
    { question: 'Hebben jullie een website?', answer: 'Ja, ik geef u het adres.' },
    { question: 'Bedankt voor de hulp', answer: 'Graag gedaan! Nog een fijne dag!' },
    { question: 'Tot ziens', answer: 'Tot ziens en een goede dag!' },
  ];
}
