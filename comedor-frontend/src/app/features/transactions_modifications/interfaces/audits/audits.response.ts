export interface AuditsResponse {
  id: number;
  username: string;

  entityType: string;
  entityId: number;
  entityName: string;

  action: AuditAction;

  details: Record<string, unknown>;

  dateTime: string;
}

export enum AuditAction {
  CREACION = 'CREACION',
  MODIFICACION = 'MODIFICACION',
}
