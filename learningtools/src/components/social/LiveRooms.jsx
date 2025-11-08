import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, MessageCircle, Crown } from 'lucide-react';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';

export default function LiveRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = useSelector(state => state.user);

  useEffect(() => {
    // Conectar socket
    if (user.mode === 'authenticated') {
      socketService.connect({
        displayName: user.profile.displayName,
        photoURL: user.profile.photoURL,
        currentLevel: user.levelSystem.currentLevel,
        totalPhrases: user.stats.totalPhrases
      });

      // Buscar salas
      socketService.getRooms();

      // Listeners
      socketService.on('rooms-list', (roomsList) => {
        console.log('📋 Rooms received:', roomsList);
        setRooms(roomsList);
      });

      // ✨ MODIFICADO: Quando sala é criada, redirecionar automaticamente
      socketService.on('room-created', (newRoom) => {
        console.log('✅ New room created:', newRoom);

        // Se é o criador, redirecionar para a sala
        if (newRoom.creator_id === user.userId) {
          console.log('👑 You created this room, redirecting...');
          navigate(`/jitsi-room/${newRoom.id}`);
        } else {
          // Para outros usuários, apenas atualizar a lista
          setRooms(prev => [newRoom, ...prev]);
        }
      });

      // ✨ NOVO: Atualizar lista quando sala é fechada
      socketService.on('room-closed', (data) => {
        console.log('🔒 Room closed:', data.roomId);
        setRooms(prev => prev.filter(room => room.id !== data.roomId));
      });

      return () => {
        socketService.off('rooms-list');
        socketService.off('room-created');
        socketService.off('room-closed');
      };
    }
  }, [user.mode, user.userId, navigate]);

  const handleCreateRoom = (roomData) => {
    console.log('🏗️ Creating room:', roomData);
    socketService.createRoom(roomData);
    setShowCreateModal(false);
    // Não precisa navegar aqui, será feito no listener 'room-created'
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Live Rooms 🎙️</h1>
          <p className="text-gray-600">Practice English with others in real-time</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No active rooms yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-purple-600 font-semibold hover:underline"
            >
              Create the first room!
            </button>
          </div>
        ) : (
          rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              navigate={navigate}
              currentUserId={user.userId}
            />
          ))
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
}

function RoomCard({ room, navigate, currentUserId }) {
  const isCreator = room.creator_id === currentUserId;
  const isFull = room.current_participants >= room.max_participants;

  const handleJoin = () => {
    console.log('🚪 Joining room:', room.id);
    navigate(`/jitsi-room/${room.id}`); // ✅ Mudou aqui
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all relative">
      {isCreator && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Crown className="w-3 h-3" />
          Your Room
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{room.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full ml-2">
          {room.language_level}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{room.current_participants}/{room.max_participants}</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={isFull && !isCreator}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isCreator
              ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
              : isFull
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {isCreator ? 'Enter' : isFull ? 'Full' : 'Join'}
        </button>
      </div>
    </div>
  );
}

function CreateRoomModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 10,
    languageLevel: 'beginner'
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsCreating(true);
    onCreate(formData);
    // Modal will close automatically when redirected
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Live Room</h2>
        <p className="text-sm text-gray-600 mb-4">
          You'll automatically join as the room creator and speaker
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Practice Basic Conversations"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Let's practice everyday phrases..."
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              value={formData.languageLevel}
              onChange={(e) => setFormData({...formData, languageLevel: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={isCreating}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Participants</label>
            <select
              value={formData.maxParticipants}
              onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={isCreating}
            >
              <option value="5">5 participants</option>
              <option value="10">10 participants</option>
              <option value="15">15 participants</option>
              <option value="20">20 participants</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create & Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}