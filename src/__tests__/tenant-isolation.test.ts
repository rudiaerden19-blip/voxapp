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

    const resultA = engineA.handle(sessionA, 'een grote friet');
    const resultB = engineB.handle(sessionB, 'een grote friet');

    expect(resultA.session.order.length).toBe(1);
    expect(resultA.session.order[0].product).toContain('grote friet');
    expect(resultA.session.order[0].price).toBe(4.10);

    if (resultB.session.order.length > 0) {
      expect(resultB.session.order[0].price).toBe(0);
      expect(resultB.session.order[0].price).not.toBe(pricesA['grote friet']);
    }
  });

  test('Tenant B menu does not leak to Tenant A', () => {
    const engineA = new VoiceOrderSystem(menuA, pricesA, configA);
    const engineB = new VoiceOrderSystem(menuB, pricesB, configB);

    const sessionA = createEmptySession();
    const sessionB = createEmptySession();

    engineA.handle(sessionA, 'een pizza');
    const resultB = engineB.handle(sessionB, 'een pizza');

    if (sessionA.order.length > 0) {
      expect(sessionA.order[0].price).toBe(0);
      expect(sessionA.order[0].price).not.toBe(pricesB['pizza']);
    }

    expect(resultB.session.order.length).toBe(1);
    expect(resultB.session.order[0].price).toBe(12.00);
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

    const sessionA = createEmptySession();
    sessionA.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    sessionA.delivery_type = 'afhalen';
    sessionA.name = 'Test';
    sessionA.state = OrderState.CONFIRM;

    const sessionB = createEmptySession();
    sessionB.order = [{ product: 'water', quantity: 1, price: 1.50 }];
    sessionB.delivery_type = 'afhalen';
    sessionB.name = 'Test';
    sessionB.state = OrderState.CONFIRM;

    const resultA = engineA.handle(sessionA, 'ja klopt');
    const resultB = engineB.handle(sessionB, 'ja klopt');

    expect(resultA.response).toContain('15 minuten');
    expect(resultB.response).toContain('30 minuten');
  });

  test('delivery_enabled=false skips DELIVERY_TYPE state', () => {
    const engine = new VoiceOrderSystem(menuA, pricesA, configA);
    const session = createEmptySession();

    engine.handle(session, 'een cola');
    const result = engine.handle(session, 'nee dat was het');

    expect(result.session.state).toBe(OrderState.GET_NAME);
    expect(result.session.delivery_type).toBe('afhalen');
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

  test('parses single item with quantity', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'twee cola');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].quantity).toBe(2);
    expect(session.order[0].price).toBe(2.00);
  });

  test('sums base product + sauce prices via is_modifier', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'een grote friet met zoete mayonaise');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(5.20, 2);
  });

  test('base product + two modifiers', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'grote friet met zoete mayonaise en tom ketchup');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(6.30, 2); // 4.10 + 1.10 + 1.10
  });

  test('splits items on periods', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    engine.handle(session, 'Een grote friet. Een cervela. Twee cola.');
    expect(session.order).toHaveLength(3);
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
  // FASE 1 — KRITIEKE ORDER BUGS (10 testcases)
  // ========================================================

  // FIX 1: "en" splitst altijd
  test('FIX1: "en" splitst twee producten met hoeveelheid', () => {
    const items = extractItems('een grote friet en een cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toContain('grote friet');
    expect(items[0].price).toBe(4.10);
    expect(items[1].product).toBe('cola');
    expect(items[1].price).toBe(2.00);
  });

  test('FIX1: "en" splitst twee producten zonder hoeveelheid', () => {
    const items = extractItems('grote friet en cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toContain('grote friet');
    expect(items[1].product).toBe('cola');
  });

  test('FIX1: "en" tussen modifiers mergt terug naar base', () => {
    const items = extractItems('grote friet met zoete mayonaise en samurai saus', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].product).toContain('grote friet');
    expect(items[0].product).toContain('samurai saus');
    expect(items[0].price).toBeCloseTo(6.30, 2); // 4.10 + 1.10 + 1.10
  });

  test('FIX1: drie items via "en"', () => {
    const items = extractItems('cola en cervela en cheeseburger', menu, prices, modifiers);
    expect(items).toHaveLength(3);
    expect(items[0].price).toBe(2.00);
    expect(items[1].price).toBe(3.00);
    expect(items[2].price).toBe(5.00);
  });

  test('FIX1: "en" met verschillende hoeveelheden', () => {
    const items = extractItems('twee grote friet en drie cola', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].quantity).toBe(2);
    expect(items[0].price).toBe(4.10);
    expect(items[1].quantity).toBe(3);
    expect(items[1].price).toBe(2.00);
  });

  // FIX 2: "zonder" sluit modifier uit
  test('FIX2: "zonder" voorkomt modifier-prijs', () => {
    const items = extractItems('grote friet zonder zoete mayonaise', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(4.10);
    expect(items[0].product).toContain('zonder');
  });

  test('FIX2: "zonder" met andere modifier wel meegeteld', () => {
    const items = extractItems('grote friet met samurai saus zonder zoete mayonaise', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(5.20, 2); // 4.10 + 1.10 (samurai), NIET +1.10 (mayo)
  });

  test('FIX2: "zonder" op base product, alleen base prijs', () => {
    const items = extractItems('cervela zonder samurai saus', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(3.00);
  });

  // FIX 3: Nooit "genoteerd" als niets geparsed
  test('FIX3: onherkenbare input → "niet begrepen" (lege order)', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    const result = engine.handle(session, 'blabla onzin tekst');
    expect(result.response).toContain('niet goed begrepen');
    expect(session.order).toHaveLength(0);
  });

  test('FIX3: onherkenbare input → "niet begrepen" (order heeft items)', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    const result = engine.handle(session, 'hmm euh wacht even');
    expect(result.response).toContain('niet goed begrepen');
    expect(session.order).toHaveLength(1); // bestaande order ongewijzigd
  });
});

// ============================================================
// FASE 2 — GET_NAME STABILISATIE
// ============================================================

describe('GET_NAME — naam validatie', () => {
  const menu = ['cola'];
  const prices = { 'cola': 2.00 };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: false,
  };

  function nameTest(input: string): { name: string | null; state: OrderState } {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.GET_NAME;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    session.delivery_type = 'afhalen';
    engine.handle(session, input);
    return { name: session.name, state: session.state };
  }

  test('"ja" → opnieuw vragen', () => {
    const r = nameTest('ja');
    expect(r.name).toBeNull();
    expect(r.state).toBe(OrderState.GET_NAME);
  });

  test('"nee dat klopt niet" → opnieuw vragen', () => {
    const r = nameTest('nee dat klopt niet');
    expect(r.name).toBeNull();
    expect(r.state).toBe(OrderState.GET_NAME);
  });

  test('"eh even denken" → opnieuw vragen', () => {
    const r = nameTest('eh even denken');
    expect(r.name).toBeNull();
    expect(r.state).toBe(OrderState.GET_NAME);
  });

  test('"mijn naam is Frederic" → Frederic', () => {
    const r = nameTest('mijn naam is Frederic');
    expect(r.name).toBe('Frederic');
    expect(r.state).toBe(OrderState.CONFIRM);
  });

  test('"het is Jan Peeters" → Jan Peeters', () => {
    const r = nameTest('het is Jan Peeters');
    expect(r.name).toBe('Jan Peeters');
    expect(r.state).toBe(OrderState.CONFIRM);
  });

  test('"ik ben Tom" → Tom', () => {
    const r = nameTest('ik ben Tom');
    expect(r.name).toBe('Tom');
    expect(r.state).toBe(OrderState.CONFIRM);
  });

  test('"Frederic" → Frederic', () => {
    const r = nameTest('Frederic');
    expect(r.name).toBe('Frederic');
    expect(r.state).toBe(OrderState.CONFIRM);
  });

  test('"Frederic Janssens" → Frederic Janssens', () => {
    const r = nameTest('Frederic Janssens');
    expect(r.name).toBe('Frederic Janssens');
    expect(r.state).toBe(OrderState.CONFIRM);
  });
});

// ============================================================
// FASE 2 — CONFIRM LOGICA FIX
// ============================================================

describe('CONFIRM — order behouden bij "nee"', () => {
  const menu = ['grote friet', 'cola', 'cervela'];
  const prices = { 'grote friet': 4.10, 'cola': 2.00, 'cervela': 3.00 };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: false,
  };

  test('"nee" behoudt order en gaat terug naar TAKING_ORDER', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.CONFIRM;
    session.order = [
      { product: 'grote friet', quantity: 1, price: 4.10 },
      { product: 'cola', quantity: 2, price: 2.00 },
    ];
    session.name = 'Frederic';
    session.delivery_type = 'afhalen';

    const result = engine.handle(session, 'nee');

    expect(result.session.state).toBe(OrderState.TAKING_ORDER);
    expect(result.session.order).toHaveLength(2);
    expect(result.session.order[0].product).toBe('grote friet');
    expect(result.session.order[1].product).toBe('cola');
    expect(result.response).toContain('aanpassen');
  });

  test('klant kan daarna nieuw item toevoegen', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.TAKING_ORDER;
    session.order = [
      { product: 'grote friet', quantity: 1, price: 4.10 },
      { product: 'cola', quantity: 2, price: 2.00 },
    ];

    engine.handle(session, 'een cervela');

    expect(session.order).toHaveLength(3);
    expect(session.order[2].product).toBe('cervela');
    expect(session.order[2].price).toBe(3.00);
  });

  test('"ja" bij confirm gaat nog steeds naar DONE', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.state = OrderState.CONFIRM;
    session.order = [{ product: 'cola', quantity: 1, price: 2.00 }];
    session.name = 'Test';
    session.delivery_type = 'afhalen';

    const result = engine.handle(session, 'ja klopt');
    expect(result.session.state).toBe(OrderState.DONE);
  });
});

// ============================================================
// LEIDENDE CONNECTORS — strip "en", "ook", "doe daar", etc.
// ============================================================

describe('Leidende connectors — correct gestript', () => {
  const menu = ['cola', 'fanta', 'cervela'];
  const prices = { 'cola': 2.00, 'fanta': 2.00, 'cervela': 3.00 };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'AI', welcome_message: 'Hallo',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('"en twee cola" → 2x cola', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'en twee cola');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].quantity).toBe(2);
    expect(session.order[0].product).toBe('cola');
  });

  test('"ook een cola" → 1x cola', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'ook een cola');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].product).toBe('cola');
  });

  test('"doe daar nog een cola bij" → 1x cola', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'doe daar nog een cola bij');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].product).toBe('cola');
  });

  test('"zet er twee cola bij" → 2x cola', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'zet er twee cola bij');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].quantity).toBe(2);
    expect(session.order[0].product).toBe('cola');
  });
});

// ============================================================
// DELIVERY_TYPE — regex fix
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
    engine.handle(session, input);
    return { type: session.delivery_type, state: session.state };
  }

  test('"levering" → levering', () => {
    const r = deliveryTest('levering');
    expect(r.type).toBe('levering');
    expect(r.state).toBe(OrderState.GET_NAME);
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
    expect(r.state).toBe(OrderState.GET_NAME);
  });

  test('"afhalen" → afhalen', () => {
    expect(deliveryTest('afhalen').type).toBe('afhalen');
  });
});

// ============================================================
// SECTOR: KAPPER — parser tests
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
    expect(items[0].product).toContain('heren knipbeurt');
    expect(items[0].price).toBe(25.00);
  });

  test('service + modifier (knipbeurt + kleuring)', () => {
    const items = extractItems('een dames knipbeurt met kleuring', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(80.00, 2); // 45 + 35
  });

  test('service + two modifiers', () => {
    const items = extractItems('dames knipbeurt met kleuring en föhnen', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(92.00, 2); // 45 + 35 + 12
  });

  test('multiple separate services', () => {
    const items = extractItems('een heren knipbeurt, een baard trim', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toContain('heren knipbeurt');
    expect(items[1].product).toContain('baard trim');
  });

  test('quantity works for kapper', () => {
    const items = extractItems('twee kinderknippen', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(items[0].price).toBe(18.00);
  });

  test('kapper menu does not match frituur items', () => {
    const items = extractItems('een grote friet', menu, prices, modifiers);
    for (const item of items) {
      expect(item.price).toBe(0);
    }
  });

  test('full state machine flow', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();

    engine.handle(session, 'een dames knipbeurt met föhnen');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(57.00, 2); // 45 + 12

    const result = engine.handle(session, 'nee dat was het');
    expect(result.session.state).toBe(OrderState.GET_NAME);
    expect(result.session.delivery_type).toBe('afhalen');
  });
});

// ============================================================
// SECTOR: GARAGE — parser tests
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
    expect(items).toHaveLength(1);
    expect(items[0].product).toContain('grote beurt');
    expect(items[0].price).toBe(175.00);
  });

  test('service + modifier', () => {
    const items = extractItems('een kleine beurt met olie verversen', menu, prices, modifiers);
    expect(items).toHaveLength(1);
    expect(items[0].price).toBeCloseTo(150.00, 2); // 95 + 55
  });

  test('multiple services via comma', () => {
    const items = extractItems('een apk keuring, een bandenwissel', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].product).toContain('apk keuring');
    expect(items[0].price).toBe(35.00);
    expect(items[1].product).toContain('bandenwissel');
    expect(items[1].price).toBe(45.00);
  });

  test('multiple services via period', () => {
    const items = extractItems('een airco service. een remblokken.', menu, prices, modifiers);
    expect(items).toHaveLength(2);
    expect(items[0].price).toBe(85.00);
    expect(items[1].price).toBe(120.00);
  });

  test('garage menu does not match kapper items', () => {
    const items = extractItems('een dames knipbeurt', menu, prices, modifiers);
    for (const item of items) {
      expect(item.price).toBe(0);
    }
  });

  test('full state machine flow', () => {
    const engine = new VoiceOrderSystem(menu, prices, config, modifiers);
    const session = createEmptySession();

    engine.handle(session, 'een grote beurt met olie verversen');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(230.00, 2); // 175 + 55

    const result = engine.handle(session, 'dat was het');
    expect(result.session.state).toBe(OrderState.GET_NAME);
  });
});
