import { DonationResponse } from '../donation/donation.response';

export interface DonationPageResponse {
  content: DonationResponse[];

  totalPages: number;
  totalElements: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;

  numberOfElements: number;

  empty: boolean;
}
