from dotenv import load_dotenv
load_dotenv(override=True)

import os
print(f"Key loaded: {bool(os.getenv('GEMINI_API_KEY'))}")

from app.services.gemini_service import analyze_environment_image

def test():
    # Use the image the user uploaded
    image_path = "uploads/fa10c813c2aba9a9875f34c0ac045b61.jpeg"
    print(f"Testing real image: {image_path}")
    
    result = analyze_environment_image(image_path)
    
    print("\nResult:")
    print(result)

if __name__ == "__main__":
    test()
