import { requireTenant, requireTenantFromBusiness, TenantError } from '../lib/tenant';
import {
  VoiceOrderSystem,
  createEmptySession,
  OrderState,
  extractItems,
  type BusinessConfig,
} from '../lib/voice-engine/VoiceOrderSystem';

// ============================================================
// TENANT ISOLATION TESTS
// ============================================================

describe('TenantContext — runtime guard', () => {
  test('rejects null tenant_id', () => {
    expect(() => requireTenant(null)).toThrow(TenantError);
    expect(() => requireTenant(null)).toThrow('TENANT_ID_REQUIRED');
  });

  test('rejects undefined tenant_id', () => {
    expect(() => requireTenant(undefined)).toThrow('TENANT_ID_REQUIRED');
  });

  test('rejects empty string tenant_id', () => {
    expect(() => requireTenant('')).toThrow('TENANT_ID_REQUIRED');
    expect(() => requireTenant('   ')).toThrow('TENANT_ID_REQUIRED');
  });

  test('rejects null business', () => {
    expect(() => requireTenantFromBusiness(null)).toThrow('TENANT_ID_REQUIRED');
  });

  test('accepts valid tenant_id', () => {
    const tenant = requireTenant('tenant-abc-123');
    expect(tenant.tenant_id).toBe('tenant-abc-123');
  });

  test('accepts valid business', () => {
    const tenant = requireTenantFromBusiness({ id: 'biz-123', name: 'Test Frituur' });
    expect(tenant.tenant_id).toBe('biz-123');
    expect(tenant.tenant_name).toBe('Test Frituur');
  });

  test('trims whitespace from tenant_id', () => {
    const tenant = requireTenant('  tenant-123  ');
    expect(tenant.tenant_id).toBe('tenant-123');
  });
});

// ============================================================
// STATE MACHINE — TENANT ISOLATION
// ============================================================

describe('VoiceOrderSystem — tenant isolation', () => {
  const menuA = ['grote friet', 'cola'];
  const pricesA: Record<string, number> = { 'grote friet': 4.10, 'cola': 2.00 };
  const configA: BusinessConfig = {
    name: 'Frituur A',
    ai_name: 'Anja',
    welcome_message: 'Hallo, met Frituur A',
    prep_time_pickup: 15,
    prep_time_delivery: 25,
    delivery_enabled: false,
  };

  const menuB = ['pizza', 'water'];
  const pricesB: Record<string, number> = { 'pizza': 12.00, 'water': 1.50 };
  const configB: BusinessConfig = {
    name: 'Restaurant B',
    ai_name: 'Sophie',
    welcome_message: 'Welkom bij Restaurant B',
    prep_time_pickup: 30,
    prep_time_delivery: 45,
    delivery_enabled: true,
  };

  test('Tenant A has own greeting', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    expect(engineA.getGreeting()).toContain('Frituur A');
    expect(engineA.getGreeting()).not.toContain('Restaurant B');
  });

  test('Tenant B has own greeting', () => {
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);
    expect(engineB.getGreeting()).toContain('Restaurant B');
    expect(engineB.getGreeting()).not.toContain('Frituur A');
  });

  test('Tenant A menu does not leak to Tenant B', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);

    const sessionA = createEmptySession();
    const sessionB = createEmptySession();

    engineA.handle(sessionA, 'een grote friet');
    engineB.handle(sessionB, 'een grote friet');

    expect(sessionA.order.length).toBe(1);
    expect(sessionA.order[0].product).toContain('grote friet');
    expect(sessionA.order[0].price).toBe(4.10);

    // Tenant B kent geen "grote friet" → geen order of prijs 0
    if (sessionB.order.length > 0) {
      expect(sessionB.order[0].price).toBe(0);
    }
  });

  test('Tenant B menu does not leak to Tenant A', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);

    const sessionA = createEmptySession();
    const sessionB = createEmptySession();

    engineA.handle(sessionA, 'een pizza');
    engineB.handle(sessionB, 'een pizza');

    if (sessionA.order.length > 0) {
      expect(sessionA.order[0].price).toBe(0);
    }
    expect(sessionB.order.length).toBe(1);
    expect(sessionB.order[0].price).toBe(12.00);
  });

  test('Tenant A sessions are independent from Tenant B', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);

    const sessionA = createEmptySession();
    const sessionB = createEmptySession();

    engineA.handle(sessionA, 'twee cola');
    engineB.handle(sessionB, 'een water');

    expect(sessionA.order.length).toBe(1);
    expect(sessionA.order[0].product).toBe('cola');
    expect(sessionA.order[0].quantity).toBe(2);

    expect(sessionB.order.length).toBe(1);
    expect(sessionB.order[0].product).toBe('water');
    expect(sessionB.order[0].quantity).toBe(1);
  });

  test('Tenant A prep time does not affect Tenant B', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);

    // Tenant A: delivery_enabled=false → na naam+tel direct DONE
    const sessionA = createEmptySession();
    sessionA.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    sessionA.state = OrderState.GET_NAME_PHONE;
    sessionA.name = 'Test';
    sessionA.phone = '0412345678';
    const resultA = engineA.handle(sessionA, 'dummy');
    expect(resultA.response).toContain('15 minuten');

    // Tenant B: delivery_enabled=true → afhalen
    const sessionB = createEmptySession();
    sessionB.order = [{ product: 'water', quantity: 1, price: 1.50 }];
    sessionB.state = OrderState.DELIVERY_TYPE;
    sessionB.name = 'Test';
    sessionB.phone = '0412345678';
    const resultB = engineB.handle(sessionB, 'afhalen');
    expect(resultB.response).toContain('30 minuten');
  });
});

// ============================================================
// SECTOR: FRITUUR — parser tests
// ============================================================

describe('Sector: Frituur — parser', () => {
  const menu = ['grote friet', 'zoete mayonaise', 'tom ketchup', 'cervela', 'cola', 'cheeseburger', 'samurai saus'];
  const prices: Record<string, number> = {
    'grote friet': 4.10, 'zoete mayonaise': 1.10, 'tom ketchup': 1.10,
    'cervela': 3.00, 'cola': 2.00, 'cheeseburger': 5.00, 'samurai saus': 1.10,
  };
  const modifiers = new Set(['zoete mayonaise', 'tom ketchup', 'samurai saus']);
  const config: BusinessConfig = {
    name: 'Frituur Test', ai_name: 'Anja', welcome_message: 'Hallo, met Frituur Test',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('bestelling → direct naar GET_NAME_PHONE', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    const result = engine.handle(session, 'twee cola');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].quantity).toBe(2);
    expect(session.state).toBe(OrderState.GET_NAME_PHONE);
    expect(result.response).toContain('genoteerd');
    expect(result.response).toContain('naam');
  });

  test('sums base product + sauce prices via is_modifier', () => {
    const items = extractItems('een grote friet met zoete mayonaise', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(5.20, 2);
  });

  test('base product + two modifiers', () => {
    const items = extractItems('grote friet met zoete mayonaise en tom ketchup', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(6.30, 2);
  });

  test('splits items on periods', () => {
    const items = extractItems('Een grote friet. Een cervela. Twee cola.', menu, prices, modifiers);
    expect(items).toHaveLength(3);
  });

  test('splits items on comma', () => {
    const items = extractItems('een cervela, twee cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toBe('cervela');
    expect(items[1].product).toBe('cola');
    expect(items[1].quantity).toBe(2);
  });

  test('receipt notes show correct totals', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    session.order = [
      { product: 'grote friet met zoete mayonaise', quantity: 1, price: 5.20 },
      { product: 'cervela', quantity: 1, price: 3.00 },
      { product: 'cola', quantity: 2, price: 2.00 },
    ];
    const { notes, total } = engine.buildReceiptNotes(session);
    expect(total).toBe(12.20);
    expect(notes).toContain('€5.20');
    expect(notes).toContain('€3.00');
    expect(notes).toContain('€4.00');
  });

  test('modifier-only order: sauce without base gets sauce price', () => {
    const items = extractItems('een samurai saus', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(1.10);
  });

  // ========================================================
  // ITEM SPLIT TESTS
  // ========================================================

  test('"en" splitst twee producten met hoeveelheid', () => {
    const items = extractItems('een grote friet en een cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toContain('grote friet');
    expect(items[1].product).toBe('cola');
  });

  test('"en" splitst twee producten zonder hoeveelheid', () => {
    const items = extractItems('grote friet en cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
  });

  test('"en" tussen modifiers mergt terug naar base', () => {
    const items = extractItems('grote friet met zoete mayonaise en samurai saus', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].product).toContain('grote friet');
    expect(items[0].product).toContain('samurai saus');
    expect(items[0].price).toBeCloseTo(6.30, 2);
  });

  test('drie items via "en"', () => {
    const items = extractItems('cola en cervela en cheeseburger', menu, prices, modifiers);
    expect(items).toHaveLength(3);
  });

  test('"en" met verschillende hoeveelheden', () => {
    const items = extractItems('twee grote friet en drie cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].quantity).toBe(2);
    expect(items[1].quantity).toBe(3);
  });

  // ========================================================
  // ZONDER TESTS
  // ========================================================

  test('"zonder" voorkomt modifier-prijs', () => {
    const items = extractItems('grote friet zonder zoete mayonaise', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(4.10);
    expect(items[0].product).toContain('zonder');
  });

  test('"zonder" met andere modifier wel meegeteld', () => {
    const items = extractItems('grote friet met samurai saus zonder zoete mayonaise', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(5.20, 2);
  });

  test('"zonder" op base product, alleen base prijs', () => {
    const items = extractItems('cervela zonder samurai saus', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(3.00);
  });

  // ========================================================
  // ONHERKENBARE INPUT
  // ========================================================

  test('onherkenbare input → herhalen', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    const result = engine.handle(session, 'blabla onzin tekst');
    expect(result.response).toContain('niet goed verstaan');
    expect(session.order).toHaveLength(0);
    expect(session.state).toBe(OrderState.TAKING_ORDER);
  });
});

// ============================================================
// GET_NAME_PHONE — naam + telefoon samen
// ============================================================

describe('GET_NAME_PHONE — naam + telefoon', () => {
  const menu = ['cola'];
  const prices = { 'cola': 2.00 };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('naam + telefoon in één zin', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];

    engine.handle(session, 'Rudi 0476123456');
    expect(session.name).toBe('Rudi');
    expect(session.phone).toBe('0476123456');
    expect(session.state).toBe(OrderState.DELIVERY_TYPE);
  });

  test('alleen naam → vraagt telefoon', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];

    const result = engine.handle(session, 'Frederic');
    expect(session.name).toBe('Frederic');
    expect(session.phone).toBeNull();
    expect(result.response).toContain('telefoonnummer');
  });

  test('daarna telefoon → door naar DELIVERY_TYPE', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    session.name = 'Frederic';

    engine.handle(session, '0412 34 56 78');
    expect(session.phone).toBe('0412345678');
    expect(session.state).toBe(OrderState.DELIVERY_TYPE);
  });

  test('"mijn naam is Frederic" → Frederic', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];

    engine.handle(session, 'mijn naam is Frederic');
    expect(session.name).toBe('Frederic');
  });

  test('"ja" → opnieuw vragen (ongeldig)', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];

    const result = engine.handle(session, 'ja');
    expect(session.name).toBeNull();
    expect(result.response).toContain('naam');
  });

  test('delivery_enabled=false → skip DELIVERY_TYPE naar DONE', () => {
    const noDeliveryConfig = { ...config, delivery_enabled: false };
    const engine = new VoiceOrderSystem(menu, prices, noDeliveryConfig);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME_PHONE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];

    engine.handle(session, 'Rudi 0476123456');
    expect(session.state).toBe(OrderState.DONE);
    expect(session.delivery_type).toBe('afhalen');
  });
});

// ============================================================
// VOLLEDIGE FLOW — exact zoals gebruiker beschreef
// ============================================================

describe('Volledige flow — afhalen', () => {
  const menu = ['grote friet', 'cola', 'cervela'];
  const prices = { 'grote friet': 4.10, 'cola': 2.00, 'cervela': 3.00 };
  const config: BusinessConfig = {
    name: 'Frituur Nolim', ai_name: 'Anja',
    welcome_message: 'Hallo met Frituur Nolim, met Anja. Wat is uw bestelling?',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('klant bestelt → naam+tel → afhalen → klaar', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();

    // Klant zegt bestelling in één keer
    const r1 = engine.handle(session, 'een grote friet en twee cola');
    expect(session.order).toHaveLength(2);
    expect(session.state).toBe(OrderState.GET_NAME_PHONE);
    expect(r1.response).toContain('genoteerd');

    // Naam + telefoon
    engine.handle(session, 'Rudi 0476123456');
    expect(session.state).toBe(OrderState.DELIVERY_TYPE);

    // Afhalen
    const r3 = engine.handle(session, 'afhalen');
    expect(session.state).toBe(OrderState.DONE);
    expect(r3.response).toContain('20 minuten');
    expect(r3.response).toContain('eet smakelijk');
  });
});

describe('Volledige flow — levering', () => {
  const menu = ['grote friet', 'cola'];
  const prices = { 'grote friet': 4.10, 'cola': 2.00 };
  const config: BusinessConfig = {
    name: 'Frituur Nolim', ai_name: 'Anja', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('klant bestelt → naam+tel → leveren → adres → klaar', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();

    // Bestelling
    engine.handle(session, 'een grote friet en een cola');
    expect(session.state).toBe(OrderState.GET_NAME_PHONE);

    // Naam + telefoon
    engine.handle(session, 'Rudi 0476123456');
    expect(session.state).toBe(OrderState.DELIVERY_TYPE);

    // Leveren
    engine.handle(session, 'levering');
    expect(session.state).toBe(OrderState.GET_ADDRESS);

    // Adres
    const r = engine.handle(session, 'Kerkstraat 15 Antwerpen');
    expect(session.state).toBe(OrderState.DONE);
    expect(session.address).toBe('Kerkstraat 15 Antwerpen');
    expect(r.response).toContain('30 minuten');
    expect(r.response).toContain('eet smakelijk');
  });
});

// ============================================================
// LEIDENDE CONNECTORS
// ============================================================

describe('Leidende connectors — correct gestript', () => {
  const menu = ['cola', 'fanta', 'cervela'];
  const prices = { 'cola': 2.00, 'fanta': 2.00, 'cervela': 3.00 };

  test('"en twee cola" → 2x cola', () => {
    const items = extractItems('en twee cola', menu, prices);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(items[0].product).toBe('cola');
  });

  test('"ook een cola" → 1x cola', () => {
    const items = extractItems('ook een cola', menu, prices);
    expect(items).toHaveLength(1);
    expect(items[0].product).toBe('cola');
  });

  test('"doe daar nog een cola bij" → 1x cola', () => {
    const items = extractItems('doe daar nog een cola bij', menu, prices);
    expect(items).toHaveLength(1);
    expect(items[0].product).toBe('cola');
  });

  test('"zet er twee cola bij" → 2x cola', () => {
    const items = extractItems('zet er twee cola bij', menu, prices);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(items[0].product).toBe('cola');
  });
});

// ============================================================
// DUBBELE "saus saus" FIX
// ============================================================

describe('Dubbele saus fix', () => {
  const menu = ['grote friet', 'samurai saus', 'andalouse saus', 'cocktail saus'];
  const prices = { 'grote friet': 4.10, 'samurai saus': 1.10, 'andalouse saus': 1.10, 'cocktail saus': 1.10 };
  const modifiers = new Set(['samurai saus', 'andalouse saus', 'cocktail saus']);
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('"met samurai" → "samurai saus" (niet "saus saus")', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'grote friet met samurai');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].product).toContain('samurai saus');
    expect(session.order[0].product).not.toContain('saus saus');
  });

  test('"met samurai saus" → geen dubbeling', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'grote friet met samurai saus');
    expect(session.order[0].product).not.toContain('saus saus');
  });
});

// ============================================================
// DELIVERY_TYPE — regex
// ============================================================

describe('DELIVERY_TYPE — herkent alle varianten', () => {
  const menu = ['cola'];
  const prices = { 'cola': 2.00 };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  function deliveryTest(input: string): { type: string | null; state: OrderState } {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.DELIVERY_TYPE;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    session.name = 'Test';
    session.phone = '0412345678';
    engine.handle(session, input);
    return { type: session.delivery_type, state: session.state };
  }

  test('"levering" → levering', () => {
    const r = deliveryTest('levering');
    expect(r.type).toBe('levering');
    expect(r.state).toBe(OrderState.GET_ADDRESS);
  });

  test('"leveren" → levering', () => {
    expect(deliveryTest('leveren').type).toBe('levering');
  });

  test('"thuis leveren" → levering', () => {
    expect(deliveryTest('thuis leveren').type).toBe('levering');
  });

  test('"bezorgen" → levering', () => {
    expect(deliveryTest('bezorgen').type).toBe('levering');
  });

  test('"ophalen" → afhalen', () => {
    const r = deliveryTest('ophalen');
    expect(r.type).toBe('afhalen');
    expect(r.state).toBe(OrderState.DONE);
  });

  test('"afhalen" → afhalen', () => {
    expect(deliveryTest('afhalen').type).toBe('afhalen');
  });
});

// ============================================================
// SECTOR: KAPPER
// ============================================================

describe('Sector: Kapper — parser', () => {
  const menu = ['heren knipbeurt', 'dames knipbeurt', 'baard trim', 'kleuring', 'föhnen', 'kinderknippen'];
  const prices: Record<string, number> = {
    'heren knipbeurt': 25.00, 'dames knipbeurt': 45.00, 'baard trim': 15.00,
    'kleuring': 35.00, 'föhnen': 12.00, 'kinderknippen': 18.00,
  };
  const modifiers = new Set(['kleuring', 'föhnen']);
  const config: BusinessConfig = {
    name: 'Salon Bellissimo', ai_name: 'Lisa', welcome_message: 'Goeiedag, met Salon Bellissimo',
    prep_time_pickup: 0, prep_time_delivery: 0, delivery_enabled: false,
  };

  test('single service', () => {
    const items = extractItems('een heren knipbeurt', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(25.00);
  });

  test('service + modifier', () => {
    const items = extractItems('een dames knipbeurt met kleuring', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(80.00, 2);
  });

  test('service + two modifiers', () => {
    const items = extractItems('dames knipbeurt met kleuring en föhnen', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(92.00, 2);
  });

  test('multiple services', () => {
    const items = extractItems('een heren knipbeurt, een baard trim', menu, prices, modifiers);
    expect(items).toHaveLength(2);
  });

  test('quantity works', () => {
    const items = extractItems('twee kinderknippen', menu, prices, modifiers);
    expect(items[0].quantity).toBe(2);
  });

  test('full flow → direct naar GET_NAME_PHONE', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();

    engine.handle(session, 'een dames knipbeurt met föhnen');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(57.00, 2);
    expect(session.state).toBe(OrderState.GET_NAME_PHONE);
  });
});

// ============================================================
// SECTOR: GARAGE
// ============================================================

describe('Sector: Garage — parser', () => {
  const menu = ['kleine beurt', 'grote beurt', 'apk keuring', 'bandenwissel', 'olie verversen', 'airco service', 'remblokken'];
  const prices: Record<string, number> = {
    'kleine beurt': 95.00, 'grote beurt': 175.00, 'apk keuring': 35.00,
    'bandenwissel': 45.00, 'olie verversen': 55.00, 'airco service': 85.00, 'remblokken': 120.00,
  };
  const modifiers = new Set(['olie verversen']);
  const config: BusinessConfig = {
    name: 'Garage Peeters', ai_name: 'Tom', welcome_message: 'Goeiedag, met Garage Peeters',
    prep_time_pickup: 0, prep_time_delivery: 0, delivery_enabled: false,
  };

  test('single service', () => {
    const items = extractItems('een grote beurt', menu, prices, modifiers);
    expect(items[0].price).toBe(175.00);
  });

  test('service + modifier', () => {
    const items = extractItems('een kleine beurt met olie verversen', menu, prices, modifiers);
    expect(items[0].price).toBeCloseTo(150.00, 2);
  });

  test('multiple services', () => {
    const items = extractItems('een apk keuring, een bandenwissel', menu, prices, modifiers);
    expect(items).toHaveLength(2);
  });

  test('full flow → direct naar GET_NAME_PHONE', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();

    engine.handle(session, 'een grote beurt met olie verversen');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(230.00, 2);
    expect(session.state).toBe(OrderState.GET_NAME_PHONE);
  });
});
