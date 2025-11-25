// ⚠️ Importante: este arquivo cuida APENAS da interface da aplicação.
// Os arquivos JSON em src/data/*_phrases.json continuam em inglês (ou idioma original)
// e NÃO são modificados por este sistema de tradução.

export const UI_TRANSLATIONS = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
      loadingPage: 'Carregando página...',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
    },
    auth: {
      loginWithGoogle: 'Entrar com Google',
      loggingIn: 'Entrando...',
      loginSuccess: '✅ Login realizado com sucesso!',
      loginMigrated: '🎉 Bem-vindo! {{count}} frases foram migradas para sua conta!',
      loginError: '❌ Erro ao fazer login. Tente novamente.',
      logout: 'Sair',
      logoutConfirm: 'Tem certeza que deseja sair? Seu progresso está salvo na nuvem.',
      notifications: 'Notificações',
      userMenuAria: 'Menu do usuário {{name}}',
      profilePictureAlt: 'Foto de perfil de {{name}}',
      openNotificationSettingsAria: 'Abrir configurações de notificações',
      closeMenuAria: 'Fechar menu',
      userMenuLabel: 'Menu do usuário',
      language: 'Idioma da interface',
      portugueseBR: 'Português (BR)',
      englishUS: 'English (US)',
    },
    navigation: {
      home: 'Início',
      aiChat: 'Chat IA',
      speakTraining: 'Fala',
      liveRooms: 'Salas ao Vivo',
      video: 'Vídeo',
      more: 'Mais',
      moreOptions: 'Mais opções',
      faq: 'Perguntas Frequentes',
      inviteFriends: 'Convide Amigos',
      inviteFriendsSubtitle: 'Ganhe +5 pular frases • Grátis',
      whatsappCommunity: 'Comunidade LearnFun',
      whatsappCommunitySubtitle: 'Suporte e Dicas • WhatsApp',
    },
    onboarding: {
      guidedTour: 'Tour guiado',
      stepOf: 'Passo {{step}} de {{total}}',
      closeTourAria: 'Pular tutorial',
      step1Title: 'Bem-vindo ao LearnFun!',
      step1Description: 'Vamos te mostrar rapidamente como dominar o inglês com treinos guiados.',
      step1Bullet1: 'Escolha modos de prática pensados para situações reais.',
      step1Bullet2: 'Aprenda frases organizadas por temas essenciais.',
      step1Bullet3: 'Participe de experiências ao vivo quando quiser evoluir mais.',
      step1Primary: 'Ver categorias',
      step2Title: 'Explore o modo Categories',
      step2Description: 'Cada categoria reúne frases prontas para você usar no dia a dia.',
      step2Bullet1: 'Veja o tema, descrição e progresso de cada coleção.',
      step2Bullet2: 'Escolha o que quer treinar agora com total liberdade.',
      step2Bullet3: 'Revise quantas vezes quiser para fixar o conteúdo.',
      step2Primary: 'Explorar Daily Basics',
      step3Title: 'Daily Basics na prática',
      step3Description: 'Aqui está sua primeira frase para destravar conversas do dia a dia.',
      step3Bullet1: 'Clique em "Ouvir" para escutar a pronúncia nativa.',
      step3Bullet2: 'Use o microfone para repetir e receber feedback imediato.',
      step3Bullet3: 'Marque como concluída e avance para a próxima expressão.',
      step3Primary: 'Começar prática',
    },
    dashboard: {
      // SEO Content
      seoTitle: 'Aprenda Inglês de Forma Prática e Divertida',
      seoDescription: 'LearnFun é uma plataforma interativa para aprender e praticar inglês com exercícios práticos, feedback instantâneo de pronúncia e método gamificado. Melhore sua fluência em inglês de forma eficaz através de reconhecimento de voz, análise fonética e múltiplos modos de treinamento.',
      seoDescription2: 'Pratique conversação em inglês sozinho, receba feedback em tempo real sobre sua pronúncia, e desenvolva suas habilidades através de exercícios interativos projetados para iniciantes e estudantes intermediários.',
      whyLearnfun: 'Por que escolher o LearnFun para aprender inglês?',
      conversationPractice: 'Prática de Conversação em Tempo Real',
      conversationDesc: 'Pratique inglês sozinho usando tecnologia de reconhecimento de voz avançada. Receba feedback instantâneo sobre sua pronúncia e melhore sua fluência através de exercícios interativos que simulam conversas reais.',
      gamifiedSystem: 'Sistema Gamificado de Aprendizado',
      gamifiedDesc: 'Aprenda inglês de forma divertida com sistema de XP, níveis e conquistas. Mantenha sua motivação com streaks diários e compita no leaderboard com outros estudantes de inglês.',
      phoneticAnalysis: 'Análise Fonética Detalhada (IPA)',
      phoneticDesc: 'Receba análise detalhada de sua pronúncia com feedback fonético preciso. Aprenda a pronunciar corretamente cada palavra através de visualizações claras e comparações com a pronúncia nativa.',
      multipleTraining: 'Múltiplos Modos de Treinamento',
      multipleDesc: 'Escolha entre diferentes modos: frases por categorias (incluindo Speak Phrases), tradução, números, vídeos e salas ao vivo. Cada modo foi projetado para desenvolver habilidades específicas do inglês.',
      bestPlatform: 'A melhor plataforma para aprender inglês online gratuitamente',
      bestPlatformDesc1: 'LearnFun é a plataforma ideal para quem quer aprender inglês de forma prática e eficaz. Nossa metodologia combina tecnologia de ponta com gamificação para tornar o aprendizado de inglês divertido e motivador. Seja você um iniciante ou estudante intermediário, temos exercícios adequados para seu nível.',
      bestPlatformDesc2: 'Comece agora mesmo e descubra como é fácil melhorar sua fluência em inglês com feedback instantâneo, exercícios práticos e um sistema que se adapta ao seu ritmo de aprendizado.',

      // Streak
      streakTitle: 'Sequência de {{count}} {{unit}}',
      consistentStudy: 'O estudo consistente melhora o aprendizado 5x mais rápido!',
      streakKeepGoing: 'Continue assim! Mais {{days}} {{unit}} para ganhar 1 freeze.',
      streakAmazing: 'Incrível! Você já ganhou {{freezeCount}} {{freezeLabel}}! Mais {{days}} {{dayLabel}} para ganhar +1 recompensa.',
      streakBonusTitle: 'Bônus de Streak',
      streakBonusText: 'Consiga uma sequência de 7+ dias para ganhar +2 XP bônus a cada exercício.',

      // CTA
      ctaTitle: 'Pronto para elevar o seu inglês para o próximo nível?',
      ctaSubtitle: 'Junte-se a milhares de alunos melhorando a pronúncia todos os dias',
      ctaChallengeButton: 'Experimentar Modo Desafio',
      ctaLiveRoomButton: 'Entrar em Sala Ao Vivo',

      // Features
      featureStartTraining: 'Começar treino',

      // Feature Cards
      categoriesTitle: 'Categories/Subjects',
      categoriesDesc1: 'Treine frases de situações do seu interesse',
      categoriesDesc2: 'Simule conversas reais.',
      categoriesDesc3: 'Real-time pronunciation feedback.',
      categoriesDesc4: 'Word-by-word accuracy analysis.',

      speakTitle: 'Speak Phrases',
      speakDesc1: 'Frases escolhidas por estudos científicos linguísticos.',
      speakDesc2: 'Frequentes em conversas reais.',
      speakDesc3: 'Fazem sentido completo (ex.: "no meio da noite").',
      speakDesc4: 'Real-time pronunciation feedback.',
      speakDesc5: 'Word-by-word accuracy analysis.',

      translateTitle: 'Translate & Practice',
      translateDesc1: 'Escreva ou fale frases em português.',
      translateDesc2: 'Traduza para Inglês e pratique a pronúncia.',
      translateDesc3: 'Real-time pronunciation feedback.',
      translateDesc4: 'Word-by-word accuracy analysis.',

      numbersTitle: 'Number Trainer',
      numbersDesc1: 'Números aleatórios gerados automaticamente.',
      numbersDesc2: 'Pratique pronúncia em inglês e outros idiomas.',
      numbersDesc3: 'Leaderboard com ranking global.',
      numbersDesc4: 'Acompanhe seu progresso e compete.',

      challengeTitle: 'Challenge Mode',
      challengeDesc1: '60 segundos para máximo de frases.',
      challengeDesc2: 'Precisa de 90% de precisão para avançar.',
      challengeDesc3: 'Ranking dos top 10 jogadores.',
      challengeDesc4: 'Teste suas habilidades em tempo real.',

      videoTitle: 'Video Learning',
      videoDesc1: 'Cenas de filmes e frases famosas.',
      videoDesc2: 'Clipes curtos com perguntas interativas.',
      videoDesc3: 'Vocabulário real em contextos naturais.',
      videoDesc4: 'Aprenda com situações do dia a dia.',

      liveRoomsTitle: 'Live Rooms',
      liveRoomsDesc1: 'Salas de voz ao vivo em tempo real.',
      liveRoomsDesc2: 'Pratique com outros estudantes.',
      liveRoomsDesc3: 'Crie sua própria sala ou entre em existentes.',
      liveRoomsDesc4: 'Ambiente seguro e colaborativo.',
      liveRoomsBadge: 'NOVO',
    },
    categoryTrainer: {
      // Loading
      loadingCategories: 'Carregando categorias...',

      // Category Selection Screen
      practiceByCategory: 'Pratique por Categoria',
      chooseTopicMaster: 'Escolha um tópico e domine frases essenciais!',
      progress: 'Progresso:',
      phrases: 'frases',
      complete: 'Completo',
      startPracticing: 'Começar a Praticar',
      tipTitle: 'Dica:',
      tipText: 'Cada categoria contém frases do mundo real que você pode usar imediatamente. Pratique diariamente para melhores resultados!',

      // Practice Screen
      backToCategories: 'Voltar para Categorias',
      phraseOf: 'Frase {{current}} de {{total}}',
      completedThisSession: '{{count}} frase{{plural}} concluída{{plural}} nesta sessão!',
      noPhrasesAvailable: 'Nenhuma frase disponível para esta categoria',
      goBack: 'Voltar',

      // Categories
      dailyBasics: 'Daily Basics',
      dailyBasicsDesc: 'Frases essenciais do dia a dia',
      travelSurvival: 'Travel Survival',
      travelSurvivalDesc: 'Frases para viajantes',
      workProfessional: 'Work & Professional',
      workProfessionalDesc: 'Comunicação empresarial',
      shoppingMoney: 'Shopping & Money',
      shoppingMoneyDesc: 'Compras e pagamentos',
      socialEnglish: 'Social English',
      socialEnglishDesc: 'Conversas casuais',
      techInterview: 'Tech Interview',
      techInterviewDesc: 'Entrevista Técnica - Desenvolvedor Fullstack',
      clinicalResearch: 'Clinical Research',
      clinicalResearchDesc: 'Ensaios clínicos e pesquisa',
      speakPhrases: 'Speak Phrases',
      speakPhrasesDesc: 'Pratique frases especializadas em treinamento de pronúncia',
      essentialQuestions: 'Essential Questions',
      essentialQuestionsDesc: 'Perguntas essenciais com dicas de gramática',
      verbTenses: 'Verb Tenses',
      verbTensesDesc: 'Domine os tempos presente, passado e futuro',

      // Guided Tour
      tourTitle: 'Tour guiado Daily Basics',
      tourIntro: 'Vamos passar rapidamente por cada parte da prática para você aproveitar ao máximo.',
      tourStart: 'Começar',
      tourPhraseTitle: 'Frase em inglês',
      tourPhraseDesc: 'Esta é a frase que você vai praticar agora. Leia com atenção para se preparar.',
      tourTranslationTitle: 'Tradução em português',
      tourTranslationDesc: 'Aqui você vê o significado em português para conectar ideias e contexto.',
      tourIpaTitle: 'Pronúncia com IPA',
      tourIpaDesc: 'O IPA detalha cada som da frase. Use-o para ajustar pronúncias que ainda soam estranhas.',
      tourSpeakTitle: 'Hora de praticar',
      tourSpeakDesc: 'Toque em Speak, repita a frase "Hello" e depois vamos analisar o feedback juntos.',
      tourFeedbackTitle: 'Veja o painel de feedback',
      tourFeedbackDesc: 'Aqui você enxerga o resultado geral da sua prática com tudo que precisa para melhorar.',
      tourYouSaidTitle: 'Entenda o "You said"',
      tourYouSaidDesc: 'Mostra exatamente o que o reconhecimento de voz captou da sua fala em inglês. Compare para ver se foi interpretado corretamente.',
      tourAccuracyTitle: 'Precisão com o "Accuracy"',
      tourAccuracyDesc: 'Indica o quão perto você chegou da frase original. Quanto mais próximo de 100%, mais fiel foi a pronúncia.',
      tourWordTitle: 'Word-by-Word Analysis',
      tourWordDesc: 'Analisa cada palavra e aponta diferenças de pronúncia entre o que você falou e a frase original para ajustar detalhes.',
      tourNextTitle: 'Avance para a próxima frase',
      tourNextDesc: 'Toque em "Next" para seguir para a próxima frase e continuar praticando com o mesmo foco.',
      lexySkipConfirm: 'Tem certeza que deseja pular o tutorial?',
      lexySkipYes: 'Sim, pular',
      lexySkipNo: 'Continuar aprendendo',
      lexyReplayAudio: 'Ouvir novamente',
      lexyUnlockFeatures: '🎉 Desbloqueie Todos os Recursos!',
            lexyLoginBenefit: 'Faça login com Google e ganhe acesso completo',

            lexyAvailableResources: '🎁 Recursos Disponíveis',
            lexyTrainingModes: '7 Modos de Treinamento',
            lexyTrainingModesDesc: 'Categories, Speak, Translate, Numbers, Challenge, Video, Live Rooms',

            lexyIPAAnalysis: 'Análise IPA',
            lexyIPADescription: 'Transcrição fonética detalhada de cada frase',

            lexyGamification: 'Gamificação',
            lexyGamificationDescription: 'Sistema de níveis, XP, conquistas e recompensas',

            lexyLeaderboard: 'Ranking',
            lexyLiveRooms: 'Salas Ao Vivo',

            lexyImportant: '⚠️ Importante',
            lexyNoSaveWarning: 'Seu progresso como visitante não será salvo',

            lexyLoginWithGoogle: '🔒 Fazer Login com Google',
            lexyContinueWithoutLogin: 'Continuar sem Login',
            lexyCanLoginLater: 'Você pode fazer login depois a qualquer momento',
    },
    speakTrainingModes: {
      // Header
      back: 'Voltar',
      backToDashboard: 'Voltar para o dashboard',
      speakTrainingModes: 'Modos de Treino de Fala',
      choosePreferred: 'Escolha sua forma preferida de praticar pronúncia',

      // Training Modes
      categories: 'Categories',
      categoriesDesc: 'Pratique frases por situações e tópicos do mundo real',
      translate: 'Translate',
      translateDesc: 'Pratique tradução e melhore seu vocabulário',
      numbers: 'Numbers',
      numbersDesc: 'Domine a pronúncia de números em inglês',
      challenge: 'Challenge',
      challengeDesc: 'Teste suas habilidades com desafios cronometrados',
      sentenceBuilder: 'Sentence Builder',
      sentenceBuilderDesc: 'Construa frases com arrastar e soltar',

      // Actions
      startTraining: 'Começar Treino',
      openMode: 'Abrir modo {{mode}}',

      // Tips
      tipsTitle: 'Dicas para Melhores Resultados',
      tipsText: '💡 Pratique diariamente por pelo menos 10 minutos. Cada modo desenvolve habilidades diferentes para ajudá-lo a se tornar fluente!',
    },phraseCard: {
        // Grammar Notes
        grammarTips: 'Dicas de Gramática',
        clickToSeeGrammar: 'Clique para ver explicações gramaticais',
        hideGrammarTips: 'Ocultar dicas de gramática',
        showGrammarTips: 'Mostrar dicas de gramática',
        structure: 'Estrutura',
        explanation: 'Explicação',
        why: 'Por quê?',
        keyWord: 'Palavra-chave',
        pronunciationTip: 'Dica de Pronúncia',
        commonMistake: 'Erro Comum',
        negativeForm: 'Forma Negativa',
        questionForm: 'Forma Interrogativa',
        timeMarkers: 'Marcadores de Tempo',
        alternativeForms: 'Formas Alternativas',

        // Buttons
        skip: 'Pular',
        hear: 'Ouvir',
        speak: 'Falar',
        stop: 'Parar',
        next: 'Próximo',

        // Voice Selector
        chooseVoice: 'Escolher Voz',
        availableVoices: '{{count}} disponíveis no seu dispositivo',
        selectAndTest: 'Selecione a voz e clique aqui para Testar',

        // Audio Playback
        stopRecording: 'Parar Gravação',
        hearYourRecording: 'Ouvir sua Gravação',

        // Feedback
        perfect: 'Perfeito! 🎉',
        veryGood: 'Muito Bom! 👏',
        keepPracticing: 'Continue Praticando! 💪',
        youSaid: 'Você disse:',
        recordingListening: '🎙️ Gravando & Ouvindo...',

        // Errors
        micPermissionDenied: '🔒 Permissão de microfone negada. Clique no ícone 🔒 e permita o acesso.',
        error: 'Erro:',

        // Tooltips/Aria
        skipPhraseTooltip: 'Você tem {{count}} frases para pular',
        playAudioAria: 'Reproduzir áudio da frase',
        clickToHearCorrect: 'Clique para ouvir a pronúncia correta.',
        startRecordingAria: 'Iniciar gravação',
        stopRecordingAria: 'Parar gravação',
        clickToStartSpeaking: 'Clique para começar a falar',
        clickToStopRecording: 'Clique para parar a gravação',
        stopPlaybackAria: 'Parar reprodução da gravação',
        playRecordingAria: 'Reproduzir minha gravação',
        resultAria: 'Resultado: {{similarity}}% de acurácia',
      },

  },
  'en-US': {
    common: {
      loading: 'Loading...',
      loadingPage: 'Loading page...',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    auth: {
      loginWithGoogle: 'Sign in with Google',
      loggingIn: 'Signing in...',
      loginSuccess: '✅ Login successful!',
      loginMigrated: '🎉 Welcome! {{count}} phrases were migrated to your account!',
      loginError: '❌ Error while signing in. Please try again.',
      logout: 'Sign out',
      logoutConfirm: 'Are you sure you want to sign out? Your progress is saved in the cloud.',
      notifications: 'Notifications',
      userMenuAria: 'User menu for {{name}}',
      profilePictureAlt: 'Profile picture of {{name}}',
      openNotificationSettingsAria: 'Open notification settings',
      closeMenuAria: 'Close menu',
      userMenuLabel: 'User menu',
      language: 'Interface language',
      portugueseBR: 'Portuguese (BR)',
      englishUS: 'English (US)',
    },
    navigation: {
      home: 'Home',
      aiChat: 'AI Chat',
      speakTraining: 'Speak',
      liveRooms: 'Live Rooms',
      video: 'Video',
      more: 'More',
      moreOptions: 'More Options',
      faq: 'Frequently Asked Questions',
      inviteFriends: 'Invite Friends',
      inviteFriendsSubtitle: 'Get +5 skip phrases • Free',
      whatsappCommunity: 'LearnFun Community',
      whatsappCommunitySubtitle: 'Support & Tips • WhatsApp',
    },
    onboarding: {
      guidedTour: 'Guided tour',
      stepOf: 'Step {{step}} of {{total}}',
      closeTourAria: 'Skip tutorial',
      step1Title: 'Welcome to LearnFun!',
      step1Description: "Let's quickly show you how to master English with guided trainings.",
      step1Bullet1: 'Choose practice modes designed for real-life situations.',
      step1Bullet2: 'Learn phrases organized by essential themes.',
      step1Bullet3: 'Join live experiences whenever you want to go further.',
      step1Primary: 'See categories',
      step2Title: 'Explore the Categories mode',
      step2Description: 'Each category brings ready-to-use phrases for your daily life.',
      step2Bullet1: 'See the topic, description and progress for each collection.',
      step2Bullet2: 'Freely choose what you want to train now.',
      step2Bullet3: 'Review as many times as you want to master the content.',
      step2Primary: 'Explore Daily Basics',
      step3Title: 'Daily Basics in practice',
      step3Description: 'Here is your first phrase to unlock everyday conversations.',
      step3Bullet1: 'Click "Listen" to hear the native pronunciation.',
      step3Bullet2: 'Use the microphone to repeat and get instant feedback.',
      step3Bullet3: 'Mark it as completed and move on to the next expression.',
      step3Primary: 'Start practicing',
    },
    dashboard: {
      // SEO Content
      seoTitle: 'Learn English Practically and Fun',
      seoDescription: 'LearnFun is an interactive platform to learn and practice English with practical exercises, instant pronunciation feedback and gamified method. Improve your English fluency effectively through voice recognition, phonetic analysis and multiple training modes.',
      seoDescription2: 'Practice English conversation alone, get real-time feedback on your pronunciation, and develop your skills through interactive exercises designed for beginners and intermediate students.',
      whyLearnfun: 'Why choose LearnFun to learn English?',
      conversationPractice: 'Real-Time Conversation Practice',
      conversationDesc: 'Practice English alone using advanced voice recognition technology. Get instant feedback on your pronunciation and improve your fluency through interactive exercises that simulate real conversations.',
      gamifiedSystem: 'Gamified Learning System',
      gamifiedDesc: 'Learn English in a fun way with XP system, levels and achievements. Keep your motivation with daily streaks and compete on the leaderboard with other English students.',
      phoneticAnalysis: 'Detailed Phonetic Analysis (IPA)',
      phoneticDesc: 'Get detailed analysis of your pronunciation with accurate phonetic feedback. Learn to pronounce each word correctly through clear visualizations and comparisons with native pronunciation.',
      multipleTraining: 'Multiple Training Modes',
      multipleDesc: 'Choose from different modes: phrases by categories (including Speak Phrases), translation, numbers, videos and live rooms. Each mode was designed to develop specific English skills.',
      bestPlatform: 'The best platform to learn English online for free',
      bestPlatformDesc1: 'LearnFun is the ideal platform for those who want to learn English in a practical and effective way. Our methodology combines cutting-edge technology with gamification to make learning English fun and motivating. Whether you are a beginner or intermediate student, we have exercises suitable for your level.',
      bestPlatformDesc2: 'Start now and discover how easy it is to improve your English fluency with instant feedback, practical exercises and a system that adapts to your learning pace.',

      // Streak
      streakTitle: 'Streak of {{count}} {{unit}}',
      consistentStudy: 'Consistent study improves learning 5x faster!',
      streakKeepGoing: 'Keep it up! Only {{days}} more {{unit}} to earn 1 freeze.',
      streakAmazing: 'Awesome! You have already earned {{freezeCount}} {{freezeLabel}}! Only {{days}} more {{dayLabel}} to earn +1 reward.',
      streakBonusTitle: 'Streak Bonus',
      streakBonusText: 'Keep a 7+ day streak to earn +2 bonus XP for each exercise.',

      // CTA
      ctaTitle: 'Ready to level up your English?',
      ctaSubtitle: 'Join thousands of learners improving their pronunciation every day',
      ctaChallengeButton: 'Try Challenge Mode',
      ctaLiveRoomButton: 'Join Live Room',

      // Features
      featureStartTraining: 'Start training',

      // Feature Cards
      categoriesTitle: 'Categories/Subjects',
      categoriesDesc1: 'Train phrases from situations of your interest',
      categoriesDesc2: 'Simulate real conversations.',
      categoriesDesc3: 'Real-time pronunciation feedback.',
      categoriesDesc4: 'Word-by-word accuracy analysis.',

      speakTitle: 'Speak Phrases',
      speakDesc1: 'Phrases chosen by linguistic scientific studies.',
      speakDesc2: 'Frequent in real conversations.',
      speakDesc3: 'Make complete sense (e.g. "in the middle of the night").',
      speakDesc4: 'Real-time pronunciation feedback.',
      speakDesc5: 'Word-by-word accuracy analysis.',

      translateTitle: 'Translate & Practice',
      translateDesc1: 'Write or speak phrases in Portuguese.',
      translateDesc2: 'Translate to English and practice pronunciation.',
      translateDesc3: 'Real-time pronunciation feedback.',
      translateDesc4: 'Word-by-word accuracy analysis.',

      numbersTitle: 'Number Trainer',
      numbersDesc1: 'Randomly generated numbers automatically.',
      numbersDesc2: 'Practice pronunciation in English and other languages.',
      numbersDesc3: 'Leaderboard with global ranking.',
      numbersDesc4: 'Track your progress and compete.',

      challengeTitle: 'Challenge Mode',
      challengeDesc1: '60 seconds for maximum phrases.',
      challengeDesc2: 'Need 90% accuracy to advance.',
      challengeDesc3: 'Ranking of top 10 players.',
      challengeDesc4: 'Test your skills in real time.',

      videoTitle: 'Video Learning',
      videoDesc1: 'Movie scenes and famous phrases.',
      videoDesc2: 'Short clips with interactive questions.',
      videoDesc3: 'Real vocabulary in natural contexts.',
      videoDesc4: 'Learn from everyday situations.',

      liveRoomsTitle: 'Live Rooms',
      liveRoomsDesc1: 'Live voice rooms in real time.',
      liveRoomsDesc2: 'Practice with other students.',
      liveRoomsDesc3: 'Create your own room or join existing ones.',
      liveRoomsDesc4: 'Safe and collaborative environment.',
      liveRoomsBadge: 'NEW',
    },
    categoryTrainer: {
      // Loading
      loadingCategories: 'Loading categories...',

      // Category Selection Screen
      practiceByCategory: 'Practice by Category',
      chooseTopicMaster: 'Choose a topic and master essential phrases!',
      progress: 'Progress:',
      phrases: 'phrases',
      complete: 'Complete',
      startPracticing: 'Start Practicing',
      tipTitle: 'Tip:',
      tipText: 'Each category contains real-world phrases you can use immediately. Practice daily for best results!',

      // Practice Screen
      backToCategories: 'Back to Categories',
      phraseOf: 'Phrase {{current}} of {{total}}',
      completedThisSession: '{{count}} phrase{{plural}} completed this session!',
      noPhrasesAvailable: 'No phrases available for this category',
      goBack: 'Go Back',

      // Categories
      dailyBasics: 'Daily Basics',
      dailyBasicsDesc: 'Essential everyday phrases',
      travelSurvival: 'Travel Survival',
      travelSurvivalDesc: 'Phrases for travelers',
      workProfessional: 'Work & Professional',
      workProfessionalDesc: 'Business communication',
      shoppingMoney: 'Shopping & Money',
      shoppingMoneyDesc: 'Shopping and payments',
      socialEnglish: 'Social English',
      socialEnglishDesc: 'Casual conversations',
      techInterview: 'Tech Interview',
      techInterviewDesc: 'Tech Interview - Fullstack Developer',
      clinicalResearch: 'Clinical Research',
      clinicalResearchDesc: 'Clinical trials and research',
      speakPhrases: 'Speak Phrases',
      speakPhrasesDesc: 'Practice phrases specialized in pronunciation training',
      essentialQuestions: 'Essential Questions',
      essentialQuestionsDesc: 'Essential questions with grammar tips',
      verbTenses: 'Verb Tenses',
      verbTensesDesc: 'Master present, past, and future tenses',

      // Guided Tour
      tourTitle: 'Daily Basics Guided Tour',
      tourIntro: "Let's quickly go through each part of the practice so you can make the most of it.",
      tourStart: 'Start',
      tourPhraseTitle: 'English phrase',
      tourPhraseDesc: 'This is the phrase you will practice now. Read it carefully to prepare yourself.',
      tourTranslationTitle: 'Portuguese translation',
      tourTranslationDesc: 'Here you see the meaning in Portuguese to connect ideas and context.',
      tourIpaTitle: 'Pronunciation with IPA',
      tourIpaDesc: 'The IPA details each sound of the phrase. Use it to adjust pronunciations that still sound strange.',
      tourSpeakTitle: 'Time to practice',
      tourSpeakDesc: 'Tap Speak, repeat the phrase "Hello" and then we will analyze the feedback together.',
      tourFeedbackTitle: 'See the feedback panel',
      tourFeedbackDesc: 'Here you see the overall result of your practice with everything you need to improve.',
      tourYouSaidTitle: 'Understand "You said"',
      tourYouSaidDesc: 'Shows exactly what the voice recognition captured from your English speech. Compare to see if it was interpreted correctly.',
      tourAccuracyTitle: 'Precision with "Accuracy"',
      tourAccuracyDesc: 'Indicates how close you came to the original phrase. The closer to 100%, the more faithful the pronunciation was.',
      tourWordTitle: 'Word-by-Word Analysis',
      tourWordDesc: 'Analyzes each word and points out pronunciation differences between what you said and the original phrase to adjust details.',
      tourNextTitle: 'Move to the next phrase',
      tourNextDesc: 'Tap "Next" to move to the next phrase and continue practicing with the same focus.',
      lexySkipConfirm: 'Are you sure you want to skip the tutorial?',
      lexySkipYes: 'Yes, skip',
      lexySkipNo: 'Keep learning',
      lexyReplayAudio: 'Listen again',
      lexyUnlockFeatures: '🎉 Unlock All Features!',
            lexyLoginBenefit: 'Login with Google and get full access',

            lexyAvailableResources: '🎁 Available Resources',
            lexyTrainingModes: '7 Training Modes',
            lexyTrainingModesDesc: 'Categories, Speak, Translate, Numbers, Challenge, Video, Live Rooms',

            lexyIPAAnalysis: 'IPA Analysis',
            lexyIPADescription: 'Detailed phonetic transcription of each phrase',

            lexyGamification: 'Gamification',
            lexyGamificationDescription: 'Level system, XP, achievements and rewards',

            lexyLeaderboard: 'Leaderboard',
            lexyLiveRooms: 'Live Rooms',

            lexyImportant: '⚠️ Important',
            lexyNoSaveWarning: 'Your progress as a guest will not be saved',

            lexyLoginWithGoogle: '🔒 Login with Google',
            lexyContinueWithoutLogin: 'Continue without Login',
            lexyCanLoginLater: 'You can login later at any time',
    },
    speakTrainingModes: {
      // Header
      back: 'Back',
      backToDashboard: 'Back to dashboard',
      speakTrainingModes: 'Speak Training Modes',
      choosePreferred: 'Choose your preferred way to practice pronunciation',

      // Training Modes
      categories: 'Categories',
      categoriesDesc: 'Practice phrases by real-world situations and topics',
      translate: 'Translate',
      translateDesc: 'Practice translation and improve your vocabulary',
      numbers: 'Numbers',
      numbersDesc: 'Master English numbers pronunciation',
      challenge: 'Challenge',
      challengeDesc: 'Test your skills with timed challenges',
      sentenceBuilder: 'Sentence Builder',
      sentenceBuilderDesc: 'Build sentences with drag & drop',

      // Actions
      startTraining: 'Start Training',
      openMode: 'Open {{mode}} mode',

      // Tips
      tipsTitle: 'Tips for Better Results',
      tipsText: '💡 Practice daily for at least 10 minutes. Each mode targets different skills to help you become fluent!',
    },
    phraseCard: {
      // Grammar Notes
      grammarTips: 'Grammar Tips',
      clickToSeeGrammar: 'Click to see grammar explanations',
      hideGrammarTips: 'Hide grammar tips',
      showGrammarTips: 'Show grammar tips',
      structure: 'Structure',
      explanation: 'Explanation',
      why: 'Why?',
      keyWord: 'Key Word',
      pronunciationTip: 'Pronunciation Tip',
      commonMistake: 'Common Mistake',
      negativeForm: 'Negative Form',
      questionForm: 'Question Form',
      timeMarkers: 'Time Markers',
      alternativeForms: 'Alternative Forms',

      // Buttons
      skip: 'Skip',
      hear: 'Hear',
      speak: 'Speak',
      stop: 'Stop',
      next: 'Next',

      // Voice Selector
      chooseVoice: 'Choose Voice',
      availableVoices: '{{count}} available in your device',
      selectAndTest: 'Select the voice and click here for Test',

      // Audio Playback
      stopRecording: 'Stop Recording',
      hearYourRecording: 'Hear Your Recording',

      // Feedback
      perfect: 'Perfect! 🎉',
      veryGood: 'Very Good! 👏',
      keepPracticing: 'Keep Practicing! 💪',
      youSaid: 'You said:',
      recordingListening: '🎙️ Recording & Listening...',

      // Errors
      micPermissionDenied: '🔒 Microphone permission denied. Click the 🔒 icon and allow access.',
      error: 'Error:',

      // Tooltips/Aria
      skipPhraseTooltip: 'You have {{count}} phrases to skip',
      playAudioAria: 'Play phrase audio',
      clickToHearCorrect: 'Click to hear the correct pronunciation.',
      startRecordingAria: 'Start recording',
      stopRecordingAria: 'Stop recording',
      clickToStartSpeaking: 'Click to start speaking',
      clickToStopRecording: 'Click to stop recording',
      stopPlaybackAria: 'Stop recording playback',
      playRecordingAria: 'Play my recording',
      resultAria: 'Result: {{similarity}}% accuracy',
    },
  },
};

// Função simples de interpolação {{chave}}
const interpolate = (template, params = {}) => {
  if (!template || typeof template !== 'string') return template;
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmed = key.trim();
    return params[trimmed] != null ? String(params[trimmed]) : '';
  });
};

export const translateUI = (language, path, params) => {
  const langPack = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];
  const parts = path.split('.');

  let current = langPack;
  for (const part of parts) {
    if (!current || typeof current !== 'object') break;
    current = current[part];
  }

  if (typeof current === 'string') {
    return interpolate(current, params);
  }

  // fallback: retorna a própria chave se não encontrar nada
  return path;
};