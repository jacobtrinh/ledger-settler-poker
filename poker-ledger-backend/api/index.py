import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import our app
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

# Export the FastAPI app for Vercel
app = app 