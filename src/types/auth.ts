
export type UserRoleType = 'student' | 'management' | 'teacher' | 'admin' | 'organization';

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

export interface ExtendedUser {
  uid: string;
  email: string;
  role?: UserRoleType;
  name?: string;
  demographics?: {
    name?: string;
    [key: string]: any;
  };
  user_metadata?: {
    isAdmin?: boolean;
    role?: string;
    [key: string]: any;
  };
}
