export type PriceSource = 'manual' | 'auto';

export interface Holding {
  id: number;
  owner_type?: string;
  owner_id?: number;
  name: string;
  symbol?: string | null;
  quantity: number;
  currency: string;
  unit_price: number;
  value: number;
  price_source: PriceSource;
  provider?: string | null;
  external_ref?: string | null;
  last_priced_at?: string | null;
}

// What the form emits; the owner is attached by the page on create.
export interface HoldingPayload {
  name: string;
  symbol?: string | null;
  quantity: number;
  currency: string;
  unit_price?: number;
  price_source: PriceSource;
  provider?: string | null;
  external_ref?: string | null;
}

export interface HoldingOwner {
  owner_type: string;
  owner_id: number;
}

export interface HoldingsResponse {
  data: Holding[];
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
}
