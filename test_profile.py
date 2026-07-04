import requests

# 1. Register
res = requests.post("http://localhost:8000/api/v1/auth/register", data={
    "email": "testprof2@example.com",
    "password": "password123",
    "role": "teacher",
    "full_name": "Test Prof",
    "phone": "999999999",
    "location": "Luanda"
})
print("Register:", res.status_code, res.text)

# 2. Login
res = requests.post("http://localhost:8000/api/v1/auth/login", json={
    "email": "testprof2@example.com",
    "password": "password123"
})
print("Login:", res.status_code, res.text)
if res.status_code == 200:
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Get Me
    res = requests.get("http://localhost:8000/api/v1/auth/me", headers=headers)
    print("Get Me:", res.status_code, res.text)
    
    # 4. Get Teacher Profile
    res = requests.get("http://localhost:8000/api/v1/auth/me/teacher-profile", headers=headers)
    print("Get Teacher Profile:", res.status_code, res.text)
    
    # 5. Update Profile
    res = requests.put("http://localhost:8000/api/v1/auth/me", headers=headers, json={
        "full_name": "Test Prof Updated",
        "specialty": "Math",
        "bio": "I teach math"
    })
    print("Update Profile:", res.status_code, res.text)
