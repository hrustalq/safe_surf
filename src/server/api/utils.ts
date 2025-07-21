import { z } from "zod";

// Common pagination schema
export const paginatedQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Paginated response wrapper
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  });

// Common types
export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

// Helper function to create paginated response
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    hasMore,
  };
}

// Common sort schemas
export const sortOrderSchema = z.enum(["asc", "desc"]);
export const sortBySchema = z.string(); 