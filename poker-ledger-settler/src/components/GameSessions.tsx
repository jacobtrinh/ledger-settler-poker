import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './GameSessions.css';

interface GameSession {
  id: number;
  title: string;
  description?: string;
  game_date: string;
  is_settled: boolean;
  created_at: string;
  players: any[];
  settlements: any[];
}

interface GameSessionsProps {
  onSelectSession: (session: GameSession) => void;
  currentSessionId?: number;
}

const GameSessions: React.FC<GameSessionsProps> = ({ onSelectSession, currentSessionId }) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    game_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getGameSessions() as GameSession[];
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await api.createGameSession({
        ...newSession,
        game_date: new Date(newSession.game_date).toISOString(),
      }) as GameSession;
      setSessions([session, ...sessions]);
      setShowNewSessionForm(false);
      setNewSession({ title: '', description: '', game_date: new Date().toISOString().split('T')[0] });
      onSelectSession(session);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.deleteGameSession(id);
        setSessions(sessions.filter(s => s.id !== id));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  if (loading) {
    return <div className="game-sessions-loading">Loading sessions...</div>;
  }

  return (
    <div className="game-sessions">
      <div className="sessions-header">
        <h2>Game Sessions</h2>
        <button
          className="new-session-button"
          onClick={() => setShowNewSessionForm(!showNewSessionForm)}
        >
          {showNewSessionForm ? 'Cancel' : 'New Game'}
        </button>
      </div>

      {showNewSessionForm && (
        <form className="new-session-form" onSubmit={handleCreateSession}>
          <input
            type="text"
            placeholder="Game title (e.g., Friday Night Poker)"
            value={newSession.title}
            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newSession.description}
            onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
          />
          <input
            type="date"
            value={newSession.game_date}
            onChange={(e) => setNewSession({ ...newSession, game_date: e.target.value })}
            required
          />
          <button type="submit">Create Game Session</button>
        </form>
      )}

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p className="no-sessions">No game sessions yet. Create your first one!</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-card ${currentSessionId === session.id ? 'active' : ''}`}
              onClick={() => onSelectSession(session)}
            >
              <div className="session-info">
                <h3>{session.title}</h3>
                {session.description && <p>{session.description}</p>}
                <div className="session-meta">
                  <span>{new Date(session.game_date).toLocaleDateString()}</span>
                  <span>{session.players?.length || 0} players</span>
                  {session.is_settled && <span className="settled-badge">Settled</span>}
                </div>
              </div>
              <button
                className="delete-session"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.id);
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameSessions; 