import React, { useState, useEffect } from 'react';
import './App.css';
import PlayerList from './components/PlayerList';
import SettlementResults from './components/SettlementResults';
import GameSessionsSidebar from './components/GameSessionsSidebar';
import Login from './components/Login';
import { Player, Settlement } from './types';
import { calculateSettlements } from './utils/settlementCalculator';
import { transformPlayers, transformSettlements } from './utils/dataTransformers';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';

interface GameSession {
  id: number;
  title: string;
  description?: string;
  game_date: string;
  is_settled: boolean;
  players: Player[];
  settlements: Settlement[];
}

function App() {
  const { user, loading, logout } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [calculatingSettlements, setCalculatingSettlements] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load players when session changes
  useEffect(() => {
    if (currentSession) {
      const transformedPlayers = transformPlayers(currentSession.players || []);
      const transformedSettlements = transformSettlements(currentSession.settlements || []);
      setPlayers(transformedPlayers);
      setSettlements(transformedSettlements);
      setShowResults(currentSession.is_settled);
    } else {
      setPlayers([]);
      setSettlements([]);
      setShowResults(false);
    }
  }, [currentSession]);

  const handleSessionSelect = async (session: GameSession) => {
    try {
      // Fetch full session details with players
      const fullSession = await api.getGameSession(session.id) as any;
      setCurrentSession({
        ...fullSession,
        players: fullSession.players || [],
        settlements: fullSession.settlements || []
      });
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handlePlayersUpdate = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    setShowResults(false);
    // Update current session's players
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        players: updatedPlayers as any,
        is_settled: false
      });
    }
  };

  const handleCalculate = async () => {
    if (!currentSession) return;

    try {
      setCalculatingSettlements(true);
      
      // Calculate settlements on backend
      const updatedSession = await api.calculateSettlements(currentSession.id) as any;
      
      setCurrentSession({
        ...updatedSession,
        players: updatedSession.players || [],
        settlements: updatedSession.settlements || []
      });
      
      const transformedSettlements = transformSettlements(updatedSession.settlements || []);
      setSettlements(transformedSettlements);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to calculate settlements:', error);
      // Fallback to local calculation
      const calculatedSettlements = calculateSettlements(players);
      setSettlements(calculatedSettlements);
      setShowResults(true);
    } finally {
      setCalculatingSettlements(false);
    }
  };

  const isCalculateDisabled = players.length < 2 || 
    players.some(p => !p.name || (p.buyIn === 0 && p.cashOut === 0)) ||
    calculatingSettlements;

  // Show loading state
  if (loading) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Poker Ledger</h1>
        </div>
      </header>
      
      <div className="App-body">
        <GameSessionsSidebar
          isOpen={sidebarOpen}
          onSelectSession={handleSessionSelect}
          currentSessionId={currentSession?.id}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`App-main ${sidebarOpen ? 'with-sidebar' : ''}`}>
          {currentSession ? (
            <div className="current-session-info">
              <PlayerList 
                players={players} 
                onPlayersUpdate={handlePlayersUpdate}
                gameSessionId={currentSession.id}
                isReadOnly={currentSession.is_settled}
                gameSessionTitle={currentSession.title}
              />
              {settlements.length > 0 && (
                <SettlementResults settlements={settlements} players={players} />
              )}
              {players.length >= 2 && !currentSession.is_settled && (
                <button className="calculate-button" onClick={handleCalculate} disabled={isCalculateDisabled}>
                  {calculatingSettlements ? 'Calculating...' : 'Calculate Settlements'}
                </button>
              )}
            </div>
          ) : (
            <div className="no-session-message">
              <h2>Select a Game Session</h2>
              <p>Choose an existing session from the sidebar or create a new one to start tracking your poker game.</p>
              <button className="create-first-session" onClick={() => setSidebarOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New Session
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
