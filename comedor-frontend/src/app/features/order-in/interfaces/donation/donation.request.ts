import { CreateDonationDetailRequest } from './donation-detail.request';

export interface CreateDonationRequest {
  date: string;
  details: CreateDonationDetailRequest[];
}
