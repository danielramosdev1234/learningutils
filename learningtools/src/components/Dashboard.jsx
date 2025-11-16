import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Globe, Hash, Zap, Video, Radio,
  TrendingUp, Target, Flame, Trophy,
  ArrowRight, Star, Clock, Users,
  CheckCircle, Award, MessageCircle, Gift, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import LevelRankingModal from './modals/LevelRankingModal';
import StreakModal from './modals/StreakModal';
import wordByWordImg from '../assets/wordbyword.png';
import translatePracticeImg from '../assets/translatepractice.png';
import numerosImg from '../assets/numeros.png';
import challengeImg from '../assets/challenge.png';
import videoListenerImg from '../assets/videolistener.png';
import liveRoomImg from '../assets/liveroom.png';
import categoriesImg from '../assets/categories.png';
import { LevelIndicator } from './leaderboard/LevelIndicator';
import PWAInstallCard from './ui/PWAInstallCard';





const Dashboard = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const { levelSystem, userId, stats } = useSelector(state => state.user);
  const streak = stats?.streak || { current: 0, longest: 0, history: [] };

    const [showRankingModal, setShowRankingModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detecta se é mobile
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
              id: 'categories',
              title: 'Categories/Subjects',
              description: (
                        <ul className="space-y-2 text-sm text-gray-600">
                                                                      <li className="flex items-center gap-2">
                                                                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                                                                      Treine frases de situações do seu interesse
                                                                                    </li>
                                                                                    <li className="flex items-center gap-2">
                                                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                                                       Simule conversas reais.
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
                      ),
              icon: BookOpen,
              gradient: 'from-indigo-500 to-purple-500 ',
              path: '/?mode=categories',
                                            src: categoriesImg,
                                                  alt: 'exemplo word by word'
            },{
          id: 'speak',
          title: 'Speak Phrases',
          description: (
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
                  ),
          icon: Mic,
          gradient: 'from-purple-500 to-pink-500 ',
          path: '/?mode=categories',
                                        src: wordByWordImg,
                                              alt: 'exemplo word by word'
        },
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
      path: '/?mode=speak-training-modes',
                                    src: translatePracticeImg,
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
      path: '/?mode=speak-training-modes',
                                  src: numerosImg ,
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
      path: '/?mode=speak-training-modes',
      highlight: true,
                           src: challengeImg ,
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
                                           src: videoListenerImg  ,
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
                        src: liveRoomImg   ,
                              alt: 'exemplo word by word'
    }
  ];

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const scrollToSlide = (index) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      // Largura do card = calc(100vw - 4rem) = viewport width - 64px (padding do container)
      const cardWidth = window.innerWidth - 64;
      const gap = 16; // gap-4 = 1rem = 16px
      const scrollPosition = index * (cardWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollLeft = container.scrollLeft;
      // Largura do card = calc(100vw - 4rem) = viewport width - 64px (padding do container)
      const cardWidth = window.innerWidth - 64;
      const gap = 16;
      const slideIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentSlide(Math.min(Math.max(0, slideIndex), features.length - 1));
    }
  };

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section com conteúdo textual para IAs - Visível apenas para bots e screen readers */}
      <div className="sr-only">
        <h1>Aprenda Inglês de Forma Prática e Divertida</h1>
        <p>
          LearnFun é uma plataforma interativa para aprender e praticar inglês com exercícios práticos, 
          feedback instantâneo de pronúncia e método gamificado. Melhore sua fluência em inglês de forma 
          eficaz através de reconhecimento de voz, análise fonética e múltiplos modos de treinamento.
        </p>
        <p>
          Pratique conversação em inglês sozinho, receba feedback em tempo real sobre sua pronúncia, 
          e desenvolva suas habilidades através de exercícios interativos projetados para iniciantes e 
          estudantes intermediários.
        </p>
      </div>




      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

         {/* PWA Install Card */}
         <PWAInstallCard />

         {/* Level Indicator */}
                         <LevelIndicator variant="full" />

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

            <div className="espaçobaixo">
                <style >{`
                        .espaçobaixo {
                          padding-bottom: 20px;
                          padding-top: 20px;
                        }`}</style>
           <p className="text-xs text-gray-600 mt-3 text-center">
             {streak.current === 0
               ? 'O estudo consistente melhora o aprendizado 5x mais rápido!'
               : streak.current < 7
               ? `Continue assim! Mais ${7 - (streak.current % 7)} dia${7 - (streak.current % 7) !== 1 ? 's' : ''} para ganhar 1 freeze.`
               : `Incrível! Você já ganhou ${Math.floor(streak.current / 7)} freeze${Math.floor(streak.current / 7) > 1 ? 's' : ''}!
               Mais ${7 - (streak.current % 7)} dia${7 - (streak.current % 7) !== 1 ? 's' : ''} para ganhar +1 recompensa.`}
           </p>
           </div>
           <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                           <div className="flex justify-between items-center mb-1">
                                             <span className="font-semibold text-yellow-800">🔥 Streak Bonus</span>
                                             <span className="text-yellow-600 text-base font-bold">+2 XP</span>
                                           </div>
                                           <p className="text-yellow-700">Consiga uma sequencia de 7+ dias para ganhar +2 XP bônus a cada exercício.</p>
                                         </div>
         </div>

         {showModal && (
                   <StreakModal
                     isOpen={showModal}
                     onClose={() => setShowModal(false)}
                   />
                 )}



        <LevelRankingModal
                  isOpen={showRankingModal}
                  onClose={() => setShowRankingModal(false)}
                  currentUserId={userId}
                />





        {/* Features - Grid no Desktop, Carrossel no Mobile */}
        {isMobile ? (
          <div className="relative">
            {/* Carrossel Mobile */}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide -mx-4 px-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="flex-shrink-0 snap-center"
                  style={{ width: 'calc(100vw - 4rem)' }}
                >
                  <FeatureCard
                    feature={feature}
                    onNavigate={handleNavigate}
                  />
                </div>
              ))}
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`p-2 rounded-full ${
                  currentSlide === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-all`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Indicadores */}
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-purple-600'
                        : 'w-2 bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === features.length - 1}
                className={`p-2 rounded-full ${
                  currentSlide === features.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-all`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}

        {/* Seção de Recursos e Benefícios - Visível apenas para bots e screen readers */}
        <div className="sr-only">
          <h2>Por que escolher o LearnFun para aprender inglês?</h2>
          <div>
            <h3>Prática de Conversação em Tempo Real</h3>
            <p>
              Pratique inglês sozinho usando tecnologia de reconhecimento de voz avançada. 
              Receba feedback instantâneo sobre sua pronúncia e melhore sua fluência através 
              de exercícios interativos que simulam conversas reais.
            </p>
          </div>
          <div>
            <h3>Sistema Gamificado de Aprendizado</h3>
            <p>
              Aprenda inglês de forma divertida com sistema de XP, níveis e conquistas. 
              Mantenha sua motivação com streaks diários e competa no leaderboard com outros 
              estudantes de inglês.
            </p>
          </div>
          <div>
            <h3>Análise Fonética Detalhada (IPA)</h3>
            <p>
              Receba análise detalhada de sua pronúncia com feedback fonético preciso. 
              Aprenda a pronunciar corretamente cada palavra através de visualizações 
              claras e comparações com a pronúncia nativa.
            </p>
          </div>
          <div>
            <h3>Múltiplos Modos de Treinamento</h3>
            <p>
              Escolha entre diferentes modos: frases por categorias (incluindo Speak Phrases), tradução, 
              números, vídeos e salas ao vivo. Cada modo foi projetado para desenvolver 
              habilidades específicas do inglês.
            </p>
          </div>
          <div>
            <h3>A melhor plataforma para aprender inglês online gratuitamente</h3>
            <p>
              LearnFun é a plataforma ideal para quem quer aprender inglês de forma prática e eficaz. 
              Nossa metodologia combina tecnologia de ponta com gamificação para tornar o aprendizado 
              de inglês divertido e motivador. Seja você um iniciante ou estudante intermediário, 
              temos exercícios adequados para seu nível.
            </p>
            <p>
              Comece agora mesmo e descubra como é fácil melhorar sua fluência em inglês 
              com feedback instantâneo, exercícios práticos e um sistema que se adapta ao seu ritmo de aprendizado.
            </p>
          </div>
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
              onClick={() => handleNavigate('/?mode=speak-training-modes')}
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
    </main>
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

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
if (!document.head.querySelector('style[data-dashboard]')) {
  style.setAttribute('data-dashboard', 'true');
  document.head.appendChild(style);
}