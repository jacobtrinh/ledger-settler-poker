# Local Development Guide

This guide will help you run the full-stack Poker Ledger application on your local machine.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (3.8 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
# If you haven't cloned yet
git clone https://github.com/YOUR_USERNAME/poker-ledger-fullstack.git
cd poker-ledger-fullstack

# Or navigate to your existing project
cd "/Users/smadhan/Downloads/Poker Ledger Settler 2"
```

## Step 2: Set Up the Backend

### 2.1 Navigate to Backend Directory
```bash
cd poker-ledger-backend
```

### 2.2 Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.4 Set Up Environment Variables
Create a `.env` file in the `poker-ledger-backend` directory:

```bash
# poker-ledger-backend/.env
DATABASE_URL=sqlite:///./poker_ledger.db
SECRET_KEY=your-secret-key-for-local-development
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### 2.5 Run Database Migrations
```bash
# Still in poker-ledger-backend directory
alembic upgrade head
```

### 2.6 Start the Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend is now running at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Step 3: Set Up the Frontend

### 3.1 Open New Terminal (Keep Backend Running!)
```bash
# Navigate to project root
cd "/Users/smadhan/Downloads/Poker Ledger Settler 2"

# Go to frontend directory
cd poker-ledger-settler
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Set Up Environment Variables
Create a `.env` file in the `poker-ledger-settler` directory:

```bash
# poker-ledger-settler/.env
REACT_APP_API_URL=http://localhost:8000
```

### 3.4 Start the Frontend Server
```bash
npm start
```

✅ Frontend is now running at `http://localhost:3000`

## Step 4: Verify Everything Works

1. Open your browser to `http://localhost:3000`
2. Create a new account
3. Try creating a game session
4. Add some players
5. Calculate settlements

## Common Issues & Solutions

### Port Already in Use
If you get "port already in use" errors:

```bash
# Find what's using port 8000 (backend)
lsof -i :8000
# Kill the process
kill -9 [PID]

# Find what's using port 3000 (frontend)
lsof -i :3000
# Kill the process
kill -9 [PID]
```

### Database Issues
If you need to reset the database:

```bash
cd poker-ledger-backend
# Delete the database file
rm poker_ledger.db
# Run migrations again
alembic upgrade head
```

### CORS Errors
Make sure:
- Backend is running on port 8000
- Frontend `.env` has `REACT_APP_API_URL=http://localhost:8000`
- Backend `.env` has `FRONTEND_URL=http://localhost:3000`

### Python Virtual Environment Not Activating
```bash
# Make sure you're in poker-ledger-backend directory
cd poker-ledger-backend

# Try with python3 specifically
python3 -m venv venv
source venv/bin/activate
```

## Quick Start Commands

For quick development startup, use these commands:

**Terminal 1 - Backend:**
```bash
cd poker-ledger-backend
source venv/bin/activate  # macOS/Linux
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd poker-ledger-settler
npm start
```

## Development Tips

1. **Backend Changes**: The `--reload` flag means the server restarts automatically when you change Python files

2. **Frontend Changes**: React's development server has hot reload - changes appear instantly

3. **Database Viewer**: You can use SQLite browser to view your local database:
   - Download: [sqlitebrowser.org](https://sqlitebrowser.org/)
   - Open: `poker-ledger-backend/poker_ledger.db`

4. **API Testing**: Use the interactive docs at `http://localhost:8000/docs` to test API endpoints directly

5. **Debugging**:
   - Frontend console: Browser Developer Tools (F12)
   - Backend logs: Check the terminal where uvicorn is running

## Stopping the Servers

- Frontend: Press `Ctrl+C` in the terminal
- Backend: Press `Ctrl+C` in the terminal
- Deactivate Python virtual environment: `deactivate`

## Next Steps

Now that you have it running locally, you can:
- Make changes and see them instantly
- Test new features before deploying
- Debug issues more easily
- Learn how the frontend and backend communicate

Happy coding! 🚀 