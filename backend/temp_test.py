import httpx
import asyncio

async def test():
    image_path = "uploads/c09cd05252e71c68fd40e7e92a7106f5.jpeg"
    # Set a longer timeout since Gemini API can take 30-60 seconds
    timeout = httpx.Timeout(90.0)
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=timeout) as client:
        print("Uploading image to /api/detections/analyze...")
        with open(image_path, "rb") as f:
            files = {"image": ("test.jpeg", f, "image/jpeg")}
            data = {"location": "Test Location", "lat": "20.1", "lng": "78.1", "region": "Test"}
            r2 = await client.post("/api/detections/analyze", files=files, data=data)
            print(f"Status: {r2.status_code}")
            print(f"Response: {r2.json()}")

if __name__ == "__main__":
    asyncio.run(test())
