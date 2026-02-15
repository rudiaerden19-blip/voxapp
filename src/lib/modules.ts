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
  tandarts: {
    id: 'tandarts',
    name: 'Tandarts',
    icon: '🦷',
    category: 'zorg',
    modules: ['appointments', 'services', 'staff', 'patients'],
    aiContext: 'Je bent receptionist van een tandartspraktijk. Je plant afspraken voor controle, vullingen, extracties, etc. Vraag naar klachten en of het dringend is. Geef door dat patiënten 15 min voor afspraak aanwezig moeten zijn.',
    terminology: { product: 'behandeling', products: 'behandelingen', appointment: 'afspraak', customer: 'patiënt' },
  },
  dokter: {
    id: 'dokter',
    name: 'Dokterspraktijk',
    icon: '👨‍⚕️',
    category: 'zorg',
    modules: ['appointments', 'services', 'staff', 'patients'],
    aiContext: 'Je bent receptionist van een huisartsenpraktijk. Je plant consulten en vraagt kort naar de klacht om urgentie te bepalen. Verwijs bij noodgevallen naar 112.',
    terminology: { appointment: 'consult', customer: 'patiënt' },
  },
  opticien: {
    id: 'opticien',
    name: 'Opticien',
    icon: '👓',
    category: 'zorg',
    modules: ['appointments', 'services', 'menu'],
    aiContext: 'Je werkt bij een opticien. Je plant oogtesten, helpt met brillen en lenzen. Vraag of het om een controle gaat of nieuwe bril/lenzen.',
    terminology: { product: 'product', products: 'producten', appointment: 'afspraak', customer: 'klant' },
  },
  dierenkliniek: {
    id: 'dierenkliniek',
    name: 'Dierenkliniek',
    icon: '🐕',
    category: 'zorg',
    modules: ['appointments', 'services', 'staff'],
    aiContext: 'Je bent receptionist van een dierenkliniek. Vraag naar diersoort, naam van het dier, en reden van bezoek. Bij spoed, geef door dat ze direct kunnen langskomen.',
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
    aiContext: 'Je bent receptionist van een loodgietersbedrijf. Vraag naar het probleem (lekkage, verstopping, etc.), adres, en of het dringend is. Plan een afspraak of geef door dat iemand terugbelt.',
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
    modules: ['appointments', 'staff', 'patients'],
    aiContext: 'Je bent receptionist van een advocatenkantoor. Je plant consulten. Vraag kort naar het type zaak (familierecht, strafrecht, etc.) en of er al een dossier is. Eerste consult is vaak betaald.',
    terminology: { appointment: 'consult', customer: 'cliënt' },
  },
  boekhouder: {
    id: 'boekhouder',
    name: 'Boekhoudkantoor',
    icon: '📊',
    category: 'diensten',
    modules: ['appointments', 'staff'],
    aiContext: 'Je werkt bij een boekhoudkantoor. Je plant afspraken voor belastingaangifte, jaarrekening, BTW, etc. Vraag of het om particulier of zelfstandige/bedrijf gaat.',
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
    modules: ['appointments', 'menu'],
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
