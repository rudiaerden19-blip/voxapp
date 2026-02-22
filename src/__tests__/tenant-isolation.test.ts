import { requireTenant, requireTenantFromBusiness, TenantError } from '../lib/tenant';
import { VoiceOrderSystem, createEmptySession, OrderState, type BusinessConfig } from '../lib/voice-engine/VoiceOrderSystem';

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

    // Tenant A should recognize "grote friet"
    expect(resultA.session.order.length).toBe(1);
    expect(resultA.session.order[0].product).toContain('grote friet');
    expect(resultA.session.order[0].price).toBe(4.10);

    // Tenant B: "grote friet" is not in their menu → price must be 0 (no leakage from A)
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

    // Tenant A: "pizza" is not in their menu → price must be 0 (no leakage from B)
    if (sessionA.order.length > 0) {
      expect(sessionA.order[0].price).toBe(0);
      expect(sessionA.order[0].price).not.toBe(pricesB['pizza']);
    }

    // Tenant B: "pizza" is in menu → order has item
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

    // Sessions are completely independent
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
    const engine = new VoiceOrderSystem(menuA, pricesA, configA); // delivery_enabled: false
    const session = createEmptySession();

    engine.handle(session, 'een cola');
    const result = engine.handle(session, 'nee dat was het');

    // Should skip to GET_NAME, not DELIVERY_TYPE
    expect(result.session.state).toBe(OrderState.GET_NAME);
    expect(result.session.delivery_type).toBe('afhalen');
  });
});

// ============================================================
// PARSER TESTS
// ============================================================

describe('VoiceOrderSystem — parser correctness', () => {
  const menu = ['grote friet', 'zoete mayonaise', 'tom ketchup', 'cervela', 'cola', 'cheeseburger', 'samurai saus'];
  const prices: Record<string, number> = {
    'grote friet': 4.10, 'zoete mayonaise': 1.10, 'tom ketchup': 1.10,
    'cervela': 3.00, 'cola': 2.00, 'cheeseburger': 5.00, 'samurai saus': 1.10,
  };
  const config: BusinessConfig = {
    name: 'Test', ai_name: 'Test', welcome_message: 'Test',
    prep_time_pickup: 20, prep_time_delivery: 30, delivery_enabled: true,
  };

  test('parses single item with quantity', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'twee cola');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].quantity).toBe(2);
    expect(session.order[0].price).toBe(2.00);
  });

  test('sums base product + sauce prices', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'een grote friet met zoete mayonaise');
    expect(session.order).toHaveLength(1);
    expect(session.order[0].price).toBeCloseTo(5.20, 2); // 4.10 + 1.10
  });

  test('splits items on periods', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    engine.handle(session, 'Een grote friet. Een cervela. Twee cola.');
    expect(session.order).toHaveLength(3);
  });

  test('receipt notes show correct totals', () => {
    const engine = new VoiceOrderSystem(menu, prices, config);
    const session = createEmptySession();
    session.order = [
      { product: 'grote friet met zoete mayonaise', quantity: 1, price: 5.20 },
      { product: 'cervela', quantity: 1, price: 3.00 },
      { product: 'cola', quantity: 2, price: 2.00 },
    ];
    const { notes, total } = engine.buildReceiptNotes(session);
    expect(total).toBe(12.20); // 5.20 + 3.00 + 4.00
    expect(notes).toContain('€5.20');
    expect(notes).toContain('€3.00');
    expect(notes).toContain('€4.00');
  });
});
