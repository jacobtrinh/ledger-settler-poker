import React, { useState } from 'react';
import { Settlement, Player } from '../types';
import './SettlementResults.css';

interface SettlementResultsProps {
  settlements: Settlement[];
  players: Player[];
}

const SettlementResults: React.FC<SettlementResultsProps> = ({ settlements, players }) => {
  const [copied, setCopied] = useState(false);
  
  // Calculate net results for display
  const playerResults = players.map(player => ({
    name: player.name,
    buyIn: player.buyIn,
    cashOut: player.cashOut,
    netResult: player.cashOut - player.buyIn
  }));

  const winners = playerResults.filter(p => p.netResult > 0).sort((a, b) => b.netResult - a.netResult);
  const losers = playerResults.filter(p => p.netResult < 0).sort((a, b) => a.netResult - b.netResult);

  return (
    <div className="settlement-results">
      <h2>Settlement Results</h2>
      
      <div className="results-summary">
        <div className="winners">
          <h3>Winners</h3>
          {winners.map(winner => (
            <div key={winner.name} className="player-result winner">
              <span>{winner.name}</span>
              <span className="amount">+${winner.netResult.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="losers">
          <h3>Losers</h3>
          {losers.map(loser => (
            <div key={loser.name} className="player-result loser">
              <span>{loser.name}</span>
              <span className="amount">-${Math.abs(loser.netResult).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settlements">
        <h3>Settlements</h3>
        {settlements.length === 0 ? (
          <p className="no-settlements">No settlements needed - everyone broke even!</p>
        ) : (
          <div className="settlement-list">
            {settlements.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <div className="settlement-flow">
                  <span className="payer">{settlement.from}</span>
                  <span className="arrow">→</span>
                  <span className="receiver">{settlement.to}</span>
                </div>
                <span className="settlement-amount">${settlement.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="settlement-instructions">
        <div className="instructions-header">
          <h4>Payment Instructions</h4>
          <button 
            className="copy-button"
            onClick={() => {
              const text = settlements
                .map((s, i) => `${i + 1}. ${s.from} should pay ${s.to} $${s.amount.toFixed(2)}`)
                .join('\n');
              navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
        <ol>
          {settlements.map((settlement, index) => (
            <li key={index}>
              <strong>{settlement.from}</strong> should pay <strong>{settlement.to}</strong> ${settlement.amount.toFixed(2)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SettlementResults; 