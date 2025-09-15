# Backend Development Concepts - Simple Guide

## What I Built
A full-stack poker settlement app with:
- **Frontend**: React (what users see)
- **Backend**: FastAPI + PostgreSQL (the brain behind it)

## 1. REST API - How Frontend Talks to Backend

### What is it?
REST API is like a waiter in a restaurant:
- Customer (Frontend) asks for something
- Waiter (API) takes the order to kitchen (Backend)
- Kitchen prepares it and waiter brings it back

### HTTP Methods I Used
Think of these as different types of requests:

```
GET    = "Show me"      → Get game sessions
POST   = "Create this"  → Create new player  
PUT    = "Update this"  → Update player info
DELETE = "Remove this"  → Delete a session
```

### Real Examples from My Code

**Getting all game sessions:**
```python
@router.get("/game-sessions")
def get_my_sessions(current_user: User):
    # Returns all sessions for logged-in user
    return user's_game_sessions
```

**Creating a new player:**
```python
@router.post("/players")
def create_player(name: str, buy_in: float):
    # Add new player to database
    new_player = Player(name=name, buy_in=buy_in)
    return new_player
```

## 2. Authentication - Keeping Data Secure

### What I Implemented
JWT (JSON Web Tokens) - Like a special wristband at a concert:
- Login → Get wristband (token)
- Show wristband → Access VIP areas (protected data)

### How It Works
```
1. User logs in with username/password
2. Backend checks credentials
3. If correct, gives back a token
4. Frontend includes token in every request
5. Backend checks token before giving data
```

### Code Example
```python
# User logs in
@router.post("/login")
def login(username: str, password: str):
    user = check_user_credentials(username, password)
    if user:
        token = create_token(user.id)
        return {"token": token}
    else:
        return {"error": "Wrong credentials"}

# Protected endpoint
@router.get("/my-games")
def get_my_games(token: str):
    user = verify_token(token)
    if user:
        return user.game_sessions
    else:
        return {"error": "Please login first"}
```

## 3. Database - Where Everything is Stored

### What I Used
- **PostgreSQL**: Professional database (like Excel but much more powerful)
- **SQLAlchemy**: Python tool to talk to database easily

### Database Structure
```
Users Table
├── id
├── username  
├── email
└── password (encrypted!)

Game Sessions Table  
├── id
├── title ("Friday Night Poker")
├── owner_id (links to Users)
└── is_settled

Players Table
├── id
├── name
├── buy_in ($100)
├── cash_out ($150)
└── game_session_id (links to Game Sessions)
```

### Relationships
- 1 User → Many Game Sessions
- 1 Game Session → Many Players

### Code Example
```python
# Without ORM (hard way)
sql = "SELECT * FROM players WHERE game_id = 123"

# With ORM (easy way) 
players = Player.filter(game_id=123).all()
```

## 4. How It All Works Together

### Complete Flow Example: Adding a Player

1. **Frontend** (React):
```javascript
// User clicks "Add Player" button
const newPlayer = {
    name: "John",
    buyIn: 100
};

fetch('/api/players', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer user-token-here'
    },
    body: JSON.stringify(newPlayer)
});
```

2. **Backend** (FastAPI):
```python
@router.post("/players")
def add_player(
    player_data: PlayerCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if user is logged in (via token)
    if not current_user:
        raise HTTPException(401, "Not logged in")
    
    # Save to database
    new_player = Player(
        name=player_data.name,
        buy_in=player_data.buy_in,
        game_session_id=player_data.game_session_id
    )
    db.add(new_player)
    db.commit()
    
    return new_player
```

3. **Database** stores:
```
Players Table:
id | name | buy_in | cash_out | game_session_id
23 | John | 100    | 0        | 5
```

## Key Skills for Resume

### What I Learned:
1. **RESTful API Development**
   - Designed and built REST endpoints
   - Implemented CRUD operations
   - Handled HTTP requests/responses

2. **Authentication & Security**
   - JWT token-based authentication
   - Password hashing with bcrypt
   - Protected API endpoints

3. **Database Management**
   - PostgreSQL database design
   - SQLAlchemy ORM
   - Database relationships (one-to-many)

4. **Full-Stack Integration**
   - Connected React frontend to FastAPI backend
   - Handled CORS for cross-origin requests
   - Deployed on Vercel (serverless)

### Technologies Used:
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL, SQLAlchemy
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel, Supabase

## The Big Picture

I built a complete backend that:
- ✅ Stores user accounts securely
- ✅ Tracks multiple poker games
- ✅ Remembers players across games
- ✅ Calculates who owes whom
- ✅ Only shows your data to you

This is real backend development - the same patterns used by companies like Netflix, Uber, and Instagram! 