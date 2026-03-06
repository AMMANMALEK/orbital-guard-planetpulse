from fastapi import FastAPI
import socketio
import logging

logger = logging.getLogger(__name__)

# Create a Socket.IO ASGIManager
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'  # In production, specify your frontend URL
)

socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_region(sid, data):
    # Data should contain {'state': '...', 'city': '...'}
    region = f"{data.get('state')}_{data.get('city')}"
    await sio.enter_room(sid, region)
    logger.info(f"Client {sid} joined region room: {region}")

@sio.event
async def leave_region(sid, data):
    region = f"{data.get('state')}_{data.get('city')}"
    await sio.leave_room(sid, region)
    logger.info(f"Client {sid} left region room: {region}")

async def broadcast_new_complaint(complaint_data: dict):
    # Broadcast to all admins
    await sio.emit('new_complaint', complaint_data, room='admins')
    
    # Broadcast to specific region room
    region = f"{complaint_data.get('state')}_{complaint_data.get('city')}"
    await sio.emit('regional_complaint', complaint_data, room=region)

async def broadcast_complaint_update(complaint_data: dict):
    await sio.emit('complaint_updated', complaint_data)

@sio.event
async def join_admins(sid, data):
    await sio.enter_room(sid, 'admins')
    logger.info(f"Client {sid} joined admins room")
