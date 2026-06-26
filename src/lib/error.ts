export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleDatabaseError(error: unknown, operationType: OperationType, table: string | null): never {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const errInfo = {
    errorCode: error instanceof Error ? error.message : 'UNKNOWN_SUPABASE_ERROR',
    requestId,
    operationType,
    table
  };
  console.error('Database Error', JSON.stringify(errInfo));
  throw new Error(`تعذر تنفيذ العملية. رمز التتبع: ${requestId}`);
}
