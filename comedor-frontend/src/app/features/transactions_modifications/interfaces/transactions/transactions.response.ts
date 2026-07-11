export type TransactionType = 'ENTRADA' | 'SALIDA';

export type TransactionSource = 'COMPRA' | 'DONACION' | 'TRANSFERENCIA' | 'INVENTARIO';

export type TransactionReferenceType = 'INGREDIENTE' | 'MENU';

export interface TransactionsResponse {
  id: number;
  dateTime: string;

  type: TransactionType;
  source: TransactionSource;
  referenceType: TransactionReferenceType;

  amount: number;
  currentStock: number;
  finalStock: number;

  itemName: string;

  userId: number;
  userName: string;
  personaName: string;
  personaLastName: string;
}
