import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Users, LogOut, Crown, AlertCircle, Mic, MicOff, Volume2, VolumeX, MessageCircle, X } from 'lucide-react';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function MeetRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(state => state.user);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [showChat, setShowChat] = useState(false); // Para mobile

  const isCreator = user.userId === room?.creator_id;
  const messagesEndRef = useRef(null);

  // ✅ STEP 1: Conectar socket e entrar na sala
  useEffect(() => {
    if (user.mode !== 'authenticated') return;

     let isInitialized = false;

    const initRoom = async () => {
        if (isInitialized) return;
            isInitialized = true;

      if (!socketService.isConnected()) {
        await socketService.connect({
          displayName: user.profile.displayName,
          photoURL: user.profile.photoURL,
          currentLevel: user.levelSystem.currentLevel,
          totalPhrases: user.stats.totalPhrases
        });
      }

      socketService.off('room-joined');
          socketService.off('message');
          socketService.off('user-joined');
          socketService.off('user-left');
          socketService.off('room-closed');
          socketService.off('room-error');

      socketService.on('room-joined', async (roomData) => {
        console.log('✅ Room joined:', roomData);
        setRoom(roomData);
        setParticipants(roomData.room_participants || []);
        if (!livekitToken) {
                await fetchLiveKitToken(roomData.id);
              }
        setLoading(false);
      });

      socketService.on('message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      socketService.on('user-joined', (userData) => {
        addSystemMessage(`${userData.username} joined`);
      });

      socketService.on('user-left', (userData) => {
        addSystemMessage(`${userData.username} left`);
      });

      socketService.on('room-closed', () => {
        alert('Room closed by creator');
        navigate('/?mode=live-rooms');
      });

      socketService.on('room-error', (error) => {
        alert(error.error || 'Room error');
        navigate('/?mode=live-rooms');
      });

      socketService.joinRoom(roomId);
    };

    initRoom();

    return () => {
      socketService.off('room-joined');
      socketService.off('message');
      socketService.off('user-joined');
      socketService.off('user-left');
      socketService.off('room-closed');
      socketService.off('room-error');

      if (room && !isCreator) {
            socketService.leaveRoom(roomId);
          }
    };
  }, [user.mode, roomId, navigate]);

  const fetchLiveKitToken = async (roomId) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const response = await fetch(`${BACKEND_URL}/api/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: `learnfun-english-${roomId}`,
          participantName: user.profile.displayName,
          participantMetadata: JSON.stringify({
            userId: user.userId,
            avatar: user.profile.photoURL,
            level: user.levelSystem.currentLevel
          })
        })
      });

      const data = await response.json();
      setLivekitToken(data.token);
      setLivekitUrl(data.serverUrl);
    } catch (error) {
      console.error('❌ Error fetching LiveKit token:', error);
      alert('Failed to connect to voice room');
      navigate('/?mode=live-rooms');
    }
  };

  const addSystemMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      content,
      message_type: 'system',
      created_at: new Date().toISOString()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    socketService.sendMessage(roomId, inputMessage);
    setInputMessage('');
  };

  const handleLeaveRoom = () => {
    if (isCreator) {
      const confirm = window.confirm(
        '⚠️ You are the room creator. Leaving will close the room. Continue?'
      );
      if (!confirm) return;
    }

    socketService.leaveRoom(roomId);
    navigate('/?mode=live-rooms');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Connecting to voice room...</p>
        </div>
      </div>
    );
  }

  if (!room || !livekitToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-xl mb-4">Room not found</p>
          <button
            onClick={() => navigate('/?mode=live-rooms')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900">
      <LiveKitRoom
        token={livekitToken}
        serverUrl={livekitUrl || import.meta.env.VITE_LIVEKIT_URL}
        connect={true}
        audio={true}
        video={false}
        options={{
          audioCaptureDefaults: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
          publishDefaults: {
            videoSimulcastLayers: [],
            dtx: true,
          },
        }}
        onDisconnected={() => {
          console.log('Disconnected from LiveKit');
          handleLeaveRoom();
        }}
        onError={(error) => {
          console.error('LiveKit error:', error);
          alert('Connection error. Please try again.');
        }}
        className="flex-1 flex flex-col"
      >
        {/* Header - Responsivo */}
        <div className="bg-black bg-opacity-50 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="text-sm md:text-lg font-bold text-white truncate">{room.title}</h1>
            {isCreator && <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden md:block text-purple-300 text-sm">{room.language_level}</span>
            <span className="text-gray-300 flex items-center gap-1 text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              {participants.length}
            </span>



            <button
              onClick={handleLeaveRoom}
              className="px-2 py-1 md:px-4 md:py-2 bg-red-500 bg-opacity-20 text-red-300 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>

        {/* Área de Áudio - Responsivo */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8 overflow-y-auto">
          <VoiceRoomContent
            roomTitle={room.title}
            isCreator={isCreator}
          />
        </div>

        <RoomAudioRenderer />
      </LiveKitRoom>

      {/* Botão Chat Mobile - MELHORADO */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center"
      >
        {messages.length > 0 && (
          <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg animate-pulse">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Sidebar - Desktop sempre visível, Mobile como overlay */}
      <div className={`
              ${showChat ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] flex' : 'hidden'}
              md:relative md:flex md:w-96 md:h-auto md:max-h-none
              bg-gray-800 bg-opacity-95 md:bg-opacity-100 flex-col border-l border-gray-700
              rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none
            `}>
        {/* Header do Chat Mobile */}
        <div className="px-4 py-3 bg-gray-900 bg-opacity-50 md:bg-opacity-100 border-b border-gray-700 flex items-center justify-between rounded-t-3xl md:rounded-none">
                  <div>
                    <h2 className="text-white font-bold text-base md:text-lg">Chat</h2>
                    <p className="hidden md:block text-gray-400 text-sm">Practice writing too!</p>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* ✅ CÓDIGO NOVO */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-2 md:space-y-3 flex flex-col-reverse">
                  <div ref={messagesEndRef} />
                  {messages.slice().reverse().map((msg, idx) => (
                    <ChatMessage
                      key={msg.id || idx}
                      message={msg}
                      currentUserId={user.userId}
                    />
                  ))}
                </div>

        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-gray-900 bg-opacity-80 md:bg-opacity-100 border-t border-gray-700 sticky bottom-0">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 md:px-4 py-2.5 md:py-2 bg-gray-700 bg-opacity-80 md:bg-opacity-100 text-white rounded-full md:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="p-2.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-full md:rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
      </div>
    </div>
  );
}

// Componente de Conteúdo da Sala de Voz - RESPONSIVO
function VoiceRoomContent({ roomTitle, isCreator }) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const toggleMic = async () => {
    if (localParticipant) {
      const enabled = localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* Título da Sala - Responsivo */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">🎙️ Voice Room</h2>
        <p className="text-sm md:text-base text-gray-400">Practice your speaking skills!</p>
      </div>

      {/* Grid de Participantes - Responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8 max-h-[50vh] md:max-h-none overflow-y-auto">
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.sid}
            participant={participant}
          />
        ))}
      </div>

      {/* Controles de Áudio - Responsivo */}
      <div className="flex items-center justify-center gap-3 md:gap-4">
        <button
          onClick={toggleMic}
          className={`p-4 md:p-6 rounded-full transition-all shadow-lg ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 md:w-8 md:h-8 text-white" />
          ) : (
            <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
          )}
        </button>

        <button
          onClick={toggleSpeaker}
          className={`p-3 md:p-4 rounded-full transition-all shadow-lg ${
            isSpeakerMuted
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-gray-700 hover:bg-gray-800'
          }`}
        >
          {isSpeakerMuted ? (
            <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>
      </div>

      {/* Dica - Responsivo */}
      <div className="mt-4 md:mt-8 text-center">
        <p className="text-xs md:text-sm text-gray-400">
          💡 Tip: <span className="hidden md:inline">Press <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> to push-to-talk</span>
          <span className="md:hidden">Tap the mic to speak</span>
        </p>
      </div>
    </div>
  );
}

// Card de Participante - RESPONSIVO
function ParticipantCard({ participant }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    participant.on('isSpeakingChanged', (speaking) => {
      setIsSpeaking(speaking);
    });

    participant.on('trackPublished', (publication) => {
      if (publication.kind === 'audio') {
        console.log(`Audio track published by ${participant.identity}`);
      }
    });

    return () => {
      participant.removeAllListeners();
    };
  }, [participant]);

  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};

  return (
    <div className={`relative bg-gray-800 rounded-lg md:rounded-xl p-2 md:p-4 transition-all ${
      isSpeaking ? 'ring-2 md:ring-4 ring-purple-500 shadow-lg md:shadow-xl shadow-purple-500/50' : 'ring-1 md:ring-2 ring-gray-700'
    }`}>
      <div className="flex flex-col items-center">
        <div className="relative mb-2 md:mb-3">
          <img
            src={metadata.avatar || '/default-avatar.png'}
            alt={participant.identity}
            className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-gray-700"
          />

          {/* Indicador de Áudio */}
          {isSpeaking && (
            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5 md:gap-1">
                <div className="w-0.5 md:w-1 bg-purple-500 rounded animate-pulse" style={{ height: '8px' }}></div>
                <div className="w-0.5 md:w-1 bg-purple-400 rounded animate-pulse" style={{ height: '12px', animationDelay: '0.1s' }}></div>
                <div className="w-0.5 md:w-1 bg-purple-500 rounded animate-pulse" style={{ height: '8px', animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Mute Badge */}
          {!participant.isMicrophoneEnabled && (
            <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 rounded-full p-0.5 md:p-1">
              <MicOff className="w-2 h-2 md:w-3 md:h-3 text-white" />
            </div>
          )}
        </div>

        {/* Nome */}
        <p className="text-white font-semibold text-xs md:text-sm text-center truncate w-full px-1">
          {participant.identity}
        </p>

        {/* Level Badge */}
        {metadata.level && (
          <span class="text-[18px] md:text-xs text-yellow-400 mt-0.5 md:mt-1 font-semibold"  >
            Lvl {metadata.level}
          </span>
        )}
      </div>
    </div>
  );
}

function ChatMessage({ message, currentUserId }) {
  if (message.message_type === 'system') {
    return (
      <div className="text-center text-xs md:text-sm text-gray-400 py-1">
        {message.content}
      </div>
    );
  }

  const isOwn = message.user_id === currentUserId;

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <img
        src={message.profiles?.avatar_url || '/default-avatar.png'}
        alt={message.profiles?.username}
        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
      />
      <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <p className="text-[10px] md:text-xs text-gray-400 mb-1">
          {message.profiles?.username}
        </p>
        <div className={`px-2 md:px-3 py-1.5 md:py-2 rounded-2xl ${
          isOwn ? 'bg-purple-600' : 'bg-gray-700'
        }`}>
          <p className="text-xs md:text-sm text-white">{message.content}</p>
        </div>
      </div>
    </div>
  );
}