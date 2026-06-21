import { DonationDetailResponse } from './donation-detail.response';

export interface DonationResponse {
  id: number;
  donationDate: string;
  status: string;
  details: DonationDetailResponse[];
}
