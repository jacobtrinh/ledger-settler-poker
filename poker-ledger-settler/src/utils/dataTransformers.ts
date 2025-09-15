import { Player, Settlement } from '../types';

// Transform backend player to frontend format
export function transformPlayer(backendPlayer: any): Player {
  return {
    id: backendPlayer.id,
    name: backendPlayer.name,
    buyIn: backendPlayer.buy_in || 0,
    cashOut: backendPlayer.cash_out || 0,
    entryMode: backendPlayer.entry_mode || 'buyin-cashout',
    // Keep backend fields for reference
    buy_in: backendPlayer.buy_in,
    cash_out: backendPlayer.cash_out,
    entry_mode: backendPlayer.entry_mode,
  };
}

// Transform backend settlement to frontend format
export function transformSettlement(backendSettlement: any): Settlement {
  return {
    from: backendSettlement.from_player,
    to: backendSettlement.to_player,
    amount: backendSettlement.amount,
    // Keep backend fields for reference
    from_player: backendSettlement.from_player,
    to_player: backendSettlement.to_player,
  };
}

// Transform array of players
export function transformPlayers(backendPlayers: any[]): Player[] {
  return backendPlayers.map(transformPlayer);
}

// Transform array of settlements
export function transformSettlements(backendSettlements: any[]): Settlement[] {
  return backendSettlements.map(transformSettlement);
} 