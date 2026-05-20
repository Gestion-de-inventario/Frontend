export interface OfflineRequest {
  id?: number;

  url: string;

  method: string;

  body: any;

  createdAt: Date;
}
