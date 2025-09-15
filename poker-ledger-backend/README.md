# Poker Ledger Backend API

A FastAPI backend for the Poker Ledger Settler application, providing user authentication, game session management, and settlement calculations.

## Features

- **User Authentication**: JWT-based authentication with login/logout functionality
- **Game Session Management**: Create and manage multiple poker game sessions
- **Player Management**: Add, update, and remove players from game sessions
- **Settlement Calculation**: Automatic calculation of who owes whom
- **Data Persistence**: PostgreSQL database with SQLAlchemy ORM
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with python-jose
- **Password Hashing**: bcrypt via passlib
- **Database Migrations**: Alembic
- **Validation**: Pydantic

## Project Structure

```
poker-ledger-backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── endpoints/    # Individual endpoint modules
│   │   └── deps.py       # Dependencies (auth, db)
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings management
│   │   └── security.py   # Security utilities
│   ├── crud/             # CRUD operations
│   ├── db/               # Database configuration
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic
├── alembic/              # Database migrations
├── requirements.txt      # Python dependencies
└── .env.example          # Environment variables template
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- PostgreSQL
- Virtual environment (recommended)

### 2. Installation

```bash
# Clone the repository
cd poker-ledger-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Create a PostgreSQL database
createdb poker_ledger_db

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# Example DATABASE_URL: postgresql://username:password@localhost/poker_ledger_db
```

### 4. Run Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Run the Application

```bash
# Development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT token)
- `GET /api/v1/auth/me` - Get current user info

### Game Sessions
- `GET /api/v1/game-sessions/` - List user's game sessions
- `POST /api/v1/game-sessions/` - Create new game session
- `GET /api/v1/game-sessions/{id}` - Get specific game session
- `PUT /api/v1/game-sessions/{id}` - Update game session
- `DELETE /api/v1/game-sessions/{id}` - Delete game session
- `POST /api/v1/game-sessions/{id}/calculate-settlements` - Calculate settlements

### Players
- `POST /api/v1/game-sessions/{game_session_id}/players` - Add player to session
- `PUT /api/v1/players/{player_id}` - Update player
- `DELETE /api/v1/players/{player_id}` - Remove player

## Frontend Integration

To integrate with your React frontend:

1. Update the frontend API configuration to point to your backend URL
2. Add authentication headers to API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
3. Update CORS settings in `.env` if needed

## Deployment to Vercel

For serverless deployment on Vercel:

1. Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ]
}
```

2. Install Vercel CLI: `npm i -g vercel`
3. Deploy: `vercel`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (generate a strong random key)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `FRONTEND_URL`: Frontend URL for CORS
- `ENVIRONMENT`: development/production

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 