import { io } from 'socket.io-client';
import { auth } from '../config/firebase';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
  }

  connect(userData) {
    if (this.socket?.connected || this.isConnecting) {
          console.log('⚡ Socket already connected or connecting');
          return;
        }

        this.isConnecting = true;

    const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    console.log('🔌 Connecting to:', SERVER_URL);

    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    });

    this.socket.on('connect', async () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;

      // Autenticar com Firebase token
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          console.log('🔐 Authenticating with Firebase token...');
          this.socket.emit('auth', {
            firebaseToken: token,
            userData
          });
        } else {
          console.warn('⚠️ No Firebase token available');
        }
      } catch (error) {
        console.error('❌ Error getting Firebase token:', error);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('auth-success', (data) => {
      console.log('🔓 Authenticated successfully:', data.userId);
    });

    this.socket.on('auth-error', (data) => {
      console.error('🔒 Authentication failed:', data.error);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🚪 Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.isConnecting = false;
    }
  }

  // Room methods
  createRoom(roomData) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('🏠 Creating room:', roomData);
    this.socket.emit('create-room', roomData);
  }

  getRooms() {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('📋 Getting rooms list...');
    this.socket.emit('get-rooms');
  }

  joinRoom(roomId) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('🚪 Joining room:', roomId);
    this.socket.emit('join-room', { roomId });
  }

  leaveRoom(roomId) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('👋 Leaving room:', roomId);
    this.socket.emit('leave-room', { roomId });
  }

  sendMessage(roomId, content, messageType = 'text', metadata = null) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('💬 Sending message to room:', roomId);
    this.socket.emit('room-message', {
      roomId,
      content,
      messageType,
      metadata
    });
  }


  sendEmotion(roomId, emotion, userId) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }
    console.log('😊 Sending emotion to room:', roomId, emotion);
    this.socket.emit('send-emotion', {
      roomId,
      emotion,
      userId
    });
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ Cannot add listener, socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Helper to check connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();