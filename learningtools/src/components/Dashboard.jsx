import React, { useState, useEffect } from 'react';
import {
  Mic, Globe, Hash, Zap, Video, Radio,
  TrendingUp, Target, Flame, Trophy,
  ArrowRight, Star, Clock, Users,
  CheckCircle, Award, MessageCircle, Gift
} from 'lucide-react';
import { useSelector } from 'react-redux';
import LevelRankingModal from './modals/LevelRankingModal';
import StreakModal from './modals/StreakModal';





const Dashboard = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { levelSystem, userId, stats } = useSelector(state => state.user);
  const streak = stats?.streak || { current: 0, longest: 0, history: [] };

    const [showRankingModal, setShowRankingModal] = useState(false);
    const [showModal, setShowModal] = useState(false);

    if (!levelSystem) return null;

    const { currentLevel, globalCompletedIndices = [] } = levelSystem;

    const totalNeededForLevel = currentLevel * 10;
    const totalCompleted = globalCompletedIndices.length;
    const progressPercent = (totalCompleted / totalNeededForLevel) * 100;
    const remaining = totalNeededForLevel - totalCompleted;
    const isLevelComplete = totalCompleted >= totalNeededForLevel;

    // Calcula quais frases ainda faltam
    const allIndices = Array.from({ length: totalNeededForLevel }, (_, i) => i);
    const remainingIndices = allIndices
      .filter(idx => !globalCompletedIndices.includes(idx))
      .map(idx => idx + 1)
      .sort((a, b) => a - b);

    const displayIndices = remainingIndices;



  const features = [
    {
      id: 'translate',
      title: 'Translate & Practice',
      description: (
                <div>

                  <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      Escreva ou fale frases em português.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                       Traduza para Inglês e pratique a pronúncia.
                                      </li>

                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Real-time pronunciation feedback.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Word-by-word accuracy analysis.
                    </li>
                  </ul>
                </div>
              ),
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/?mode=translate',
                                    src: 'src/assets/translatepractice.png',
                                          alt: 'exemplo word by word'
    },
    {
      id: 'numbers',
      title: 'Number Trainer',
description: (
      <div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Números aleatórios gerados automaticamente.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Pratique pronúncia em inglês e outros idiomas.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Leaderboard com ranking global.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Acompanhe seu progresso e compete.
          </li>
        </ul>
      </div>
    ),      icon: Hash,
      gradient: 'from-green-500 to-teal-500',
      path: '/?mode=numbers',
                                  src: 'src/assets/numeros.png',
                                        alt: 'exemplo word by word'
    },
    {
      id: 'challenge',
      title: 'Challenge Mode',
description: (
      <div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            60 segundos para máximo de frases.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Precisa de 90% de precisão para avançar.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Ranking dos top 10 jogadores.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Teste suas habilidades em tempo real.
          </li>
        </ul>
      </div>
    ),      icon: Zap,
      gradient: 'from-yellow-500 to-orange-500',
      path: '/?mode=challenge',
      highlight: true,
                           src: 'src/assets/challenge.png',
                                 alt: 'exemplo word by word'
    },
    {
      id: 'video',
      title: 'Video Learning',
description: (
      <div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Cenas de filmes e frases famosas.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Clipes curtos com perguntas interativas.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Vocabulário real em contextos naturais.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Aprenda com situações do dia a dia.
          </li>
        </ul>
      </div>
    ),      icon: Video,
      gradient: 'from-red-500 to-pink-500',
      path: '/?mode=VideoLearningApp',
                                           src: 'src/assets/videolistener.png',
                                                 alt: 'exemplo word by word'
    },
    {
      id: 'live-rooms',
      title: 'Live Rooms',
 description: (
      <div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Salas de voz ao vivo em tempo real.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Pratique com outros estudantes.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Crie sua própria sala ou entre em existentes.
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Ambiente seguro e colaborativo.
          </li>
        </ul>
      </div>
    ),      icon: Radio,
      gradient: 'from-indigo-500 to-purple-500',
      path: '/?mode=live-rooms',
      badge: 'NEW',
                        src: 'src/assets/liveroom.png',
                              alt: 'exemplo word by word'
    }
  ];

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">




      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

         {/* Streak Progress Bar */}
         <div className="bg-white rounded-2xl shadow-md p-4 mb-4" onClick={() => setShowModal(true)}>
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
               <span className="text-sm font-bold text-gray-800">
                 Sequência de {streak.current} dia{streak.current !== 1 ? 's' : ''}
               </span>
             </div>
             <div className="flex items-center gap-2">
               {streak.freezes > 0 && (
                 <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg">
                   <CheckCircle className="w-3 h-3 text-blue-600" />
                   <span className="text-xs font-semibold text-blue-600">{streak.freezes} freeze{streak.freezes !== 1 ? 's' : ''}</span>
                 </div>
               )}
               <Trophy className="w-5 h-5 text-yellow-500" />
             </div>
           </div>

           {/* Progress bar com 7 círculos */}
           <div className="flex items-center gap-2">
             {[...Array(7)].map((_, index) => {
               const currentStreakMod = streak.current % 7;
               const isCompleted = index < currentStreakMod;
               const isTrophy = index === 6;

               return (
                 <React.Fragment key={index}>
                   <div
                     className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                       isCompleted
                         ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md scale-110'
                         : 'bg-gray-200'
                     }`}
                   >
                     {isTrophy ? (
                       <Gift className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} fill={isCompleted ? 'currentColor' : 'none'} />
                     ) : isCompleted ? (
                       <Flame className="w-4 h-4 text-white" fill="currentColor" />
                     ) : (
                       <div className="w-2 h-2 bg-gray-400 rounded-full" />
                     )}
                   </div>
                   {index < 6 && (
                     <div className={`flex-1 h-1 rounded transition-all ${isCompleted && index < currentStreakMod - 1 ? 'bg-orange-400' : 'bg-gray-200'}`} />
                   )}
                 </React.Fragment>
               );
             })}
           </div>

           <p className="text-xs text-gray-600 mt-3 text-center">
             {streak.current === 0
               ? 'O estudo consistente melhora o aprendizado 5x mais rápido!'
               : streak.current < 7
               ? `Continue assim! Mais ${7 - (streak.current % 7)} dia${7 - (streak.current % 7) !== 1 ? 's' : ''} para ganhar 1 freeze.`
               : `Incrível! Você já ganhou ${Math.floor(streak.current / 7)} freeze${Math.floor(streak.current / 7) > 1 ? 's' : ''}!
               Mais ${7 - (streak.current % 7)} dia${7 - (streak.current % 7) !== 1 ? 's' : ''} para ganhar +1 recompensa.`}
           </p>
         </div>

         {showModal && (
                   <StreakModal
                     isOpen={showModal}
                     onClose={() => setShowModal(false)}
                   />
                 )}

        {/* Level Progress Card */}
        <div className="bg-white rounded-2xl shadow-md p-3 md:p-4 mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Left - Speak phrases button */}
           <div className="bg-gradient-to-br from-purple-500 to-pink-500 px-3 md:px-6 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center min-w-[80px] md:min-w-[110px]">
             <Mic className="w-6 h-6 md:w-8 md:h-8 text-white mb-1 md:mb-2" />
             <span className="text-white font-bold text-xs md:text-sm text-center leading-tight">Speak<br/>phrases</span>
            </div>

            {/* Center - Level Info & Progress */}
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Level {currentLevel}</h2>
                  <p className="text-gray-600 text-xs md:text-sm">Complete {totalNeededForLevel} phrases total to advance</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs md:text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{totalCompleted} / {totalNeededForLevel}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500 relative"
                   style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Action Buttons */}
            <div className="hidden md:flex flex-col gap-2">
              <button onClick={() => setShowRankingModal(true)}
              className="border-2 border-purple-500 text-purple-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all text-sm whitespace-nowrap flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                View Ranking
              </button>
              <button
                onClick={() => handleNavigate('/?mode=chunk')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                Start training
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Buttons - Below Card */}
                          <div className="md:hidden grid grid-cols-2 gap-2 mb-8 px-4 botoespadding" >
                              <style jsx>{`
                                      .botoespadding {
                                        padding-top: 20px;
                                      }`}</style>
                            <button onClick={() => setShowRankingModal(true)}
                                className="border-2 border-purple-500 text-purple-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all text-sm flex items-center justify-center gap-1.5">
                              <CheckCircle className="w-4 h-4" />
                              Ranking
                            </button>
                            <button
                              onClick={() => handleNavigate('/?mode=chunk')}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1.5"
                            >
                              Start
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>

          {/* Preview Section - Speak Phrases */}
                          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-8">
                            <div className="flex items-center gap-3 mb-4">
                              <Mic className="w-6 h-6 text-purple-600" />
                              <h3 className="text-xl font-bold text-gray-900">How it Works</h3>
                            </div>

                              {/* Texto explicativo */}

                                          <ul className="space-y-2 text-sm text-gray-600">
                                              <li className="flex items-center gap-2">
                                                              <CheckCircle className="w-4 h-4 text-green-500" />
                                                              Frases escolhidas por estudos científicos linguísticos.
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                               Frequentes em conversas reais.
                                                              </li>
                                                              <li className="flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                               Fazem sentido completo (ex.: "no meio da noite").
                                                              </li>
                                            <li className="flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-500" />
                                              Real-time pronunciation feedback.
                                            </li>
                                            <li className="flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-500" />
                                              Word-by-word accuracy analysis.
                                            </li>

                                          </ul>

                              {/* Imagem do exemplo */}
                              <div class="imagemexemplo">
                                  <style jsx>{`
                                                                        .imagemexemplo {
                                                                          padding-top: 20px;
                                                                        }`}</style>
                                <img
                                  src="src/assets/wordbyword.png"
                                  alt="Pronunciation Feedback Example"
                                  className="w-full h-auto rounded-lg shadow-md"
                                />
                                </div>


                          </div>
        </div>

        <LevelRankingModal
                  isOpen={showRankingModal}
                  onClose={() => setShowRankingModal(false)}
                  currentUserId={userId}
                />





        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Ready to level up your English?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of learners improving their pronunciation every day
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleNavigate('/?mode=challenge')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Try Challenge Mode
            </button>
            <button
              onClick={() => handleNavigate('/?mode=live-rooms')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Join Live Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ feature, onNavigate }) => {
  const Icon = feature.icon;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full">
      {/* Header with gradient and icon */}
      <div className={`bg-gradient-to-r ${feature.gradient} p-4 relative`}>
        <div className="flex items-center gap-3 text-white">
          <Icon className="w-6 h-6" />
          <h3 className="text-xl font-bold">{feature.title}</h3>
        </div>

        {/* Badge */}
        {feature.badge && (
          <div className="absolute top-4 right-4 bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full">
            {feature.badge}
          </div>
        )}

        {/* Highlight Border */}
        {feature.highlight && (
          <div className="absolute inset-0 border-4 border-yellow-300 rounded-2xl animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="text-gray-700 text-sm leading-relaxed mb-4">
          {feature.description}
        </div>

        {/* Imagem do exemplo */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex-1">
          <img
            src={feature.src}
            alt={feature.alt}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* CTA Button - sempre no final */}
        <button
          onClick={() => onNavigate(feature.path)}
          className={`w-full bg-gradient-to-r ${feature.gradient} text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105 mt-auto`}
        >
          Start training
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
};

export default Dashboard;

// CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    0% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; pointer-events: none; }
  }

  .animate-fadeOut {
    animation: fadeOut 3s ease-in-out forwards;
  }
`;
document.head.appendChild(style);