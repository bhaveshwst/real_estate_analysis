// ═══════════════════════════════════════════
//  API response envelope (matches backend TransformInterceptor)
// ═══════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | null;
  };
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ═══════════════════════════════════════════
//  Auth
// ═══════════════════════════════════════════

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'premium' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// ═══════════════════════════════════════════
//  Properties
// ═══════════════════════════════════════════

export type PropertyType =
  | 'single_family'
  | 'condo'
  | 'townhouse'
  | 'multi_family'
  | 'land'
  | 'commercial';

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'off_market';

export interface PropertySummary {
  id: string;
  attomId: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  estimatedValue: number | null;
  lastSalePrice: number | null;
  distanceMiles?: number;
}

export interface PropertyDetail extends PropertySummary {
  apn: string | null;
  addressLine2: string | null;
  county: string | null;
  lotSizeAcres: number | null;
  yearBuilt: number | null;
  stories: number | null;
  garageSpaces: number | null;
  hasPool: boolean;
  lastSaleDate: string | null;
  taxAssessedValue: number | null;
  taxYear: number | null;
  annualTaxAmount: number | null;
  estimatedRent: number | null;
  transactions: PropertyTransaction[];
  pricePerSqFt: number | null;
  capRate: number | null;
  attomSyncedAt: string | null;
}

export interface PropertyTransaction {
  id: string;
  transactionType: string;
  amount: number;
  transactionDate: string;
  buyer: string | null;
  seller: string | null;
}

// ═══════════════════════════════════════════
//  Search
// ═══════════════════════════════════════════

export interface PropertySearchParams {
  // Location
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  zipCode?: string;
  city?: string;
  state?: string;
  address?: string;
  // Filters
  propertyType?: PropertyType;
  status?: PropertyStatus;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minSqFt?: number;
  maxSqFt?: number;
  minYearBuilt?: number;
  // Pagination
  page?: number;
  limit?: number;
}

export interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// ═══════════════════════════════════════════
//  Analytics
// ═══════════════════════════════════════════

export interface MarketSnapshot {
  zipCode: string;
  state: string;
  currentMedianPrice: number;
  currentAvgPricePerSqFt: number;
  currentTotalListings: number;
  medianDaysOnMarket: number | null;
  monthOverMonthChange: number | null;
  yearOverYearChange: number | null;
  medianRent: number | null;
  grossYield: number | null;
  trendData: Array<{
    date: string;
    medianPrice: number;
    totalListings: number;
    pricePerSqFt: number;
  }>;
}

export interface PropertyValuation {
  propertyId: string;
  estimatedValue: number;
  confidenceRange: { low: number; high: number };
  pricePerSqFt: number | null;
  comparables: ComparableProperty[];
  investmentMetrics: InvestmentMetrics;
}

export interface ComparableProperty {
  id: string;
  address: string;
  salePrice: number;
  saleDate: string;
  squareFeet: number | null;
  bedrooms: number | null;
  distanceMiles: number;
}

export interface InvestmentMetrics {
  capRate: number | null;
  cashOnCashReturn: number | null;
  grossRentMultiplier: number | null;
  monthlyMortgage: number | null;
  monthlyCashFlow: number | null;
}

// ═══════════════════════════════════════════
//  Saved Properties
// ═══════════════════════════════════════════

export interface SavedProperty {
  id: string;
  propertyId: string;
  listName: string | null;
  notes: string | null;
  alertOnPriceChange: boolean;
  alertPriceThreshold: number | null;
  createdAt: string;
  property: PropertySummary;
}

export interface SavePropertyRequest {
  propertyId: string;
  listName?: string;
  notes?: string;
  alertOnPriceChange?: boolean;
  alertPriceThreshold?: number;
}
