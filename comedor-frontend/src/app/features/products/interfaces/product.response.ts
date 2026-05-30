export interface ProductResponse {
  id: number;
  name: string;
  status: string;
  categoryId: number;
  categoryName: string;
  categoryState: string;
  tagId: number | null;
  tagName: string | null;
  tagState: string | null;
  unit: string;
  stock: number;
  reorderPoint: number;
}