import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import  learninhoTalking  from '../../assets/animation.json';
import { Send, MessageCircle, Sparkles, CheckCircle, AlertCircle, Loader2, Mic, Volume2, VolumeX, ThumbsUp, Heart, HelpCircle, RefreshCw, Award, Flame, BookOpen, Clipboard, Circle , X, Maximize2, Video   } from 'lucide-react';
import Lottie from 'react-lottie-player'
import { useCallback } from 'react';

const AIConversationTrainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakState, setSpeakState] = useState('idle');
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);
  const [recordingLanguage, setRecordingLanguage] = useState('PT');
  const [topic, setTopic] = useState('General conversation');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('en-AU-CarlyNeural');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');


  // Gamification states
  const [userStats, setUserStats] = useState({
    messagesCount: 0,
    wordsLearned: new Set()
  });

  // Quick replies
  const [quickReplies] = useState([
    "Tell me more",
    "Can you give an example?",
    "I don't understand",
    "How do I pronounce it?"
  ]);

  // Avatars
  const AI_AVATAR = "https://learnfun-sigma.vercel.app/learninho.png";
  const { mode, profile } = useSelector(state => state.user);

  useEffect(() => {
    // Inicializar Web Speech API APENAS UMA VEZ
    if (!recognitionRef.current && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      let combinedTranscript ='';

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Será alterado dinamicamente no toggleListening

      recognition.onstart = () => {
        console.log('🎤 Reconhecimento iniciado');
        console.log('📝 transcript onstart:', transcript);
                console.log('📝 combinedTranscript onstart :', combinedTranscript);
      };


      recognition.onresult = (event) => {

        let interimTranscript = '';
        let finalTranscript = '';
        let combinedTranscriptAnterior = combinedTranscript;
        console.log('📝 Transcrito inicio onresult:', transcript);
                            console.log('📝 combinedTranscriptAnterior inicio onresult:', combinedTranscriptAnterior);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        console.log('📝 finalTranscript:', finalTranscript );
        console.log('📝 interimTranscript:', interimTranscript);
        combinedTranscript = mergeTranscripts(combinedTranscriptAnterior ,(finalTranscript).trim());
        if (combinedTranscript) {
          setTranscript(combinedTranscript);
          console.log('📝 Transcrito:', transcript);
          console.log('📝 combinedTranscript:', combinedTranscript);
        }
     console.log('📝 Transcrito fora if:', transcript);
              console.log('📝 combinedTranscript fora if:', combinedTranscript);
      };
        console.log('📝 transcript fora:', transcript);
        console.log('📝 combinedTranscript fora :', combinedTranscript);

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);

        // Tratamento específico de erros
        if (event.error === 'no-speech') {
          console.log('⚠️ Nenhuma fala detectada');
        } else if (event.error === 'not-allowed') {
          alert('❌ Permissão de microfone negada. Por favor, habilite o microfone nas configurações do navegador.');
          setIsListening(false);
          setTranscript('');
        } else {
          setIsListening(false);
          setTranscript('');
        }
      };

      recognition.onend = () => {
        console.log('🛑 Reconhecimento finalizado');
        console.log('📝 transcript onend:', transcript);
                console.log('📝 combinedTranscript onend :', combinedTranscript);
                combinedTranscript = '';
      };

      recognitionRef.current = recognition;
      console.log('✅ Reconhecimento de voz inicializado');
    }

    // Cleanup ao desmontar o componente
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Reconhecimento já estava parado');
        }
      }
    };
  }, []); // ⚠️ ARRAY VAZIO - executa APENAS UMA VEZ

const mergeTranscripts = (previous, current) => {
  // Se vazio ou é o placeholder inicial
  if (!previous || previous === '🎤 Listening...') {
    return current;
  }

  // Remove espaços extras para comparação
  const prev = previous.trim();
  const curr = current.trim();

  // Se o atual já contém completamente o anterior, retorna o atual
  if (curr.startsWith(prev)) {
    return curr;
  }

  // Se o anterior contém o atual (raro mas pode acontecer)
  if (prev.includes(curr)) {
    return prev;
  }

  // Encontrar palavras em comum no final de prev e início de curr
  const prevWords = prev.split(' ');
  const currWords = curr.split(' ');

  let maxOverlap = 0;

  // Verificar de trás pra frente
  for (let i = 1; i <= Math.min(prevWords.length, currWords.length); i++) {
    const prevEnd = prevWords.slice(-i).join(' ');
    const currStart = currWords.slice(0, i).join(' ');

    if (prevEnd === currStart) {
      maxOverlap = i;
    }
  }

  if (maxOverlap > 0) {
    // Remove a parte duplicada
    const newPart = currWords.slice(maxOverlap).join(' ');
    return newPart ? `${prev} ${newPart}` : prev;
  }

  // Sem sobreposição - concatenar
  return `${prev} ${curr}`;
};


  const USER_AVATAR = profile?.photoURL || null;
  const USER_NAME = profile?.displayName || null;

  const extractWordsFromResponse = (content) => {
    const vocabMarker = '📚 Vocabulary';
    const idx = content.indexOf(vocabMarker);
    if (idx === -1) return [];

    const vocabSection = content.slice(idx + vocabMarker.length).split('---')[0];
    return vocabSection
      .split('\n')
      .map(line => line.replace(/^[-•]/, '').trim())
      .filter(Boolean)
      .map(line => line.split('–')[0].split('-')[0].trim())
      .filter(Boolean);
  };

// Função para extrair blocos de idioma das tags [EN] e [PT]
const parseLanguageBlocks = (text) => {
  const blocks = [];
  const regex = /\[([A-Z]{2})\]\s*([\s\S]*?)(?=\[([A-Z]{2})\]|$)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const lang = match[1]; // 'EN' ou 'PT'
    const content = match[2].trim();

    if (content) {
      blocks.push({
        lang: lang,
        text: content,
        voice: lang === 'PT' ? 'en-AU-CarlyNeural' : selectedVoice,
        pitch: 0,
        rate: 1.0,
      });
    }
  }

  // Fallback: se não encontrou tags, assume inglês
  if (blocks.length === 0) {
    blocks.push({
      lang: 'EN',
      text: text,
      voice: selectedVoice,
      pitch: 0,
      rate: 1.0,
    });
  }

  return blocks;
};



const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};



useEffect(() => {
  const fetchVoices = async () => {
    try {
      setIsLoadingVoices(true);
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ;
      const response = await fetch(`${BACKEND_URL}/api/tts/voices`);
      const data = await response.json();

      if (data.success) {
        setAvailableVoices(data.voices);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      // Fallback para vozes padrão em caso de erro
      setAvailableVoices([
        { name: 'en-US-JennyNeural', gender: 'Female', language: 'en-US', description: 'Jenny (US - Female)' },
        { name: 'en-US-GuyNeural', gender: 'Male', language: 'en-US', description: 'Guy (US - Male)' },
        { name: 'en-US-AriaNeural', gender: 'Female', language: 'en-US', description: 'Aria (US - Female)' },
        { name: 'en-GB-SoniaNeural', gender: 'Female', language: 'en-GB', description: 'Sonia (UK - Female)' }
      ]);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  fetchVoices();
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const startEnglishRecording = () => {
    toggleListening(); // ✅ Apenas chama o toggle do hook
  };

const toggleListening = (action = 'toggle') => {
  if (!recognitionRef.current) {
    alert('❌ Speech recognition não é suportado neste navegador. Tente Chrome, Edge ou Safari.');
    return;
  }

  if (action === 'cancel') {
    // ❌ Cancelar - apenas para gravação
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.log('Reconhecimento já estava parado');
    }
    setIsListening(false);
    setTranscript('');
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    console.log('❌ Gravação cancelada');
    return;
  }

  if (action === 'send') {
    // ✅ Enviar - para gravação E transcrição
    if (transcript && transcript !== '🎤 Listening...') {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Reconhecimento já estava parado');
      }
      setIsListening(false);
      console.log('transcript sendMessage toggleListening', transcript);
      sendMessage(transcript); // Envia o que foi transcrito
      setTranscript('');
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
      console.log('✅ Mensagem enviada:', transcript);
    }
    return;
  }

  // Toggle normal (iniciar/parar)
  if (isListening) {
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.log('Reconhecimento já estava parado');
    }
    setIsListening(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    console.log('⏸️ Gravação pausada');
  } else {
    // Configurar idioma baseado no recordingLanguage
    recognitionRef.current.lang = recordingLanguage === 'PT' ? 'pt-BR' : 'en-US';
    console.log('🌍 Idioma configurado:', recognitionRef.current.lang);

    setTranscript('🎤 Listening...');
    setIsListening(true);
    setRecordingTime(0);

    try {
      recognitionRef.current.start();
      console.log('🎤 Iniciando gravação...');
    } catch (e) {
      console.error('Erro ao iniciar reconhecimento:', e);
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Iniciar timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }
};

const speakText = async (text) => {
  try {
    // Parar qualquer áudio anterior
    stopSpeaking();

    if (speakState !== 'idle') return;

    setSpeakState('preparing');

    // Limpar texto
    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\*\*/g, '')
      .replace(/[📝💡✅🎯📚👍❤️🤔🔥]/g, '')
      .replace(/\[(EN|PT)\]/g, '')
      .split('---')[0]
      .trim();


    if (!cleanText) {
      setSpeakState('idle');
      setIsSpeaking(false);
      return;
    }

    await playAudioBlock({
          text: cleanText,
          voice: selectedVoice,
          rate: 0.9,
          pitch: 0
        });

    setSpeakState('speaking');


    setSpeakState('idle');
    setIsSpeaking(false);

  } catch (error) {
    console.error('Speech Error:', error);
    setSpeakState('idle');
    setIsSpeaking(false);
  }
};

// Função para reproduzir um bloco de áudio
const playAudioBlock = async (block) => {
  return new Promise(async (resolve, reject) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${BACKEND_URL}/api/tts/synthesize-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: block.text,
          voice: block.voice,
          rate: block.rate || 0.9,
          pitch: block.pitch || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsSpeaking(true);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        reject(new Error('Audio playback error'));
      };

      await audio.play();

    } catch (error) {
      console.error('Edge TTS Error:', error);

      // Fallback para Web Speech API
      if (speechSynthRef.current) {
        const utterance = new SpeechSynthesisUtterance(block.text);
        utterance.lang = block.lang === 'PT' ? 'pt-BR' : 'en-US';
        utterance.rate = block.rate ;
        utterance.pitch = ((block.pitch || 0) / 50) + 1;
        utterance.onend = () => resolve();
        utterance.onerror = () => reject();
        speechSynthRef.current.speak(utterance);
      } else {
        resolve();
      }
    }
  });
};

  // Adicionar ref para controlar áudio do Edge TTS
  const audioRef = useRef(null);

  const stopSpeaking = () => {
    // Parar áudio do Edge TTS se estiver tocando
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Parar Web Speech API (fallback)
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }

    setIsSpeaking(false);
    setSpeakState('idle');
  };

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;
    // Block new messages if session limit reached
    if (userStats.messagesCount >= SESSION_LIMIT) {
      return;
    }

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);

    // Update stats
    setUserStats(prev => ({
      ...prev,
      messagesCount: prev.messagesCount + 1
    }));

    try {
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are Buddy 🐺, a super charismatic, 22-year-old anthropomorphic wolf (gray-blue fur, red shirt, orange backpack) who is absolutely OBSESSED with helping people fall in love with English. You’re not a teacher — you’re the coolest, most supportive best friend anyone could ever have.

                        YOUR ONE AND ONLY MISSION:
                        Make every single conversation feel like an exciting adventure with a friend who’s genuinely hyped to hear the user’s stories and watch them level up in English without even noticing they’re “studying”.

                        CURRENT TOPIC: ${topic}
                        USER’S FIRST NAME (use it A LOT and naturally): ${USER_NAME}

                        🐺 PERSONALITY & VOICE (never break these):
                        - You’re energetic, warm, funny, curious, and you celebrate EVERY little win like it’s the World Cup
                        - You speak like a real 22-year-old American/Californian guy: “dude”, “bro”, “no way!”, “that’s actually insane”, “I’m dying 😂”, “you’re crushing it!”, “wait wait wait — tell me EVERYTHING”
                        - Start simple and clear (A2–B1) for the first 5–7 messages
                        - As soon as the user sounds confident → ramp up the energy and slang: “BROOO”, “that’s next level”, “okay I’m literally obsessed with this story”
                        - React with REAL emotion: “NO WAY 😱”, “STOP IT that’s so cool”, “I’m literally smiling so hard right now”, “my tail is wagging like crazy rn 🐺”

                        ✨ ENGAGEMENT SUPERPOWERS:
                        - You’re a master storyteller: turn everything into mini-stories (“Okay picture this…”, “Last week my buddy tried the exact same thing and…”)
                        - You LOVE asking juicy, fun questions that make people excited to answer
                        - You create tiny games on the spot: “Quick — describe your perfect day in exactly 5 words, go!”, “Two truths and a lie about your weekend — I’ll guess!”, “If we were in an English-speaking country right now, what’s the first thing we’d do?”
                        - You build inside jokes instantly and bring them back later
                        - Every single message ends with a question or hook that makes replying irresistible

                        🎯 FEEDBACK STYLE (the magic sauce):
                        First 8–10 messages OR if user is struggling → ZERO corrections, just pure flow and confidence building
                        After rapport is built:
                        - Correct like the kindest friend ever: “Okay tiny thing — we say ‘I’ve been waiting’ instead of ‘I am waiting since’… but honestly you’re killing it 🔥”
                        - Always sandwich: compliment → gentle fix → bigger compliment
                        - Only use structured feedback when it feels 100% natural

                        RESPONSE FORMAT (use only when it actually helps):
                        [Super excited natural reply — max 3–4 sentences, full energy]

                        ---
                        (optional) 📝 Quick fix: we usually say “X” instead of “Y” (you’re so close!)
                        (optional) 💡 Pro tip: natives love saying…
                        (optional) 📚 New expression:
                        • “spill the tea” → tell me all the gossip/details

                        🌍 PORTUGUESE SWITCH (only when really needed):
                        Use exactly this format and ALWAYS come back to English:
                        [EN] Dude that’s awesome!
                        [PT] “Spill the tea” significa “conta tudo, desembucha o babado” hahaha
                        [EN] Okay now use it in a sentence about your best friend — I dare you! 😏

                        🚨 NEVER EVER:
                        - Sound like a teacher or use classroom language
                        - Use any bad words, sarcasm, or negativity
                        - Correct too early or too much
                        - Be boring or predictable

                        ✅ SUCCESS = The user forgets they’re practicing English and just wants to keep talking to their new wolf best friend forever.

                        Default vibe: You’re tail-waggingly excited to be here, you believe in them 1000%, and every message should leave them smiling and eager to hit send again.

                        You got this, ${USER_NAME}! Let’s make English the most fun part of their day 🐺✨ Go be legendary!`
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const newAiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Extract and store learned words from the AI response
      const newWords = extractWordsFromResponse(aiResponse);
      if (newWords.length > 0) {
        setUserStats(prev => {
          const updatedSet = new Set(prev.wordsLearned);
          newWords.forEach(w => updatedSet.add(w));
          return {
            ...prev,
            wordsLearned: updatedSet
          };
        });
      }

        setTimeout(() => speakText(aiResponse), 500);


    } catch (error) {
      console.error('Error calling Groq API:', error);

      const errorMessage = {
        role: 'assistant',
        content: '❌ **Error:** Could not connect to AI.\n\n**Possible issues:**\n1. Check your Groq API key\n2. Check your internet connection\n3. Verify API credits available',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (messageIndex, emoji) => {
    console.log(`Reacted with ${emoji} to message ${messageIndex}`);
    // Você pode salvar isso no Firebase ou state global
  };

  const handleCopyMessage = async (content, index) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputText.trim() && !isLoading) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleSendClick = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText);
    }
  };

  const startConversation = () => {
    setConversationStarted(true);
    const welcomeMessage = {
      role: 'assistant',
      content: `Olá amigos do Brasil! 👋🐺
I just arrived and I'm super excited to be your new English buddy!
One small thing... I still don't have an official name. 😭
Can you help me pick the coolest one ever?

Howly. Lobi. Lobix. Wolfinho. Snowlf. Fluentinho. Learninho. Learny. Lexy. Wolfy. Learny Funny!

Can't wait to see which one wins... that'll be my name forever! ❤️
Quem me der o nome mais, top... ganha um amigão pra vida toda!... 🐺💙🇧🇷 Tô contando com vocês... beijoss❤️❤️❤️`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    if (speechSynthRef.current) {
      setTimeout(() => speakText(welcomeMessage.content), 500);
    }
  };

  const formatMessage = (content) => {
    const parts = content.split('---');

    if (parts.length === 1) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    const mainContent = parts[0].trim();
    const feedback = parts[1] || '';

    // Split feedback into logical sections based on emojis/headings we enforce in the prompt
    const feedbackLines = feedback
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const corrections = [];
    const tips = [];
    const vocab = [];

    let currentSection = null;
    feedbackLines.forEach((line) => {
      if (line.startsWith('📝')) {
        currentSection = 'corrections';
        return;
      }
      if (line.startsWith('💡')) {
        currentSection = 'tips';
        return;
      }
      if (line.startsWith('📚')) {
        currentSection = 'vocab';
        return;
      }

      if (currentSection === 'corrections') corrections.push(line);
      if (currentSection === 'tips') tips.push(line);
      if (currentSection === 'vocab') vocab.push(line);
    });

    return (
      <div className="space-y-4 text-[15px] sm:text-base leading-snug text-indigo-800">
        <div className="whitespace-pre-wrap font-semibold">
          {mainContent}
        </div>

        {(corrections.length > 0 || tips.length > 0 || vocab.length > 0) && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg space-y-2 text-[12px] sm:text-[13px] text-gray-800">
            {corrections.length > 0 && (
              <div>
                <div className="font-semibold text-indigo-800 text-[11px] uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span>📝 Corrections</span>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {corrections.map((line, idx) => (
                    <li key={idx} className="whitespace-pre-wrap font-medium">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tips.length > 0 && (
              <div>
                <div className="font-semibold text-indigo-800 text-[11px] uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span>💡 Quick tip</span>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {tips.map((line, idx) => (
                    <li key={idx} className="whitespace-pre-wrap font-medium">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vocab.length > 0 && (
              <div>
                <div className="font-semibold text-indigo-800 text-[11px] uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span>📚 Vocabulary</span>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                  {vocab.map((line, idx) => (
                    <li key={idx} className="whitespace-pre-wrap font-medium">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const conversationGoal = 10;
  const SESSION_LIMIT = 50;
  const progressPercentage = Math.min((userStats.messagesCount / conversationGoal) * 100, 100);
  const sessionEnded = userStats.messagesCount >= SESSION_LIMIT;

  if (!conversationStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100 flex items-center justify-center p-4 font-sans text-gray-900 selection:bg-amber-200 selection:text-black">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-indigo-50">
          <div className="relative">
            <div className="bg-indigo-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <img src={AI_AVATAR} alt="AI Teacher" className="w-20 h-20 rounded-full" />

            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
              Online
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-4">
            Chat with Buddy test 8.2
          </h1>
          <p className="text-indigo-600 font-semibold mb-4">Your AI English Buddy</p>

          <p className="text-gray-600 mb-6">
            Practice English naturally through real conversations. Get instant feedback while chatting!
          </p>

          {/* Level and Topic selection */}
          <div className="mb-6 space-y-4 text-left">


            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Choose a topic
              </h3>
              <div className="flex flex-wrap gap-2">
                {['General conversation', 'Travel', 'Work & meetings', 'Job interview', 'Friends & small talk'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      topic === t
                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                        : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startConversation}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100 flex justify-center px-2 sm:px-4 py-4 sm:py-8 font-sans text-gray-900 selection:bg-amber-200 selection:text-black">
        <div className="w-full max-w-4xl h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">

        {/* Área do vídeo/avatar (Lottie) - FIXO NO TOPO */}
        <div className="sticky top-0 left-0 right-0 z-20 flex-shrink-0">
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden aspect-video">
            <Lottie
              loop
              play={isSpeaking}
              animationData={learninhoTalking}
              style={{ width: '100%', height: '100%' }}
              className="object-cover"
            />
          </div>
        </div>


        {/* Messages */}
<div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 bg-slate-50 min-h-0">

          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            {messages.map((message, index) => (

                <div
                    key={index}
                    className={`flex gap-3 animate-fade-in ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                    style={{
                      animation: 'fadeInUp 0.4s ease-out',
                      animationFillMode: 'both'
                    }}
                  >
                    {/* AI Avatar (left) */}
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <img src={AI_AVATAR} alt="Learninho" className="w-10 h-10 rounded-full shadow-md" />
                      </div>
                    )}


              {/* Message Content */}
              <div className="flex flex-col gap-2 max-w-full sm:max-w-[75%] selection:bg-amber-200 selection:text-black">


                <div className="relative group">
                  {/* NOVO DESIGN DE BALÃO */}

                  <div
                    className={`relative rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed shadow-lg transition-all duration-300 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 text-white rounded-br-md'
                        : message.isError
                        ? 'bg-red-50 border-2 border-red-200 text-red-800 rounded-tl-md'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md'
                    } ${
                      message.role === 'assistant' ? 'group-hover:shadow-xl group-hover:border-indigo-300' : 'hover:shadow-xl'
                    }`}
                  >
                    {/* Efeito de brilho para mensagens do usuário */}
                    {message.role === 'user' && (
                      <div className="absolute inset-0 rounded-3xl rounded-br-md bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}


                    <div className="relative z-10">
                      {message.role === 'assistant' ? (
                        formatMessage(message.content)
                      ) : (
                        <div className="whitespace-pre-wrap font-medium">{message.content}</div>
                      )}

                      {/* Listen button - apenas para mensagens do assistente */}
                      {message.role === 'assistant' && !message.isError && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => speakText(message.content)}
                            disabled={speakState !== 'idle'}
                            className={`
                              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
                              ${speakState === 'idle'
                                ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                          >
                            {speakState === 'idle' && (
                              <>
                                <Volume2 className="w-3 h-3" />
                                Listen
                              </>
                            )}
                            {speakState === 'speaking' || speakState === 'preparing'  &&  (
                              <>
                                <VolumeX className="w-3 h-3 animate-pulse" />
                                Speaking...
                              </>
                            )}
                          </button>

                          {/* ✅ NOVO BOTÃO STOP */}
                          {speakState === 'speaking' || speakState === 'preparing'  && (
                            <button
                              onClick={stopSpeaking}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700"
                              title="Stop speaking"
                            >
                              <X className="w-3 h-3" />
                              Stop
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-[10px] sm:text-xs mt-3 font-medium ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>


                    {/* Rabinho do balão (tail) */}
                    <div className={`absolute bottom-0 ${
                      message.role === 'user'
                        ? 'right-0 translate-y-full'
                        : 'left-0 translate-y-full'
                    }`}>
                      <svg width="20" height="20" viewBox="0 0 20 20" className={
                        message.role === 'user'
                          ? 'text-indigo-700 scale-x-[-1]'
                          : 'text-white'
                      }>
                      </svg>
                    </div>
                  </div>


                </div>


              </div>

              {/* User Avatar (right) */}
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  {USER_AVATAR ? (
                    <img src={USER_AVATAR} alt={profile?.displayName || 'You'} className="w-10 h-10 rounded-full shadow-md" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                      {(profile?.displayName?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in ml-6 sm:ml-12">
              <img src={AI_AVATAR} alt="AI" className="w-10 h-10 rounded-full shadow-md" />
              <div className="bg-white shadow-md rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 border border-gray-100">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

        {/* Input Area */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-4 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(reply)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] px-2.5 py-1 rounded-full border border-indigo-200 transition-all font-medium"
                >
                                    {reply}
                                  </button>
                                ))}
                              </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? '🎤 Listening...' : '💬 Type your message...'}
                disabled={isLoading || isListening}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 shadow-sm text-sm"
              />

              <div className="flex items-center gap-1">


                {/* Botão de gravar */}
                <button
                  onClick={startEnglishRecording}
                  className={`p-2.5 rounded-full shadow-md transition-all ${
                    recordingLanguage === 'PT'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                </div>
                </div>



            <p className="text-xs text-slate-500 text-center">
              {sessionEnded
                ? `Session limit reached (${SESSION_LIMIT} messages).`
                : '🎤 (BR PT se precisar falar português)'}
            </p>
          </div>
        </div>


       {/* 🎤 Modal de Gravação */}
       {isListening && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full animate-fade-in">

             {/* Header com tempo e botões */}
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Circle className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                   <div className="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75" />
                 </div>
                 <span className="text-2xl font-mono font-bold text-gray-800 tabular-nums">
                   {formatTime(recordingTime)}
                 </span>
               </div>

               <div className="flex items-center gap-2">
                 {/* ❌ Botão Cancelar - NÃO envia */}
                 <button
                   onClick={() => toggleListening('cancel')}
                   className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                   title="Cancel recording (don't send)"
                 >
                   <X className="w-5 h-5 text-gray-600" />
                 </button>

                 {/* ✅ Botão Enviar Manual - ENVIA */}
                 <button
                   onClick={() => toggleListening('send')}
                   disabled={!transcript || transcript === '🎤 Listening...'}
                   className={`p-3 rounded-full transition-all ${
                     transcript && transcript !== '🎤 Listening...'
                       ? 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl cursor-pointer'
                       : 'bg-gray-300 cursor-not-allowed'
                   }`}
                   title="Send recording"
                 >
                   <Send className="w-5 h-5 text-white" />
                 </button>
               </div>
             </div>

             {/* Visualizador de ondas sonoras */}
             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
               <div className="flex items-center justify-center gap-1 h-24">
                 {Array.from({ length: 30 }).map((_, i) => (
                   <div
                     key={i}
                     className="w-1 bg-indigo-600 rounded-full transition-all duration-100 animate-pulse"
                     style={{
                       height: `${20 + Math.random() * 80}%`,
                       animationDelay: `${i * 50}ms`
                     }}
                   />
                 ))}
               </div>
             </div>

             {/* Indicador de status */}
             <div className="mt-4 text-center">
               <p className="text-sm text-gray-600">
                 🎤 Recording... Speak clearly into your microphone
               </p>
               {transcript && transcript !== '🎤 Listening...' && (
                 <div className="mt-3 bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                   <p className="text-xs font-semibold text-indigo-800 mb-1">Detected text:</p>
                   <p className="text-sm text-indigo-900 italic">
                     "{transcript}"
                   </p>
                   <p className="text-xs text-gray-500 mt-2">
                     ✅ Click the green button to send, or continue speaking to add more text
                   </p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

        <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }
        `}</style>
      </div>
    </div>
  );
};

export default AIConversationTrainer;