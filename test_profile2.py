import requests

# Find a valid user in db
import sqlite3
conn = sqlite3.connect("backend/aprovei.db")
cur = conn.cursor()
cur.execute("SELECT email, password_hash FROM users WHERE role = 'teacher' LIMIT 1")
row = cur.fetchone()
conn.close()

if row:
    email = row[0]
    # Reset password directly in DB to known value
    import bcrypt
    conn = sqlite3.connect("backend/aprovei.db")
    cur = conn.cursor()
    # Pwd 'password123'
    # Wait, FastAPI password hashing is usually passlib
    conn.close()
    
    # Just try to query directly using the api? Let's just create a test script that imports db and creates a user? 
    pass
