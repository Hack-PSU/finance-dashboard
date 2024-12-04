// Import or define enums and interfaces
export enum SubmitterType {
  USER = "USER",
  ORGANIZER = "ORGANIZER",
}

export enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface FinanceEntity {
  id: string;
  submitterId: string;
  submitterType: SubmitterType;
  amount: number;
  description: string;
  category: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  status: Status;
  receiptUrl?: string;
  createdAt: number;
  hackathonId: string;
  updatedBy: string;
}
