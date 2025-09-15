import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './GameSessionsSidebar.css';
import { useAuth } from '../contexts/AuthContext';

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

interface GameSessionsSidebarProps {
  isOpen: boolean;
  onSelectSession: (session: GameSession) => void;
  currentSessionId?: number;
  onClose: () => void;
}

const GameSessionsSidebar: React.FC<GameSessionsSidebarProps> = ({ 
  isOpen, 
  onSelectSession, 
  currentSessionId,
  onClose 
}) => {
  const { user, logout } = useAuth();
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

  const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.deleteGameSession(id);
        setSessions(sessions.filter(s => s.id !== id));
        if (currentSessionId === id) {
          // If we deleted the current session, clear it
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  // Group sessions by date
  const groupSessionsByDate = (sessions: GameSession[]) => {
    const groups: { [key: string]: GameSession[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    sessions.forEach(session => {
      const sessionDate = new Date(session.game_date);
      let groupKey: string;

      if (sessionDate.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (sessionDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (sessionDate > lastWeek) {
        groupKey = 'This Week';
      } else {
        groupKey = sessionDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`game-sessions-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Game Sessions</h2>
          <button
            className="new-session-button"
            onClick={() => setShowNewSessionForm(!showNewSessionForm)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {showNewSessionForm && (
          <form className="new-session-form" onSubmit={handleCreateSession}>
            <input
              type="text"
              placeholder="Session name"
              value={newSession.title}
              onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
              required
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newSession.description}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              rows={2}
            />
            <input
              type="date"
              value={newSession.game_date}
              onChange={(e) => setNewSession({ ...newSession, game_date: e.target.value })}
              required
            />
            <div className="form-actions">
              <button type="submit">Create</button>
              <button type="button" onClick={() => setShowNewSessionForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="sessions-list">
          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <p>No sessions yet</p>
              <p className="hint">Create your first game session to get started</p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
              <div key={groupName} className="session-group">
                <h3 className="group-title">{groupName}</h3>
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelectSession(session);
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <div className="session-content">
                      <h4>{session.title}</h4>
                      <div className="session-meta">
                        <span>{session.players?.length || 0} players</span>
                        {session.is_settled && <span className="settled">Settled</span>}
                      </div>
                    </div>
                    <button
                      className="delete-button"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      aria-label="Delete session"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default GameSessionsSidebar; 