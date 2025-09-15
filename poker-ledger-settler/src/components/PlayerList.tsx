import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { api } from '../services/api';
import { transformPlayer } from '../utils/dataTransformers';
import './PlayerList.css';

interface PlayerListProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  gameSessionId?: number;
  isReadOnly?: boolean;
  gameSessionTitle?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ 
  players, 
  onPlayersUpdate, 
  gameSessionId,
  isReadOnly = false,
  gameSessionTitle
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerBuyIn, setNewPlayerBuyIn] = useState('');
  const [newPlayerCashOut, setNewPlayerCashOut] = useState('');
  const [newPlayerNetResult, setNewPlayerNetResult] = useState('');
  const [globalMode, setGlobalMode] = useState<'buyin-cashout' | 'pnl'>('buyin-cashout');
  const [loading, setLoading] = useState(false);
  const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const tabsRef = useRef<HTMLDivElement>(null);
  const firstTabRef = useRef<HTMLButtonElement>(null);
  const secondTabRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Fetch unique player names on component mount
  useEffect(() => {
    const fetchPlayerNames = async () => {
      try {
        const names = await api.getUniquePlayerNames();
        setPlayerSuggestions(names);
      } catch (error) {
        console.error('Failed to fetch player names:', error);
      }
    };
    
    if (gameSessionId && !isReadOnly) {
      fetchPlayerNames();
    }
  }, [gameSessionId, isReadOnly]);

  // Filter suggestions based on input
  const getFilteredSuggestions = (input: string) => {
    // Show all suggestions when input is empty
    if (!input.trim()) return playerSuggestions.slice(0, 10);
    
    const inputLower = input.toLowerCase().trim();
    
    // Filter suggestions that start with or contain the input
    const filtered = playerSuggestions
      .filter(name => {
        const nameLower = name.toLowerCase();
        // Exclude players already in the current game
        const alreadyAdded = players.some(p => p.name.toLowerCase() === nameLower);
        if (alreadyAdded) return false;
        
        // Check if name starts with or contains the input
        return nameLower.startsWith(inputLower) || nameLower.includes(inputLower);
      })
      .sort((a, b) => {
        // Prioritize names that start with the input
        const aStarts = a.toLowerCase().startsWith(inputLower);
        const bStarts = b.toLowerCase().startsWith(inputLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10); // Limit to 10 suggestions
    
    return filtered;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPlayerName(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewPlayerName(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredSuggestions = getFilteredSuggestions(newPlayerName);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  React.useEffect(() => {
    if (tabsRef.current && firstTabRef.current && secondTabRef.current) {
      const firstTab = firstTabRef.current;
      const secondTab = secondTabRef.current;
      const container = tabsRef.current;
      
      if (globalMode === 'buyin-cashout') {
        container.style.setProperty('--slider-width', `${firstTab.offsetWidth}px`);
        container.style.setProperty('--slider-left', '4px');
      } else {
        container.style.setProperty('--slider-width', `${secondTab.offsetWidth}px`);
        container.style.setProperty('--slider-left', `${firstTab.offsetWidth + 8}px`);
      }
    }
  }, [globalMode]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addPlayer();
    }
  };

  const addPlayer = async () => {
    if (newPlayerName.trim() && gameSessionId) {
      const buyIn = globalMode === 'buyin-cashout' 
        ? (parseFloat(newPlayerBuyIn) || 0)
        : (parseFloat(newPlayerNetResult) < 0 ? Math.abs(parseFloat(newPlayerNetResult)) : 0);
      
      const cashOut = globalMode === 'buyin-cashout'
        ? (parseFloat(newPlayerCashOut) || 0)
        : (parseFloat(newPlayerNetResult) >= 0 ? parseFloat(newPlayerNetResult) : 0);

      try {
        setLoading(true);
        const backendPlayer = await api.addPlayer(gameSessionId, {
          name: newPlayerName.trim(),
          buy_in: buyIn,
          cash_out: cashOut,
          entry_mode: globalMode
        });
        
        const newPlayer = transformPlayer(backendPlayer);
        onPlayersUpdate([...players, newPlayer]);
        
        // Reset form
        setNewPlayerName('');
        setNewPlayerBuyIn('');
        setNewPlayerCashOut('');
        setNewPlayerNetResult('');
      } catch (error) {
        console.error('Failed to add player:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const updatePlayer = async (id: string | number, field: 'buyIn' | 'cashOut' | 'netResult', value: string) => {
    const numValue = parseFloat(value) || 0;
    const player = players.find(p => p.id === id);
    if (!player || !gameSessionId) return;

    try {
      let updateData: any = {};
      
      if (field === 'netResult') {
        // When PNL is entered directly, calculate buy-in/cash-out
        if (numValue >= 0) {
          updateData = { buy_in: 0, cash_out: numValue };
        } else {
          updateData = { buy_in: Math.abs(numValue), cash_out: 0 };
        }
      } else if (field === 'buyIn') {
        updateData = { buy_in: numValue };
      } else if (field === 'cashOut') {
        updateData = { cash_out: numValue };
      }

      const backendPlayer = await api.updatePlayer(Number(id), updateData);
      const updatedPlayer = transformPlayer(backendPlayer);
      
      const updatedPlayers = players.map(p => 
        p.id === id ? updatedPlayer : p
      );
      onPlayersUpdate(updatedPlayers);
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  const removePlayer = async (id: string | number) => {
    if (!gameSessionId) return;
    
    try {
      await api.deletePlayer(Number(id));
      onPlayersUpdate(players.filter(player => player.id !== id));
    } catch (error) {
      console.error('Failed to remove player:', error);
    }
  };

  if (!gameSessionId && !isReadOnly) {
    return (
      <div className="player-list">
        <div className="section-header">
          <h2>Players</h2>
        </div>
        <p className="no-session-selected">Please select or create a game session first.</p>
      </div>
    );
  }

  return (
    <div className="player-list">
      <div className="section-header">
        <h2>Players{gameSessionTitle ? ` for ${gameSessionTitle}` : ''}</h2>
        {!isReadOnly && (
          <div className="header-controls">
            <div className="mode-tabs" ref={tabsRef}>
              <button 
                ref={firstTabRef}
                className={`mode-tab ${globalMode === 'buyin-cashout' ? 'active' : ''}`}
                onClick={() => setGlobalMode('buyin-cashout')}
              >
                Buy-in/Cash-out
              </button>
              <button 
                ref={secondTabRef}
                className={`mode-tab ${globalMode === 'pnl' ? 'active' : ''}`}
                onClick={() => setGlobalMode('pnl')}
              >
                PNL
              </button>
            </div>
            {players.length > 0 && (
              <button 
                className="clear-button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all players? This cannot be undone.')) {
                    // Clear all players by removing them one by one
                    players.forEach(player => removePlayer(player.id));
                  }
                }}
                title="Clear all players"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
      
      {!isReadOnly && (
        <div className="add-player-form">
          <div className="form-inputs">
            <div className={`name-input-wrapper ${showSuggestions && getFilteredSuggestions(newPlayerName).length > 0 ? 'has-suggestions' : ''}`}>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Player name"
                value={newPlayerName}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => setShowSuggestions(true)}
                className="name-input"
                disabled={loading}
              />
              
              {showSuggestions && getFilteredSuggestions(newPlayerName).length > 0 && (
                <ul className="suggestions-list">
                  {getFilteredSuggestions(newPlayerName).map((suggestion, index) => (
                    <li
                      key={suggestion}
                      className={index === selectedSuggestionIndex ? 'selected' : ''}
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {globalMode === 'buyin-cashout' ? (
              <>
                <input
                  type="number"
                  placeholder="Buy-in"
                  value={newPlayerBuyIn}
                  onChange={(e) => setNewPlayerBuyIn(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="number-input"
                  disabled={loading}
                />
                <input
                  type="number"
                  placeholder="Cash-out"
                  value={newPlayerCashOut}
                  onChange={(e) => setNewPlayerCashOut(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="number-input"
                  disabled={loading}
                />
              </>
            ) : (
              <input
                type="number"
                placeholder="PNL (+/-)"
                value={newPlayerNetResult}
                onChange={(e) => setNewPlayerNetResult(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`number-input pnl-input ${parseFloat(newPlayerNetResult) >= 0 ? 'positive' : parseFloat(newPlayerNetResult) < 0 ? 'negative' : ''}`}
                disabled={loading}
              />
            )}
            
            <button onClick={addPlayer} className="add-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </div>
      )}

      <div className="players-table">
        {players.length === 0 ? (
          <p className="no-players">
            {isReadOnly 
              ? 'No players in this session.' 
              : 'No players added yet. Add at least 2 players to calculate settlements.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Player Name</th>
                {globalMode === 'buyin-cashout' || isReadOnly ? (
                  <>
                    <th>Buy-in ($)</th>
                    <th>Cash-out ($)</th>
                    <th>PNL</th>
                  </>
                ) : (
                  <th>PNL ($)</th>
                )}
                {!isReadOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {players.map(player => {
                const netResult = player.cashOut - player.buyIn;
                return (
                  <tr key={player.id}>
                    <td>{player.name}</td>
                    {globalMode === 'buyin-cashout' || isReadOnly ? (
                      <>
                        <td>
                          {isReadOnly ? (
                            `$${player.buyIn.toFixed(2)}`
                          ) : (
                            <input
                              type="number"
                              value={player.buyIn || ''}
                              onChange={(e) => updatePlayer(player.id, 'buyIn', e.target.value)}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </td>
                        <td>
                          {isReadOnly ? (
                            `$${player.cashOut.toFixed(2)}`
                          ) : (
                            <input
                              type="number"
                              value={player.cashOut || ''}
                              onChange={(e) => updatePlayer(player.id, 'cashOut', e.target.value)}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </td>
                        <td className={netResult >= 0 ? 'positive' : 'negative'}>
                          ${netResult.toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <td>
                        <input
                          type="number"
                          value={netResult || ''}
                          onChange={(e) => updatePlayer(player.id, 'netResult', e.target.value)}
                          placeholder="0"
                          step="0.01"
                          className={netResult >= 0 ? 'positive-input' : 'negative-input'}
                        />
                      </td>
                    )}
                    {!isReadOnly && (
                      <td>
                        <button 
                          className="remove-button"
                          onClick={() => removePlayer(player.id)}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {players.length > 0 && (
        <div className="summary">
          <p>Total Buy-ins: ${players.reduce((sum, p) => sum + p.buyIn, 0).toFixed(2)}</p>
          <p>Total Cash-outs: ${players.reduce((sum, p) => sum + p.cashOut, 0).toFixed(2)}</p>
          <p className={
            Math.abs(players.reduce((sum, p) => sum + p.buyIn, 0) - 
                    players.reduce((sum, p) => sum + p.cashOut, 0)) < 0.01 ? 'balanced' : 'unbalanced'
          }>
            {Math.abs(players.reduce((sum, p) => sum + p.buyIn, 0) - 
                     players.reduce((sum, p) => sum + p.cashOut, 0)) < 0.01 
              ? '✓ Balanced' 
              : '⚠ Unbalanced (Buy-ins and Cash-outs should match)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerList; 