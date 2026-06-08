export interface DishMenuResponse {
  id: number;
  name: string;
  status: string;
  supplies: DishSupplyResponse[];
}

export interface DishSupplyResponse {
  productId: number;
  productName: string;
  quantityNeeded: number;
  unit: string;
}