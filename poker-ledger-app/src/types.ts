export interface Player {
  id: string | number;  // Can be either string (local) or number (from backend)
  name: string;
  buyIn: number;
  cashOut: number;
  netResult?: number;
  entryMode: 'buyin-cashout' | 'pnl';
  // Backend fields
  buy_in?: number;
  cash_out?: number;
  entry_mode?: 'buyin-cashout' | 'pnl';
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  // Backend fields
  from_player?: string;
  to_player?: string;
} 