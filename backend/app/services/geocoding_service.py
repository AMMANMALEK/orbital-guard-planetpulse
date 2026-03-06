from __future__ import annotations
import requests
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

async def get_coordinates(city: str, state: str) -> Tuple[float, float]:
    """
    Converts Indian City and State to Latitude/Longitude using Nominatim (OpenStreetMap).
    Returns (lat, lng). Defaults to (20.5937, 78.9629) - Center of India - if not found.
    """
    query = f"{city}, {state}, India"
    url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1"
    headers = {
        "User-Agent": "OrbitalGuard/1.0 (Environmental Monitoring Platform)"
    }
    
    try:
        # Using requests directly for simplicity in this hackathon context
        # In a real async prod env, httpx would be better.
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data and len(data) > 0:
            lat = float(data[0]["lat"])
            lng = float(data[0]["lon"])
            logger.info(f"Geocoded {query} to ({lat}, {lng})")
            return lat, lng
        
        logger.warning(f"Could not geocode {query}. Using fallback coordinates.")
    except Exception as e:
        logger.error(f"Geocoding error for {query}: {str(e)}")
    
    # Fallback to center of India or a reasonable default for India
    return 20.5937, 78.9629
