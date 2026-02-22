// ============================================================
// TENANT CONTEXT — Enterprise multi-tenant enforcement
// ============================================================

export interface TenantContext {
  tenant_id: string;
  tenant_name?: string;
}

export class TenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantError';
  }
}

export function requireTenant(tenantId: string | null | undefined): TenantContext {
  if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
    throw new TenantError('TENANT_ID_REQUIRED');
  }
  return { tenant_id: tenantId.trim() };
}

export function requireTenantFromBusiness(business: { id: string; name: string } | null): TenantContext {
  if (!business || !business.id) {
    throw new TenantError('TENANT_ID_REQUIRED');
  }
  return { tenant_id: business.id, tenant_name: business.name };
}
