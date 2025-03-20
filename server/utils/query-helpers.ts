/**
 * Query helper functions for efficient database filtering
 */
import { SQL, sql } from 'drizzle-orm';
import { cars } from '@shared/schema';
import { ilike, and, or, eq, between, gte, lte, inArray } from 'drizzle-orm/expressions';

// Export the interface for use in other files
export interface CarFilterOptions {
  minPrice?: number;
  maxPrice?: number;
  make?: string[];
  model?: string[];
  available?: boolean;
  features?: string[];
  year?: number | number[];
  minRating?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  hostId?: number;
  searchQuery?: string;
  type?: string; // Car type (Sedan, SUV, etc.) - matches 'type' in schema
  limit?: number;
  offset?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

/**
 * Build a SQL where clause for car filtering
 * @param filters Filter options for cars query
 * @returns SQL condition for WHERE clause
 */
export function buildCarFilterConditions(filters: CarFilterOptions): SQL<unknown> {
  const conditions: SQL<unknown>[] = [];
  
  // Price range filtering
  if (filters.minPrice !== undefined) {
    conditions.push(gte(cars.dailyRate, filters.minPrice));
  }
  
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(cars.dailyRate, filters.maxPrice));
  }
  
  // Make and model filtering
  if (filters.make && filters.make.length > 0) {
    conditions.push(inArray(cars.make, filters.make));
  }
  
  if (filters.model && filters.model.length > 0) {
    conditions.push(inArray(cars.model, filters.model));
  }
  
  // Year filtering
  if (filters.year !== undefined) {
    if (Array.isArray(filters.year)) {
      conditions.push(inArray(cars.year, filters.year));
    } else {
      conditions.push(eq(cars.year, filters.year));
    }
  }
  
  // Host filtering
  if (filters.hostId !== undefined) {
    conditions.push(eq(cars.hostId, filters.hostId));
  }
  
  // Features filtering - using array containment
  if (filters.features && filters.features.length > 0) {
    // For each feature we want, check if it's in the array
    const featuresConditions: SQL<unknown>[] = filters.features.map(feature => 
      sql`${feature} = ANY(${cars.features})`
    );
    
    if (featuresConditions.length === 1) {
      conditions.push(featuresConditions[0]);
    } else if (featuresConditions.length > 1) {
      conditions.push(and(...featuresConditions));
    }
  }
  
  // Transmission filtering
  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission));
  }
  
  // Fuel type filtering
  if (filters.fuelType) {
    conditions.push(eq(cars.fuelType, filters.fuelType));
  }
  
  // Seats filtering
  if (filters.seats) {
    conditions.push(gte(cars.seats, filters.seats));
  }
  
  // Car type filtering (Sedan, SUV, etc.)
  if (filters.type) {
    conditions.push(eq(cars.type, filters.type));
  }
  
  // Min rating filtering
  if (filters.minRating !== undefined) {
    conditions.push(gte(cars.rating, filters.minRating));
  }
  
  // Text search (fuzzy search on make, model, and description)
  if (filters.searchQuery) {
    const searchTerm = `%${filters.searchQuery}%`;
    const searchCondition = or(
      ilike(cars.make, searchTerm),
      ilike(cars.model, searchTerm),
      ilike(cars.description, searchTerm)
    );
    conditions.push(searchCondition);
  }
  
  // Combine all conditions with AND or return TRUE if no conditions
  return conditions.length ? and(...conditions) : sql`TRUE`;
}

/**
 * Build a SQL order by clause based on sort parameter
 * @param sort Sort option
 * @returns SQL for ORDER BY clause
 */
export function buildCarSortClause(sort?: string): SQL<unknown> {
  switch (sort) {
    case 'price_asc':
      return sql`${cars.dailyRate} ASC`;
    case 'price_desc':
      return sql`${cars.dailyRate} DESC`;
    case 'rating_desc':
      return sql`${cars.rating} DESC NULLS LAST`;
    case 'newest':
      return sql`${cars.id} DESC`; // Assuming higher IDs are newer entries
    default:
      // Default sort: Rating DESC, then price ASC
      return sql`${cars.rating} DESC NULLS LAST, ${cars.dailyRate} ASC`;
  }
}

/**
 * Build a SQL pagination clause
 * @param limit Maximum number of results
 * @param offset Number of results to skip
 * @returns SQL for LIMIT and OFFSET
 */
export function buildPaginationClause(limit = 50, offset = 0): SQL<unknown> {
  // Cap the maximum limit to prevent performance issues
  const safeLimit = Math.min(limit || 50, 100);
  const safeOffset = offset || 0;
  return sql`LIMIT ${safeLimit} OFFSET ${safeOffset}`;
}