export interface TransactionsResponse {
  id: number;
  dateTime: string;
  type: string;
  amount: number;
  currentStock: number;
  finalStock: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  personaName: string;
  personaLastName: string;
}
