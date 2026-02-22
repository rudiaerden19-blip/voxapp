// ============================================================
// TENANT TEMPLATES — standaard menu per business type
// ============================================================

export interface MenuTemplate {
  name: string;
  price: number;
  category?: string;
}

export interface TenantTemplate {
  type: string;
  label: string;
  default_ai_name: string;
  prep_time_pickup: number;
  prep_time_delivery: number;
  delivery_enabled: boolean;
  welcome_template: string;
  menu: MenuTemplate[];
}

export const TENANT_TEMPLATES: Record<string, TenantTemplate> = {
  frituur: {
    type: 'frituur',
    label: 'Frituur / Snackbar',
    default_ai_name: 'Anja',
    prep_time_pickup: 20,
    prep_time_delivery: 30,
    delivery_enabled: true,
    welcome_template: 'Goeiedag, met {business_name}, met {ai_name}, wat kan ik voor je doen?',
    menu: [
      { name: 'Kinderfriet', price: 3.30, category: 'frieten' },
      { name: 'Kleine friet', price: 3.50, category: 'frieten' },
      { name: 'Middelfriet', price: 3.80, category: 'frieten' },
      { name: 'Grote friet', price: 4.10, category: 'frieten' },
      { name: 'Friet special klein', price: 4.90, category: 'frieten' },
      { name: 'Friet special middel', price: 5.20, category: 'frieten' },
      { name: 'Friet special groot', price: 5.50, category: 'frieten' },
      { name: 'Mayonaise', price: 1.10, category: 'sauzen' },
      { name: 'Zoete mayonaise', price: 1.10, category: 'sauzen' },
      { name: 'Tom ketchup', price: 1.10, category: 'sauzen' },
      { name: 'Curry ketchup', price: 1.10, category: 'sauzen' },
      { name: 'Andalouse saus', price: 1.10, category: 'sauzen' },
      { name: 'Samurai saus', price: 1.10, category: 'sauzen' },
      { name: 'Cocktail saus', price: 1.10, category: 'sauzen' },
      { name: 'Amerikaans saus', price: 1.10, category: 'sauzen' },
      { name: 'BBQ saus', price: 1.10, category: 'sauzen' },
      { name: 'Looksaus', price: 1.10, category: 'sauzen' },
      { name: 'Joppie saus', price: 1.10, category: 'sauzen' },
      { name: 'Mosterd', price: 1.10, category: 'sauzen' },
      { name: 'Tartaar', price: 1.10, category: 'sauzen' },
      { name: 'Bicky burger', price: 4.50, category: 'snacks' },
      { name: 'Cheeseburger', price: 5.00, category: 'snacks' },
      { name: 'Frikandel', price: 2.50, category: 'snacks' },
      { name: 'Frikandel speciaal', price: 3.50, category: 'snacks' },
      { name: 'Curryworst', price: 3.50, category: 'snacks' },
      { name: 'Kroket', price: 2.50, category: 'snacks' },
      { name: 'Cervela', price: 3.00, category: 'snacks' },
      { name: 'Gebakken boulet', price: 2.00, category: 'snacks' },
      { name: 'Broodje mexicano', price: 4.50, category: 'snacks' },
      { name: 'Bitterballen (6st)', price: 4.50, category: 'snacks' },
      { name: 'Cola', price: 2.00, category: 'dranken' },
      { name: 'Fanta', price: 2.00, category: 'dranken' },
      { name: 'Water', price: 1.50, category: 'dranken' },
      { name: 'Ice tea', price: 2.00, category: 'dranken' },
    ],
  },

  restaurant: {
    type: 'restaurant',
    label: 'Restaurant',
    default_ai_name: 'Sophie',
    prep_time_pickup: 30,
    prep_time_delivery: 45,
    delivery_enabled: true,
    welcome_template: 'Goeiedag, met {business_name}, met {ai_name}, waarmee kan ik u helpen?',
    menu: [
      { name: 'Soep van de dag', price: 6.50, category: 'voorgerechten' },
      { name: 'Garnaalkroketten', price: 14.50, category: 'voorgerechten' },
      { name: 'Caesarsalade', price: 12.00, category: 'voorgerechten' },
      { name: 'Steak frites', price: 24.00, category: 'hoofdgerechten' },
      { name: 'Vol-au-vent', price: 18.50, category: 'hoofdgerechten' },
      { name: 'Stoofvlees', price: 19.00, category: 'hoofdgerechten' },
      { name: 'Pasta bolognese', price: 16.00, category: 'hoofdgerechten' },
      { name: 'Vis van de dag', price: 22.00, category: 'hoofdgerechten' },
      { name: 'Dame blanche', price: 8.50, category: 'desserts' },
      { name: 'Crème brûlée', price: 9.00, category: 'desserts' },
      { name: 'Cola', price: 3.00, category: 'dranken' },
      { name: 'Water', price: 2.50, category: 'dranken' },
      { name: 'Koffie', price: 3.00, category: 'dranken' },
    ],
  },

  kapper: {
    type: 'kapper',
    label: 'Kapper / Kapsalon',
    default_ai_name: 'Lisa',
    prep_time_pickup: 0,
    prep_time_delivery: 0,
    delivery_enabled: false,
    welcome_template: 'Goeiedag, met {business_name}, met {ai_name}, waarmee kan ik u helpen?',
    menu: [
      { name: 'Knippen dames', price: 35.00, category: 'diensten' },
      { name: 'Knippen heren', price: 25.00, category: 'diensten' },
      { name: 'Knippen kinderen', price: 18.00, category: 'diensten' },
      { name: 'Wassen en föhnen', price: 20.00, category: 'diensten' },
      { name: 'Kleuren', price: 55.00, category: 'diensten' },
      { name: 'Highlights', price: 75.00, category: 'diensten' },
      { name: 'Permanenten', price: 65.00, category: 'diensten' },
      { name: 'Baard trimmen', price: 15.00, category: 'diensten' },
    ],
  },

  garage: {
    type: 'garage',
    label: 'Garage / Autoservice',
    default_ai_name: 'Tom',
    prep_time_pickup: 0,
    prep_time_delivery: 0,
    delivery_enabled: false,
    welcome_template: 'Goeiedag, met {business_name}, met {ai_name}, waarmee kan ik u helpen?',
    menu: [
      { name: 'Kleine beurt', price: 149.00, category: 'onderhoud' },
      { name: 'Grote beurt', price: 249.00, category: 'onderhoud' },
      { name: 'APK keuring', price: 35.00, category: 'onderhoud' },
      { name: 'Bandenwissel', price: 40.00, category: 'onderhoud' },
      { name: 'Airco service', price: 89.00, category: 'onderhoud' },
      { name: 'Diagnose', price: 55.00, category: 'onderhoud' },
    ],
  },

  dokter: {
    type: 'dokter',
    label: 'Dokter / Huisarts',
    default_ai_name: 'Emma',
    prep_time_pickup: 0,
    prep_time_delivery: 0,
    delivery_enabled: false,
    welcome_template: 'Goeiedag, met de praktijk van {business_name}, met {ai_name}, waarmee kan ik u helpen?',
    menu: [
      { name: 'Consultatie', price: 25.00, category: 'diensten' },
      { name: 'Huisbezoek', price: 45.00, category: 'diensten' },
      { name: 'Bloedafname', price: 10.00, category: 'diensten' },
      { name: 'Griepvaccinatie', price: 15.00, category: 'diensten' },
      { name: 'Attest', price: 5.00, category: 'diensten' },
    ],
  },
};

export function getTemplate(type: string): TenantTemplate | null {
  return TENANT_TEMPLATES[type] || null;
}

export function getAvailableTypes(): { type: string; label: string }[] {
  return Object.values(TENANT_TEMPLATES).map(t => ({ type: t.type, label: t.label }));
}

export function buildWelcomeMessage(template: TenantTemplate, businessName: string, aiName?: string): string {
  return template.welcome_template
    .replace('{business_name}', businessName)
    .replace('{ai_name}', aiName || template.default_ai_name);
}
