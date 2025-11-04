// src/components/ShareButton.jsx
import React, { useState } from 'react';
import { Share2, Download, Check, Copy, Gift } from 'lucide-react';
import { generateShareCard } from '../../utils/shareCardGenerator';
import { useSelector } from 'react-redux';
import { generateReferralShareText, trackReferralEvent } from '../../utils/referralUtils';
import { InviteFriendsScreen } from '../referral/InviteFriendsScreen';


export const ShareButton = ({
  phraseText,
  accuracy,
  totalPracticed = 0,
  streak = 0,
  variant = 'default' // 'default' | 'compact' | 'celebration'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const referral = useSelector(state => state.user.referral);
    const mode = useSelector(state => state.user.mode);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const handleShareReferral = (platform) => {
            if (!referral?.code) {
              alert('⚠️ Faça login para ganhar seu código de convite!');
              return;
            }

            const texts = generateReferralShareText(referral.code);
            const link = `${window.location.origin}/?ref=${referral.code}`;

            trackReferralEvent('referral_shared_from_result', {
              platform,
              code: referral.code,
              accuracy
            });

            if (platform === 'whatsapp') {
              const whatsappText = encodeURIComponent(texts.whatsapp);
              window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
            } else if (platform === 'telegram') {
              const telegramText = encodeURIComponent(texts.telegram);
              window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${telegramText}`, '_blank');
            } else {
              // Copia link
              navigator.clipboard.writeText(link);
              alert('✅ Link de convite copiado! Cole no WhatsApp, Instagram ou onde quiser!');
            }
          };

  // ⭐ ADICIONAR TODA ESTA FUNÇÃO AQUI (entre linha 14 e 16)
  const generateShareText = (platform) => {
    const appUrl = 'https://learnfun-sigma.vercel.app';

    // 🥇 RANKING EMOJIS baseado no score
    const getRankingEmoji = () => {
      if (accuracy === 100) return '🥇';
      if (accuracy >= 95) return '🥈';
      if (accuracy >= 90) return '🥉';
      if (accuracy >= 80) return '🏅';
      return '⭐';
    };

    // 💬 FRASES MOTIVACIONAIS
    const motivationalPhrases = {
      perfect: [
        'Pronúncia nativa desbloqueada! 🔓',
        'Isso é o que eu chamo de fluência! 🌟',
        'Gringo ia pensar que você nasceu nos EUA! 🇺🇸',
        'Sotaque brasileiro? Nem sinal! 🎯',
        'Professor nativo aprovaria! ✅'
      ],
      great: [
        'Tá quase fluente! Mais um pouco! 💪',
        'Seu sotaque tá melhorando demais! 📈',
        'Gringo já tá te entendendo perfeitamente! 👂',
        'Continua assim que chega nos 100%! 🚀',
        'Tá no caminho da fluência! 🛤️'
      ],
      good: [
        'Progresso é progresso! Segue firme! 💪',
        'Cada % conta! Você tá evoluindo! 📊',
        'Persistência é a chave! Continue! 🔑',
        'Tá melhor que ontem! É isso aí! ⬆️',
        'Prática leva à perfeição! 🎯'
      ],
      improving: [
        'Todo expert foi iniciante um dia! 🌱',
        'O importante é não desistir! 💪',
        'Cada tentativa te deixa melhor! 📈',
        'Sotaque se treina, não se nasce com! 🏋️',
        'Persistência vence talento! 🔥'
      ]
    };

    const getPhraseCategory = () => {
      if (accuracy === 100) return 'perfect';
      if (accuracy >= 90) return 'great';
      if (accuracy >= 80) return 'good';
      return 'improving';
    };



    const category = getPhraseCategory();
    const phrases = motivationalPhrases[category];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // 📊 COMPARAÇÃO COM MÉDIA
    const getAverageComparison = () => {
      const globalAverage = 75;

      if (accuracy > globalAverage + 10) {
        return `\n\n📊 Você tá ${accuracy - globalAverage}% acima da média! 🔥`;
      } else if (accuracy > globalAverage) {
        return `\n\n📊 Acima da média global (${globalAverage}%)! 👏`;
      } else if (accuracy === globalAverage) {
        return `\n\n📊 Na média global (${globalAverage}%)! Você consegue mais! 💪`;
      } else {
        return `\n\n📊 Média global: ${globalAverage}%. Continue treinando! 🎯`;
      }
    };

    const rankEmoji = getRankingEmoji();
    const scoreDisplay = `${rankEmoji} ${accuracy}%`;

    const practiceText = totalPracticed > 50
      ? `\n🔥 ${totalPracticed} frases dominadas! VETERANO!`
      : totalPracticed > 20
      ? `\n💪 ${totalPracticed} frases praticadas! Tá ficando ninja!`
      : totalPracticed > 10
      ? `\n📈 ${totalPracticed} frases! Consistência é tudo!`
      : totalPracticed > 5
      ? `\n⭐ ${totalPracticed} frases! Só o começo!`
      : totalPracticed > 0
      ? `\n✨ ${totalPracticed} frases praticadas`
      : '';

    const comparisonText = getAverageComparison();

    const getChallenge = () => {
      if (accuracy === 100) {
        return 'Consegue 100% em 3 frases seguidas? 🎯';
      } else if (accuracy >= 95) {
        return 'Falta pouco pro 100%! Você consegue? 🔥';
      } else if (accuracy >= 90) {
        return 'Será que você chega nos 95%? 💪';
      } else if (accuracy >= 80) {
        return 'Desafio: bater 90% na próxima! 📈';
      } else {
        return 'Vamos treinar juntos? Quanto você tira? 🚀';
      }
    };

    const challenge = getChallenge();

    const hashtags = platform === 'twitter' || platform === 'facebook'
      ? '\n\n#DesafioLearnFun #inglês #pronúncia #fluência #sotaque'
      : '';

    const templates = {
      whatsapp: `${scoreDisplay} no LearnFun!

  ${randomPhrase}

  Frase: "${phraseText}"
  ${practiceText}${comparisonText}

  ${challenge}

  Aceita o #DesafioLearnFun?
  ${appUrl}

  Manda teu resultado aqui! 👇`,

      telegram: `${scoreDisplay} de pronúncia!

  ${randomPhrase}

  Frase: "${phraseText}"
  ${practiceText}${comparisonText}

  ${challenge}

  #DesafioLearnFun
  ${appUrl}

  Quem topa? 🔥`,

      twitter: `${scoreDisplay} no #DesafioLearnFun!

  ${randomPhrase}

  "${phraseText}"
  ${practiceText}${comparisonText}

  ${challenge}

  Testa: ${appUrl}${hashtags}`,

      facebook: `${scoreDisplay} no LearnFun! ${rankEmoji}

  ${randomPhrase}

  Acabei de praticar: "${phraseText}"
  ${practiceText}${comparisonText}

  ${challenge}

  🎯 DESAFIO ABERTO:
  1. Acesse: ${appUrl}
  2. Pratique a mesma frase
  3. Compartilhe seu resultado
  4. Marca quem você desafia!

  Quem consegue me superar? 💪

  #DesafioLearnFun - Vamos ver quem tem o melhor inglês! 🏆${hashtags}`,

linkedin: `${scoreDisplay} no LearnFun!

${randomPhrase}

Acabei de praticar pronúncia em inglês: "${phraseText}"
${practiceText}${comparisonText}

${challenge}

Pratique gratuitamente: ${appUrl}

#LearnFun #English #Pronunciation #LanguageLearning #ProfessionalDevelopment #CareerDevelopment`,

      download: `${scoreDisplay} no LearnFun!

  ${randomPhrase}

  "${phraseText}"
  ${practiceText}${comparisonText}

  ${challenge}

  #DesafioLearnFun
  ${appUrl}`
    };

    return templates[platform] || templates.download;
  };

  const handleShare = async (platform = 'auto') => {
    setIsGenerating(true);

    try {
      // Gera o card visual
      const cardDataUrl = await generateShareCard({
        phraseText,
        accuracy,
        totalPracticed,
        streak
      });

      const appUrl = 'https://learnfun-sigma.vercel.app';

      // Compartilhamento específico por plataforma
     if (platform === 'whatsapp') {
       const shareText = generateShareText('whatsapp');

       // ✅ Detecta se é mobile ou desktop
       const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

       // MOBILE: Usa compartilhamento nativo
       if (isMobile && navigator.share) {
         try {
           const blob = await (await fetch(cardDataUrl)).blob();
           const file = new File([blob], 'learnfun-result.png', { type: 'image/png' });

           // ✅ TENTA COM TEXTO + IMAGEM PRIMEIRO
           const shareDataWithFile = {
             text: shareText,
             files: [file]
           };

           if (navigator.canShare && navigator.canShare(shareDataWithFile)) {
             alert('✅ Image and text ready!\n\n📱 Choose WhatsApp in the next screen\n💡 The text and image will be sent together!\n\n(✅ Imagem e texto prontos!\n\n📱 Escolha WhatsApp na próxima tela\n💡 O texto e a imagem serão enviados juntos!)');

             await navigator.share(shareDataWithFile);

             setShowSuccess(true);
             setTimeout(() => setShowSuccess(false), 3000);
             return;
           }

           // ✅ SE NÃO SUPORTAR ARQUIVO + TEXTO, USA URL DO WHATSAPP
           alert('📱 Opening WhatsApp with your message!\n💡 The image was downloaded, send it manually.\n\n(📱 Abrindo WhatsApp com sua mensagem!\n💡 A imagem foi baixada, envie manualmente.)');

           downloadImage(cardDataUrl, accuracy);

           // Limpa emojis problemáticos
           const urlSafeText = shareText
             .replace(/🥇|🥈|🥉/g, '🏆')
             .replace(/🏅/g, '⭐')
             .replace(/💎/g, '✨')
             .replace(/🔒|🔓|🔑/g, '🔐')
             .replace(/🛤️/g, '🚀')
             .replace(/🏋️/g, '💪');

           const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(urlSafeText)}`;
           window.open(whatsappUrl, '_blank');

           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
           return;

         } catch (err) {
           if (err.name === 'AbortError') {
             return; // Usuário cancelou
           }

           console.log('Native share failed, using WhatsApp URL');

           // ✅ FALLBACK FINAL: URL do WhatsApp
           alert('📱 Opening WhatsApp with your message!\n💡 The image was downloaded, send it manually.\n\n(📱 Abrindo WhatsApp com sua mensagem!\n💡 A imagem foi baixada, envie manualmente.)');

           downloadImage(cardDataUrl, accuracy);

           const urlSafeText = shareText
             .replace(/🥇|🥈|🥉/g, '🏆')
             .replace(/🏅/g, '⭐')
             .replace(/💎/g, '✨')
             .replace(/🔒|🔓|🔑/g, '🔐')
             .replace(/🛤️/g, '🚀')
             .replace(/🏋️/g, '💪');

           const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(urlSafeText)}`;
           window.open(whatsappUrl, '_blank');
         }
       }

       // DESKTOP: Copia texto + baixa imagem + mostra instruções
       await navigator.clipboard.writeText(shareText);
       downloadImage(cardDataUrl, accuracy);

       // Mostra instruções amigáveis
       alert('✅ Text copied and image downloaded!\n\n📱 Open WhatsApp Web and paste (Ctrl+V)\n💡 Or send the image from your phone! \n\n(✅ Texto copiado e imagem baixada!\n\n📱 Abra o WhatsApp Web e cole (Ctrl+V)\n💡 Ou envie a imagem do seu celular!)');


       setShowSuccess(true);
       setTimeout(() => setShowSuccess(false), 3000);
       return;
     }

      if (platform === 'twitter') {
        const shareText = generateShareText('twitter');

        downloadImage(cardDataUrl, accuracy);
        alert('📋 Image downloaded! Now compose your tweet with the image.\n\n(Imagem baixada! Agora componha seu tweet com a imagem.)');

        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      if (platform === 'facebook') {
        const shareText = generateShareText('facebook');
        const appUrl = 'https://learnfun-sigma.vercel.app';
        await navigator.clipboard.writeText(shareText);


          alert('📋 Text copied! Paste it in your Facebook post along with the image. (Texto copiado! Cole-o na sua publicação do Facebook junto com a imagem.)');

          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;

          window.open(facebookUrl, '_blank');

          downloadImage(cardDataUrl, accuracy);


        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      if (platform === 'telegram') {
        const shareText = generateShareText('telegram');
        const appUrl = 'https://learnfun-sigma.vercel.app';
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank');

        downloadImage(cardDataUrl, accuracy);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

        if (platform === 'linkedin') {
          const shareText = generateShareText('linkedin');
          const appUrl = 'https://learnfun-sigma.vercel.app';

          // LinkedIn aceita URL + título + descrição
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;

          // Copia o texto para o usuário colar
          await navigator.clipboard.writeText(shareText);



          alert('📋 Text copied! Paste it in your LinkedIn post along with the image. (📋 Texto copiado! Cole-o na sua publicação do LinkedIn junto com a imagem.)');

            window.open(linkedinUrl, '_blank');
          downloadImage(cardDataUrl, accuracy);

          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return;
        }

      if (platform === 'download') {
        const shareText = generateShareText('download');
        downloadImage(cardDataUrl, accuracy);

        await navigator.clipboard.writeText(shareText);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }

      // Compartilhamento nativo (mobile)
      if (navigator.share && navigator.canShare) {
          const shareText = generateShareText('download')
        const blob = await (await fetch(cardDataUrl)).blob();
        const file = new File([blob], 'learnfun-result.png', { type: 'image/png' });

        const shareData = {
          title: `I got ${accuracy}% on LearnFun! 🎉`,
          text: shareText,
          files: [file]
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return;
        }
      }

      // Fallback: Mostra opções
      const shareText = generateShareText('download');
      downloadImage(cardDataUrl, accuracy);
      await navigator.clipboard.writeText(shareText);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('❌ Share error:', error);
      alert('Could not share. Try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function para baixar imagem
  const downloadImage = (dataUrl, accuracy) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `learnfun-${accuracy}-percent.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Variante compacta (menu de opções)
  if (variant === 'compact') {
    return (
      <div className="relative">
         {/* ✅ NOVO: Seção de Referral */}
                              {mode === 'authenticated' && referral?.code && (
                                <>


                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border-2 border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Gift className="text-purple-600" size={20} />
                                      <h4 className="font-bold text-gray-800">Convide Amigos</h4>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">
                                      Ganhe <span className="font-bold text-purple-600">+5 skip frases</span> a cada amigo!
                                    </p>

                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handleShareReferral('whatsapp')}
                                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                                      >
                                        💬 WhatsApp
                                      </button>

                                      <button
                                        onClick={() => handleShareReferral('telegram')}
                                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                                      >
                                        ✈️ Telegram
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => { setShowInviteModal(true); }}
                                      className="w-full mt-2 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                                    >
                                      Gerenciar Convites
                                    </button>
                                  </div>
                                </>
                              )}

                          {/* Modal Invite Friends */}
                                    {showInviteModal && (
                                      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                                        <InviteFriendsScreen onBack={() => setShowInviteModal(false)} />
                                      </div>
                                    )}
      </div>
    );
  }

  // Variante celebração (expansível com redes sociais)
  if (variant === 'celebration') {
    return (
      <div className="mt-4 space-y-3">



         {/* ✅ NOVO: Seção de Referral */}
                {mode === 'authenticated' && referral?.code && (
                  <>


                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="text-purple-600" size={20} />
                        <h4 className="font-bold text-gray-800">Convide Amigos</h4>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        Ganhe <span className="font-bold text-purple-600">+5 skip frases</span> a cada amigo!
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShareReferral('whatsapp')}
                          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                        >
                          💬 WhatsApp
                        </button>

                        <button
                          onClick={() => handleShareReferral('telegram')}
                          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                        >
                          ✈️ Telegram
                        </button>
                      </div>

                      <button
                        onClick={() => { setShowInviteModal(true); }}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                      >
                        Gerenciar Convites
                      </button>
                    </div>
                  </>
                )}

            {/* Modal Invite Friends */}
                      {showInviteModal && (
                        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                          <InviteFriendsScreen onBack={() => setShowInviteModal(false)} />
                        </div>
                      )}

        {showSuccess && (
          <div className="text-center p-3 bg-green-50 border border-green-300 rounded-lg animate-fade-in">
            <p className="text-green-700 font-semibold">✅ Image downloaded! Share it on your social media!</p>
          </div>
        )}
      </div>
    );
  }

  // Variante padrão
  return (
    <div className="space-y-2">
      {/* ✅ NOVO: Seção de Referral */}
                      {mode === 'authenticated' && referral?.code && (
                        <>


                          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border-2 border-purple-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Gift className="text-purple-600" size={20} />
                              <h4 className="font-bold text-gray-800">Convide Amigos</h4>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">
                              Ganhe <span className="font-bold text-purple-600">+5 skip frases</span> a cada amigo!
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleShareReferral('whatsapp')}
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                              >
                                💬 WhatsApp
                              </button>

                              <button
                                onClick={() => handleShareReferral('telegram')}
                                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                              >
                                ✈️ Telegram
                              </button>
                            </div>

                            <button
                              onClick={() => { setShowInviteModal(true); }}
                              className="w-full mt-2 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm"
                            >
                              Gerenciar Convites
                            </button>
                          </div>
                        </>
                      )}

                  {/* Modal Invite Friends */}
                            {showInviteModal && (
                              <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                                <InviteFriendsScreen onBack={() => setShowInviteModal(false)} />
                              </div>
                            )}
    </div>
  );
};