import { AuditsResponse } from './audits.response';

export interface AuditsPageResponse {
  content: AuditsResponse[];

  totalPages: number;
  totalElements: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;

  numberOfElements: number;

  empty: boolean;
}
