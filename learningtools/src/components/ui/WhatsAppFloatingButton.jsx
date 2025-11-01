import React from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(true);

  const whatsappGroupLink = "https://chat.whatsapp.com/ICDjTirl4Tu00SNRBYK71W";

  const handleClick = () => {
    window.open(whatsappGroupLink, '_blank');
  };

  const closeTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 w-64 mb-2 animate-bounce">
          <button
            onClick={closeTooltip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-700 font-medium pr-4">
            🎉 Entre no nosso grupo do WhatsApp e fique por dentro das novidades!
          </p>
        </div>
      )}

      {/* Botão Principal */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 group"
        aria-label="Entre no grupo do WhatsApp"
      >
        {/* Efeito de pulso */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>

        {/* Ícone do WhatsApp */}
        <MessageCircle className="w-8 h-8 relative z-10" />

        {/* Badge de notificação */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-20">
          1
        </span>

        {/* Tooltip hover */}
        {isHovered && !showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm rounded-lg px-4 py-2 whitespace-nowrap">
            Junte-se ao grupo! 🚀
            <div className="absolute top-full right-4 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}