import { Player, Settlement } from '../types';

export function calculateSettlements(players: Player[]): Settlement[] {
  // Calculate net results for each player
  const playersWithNet = players.map(player => ({
    ...player,
    netResult: player.cashOut - player.buyIn
  }));

  // Separate winners and losers
  const winners = playersWithNet
    .filter(p => p.netResult > 0)
    .sort((a, b) => b.netResult - a.netResult);
  
  const losers = playersWithNet
    .filter(p => p.netResult < 0)
    .sort((a, b) => a.netResult - b.netResult);

  const settlements: Settlement[] = [];

  // Create copies to track remaining amounts
  const winnersToSettle = winners.map(w => ({ ...w, remaining: w.netResult }));
  const losersToSettle = losers.map(l => ({ ...l, remaining: Math.abs(l.netResult) }));

  // Match losers with winners
  for (const loser of losersToSettle) {
    for (const winner of winnersToSettle) {
      if (loser.remaining === 0 || winner.remaining === 0) continue;

      const amount = Math.min(loser.remaining, winner.remaining);
      
      settlements.push({
        from: loser.name,
        to: winner.name,
        amount: Number(amount.toFixed(2))
      });

      loser.remaining -= amount;
      winner.remaining -= amount;
    }
  }

  return settlements;
} 