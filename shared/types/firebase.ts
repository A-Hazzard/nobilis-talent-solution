export type FirebaseUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
};

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