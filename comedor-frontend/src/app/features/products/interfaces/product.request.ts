export interface ProductRequest {
  name: string;
  categoryId: number;
  tagId?: number | null;
  unit: string;
  stock: number;
  reorderPoint: number;
}