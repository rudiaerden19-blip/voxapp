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
  const config = getBusinessType(businessType);
  const typeId = businessType.toLowerCase();
  
  // Medische praktijken (dokter, ziekenhuis)
  if (typeId === 'dokter' || typeId === 'ziekenhuis') {
    return [
      // Algemeen & Contact
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze openingsuren vindt u op onze website of vraag aan de receptie.' },
      { question: 'Waar zijn jullie gevestigd?', answer: 'Ons adres vindt u op onze website of vraag de receptie.' },
      { question: 'Wat is het telefoonnummer?', answer: 'Ons telefoonnummer staat op de website en uw afspraakbevestiging.' },
      { question: 'Hebben jullie een e-mailadres?', answer: 'Ja, u kunt ons e-mailen voor niet-dringende vragen.' },
      { question: 'Zijn jullie op zaterdag open?', answer: 'Neem contact op voor onze weekenduren.' },
      { question: 'Zijn jullie op zondag open?', answer: 'Zondag zijn we gesloten, bij spoed bel de huisartsenpost.' },
      { question: 'Zijn jullie op feestdagen open?', answer: 'Op feestdagen zijn we gesloten, bij spoed bel de huisartsenpost.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parking beschikbaar voor patiënten.' },
      { question: 'Moet ik betalen voor parkeren?', answer: 'Neem contact op voor informatie over parkeertarieven.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja, onze praktijk is volledig toegankelijk.' },
      { question: 'Is er een lift aanwezig?', answer: 'Ja, onze praktijk is toegankelijk voor minder mobiele patiënten.' },
      { question: 'Kan ik met het openbaar vervoer komen?', answer: 'Ja, er zijn bushaltes en/of treinstations in de buurt.' },
      { question: 'Hebben jullie een website?', answer: 'Ja, alle informatie vindt u op onze website.' },
      { question: 'Zijn jullie op sociale media?', answer: 'Ja, volg ons voor updates en gezondheidstips.' },
      
      // Afspraken maken
      { question: 'Hoe maak ik een afspraak?', answer: 'U kunt telefonisch of online een afspraak maken.' },
      { question: 'Kan ik online een afspraak maken?', answer: 'Ja, via onze website of patiëntenportaal.' },
      { question: 'Kan ik dezelfde dag nog terecht?', answer: 'Voor dringende zaken proberen we u dezelfde dag te helpen.' },
      { question: 'Hoe lang van tevoren moet ik bellen?', answer: 'Voor niet-dringende zaken adviseren we een paar dagen vooruit.' },
      { question: 'Kan ik een afspraak maken voor iemand anders?', answer: 'Ja, met toestemming van de patiënt.' },
      { question: 'Kan ik een dubbele afspraak maken?', answer: 'Ja, voor meerdere klachten kunt u een langere afspraak vragen.' },
      { question: 'Kan ik een afspraak maken voor mijn kind?', answer: 'Ja, kinderen zijn welkom met een ouder/voogd.' },
      { question: 'Wat als ik te laat kom?', answer: 'Bel ons, we bekijken of het consult nog door kan gaan.' },
      { question: 'Hoe lang duurt een consult?', answer: 'Een standaard consult duurt 15-20 minuten.' },
      { question: 'Kan ik een langere afspraak maken?', answer: 'Ja, geef dit aan bij het maken van de afspraak.' },
      
      // Afspraken wijzigen/annuleren
      { question: 'Hoe verzet ik mijn afspraak?', answer: 'Bel minstens 24 uur van tevoren om te verzetten.' },
      { question: 'Hoe annuleer ik mijn afspraak?', answer: 'Bel minstens 24 uur van tevoren om te annuleren.' },
      { question: 'Zijn er kosten voor annuleren?', answer: 'Bij te laat annuleren kunnen kosten in rekening worden gebracht.' },
      { question: 'Krijg ik een herinnering voor mijn afspraak?', answer: 'Ja, u ontvangt een sms of e-mail herinnering.' },
      
      // Spoed & Buiten kantooruren
      { question: 'Wat doe ik bij spoed?', answer: 'Bij levensbedreigende situaties bel 112. Anders bel de praktijk.' },
      { question: 'Wanneer moet ik 112 bellen?', answer: 'Bij bewusteloosheid, hartklachten, ernstige ademhalingsproblemen, zware bloedingen.' },
      { question: 'Wat is het nummer van de huisartsenpost?', answer: 'Het nummer vindt u op onze website of voicemail buiten kantooruren.' },
      { question: 'Wanneer is de huisartsenpost open?', answer: 'Avonden, nachten, weekenden en feestdagen.' },
      { question: 'Wat doe ik bij klachten buiten kantooruren?', answer: 'Bel de huisartsenpost of bij spoed 112.' },
      { question: 'Doen jullie avondspreekuur?', answer: 'Neem contact op voor informatie over avondspreekuren.' },
      
      // Huisbezoeken
      { question: 'Doen jullie huisbezoeken?', answer: 'Ja, voor patiënten die niet kunnen komen. Bel voor 10u.' },
      { question: 'Hoe vraag ik een huisbezoek aan?', answer: 'Bel voor 10 uur s ochtends voor een huisbezoek dezelfde dag.' },
      { question: 'Zijn er kosten voor een huisbezoek?', answer: 'Neem contact op voor informatie over eventuele kosten.' },
      { question: 'Wanneer komt de dokter bij huisbezoek?', answer: 'Meestal in de loop van de ochtend of vroege middag.' },
      
      // Videoconsult
      { question: 'Kan ik videoconsult doen?', answer: 'Ja, voor sommige klachten bieden we videoconsulten aan.' },
      { question: 'Hoe werkt een videoconsult?', answer: 'U ontvangt een link en belt via uw computer of telefoon.' },
      { question: 'Is een videoconsult gratis?', answer: 'Dezelfde vergoeding als een gewoon consult.' },
      { question: 'Wanneer is videoconsult geschikt?', answer: 'Voor huidklachten, nacontroles, besprekingen van uitslagen.' },
      
      // Kosten & Verzekering
      { question: 'Moet ik betalen voor het consult?', answer: 'Meestal vergoed door uw zorgverzekering.' },
      { question: 'Welke verzekeringen accepteren jullie?', answer: 'Alle Belgische en Nederlandse zorgverzekeringen.' },
      { question: 'Moet ik mijn verzekeringspas meenemen?', answer: 'Ja, neem altijd uw ID en verzekeringspas mee.' },
      { question: 'Wat als ik geen verzekering heb?', answer: 'Neem contact op om de mogelijkheden te bespreken.' },
      { question: 'Krijg ik een factuur?', answer: 'De factuur gaat meestal rechtstreeks naar uw verzekering.' },
      { question: 'Wat kost een consult zonder verzekering?', answer: 'Neem contact op voor actuele tarieven.' },
      { question: 'Worden alle behandelingen vergoed?', answer: 'De meeste wel, vraag naar specifieke behandelingen.' },
      
      // Recepten & Medicatie
      { question: 'Hoe vraag ik een herhaalrecept aan?', answer: 'Telefonisch of via de website, recept is binnen 24-48u klaar.' },
      { question: 'Hoe lang duurt het voor mijn recept klaar is?', answer: 'Herhaalrecepten zijn binnen 24-48 werkuren klaar.' },
      { question: 'Kan ik mijn recept bij elke apotheek ophalen?', answer: 'Ja, wij sturen het naar de apotheek van uw keuze.' },
      { question: 'Wat als mijn medicijn op is?', answer: 'Vraag tijdig een herhaalrecept aan, minstens een week vooruit.' },
      { question: 'Kan ik recepten telefonisch bestellen?', answer: 'Ja, voor herhaalrecepten van bestaande medicatie.' },
      { question: 'Moet ik langskomen voor een herhaalrecept?', answer: 'Niet altijd, afhankelijk van het medicijn en controleperiode.' },
      { question: 'Wat als ik bijwerkingen heb?', answer: 'Neem contact op met de praktijk om dit te bespreken.' },
      { question: 'Kunnen jullie medicijnen voorschrijven voor vakantie?', answer: 'Ja, vraag dit tijdig aan voor uw vertrek.' },
      
      // Verwijzingen
      { question: 'Hoe krijg ik een verwijzing?', answer: 'Na consult kan de arts een verwijzing uitschrijven.' },
      { question: 'Hoe lang is een verwijzing geldig?', answer: 'Meestal 3-6 maanden, afhankelijk van de specialist.' },
      { question: 'Kan ik zelf een specialist kiezen?', answer: 'Ja, u mag zelf kiezen naar welk ziekenhuis of specialist.' },
      { question: 'Kan ik een second opinion krijgen?', answer: 'Ja, bespreek dit met uw arts.' },
      
      // Onderzoeken & Labresultaten
      { question: 'Hoe krijg ik mijn labresultaten?', answer: 'Binnen enkele dagen beschikbaar, we bellen bij afwijkingen.' },
      { question: 'Moet ik nuchter komen voor bloedonderzoek?', answer: 'Voor sommige testen wel, dit wordt meegedeeld bij de afspraak.' },
      { question: 'Waar kan ik bloed laten prikken?', answer: 'Bij ons of bij een laboratorium in de buurt.' },
      { question: 'Hoe lang duurt bloedonderzoek?', answer: 'Het prikken zelf duurt enkele minuten, resultaten binnen dagen.' },
      { question: 'Kan ik mijn resultaten online inzien?', answer: 'Neem contact op voor toegang tot het patiëntenportaal.' },
      { question: 'Wat als mijn resultaten niet goed zijn?', answer: 'Wij nemen contact met u op om dit te bespreken.' },
      
      // Vaccinaties
      { question: 'Wanneer is de griepprik?', answer: 'Vanaf oktober, u wordt uitgenodigd als u in aanmerking komt.' },
      { question: 'Wie komt in aanmerking voor griepprik?', answer: '65-plussers, chronisch zieken, zwangeren en zorgmedewerkers.' },
      { question: 'Bieden jullie reisvaccinaties?', answer: 'Ja, maak tijdig een afspraak voor uw reis.' },
      { question: 'Welke vaccinaties bieden jullie?', answer: 'Griep, tetanus, reis- en overige vaccinaties.' },
      { question: 'Zijn vaccinaties gratis?', answer: 'Sommige wel, andere niet. Vraag naar de kosten.' },
      { question: 'Kan ik zonder afspraak voor vaccinatie komen?', answer: 'Nee, maak altijd een afspraak voor vaccinaties.' },
      
      // Dossier & Privacy
      { question: 'Kan ik mijn dossier opvragen?', answer: 'Ja, vraag een kopie aan bij de praktijk.' },
      { question: 'Zijn mijn gegevens veilig?', answer: 'Ja, wij werken volgens AVG/GDPR richtlijnen.' },
      { question: 'Kan ik mijn dossier laten overdragen?', answer: 'Ja, bij verhuizing dragen we uw dossier over naar nieuwe arts.' },
      { question: 'Wie heeft toegang tot mijn dossier?', answer: 'Alleen uw behandelend artsen en geautoriseerd personeel.' },
      { question: 'Hoe wijzig ik mijn gegevens?', answer: 'Telefonisch of bij de receptie doorgeven.' },
      
      // Klachten & Specifiek
      { question: 'Wat doe ik bij koorts?', answer: 'Bij hoge koorts of koorts langer dan 3 dagen, neem contact op.' },
      { question: 'Wat doe ik bij griepklachten?', answer: 'Rust, vocht, paracetamol. Bij verergering contact opnemen.' },
      { question: 'Wat doe ik bij buikpijn?', answer: 'Bij ernstige of aanhoudende buikpijn, neem contact op.' },
      { question: 'Wat doe ik bij hoofdpijn?', answer: 'Bij ernstige of ongewone hoofdpijn, neem contact op.' },
      { question: 'Wat doe ik bij rugpijn?', answer: 'Bij aanhoudende rugpijn of uitstraling naar benen, contact opnemen.' },
      { question: 'Wat doe ik bij huiduitslag?', answer: 'Maak een afspraak, eventueel met foto via videoconsult.' },
      { question: 'Wat doe ik bij oorpijn?', answer: 'Maak een afspraak voor onderzoek.' },
      { question: 'Wat doe ik bij keelpijn?', answer: 'Bij ernstige keelpijn of koorts, neem contact op.' },
      { question: 'Wat doe ik bij een insectenbeet?', answer: 'Bij allergische reactie of verergering, direct contact opnemen.' },
      { question: 'Wat doe ik bij een snijwond?', answer: 'Bij diepe wonden of niet-stoppende bloeding, direct contact opnemen.' },
      
      // Administratief
      { question: 'Wat moet ik meenemen?', answer: 'ID, verzekeringspas en eventuele medische documenten.' },
      { question: 'Kan ik me inschrijven als nieuwe patiënt?', answer: 'Ja, neem contact op voor inschrijving.' },
      { question: 'Wat heb ik nodig voor inschrijving?', answer: 'ID, verzekeringspas en gegevens vorige huisarts.' },
      { question: 'Kan ik van huisarts wisselen?', answer: 'Ja, u bent vrij om een andere huisarts te kiezen.' },
      { question: 'Behandelen jullie ook kinderen?', answer: 'Ja, wij behandelen patiënten van alle leeftijden.' },
      { question: 'Behandelen jullie ook ouderen?', answer: 'Ja, wij bieden zorg voor alle leeftijden.' },
      { question: 'Spreken jullie andere talen?', answer: 'Neem contact op voor informatie over talen.' },
    ];
  }
  
  // Tandarts
  if (typeId === 'tandarts') {
    return [
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze openingsuren vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of via onze online agenda.' },
      { question: 'Hoe vaak moet ik komen?', answer: 'Wij adviseren minimaal 2x per jaar een controle.' },
      { question: 'Wat doe ik bij kiespijn buiten kantooruren?', answer: 'Bel de tandartsenpost voor spoedhulp.' },
      { question: 'Hoe lang duurt een controle?', answer: 'Een controle duurt ongeveer 20-30 minuten.' },
      { question: 'Hoe lang duurt een gebitsreiniging?', answer: 'Ongeveer 30-45 minuten.' },
      { question: 'Bieden jullie orthodontie aan?', answer: 'Neem contact op voor info over beugels en aligners.' },
      { question: 'Doen jullie aan bleken?', answer: 'Ja, wij bieden professionele tandenbleking aan.' },
      { question: 'Wat kost een controle?', answer: 'Grotendeels vergoed door verzekering, vraag naar eigen bijdrage.' },
      { question: 'Behandelen jullie kinderen?', answer: 'Ja, vanaf de eerste tandjes.' },
      { question: 'Wat als ik bang ben voor de tandarts?', answer: 'We hebben ervaring met angstpatiënten, bespreek het met ons.' },
      { question: 'Bieden jullie implantaten aan?', answer: 'Ja, vraag naar de mogelijkheden.' },
      { question: 'Hoe verzet ik mijn afspraak?', answer: 'Bel minstens 24 uur van tevoren.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, er is parking in de buurt.' },
      { question: 'Welke verzekeringen accepteren jullie?', answer: 'Alle gangbare zorgverzekeringen.' },
      { question: 'Kan ik een spoedafspraak maken?', answer: 'Bel ons, we proberen u dezelfde dag te helpen.' },
      { question: 'Wat moet ik meenemen?', answer: 'ID en verzekeringspas.' },
      { question: 'Bieden jullie kronen en bruggen aan?', answer: 'Ja, vraag naar de mogelijkheden.' },
      { question: 'Hoe voorkom ik gaatjes?', answer: '2x daags poetsen, flossen en regelmatige controles.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja, onze praktijk is toegankelijk.' },
    ];
  }
  
  // Opticien
  if (typeId === 'opticien') {
    return [
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze openingsuren vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak voor oogmeting?', answer: 'Telefonisch of via onze website.' },
      { question: 'Hoe vaak moet ik mijn ogen laten testen?', answer: 'Wij adviseren elke 2 jaar een oogmeting.' },
      { question: 'Kan ik zonder afspraak langskomen?', answer: 'Voor oogmeting adviseren we een afspraak.' },
      { question: 'Hoe lang duurt een oogmeting?', answer: 'Ongeveer 20-30 minuten.' },
      { question: 'Hoe lang duurt het maken van een bril?', answer: 'Meestal 1-2 weken.' },
      { question: 'Passen jullie contactlenzen aan?', answer: 'Ja, met professionele aanpassing en instructie.' },
      { question: 'Kan ik mijn bril laten repareren?', answer: 'Ja, kleine reparaties vaak gratis en direct.' },
      { question: 'Bieden jullie zonnebrillen op sterkte?', answer: 'Ja, in diverse merken en modellen.' },
      { question: 'Wat kost een oogmeting?', answer: 'Vaak gratis bij aankoop, anders vraag naar tarieven.' },
      { question: 'Welke merken hebben jullie?', answer: 'Diverse merken, kom gerust kijken in de winkel.' },
      { question: 'Kan ik mijn oude montuur hergebruiken?', answer: 'Vaak wel, we checken of het nog geschikt is.' },
      { question: 'Bieden jullie progressieve glazen?', answer: 'Ja, multifocale glazen in alle kwaliteiten.' },
      { question: 'Hebben jullie sportbrillen?', answer: 'Ja, ook op sterkte.' },
      { question: 'Kan ik lenzen bestellen?', answer: 'Ja, ook online nabestellen.' },
      { question: 'Doen jullie aan oogtesten voor rijbewijs?', answer: 'Ja, we kunnen een oogtest doen.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, in de buurt.' },
      { question: 'Zijn jullie rolstoeltoegankelijk?', answer: 'Ja.' },
      { question: 'Kan ik mijn bril laten aanpassen?', answer: 'Ja, brillen verstellen is gratis.' },
      { question: 'Bieden jullie kinderbrillen aan?', answer: 'Ja, met speciale kindermonturen.' },
    ];
  }
  
  // Advocaat
  if (typeId === 'advocaat') {
    return [
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze kantooruren vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of via e-mail.' },
      { question: 'Wat kost een eerste gesprek?', answer: 'Vaak een vast tarief, vraag naar de kosten.' },
      { question: 'Op welke rechtsgebieden zijn jullie gespecialiseerd?', answer: 'Neem contact op voor onze specialisaties.' },
      { question: 'Werken jullie op uurtarief?', answer: 'Ja, vraag naar onze tarieven.' },
      { question: 'Bieden jullie pro-deo aan?', answer: 'In bepaalde gevallen, vraag naar de voorwaarden.' },
      { question: 'Hoe lang duurt een zaak gemiddeld?', answer: 'Afhankelijk van de complexiteit, we informeren u.' },
      { question: 'Kan ik documenten per mail sturen?', answer: 'Ja, veilig via e-mail of via onze portal.' },
      { question: 'Behandelen jullie particulieren en bedrijven?', answer: 'Ja, beide.' },
      { question: 'Wat moet ik meenemen naar het eerste gesprek?', answer: 'Alle relevante documenten en een ID.' },
      { question: 'Zijn gesprekken vertrouwelijk?', answer: 'Ja, advocaat-cliënt privilege geldt altijd.' },
      { question: 'Helpen jullie bij echtscheiding?', answer: 'Ja, neem contact op voor familierecht.' },
      { question: 'Helpen jullie bij arbeidsgeschillen?', answer: 'Ja, we adviseren bij arbeidsrechtelijke kwesties.' },
      { question: 'Kan ik een second opinion krijgen?', answer: 'Ja, neem vrijblijvend contact op.' },
      { question: 'Hoe werkt rechtsbijstand?', answer: 'We werken met de meeste rechtsbijstandverzekeraars.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, in de buurt van ons kantoor.' },
      { question: 'Kunnen jullie mij vertegenwoordigen in de rechtbank?', answer: 'Ja, dat is onze kerntaak.' },
      { question: 'Hoe snel krijg ik reactie?', answer: 'Wij streven naar reactie binnen 24-48 uur.' },
      { question: 'Bieden jullie mediation aan?', answer: 'Ja, als alternatief voor rechtszaken.' },
      { question: 'Zijn jullie aangesloten bij de Orde?', answer: 'Ja, al onze advocaten zijn ingeschreven.' },
    ];
  }
  
  // Boekhouder
  if (typeId === 'boekhouder') {
    return [
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze kantooruren vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of via e-mail.' },
      { question: 'Wat kost een eerste gesprek?', answer: 'Vaak gratis en vrijblijvend.' },
      { question: 'Helpen jullie bij belastingaangifte?', answer: 'Ja, voor particulieren en bedrijven.' },
      { question: 'Wanneer is de deadline voor belastingaangifte?', answer: 'We informeren u tijdig over deadlines.' },
      { question: 'Bieden jullie boekhouding voor ZZP aan?', answer: 'Ja, we helpen zelfstandigen.' },
      { question: 'Kunnen jullie mijn administratie overnemen?', answer: 'Ja, volledig of gedeeltelijk.' },
      { question: 'Werken jullie met boekhoudprogrammas?', answer: 'Ja, we werken met diverse pakketten.' },
      { question: 'Wat kost boekhouding per maand?', answer: 'Afhankelijk van omvang, vraag een offerte.' },
      { question: 'Helpen jullie bij BTW-aangifte?', answer: 'Ja, wij verzorgen uw BTW-aangiftes.' },
      { question: 'Kunnen jullie loonstroken maken?', answer: 'Ja, we verzorgen loonadministratie.' },
      { question: 'Helpen jullie bij starten van een bedrijf?', answer: 'Ja, advies over rechtsvorm en oprichting.' },
      { question: 'Geven jullie fiscaal advies?', answer: 'Ja, optimalisatie en planning.' },
      { question: 'Kunnen jullie facturen voor mij versturen?', answer: 'Ja, als onderdeel van onze diensten.' },
      { question: 'Hoe lever ik mijn administratie aan?', answer: 'Digitaal, per post of persoonlijk.' },
      { question: 'Werken jullie ook voor vzws/stichtingen?', answer: 'Ja, non-profit organisaties.' },
      { question: 'Wat als ik een controle krijg?', answer: 'Wij begeleiden u bij belastingcontroles.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, bij ons kantoor.' },
      { question: 'Hoe snel krijg ik reactie?', answer: 'Binnen 24-48 uur op werkdagen.' },
      { question: 'Zijn jullie erkend?', answer: 'Ja, erkende boekhouders/accountants.' },
    ];
  }
  
  // Dierenkliniek
  if (typeId === 'dierenkliniek') {
    return [
      { question: 'Wat zijn jullie openingsuren?', answer: 'Onze openingsuren vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of online.' },
      { question: 'Welke dieren behandelen jullie?', answer: 'Honden, katten en andere huisdieren.' },
      { question: 'Wat doe ik bij spoed?', answer: 'Bel direct, we hebben spoeddienst.' },
      { question: 'Bieden jullie chippen aan?', answer: 'Ja, met registratie.' },
      { question: 'Welke vaccinaties zijn nodig?', answer: 'We adviseren de basisvaccinaties.' },
      { question: 'Wat kost een consult?', answer: 'Vraag naar actuele tarieven.' },
      { question: 'Doen jullie castratie/sterilisatie?', answer: 'Ja, op afspraak.' },
      { question: 'Bieden jullie gebitsverzorging?', answer: 'Ja, tandenreiniging en extracties.' },
      { question: 'Kunnen jullie nagels knippen?', answer: 'Ja, tijdens consult of apart.' },
      { question: 'Hebben jullie dierenvoeding?', answer: 'Ja, dieetvoeding en supplementen.' },
      { question: 'Bieden jullie echografie aan?', answer: 'Ja, voor diagnostiek.' },
      { question: 'Kunnen jullie bloed afnemen?', answer: 'Ja, voor bloedonderzoek.' },
      { question: 'Wat als mijn dier medicijnen nodig heeft?', answer: 'We schrijven voor en hebben voorraad.' },
      { question: 'Bieden jullie dierenverzekering advies?', answer: 'Ja, we kunnen adviseren.' },
      { question: 'Is er parkeergelegenheid?', answer: 'Ja, voor de deur.' },
      { question: 'Zijn jullie 24/7 bereikbaar?', answer: 'Nee, maar we hebben spoednummers.' },
      { question: 'Behandelen jullie exotische dieren?', answer: 'Neem contact op voor mogelijkheden.' },
      { question: 'Kunnen jullie een paspoort maken?', answer: 'Ja, dierenpaspoorten voor reizen.' },
      { question: 'Hoe vaak moet mijn huisdier gecontroleerd worden?', answer: 'Minimaal jaarlijks adviseren we.' },
    ];
  }
  
  // Loodgieter
  if (typeId === 'loodgieter') {
    return [
      { question: 'Wat zijn jullie werktijden?', answer: 'Onze werktijden vindt u op onze website.' },
      { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch, we komen snel langs.' },
      { question: 'Komen jullie ook bij spoed?', answer: 'Ja, we hebben spoeddienst.' },
      { question: 'Wat kost een voorrijden?', answer: 'Vraag naar actuele tarieven.' },
      { question: 'Repareren jullie lekkages?', answer: 'Ja, alle soorten lekkages.' },
      { question: 'Installeren jullie nieuwe badkamers?', answer: 'Ja, complete badkamerrenovatie.' },
      { question: 'Plaatsen jullie boilers?', answer: 'Ja, verkoop en installatie.' },
      { question: 'Doen jullie aan CV-onderhoud?', answer: 'Ja, jaarlijks onderhoud.' },
      { question: 'Ontstoppen jullie riolen?', answer: 'Ja, met professioneel materiaal.' },
      { question: 'Werken jullie ook in het weekend?', answer: 'Bij spoed ja, anders op afspraak.' },
      { question: 'Geven jullie garantie?', answer: 'Ja, op al ons werk.' },
      { question: 'Kunnen jullie offerte maken?', answer: 'Ja, vrijblijvende offerte.' },
      { question: 'Installeren jullie vloerverwarming?', answer: 'Ja, aanleg en reparatie.' },
      { question: 'Werken jullie voor bedrijven?', answer: 'Ja, particulier en zakelijk.' },
      { question: 'Hebben jullie erkende installateurs?', answer: 'Ja, gecertificeerde vakmensen.' },
      { question: 'Kunnen jullie een gaslek oplossen?', answer: 'Ja, bel direct bij gaslek!' },
      { question: 'Plaatsen jullie kranen?', answer: 'Ja, alle soorten kranen.' },
      { question: 'Doen jullie aan waterontharders?', answer: 'Ja, installatie en onderhoud.' },
      { question: 'Hoe snel kunnen jullie komen?', answer: 'Vaak dezelfde of volgende dag.' },
      { question: 'Accepteren jullie pin/factuur?', answer: 'Ja, diverse betaalmethoden.' },
    ];
  }
  
  // Default FAQs
  return [
    { question: 'Wat zijn jullie openingsuren?', answer: 'Onze openingsuren vindt u op onze website.' },
    { question: 'Waar zijn jullie gevestigd?', answer: 'Ons adres vindt u op onze website.' },
    { question: 'Hoe maak ik een afspraak?', answer: 'Telefonisch of online.' },
    { question: 'Is er parkeergelegenheid?', answer: 'Ja, in de buurt.' },
    { question: 'Kan ik mijn afspraak verzetten?', answer: 'Ja, neem tijdig contact op.' },
  ];
}
