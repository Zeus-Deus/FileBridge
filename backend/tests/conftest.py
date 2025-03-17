import os
import sys

# Insert the backend folder into sys.path, so "from src import create_app" works.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
