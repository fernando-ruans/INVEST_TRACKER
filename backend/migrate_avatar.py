#!/usr/bin/env python3
"""
Migration script to add avatar column to users table
"""

import sys
import os
sys.path.append('.')

from sqlalchemy import text
from app.database.database import engine, SessionLocal

def add_avatar_column():
    """Add avatar column to users table if it doesn't exist"""
    db = SessionLocal()
    try:
        # Check if avatar column already exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='avatar'
        """))
        
        if result.fetchone() is None:
            # Add avatar column
            db.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR"))
            db.commit()
            print("✅ Avatar column added successfully to users table")
        else:
            print("ℹ️  Avatar column already exists in users table")
            
    except Exception as e:
        print(f"❌ Error adding avatar column: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_avatar_column()