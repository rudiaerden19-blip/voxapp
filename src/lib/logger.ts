// ============================================================
// STRUCTURED LOGGER — Enterprise call logging
// ============================================================

export interface CallLog {
  conversation_id: string;
  tenant_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  state_transitions: string[];
  error_count: number;
  completion_status: 'in_progress' | 'completed' | 'error';
  items_count?: number;
  total_amount?: number;
}

export function createCallLog(conversationId: string, tenantId: string): CallLog {
  return {
    conversation_id: conversationId,
    tenant_id: tenantId,
    start_time: new Date().toISOString(),
    state_transitions: [],
    error_count: 0,
    completion_status: 'in_progress',
  };
}

export function logCall(log: CallLog): void {
  const entry = {
    level: 'info',
    service: 'voice-engine',
    ...log,
  };
  console.log(JSON.stringify(entry));
}

export function logError(tenantId: string, conversationId: string, error: unknown): void {
  const entry = {
    level: 'error',
    service: 'voice-engine',
    tenant_id: tenantId,
    conversation_id: conversationId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(entry));
}
