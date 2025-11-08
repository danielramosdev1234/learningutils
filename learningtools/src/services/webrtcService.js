class WebRTCManager {
  constructor() {
    this.peerConnections = new Map(); // userId -> RTCPeerConnection
    this.localStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.audioLevelCallback = null;
    this.isInitialized = false;
    this.remoteAudios = new Map();
  }

  async initializeAudio() {
    if (this.isInitialized) return true;

    try {
      console.log('🎤 Requesting microphone access...');
      
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Setup audio level detection
      this.setupAudioLevelDetection();
      
      this.isInitialized = true;
      console.log('✅ Microphone initialized');
      return true;
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      return false;
    }
  }

  setupAudioLevelDetection() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    const source = this.audioContext.createMediaStreamSource(this.localStream);
    source.connect(this.analyser);

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const detectLevel = () => {
      if (!this.isInitialized) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      if (this.audioLevelCallback) {
        this.audioLevelCallback(average);
      }
      
      requestAnimationFrame(detectLevel);
    };
    
    detectLevel();
  }

  onAudioLevel(callback) {
    this.audioLevelCallback = callback;
  }

  async createPeerConnection(remoteUserId, socketService, roomId) {
    if (this.peerConnections.has(remoteUserId)) {
      console.log('⚠️ Closing old connection for:', remoteUserId);
      this.closePeerConnection(remoteUserId);
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log('➕ Adding track to peer connection:', remoteUserId);
        pc.addTrack(track, this.localStream);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('📊 Received remote track from:', remoteUserId);
      console.log('Stream ID:', event.streams[0].id);
      console.log('Track kind:', event.track.kind);

      // Criar ou reutilizar elemento de áudio
      let audio = this.remoteAudios.get(remoteUserId);

      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        audio.volume = 1.0;
        this.remoteAudios.set(remoteUserId, audio);
        console.log('🔊 Created new audio element for:', remoteUserId);
      }

      audio.srcObject = event.streams[0];

      // Tentar reproduzir
      audio.play()
        .then(() => {
          console.log('✅ Audio playing from:', remoteUserId);
        })
        .catch(error => {
          console.warn('⚠️ Autoplay blocked for:', remoteUserId);
          console.log('👆 Click anywhere to enable audio');

          // Event listener para desbloquear
          const unlock = () => {
            audio.play()
              .then(() => console.log('✅ Audio resumed after interaction'))
              .catch(e => console.error('❌ Still blocked:', e));
            document.removeEventListener('click', unlock);
          };
          document.addEventListener('click', unlock, { once: true });
        });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.socket.emit('webrtc-ice-candidate', {
          roomId,
          targetUserId: remoteUserId,
          candidate: event.candidate
        });
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection with ${remoteUserId}:`, pc.connectionState);

      if (pc.connectionState === 'connected') {
        console.log('✅ WebRTC connected with:', remoteUserId);
      }

      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('❌ Connection lost with:', remoteUserId);
        this.closePeerConnection(remoteUserId);
      }
    };

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE state with ${remoteUserId}:`, pc.iceConnectionState);
    };

    this.peerConnections.set(remoteUserId, pc);
    return pc;
  }

  async createOffer(remoteUserId, socketService, roomId) {
    const pc = await this.createPeerConnection(remoteUserId, socketService, roomId);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketService.socket.emit('webrtc-offer', {
      roomId,
      targetUserId: remoteUserId,
      offer
    });
    
    console.log('📤 Sent offer to:', remoteUserId);
  }

  async handleOffer(fromUserId, offer, socketService, roomId) {
    console.log('📥 Processing offer from:', fromUserId);
    const pc = await this.createPeerConnection(fromUserId, socketService, roomId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('✅ Remote description set');

    const answer = await pc.createAnswer();
    console.log('✅ Answer created');

    await pc.setLocalDescription(answer);
    console.log('✅ Local description set');

    socketService.socket.emit('webrtc-answer', {
      roomId,
      targetUserId: fromUserId,
      answer
    });

    console.log('📤 Answer sent to:', fromUserId);
  }

  async handleAnswer(fromUserId, answer) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Answer processed from:', fromUserId);
    }
  }

  async handleIceCandidate(fromUserId, candidate) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  setMuted(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
      console.log('🔌 Closed connection with:', userId);
    }

    // ✨ ADICIONAR: Limpar áudio
    const audio = this.remoteAudios.get(userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      this.remoteAudios.delete(userId);
      console.log('🔇 Removed audio from:', userId);
    }
  }

  cleanup() {
    console.log('🧹 Cleaning up WebRTC...');

    this.remoteAudios.forEach((audio, userId) => {
        audio.pause();
        audio.srcObject = null;
        console.log('🔇 Stopped audio from:', userId);
      });
      this.remoteAudios.clear();
    
    // Close all peer connections
    this.peerConnections.forEach((pc, userId) => {
      this.closePeerConnection(userId);
    });
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    this.audioLevelCallback = null;
  }
}

export default new WebRTCManager();