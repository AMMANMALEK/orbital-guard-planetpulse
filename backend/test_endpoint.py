import httpx
import asyncio

async def test():
    # Use any local image
    image_path = "uploads/c09cd05252e71c68fd40e7e92a7106f5.jpeg"
    
    # Needs a token because endpoint requires admin/officer, let's just write a test specifically for the function, or login first.
    # To bypass login, I'll just write a quick login.
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. Login
        login_data = {"email": "admin@orbitalguard.gov", "password": "adminpassword"}
        r = await client.post("/api/auth/login", json=login_data)
        if r.status_code != 200:
            print(f"Login failed: {r.text}")
            return
            
        token = r.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Upload image to /api/detections/analyze
        print("Uploading image to /api/detections/analyze...")
        with open(image_path, "rb") as f:
            files = {"image": ("test.jpeg", f, "image/jpeg")}
            data = {"location": "Test Location", "lat": "20.1", "lng": "78.1", "region": "Test"}
            r2 = await client.post("/api/detections/analyze", files=files, data=data, headers=headers)
            print(f"Status: {r2.status_code}")
            print(f"Response: {r2.json()}")

if __name__ == "__main__":
    asyncio.run(test())
