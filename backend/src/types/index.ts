import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  type: 'access' | 'refresh';
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}