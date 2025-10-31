export enum AppState {
  SETUP,
  VOTING,
  RESULTS,
}

export interface Candidate {
  id: number;
  name: string;
}

export interface Voter {
  phone: string;
  name: string;
}

export interface Vote {
  voterPhone: string;
  candidateIds: number[];
}

export interface Result extends Candidate {
    votes: number;
    percentage: number;
}

export enum SortKey {
    NAME = 'name',
    PERCENTAGE = 'percentage',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}
