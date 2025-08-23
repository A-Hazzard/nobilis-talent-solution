import { User as FirebaseAuthUser } from 'firebase/auth';

export type FirebaseUser = FirebaseAuthUser;

export type FirebaseAuthError = {
  code: string;
  message: string;
};

export type FirebaseDocument = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FirebaseQueryOptions = {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=';
    value: any;
  }[];
}; 