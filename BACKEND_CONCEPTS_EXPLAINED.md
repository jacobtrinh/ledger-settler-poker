# Backend Concepts & REST API Explained

This guide explains the backend concepts implemented in the Poker Ledger app, focusing on REST API principles and modern backend development.

## Table of Contents
1. [What is a REST API?](#what-is-a-rest-api)
2. [Core REST Principles](#core-rest-principles)
3. [HTTP Methods & CRUD Operations](#http-methods--crud-operations)
4. [Our API Architecture](#our-api-architecture)
5. [Authentication & Security](#authentication--security)
6. [Database & ORM](#database--orm)
7. [API Design Best Practices](#api-design-best-practices)
8. [Real Examples from Our Code](#real-examples-from-our-code)

## What is a REST API?

REST (Representational State Transfer) is an architectural style for building web services. In our Poker Ledger app:

- **Frontend (React)** = Client that consumes the API
- **Backend (FastAPI)** = Server that provides the API
- **Communication** = HTTP requests with JSON data

Think of it like a restaurant:
- Customer (Frontend) places an order
- Waiter (API) takes the order to the kitchen
- Kitchen (Backend) prepares the food
- Waiter brings it back to the customer

## Core REST Principles

### 1. **Client-Server Separation**
```
Frontend (React)          Backend (FastAPI)
     |                          |
     |   HTTP Request          |
     |------------------------>|
     |                         |
     |   JSON Response         |
     |<------------------------|
```

Our implementation:
- Frontend knows nothing about database
- Backend knows nothing about UI
- They only communicate through API endpoints

### 2. **Statelessness**
Each request contains all information needed to understand it.

```python
# BAD - Server stores state
current_user = None  # Don't do this!

@router.get("/profile")
def get_profile():
    return current_user  # Relies on server state

# GOOD - Stateless with JWT token
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user  # Token provides user info
```

### 3. **Resource-Based URLs**
URLs represent resources (nouns), not actions (verbs).

```
GOOD:
GET    /api/v1/players           # Get all players
GET    /api/v1/players/123       # Get player 123
POST   /api/v1/players           # Create player
PUT    /api/v1/players/123       # Update player 123
DELETE /api/v1/players/123       # Delete player 123

BAD:
GET    /api/v1/getPlayers
POST   /api/v1/createPlayer
POST   /api/v1/deletePlayer/123
```

## HTTP Methods & CRUD Operations

### Mapping HTTP Methods to Database Operations

| HTTP Method | CRUD Operation | Purpose | Example in Our App |
|-------------|----------------|---------|-------------------|
| GET | Read | Retrieve data | Get game sessions |
| POST | Create | Create new resource | Create new player |
| PUT/PATCH | Update | Modify existing | Update player info |
| DELETE | Delete | Remove resource | Delete game session |

### Our Implementation Examples

```python
# GET - Read all game sessions
@router.get("/", response_model=List[schemas.GameSession])
def read_game_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    sessions = crud.game_session.get_multi_by_owner(
        db=db, owner_id=current_user.id
    )
    return sessions

# POST - Create new player
@router.post("/", response_model=schemas.Player)
def create_player(
    game_session_id: int,
    player_in: schemas.PlayerCreate,
    db: Session = Depends(get_db),
):
    player = crud.player.create(db=db, obj_in=player_in)
    return player
```

## Our API Architecture

### 1. **Layered Architecture**

```
┌─────────────────┐
│   API Routes    │  ← Handles HTTP requests/responses
├─────────────────┤
│    Services     │  ← Business logic
├─────────────────┤
│      CRUD       │  ← Database operations
├─────────────────┤
│     Models      │  ← Database schema
└─────────────────┘
```

### 2. **Dependency Injection**

FastAPI's powerful pattern for managing dependencies:

```python
# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency for current user
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # Validate token and return user
    ...

# Using dependencies in routes
@router.get("/protected")
def protected_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Both db and current_user are automatically injected
    return {"user": current_user.email}
```

### 3. **Request/Response Cycle**

```python
# 1. Client sends request
POST /api/v1/game-sessions/
{
    "title": "Friday Night Poker",
    "description": "Weekly game"
}

# 2. FastAPI validates with Pydantic schema
class GameSessionCreate(BaseModel):
    title: str
    description: Optional[str] = None

# 3. Route handler processes
@router.post("/", response_model=GameSession)
def create_game_session(
    session_in: GameSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 4. Business logic
    session = crud.game_session.create_with_owner(
        db=db, obj_in=session_in, owner_id=current_user.id
    )
    
    # 5. Return response
    return session
```

## Authentication & Security

### JWT (JSON Web Tokens)

We use JWT for stateless authentication:

```python
# User logs in
POST /api/v1/auth/login
{
    "username": "john",
    "password": "secret123"
}

# Server returns JWT token
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
}

# Client includes token in subsequent requests
GET /api/v1/game-sessions/
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### How JWT Works

```python
# Creating a token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    
    # Encode with secret key
    encoded_jwt = jwt.encode(
        to_encode, 
        SECRET_KEY, 
        algorithm="HS256"
    )
    return encoded_jwt

# Verifying a token
def verify_token(token: str):
    try:
        # Decode with same secret key
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401)
```

### Password Security

```python
# Never store plain passwords!
pwd_context = CryptContext(schemes=["bcrypt"])

# Hashing password
hashed_password = pwd_context.hash("user_password")
# Result: $2b$12$EixZaYVK1fsbw1ZfbX3OXe...

# Verifying password
is_valid = pwd_context.verify("user_password", hashed_password)
```

## Database & ORM

### SQLAlchemy ORM

ORM (Object-Relational Mapping) lets us work with database using Python objects:

```python
# Without ORM (raw SQL)
cursor.execute(
    "INSERT INTO players (name, buy_in) VALUES (?, ?)", 
    ("John", 100)
)

# With ORM (SQLAlchemy)
player = Player(name="John", buy_in=100)
db.add(player)
db.commit()
```

### Database Relationships

```python
# One-to-Many: User has many GameSessions
class User(Base):
    id = Column(Integer, primary_key=True)
    game_sessions = relationship("GameSession", back_populates="owner")

class GameSession(Base):
    id = Column(Integer, primary_key=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="game_sessions")

# Usage
user.game_sessions  # Get all sessions for a user
session.owner       # Get the owner of a session
```

### Database Migrations with Alembic

Migrations track database schema changes:

```bash
# Create a migration
alembic revision --autogenerate -m "Add players table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## API Design Best Practices

### 1. **Consistent Naming**
```python
# Good - Consistent plural nouns
/api/v1/players
/api/v1/game-sessions
/api/v1/settlements

# Bad - Inconsistent
/api/v1/player
/api/v1/gameSessions
/api/v1/get-settlements
```

### 2. **Proper Status Codes**
```python
200 OK              # Successful GET/PUT
201 Created         # Successful POST
204 No Content      # Successful DELETE
400 Bad Request     # Invalid input
401 Unauthorized    # Not authenticated
403 Forbidden       # Not allowed
404 Not Found       # Resource doesn't exist
500 Server Error    # Server problem
```

### 3. **Filtering and Pagination**
```python
# Good API design
GET /api/v1/players?game_session_id=123&limit=10&offset=20

@router.get("/")
def get_players(
    game_session_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Player)
    if game_session_id:
        query = query.filter(Player.game_session_id == game_session_id)
    return query.offset(skip).limit(limit).all()
```

### 4. **Error Handling**
```python
@router.get("/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(
            status_code=404,
            detail=f"Player with id {player_id} not found"
        )
    return player
```

## Real Examples from Our Code

### 1. **Complete CRUD for Players**

```python
# CREATE
@router.post("/{game_session_id}/players", response_model=schemas.Player)
def create_player_for_session(
    game_session_id: int,
    player_in: schemas.PlayerCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    # Verify user owns the game session
    game_session = crud.game_session.get(db=db, id=game_session_id)
    if not game_session or game_session.owner_id != current_user.id:
        raise HTTPException(status_code=404)
    
    # Create player
    player = models.Player(**player_in.dict(), game_session_id=game_session_id)
    db.add(player)
    db.commit()
    return player

# READ
@router.get("/unique-names", response_model=List[str])
def get_unique_player_names(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    # Complex query with joins
    player_names = db.query(models.Player.name).distinct()\
        .join(models.GameSession)\
        .filter(models.GameSession.owner_id == current_user.id)\
        .all()
    
    return [name[0] for name in player_names]

# UPDATE
@router.put("/{player_id}")
def update_player(
    player_id: int,
    player_update: schemas.PlayerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404)
    
    # Update fields
    for field, value in player_update.dict(exclude_unset=True).items():
        setattr(player, field, value)
    
    db.commit()
    return player

# DELETE
@router.delete("/{player_id}")
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404)
    
    db.delete(player)
    db.commit()
    return {"message": "Player deleted"}
```

### 2. **Complex Business Logic - Settlement Calculation**

```python
@router.post("/{game_session_id}/calculate-settlements")
def calculate_settlements(
    game_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify ownership
    session = verify_session_ownership(db, game_session_id, current_user.id)
    
    # 2. Get all players
    players = db.query(Player).filter(
        Player.game_session_id == game_session_id
    ).all()
    
    # 3. Calculate who owes whom
    settlements = settlement_service.calculate_settlements_for_session(
        db, game_session_id
    )
    
    # 4. Mark session as settled
    session.is_settled = True
    db.commit()
    
    # 5. Return results
    return {
        "session": session,
        "settlements": settlements
    }
```

### 3. **Frontend API Integration**

```typescript
// Frontend API client
class API {
    async getGameSessions(): Promise<GameSession[]> {
        const response = await fetch(`${this.baseURL}/game-sessions/`, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        
        return response.json();
    }
    
    async createPlayer(gameSessionId: number, player: PlayerCreate) {
        const response = await fetch(
            `${this.baseURL}/game-sessions/${gameSessionId}/players`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(player)
            }
        );
        
        return response.json();
    }
}
```

## Key Takeaways

1. **REST APIs** provide a standardized way for frontend and backend to communicate
2. **HTTP methods** map to CRUD operations (GET=Read, POST=Create, etc.)
3. **Authentication** with JWT keeps the API stateless and secure
4. **ORM** (SQLAlchemy) makes database operations more Pythonic
5. **Proper error handling** and status codes make APIs user-friendly
6. **Dependency injection** keeps code modular and testable

## What You've Learned

By building this backend, you've implemented:
- ✅ RESTful API design principles
- ✅ JWT authentication system
- ✅ Database relationships (Users → GameSessions → Players)
- ✅ Password hashing and security
- ✅ CORS handling for cross-origin requests
- ✅ Environment-based configuration
- ✅ Database migrations
- ✅ API documentation (automatic with FastAPI)
- ✅ Serverless deployment on Vercel

This is real-world backend development! 🎉 