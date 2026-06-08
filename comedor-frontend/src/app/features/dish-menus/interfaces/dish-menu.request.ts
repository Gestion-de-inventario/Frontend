export interface CreateDishMenuRequest {
  name: string;
  supplies: DishSupplyRequest[];
}

export interface EditDishMenuRequest {
  name?: string;
  supplies?: DishSupplyRequest[];
}

export interface DishSupplyRequest {
  productId: number;
  quantityNeeded: number;
}