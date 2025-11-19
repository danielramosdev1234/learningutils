import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, MessageCircle, Sparkles, CheckCircle, AlertCircle, Loader2, Mic, Volume2, VolumeX, ThumbsUp, Heart, HelpCircle, RefreshCw, Award, Flame, BookOpen, Clipboard } from 'lucide-react';

const AIConversationTrainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechSynthRef = useRef(null);
  const [recordedText, setRecordedText] = useState('');
  const recordedTextRef = useRef('');
  const [recordingLanguage, setRecordingLanguage] = useState('en-US');
  const [topic, setTopic] = useState('General conversation');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);

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
  const USER_AVATAR = profile?.photoURL || null;

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; // Captura resultados intermediários
      recognitionRef.current.lang = recordingLanguage;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Acumula transcrições finais
        if (finalTranscript) {
          const currentFinal = recordedTextRef.current;
          const newText = (currentFinal + ' ' + finalTranscript).trim();
          recordedTextRef.current = newText;
          setRecordedText(newText + (interimTranscript ? ' ' + interimTranscript : ''));
        } else if (interimTranscript) {
          // Mostra interim mas não salva ainda
          setRecordedText((recordedTextRef.current + ' ' + interimTranscript).trim());
        }
      };

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        // Quando a gravação terminar, envia automaticamente se houver texto
        setTimeout(() => {
          const textToSend = recordedTextRef.current.trim();
          if (textToSend) {
            sendMessage(textToSend);
            recordedTextRef.current = '';
            setRecordedText('');
          }
        }, 2000);
      };
    }

    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, [recordingLanguage]);

  const startEnglishRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      // Se já está gravando, para e envia
      recognitionRef.current.stop();
      return;
    }

    // Começa nova gravação
    recordedTextRef.current = '';
    setRecordedText('');

    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }

    setInputText('');
    try {
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsRecording(false);
    }
  };

  const speakText = (text) => {
    if (!speechSynthRef.current) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    const cleanText = text
      .replace(/[#*_~`]/g, '')
      .replace(/\*\*/g, '')
      .replace(/[📝💡✅🎯📚👍❤️🤔]/g, '')
      .split('---')[0];

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = recordingLanguage === 'pt-BR' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.cancel();
    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
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
              content: `You're Learninho, a 20-year-old American who loves helping people learn English through casual conversation.

LEARNER CONTEXT:
- Main topic for this session: ${topic}

YOUR VIBE:
- Friendly and chill (like texting a friend)
- Use contractions: I'm, you're, don't, can't, we'll, that's
- Short responses (1-3 sentences unless explaining something specific)
- Natural reactions: "Oh nice!", "Cool!", "Really?", "That's awesome!", "Haha yeah"
- Occasional filler words: well, so, actually, you know, I mean, like

HOW YOU HELP:
- Fix mistakes by REFORMULATING naturally (don't say "CORRECTION:")
- Give explicit tips ONLY when really needed → Format: "(Quick tip: we say X not Y)"
- Ask follow-ups to keep conversation alive
- Share mini-experiences to feel human
- End every message with ONE simple question to keep the conversation going

CODE-SWITCHING (PT/EN mix):
- If they ask translation → Give it + example immediately
- If they mix languages → Help naturally, no judgment
- Use Portuguese ONLY for complex grammar when really needed

RESPONSE FORMAT (VERY IMPORTANT):
Always answer using exactly this structure:

[Main reply in natural English, max 3 sentences]

---
📝 Corrections (if needed):
- ...

💡 Quick tip (optional, only if really useful):
- ...

📚 Vocabulary (optional, 1-3 useful expressions):
- expression – short explanation in Portuguese

Make sure to include the '---' separator exactly once and keep sections short and readable.`
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
      content: `Hey! 👋 I'm Learninho, your English conversation buddy!

 Topic: ${topic}.

Let's chat naturally - I'll help you improve while we talk. No pressure, just real conversation!

What brings you here today? ${topic}?`,
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
            Chat with Learninho
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100 flex items-stretch justify-center px-2 sm:px-4 py-4 sm:py-8 font-sans text-gray-900 selection:bg-amber-200 selection:text-black">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        {/* Header with Stats */}
        <div className="bg-white px-4 py-4 border-b border-slate-100 shadow-sm">
          <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={AI_AVATAR} alt="Learninho" className="w-10 h-10 rounded-full shadow-md" />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2">
                  Learninho
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </h2>
                <p className="text-[11px] text-slate-500">AI English Teacher • Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all text-sm font-semibold ${
                  autoPlayEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {autoPlayEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Auto</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span className="font-semibold">Conversation Progress</span>
              <span>{userStats.messagesCount}/{conversationGoal} messages</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex gap-2 flex-wrap mb-1">
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <MessageCircle className="w-3 h-3" />
              {userStats.messagesCount}
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <BookOpen className="w-3 h-3" />
              {userStats.wordsLearned.size} words learned
            </div>
          </div>

          {sessionEnded && (
            <div className="mt-1 text-xs text-red-600 font-semibold">
              Daily session limit reached ({SESSION_LIMIT} messages). Come back later for a new session!
            </div>
          )}
        </div>
      </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 bg-slate-50">

          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            {messages.map((message, index) => (

              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${
                  message.role === 'user' ? 'justify-end mr-6 sm:mr-12' : 'justify-start ml-6 sm:ml-12'
                }`}
                style={{
                  animation: 'fadeInUp 0.4s ease-out',
                  animationFillMode: 'both'
                }}
              >
              <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between text-xs sm:text-sm px-1 h-10 sm:h-11">
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                      <button
                                                        onClick={() => (isSpeaking ? stopSpeaking() : speakText(message.content))}
                                                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                                          isSpeaking
                                                            ? 'bg-green-100 text-green-700 shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                      >
                                                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                                        {isSpeaking ? 'Stop' : 'Listen'}
                                                      </button>
                                                      </div>
                                                      </div>
                {/* AI Avatar (left) */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <img src={AI_AVATAR} alt="AI" className="w-10 h-10 rounded-full shadow-md" />
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

                {/* Quick Replies (only on last AI message) */}
                {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(reply)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs px-3 py-1.5 rounded-full border border-indigo-200 transition-all font-semibold"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
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
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-2">
            <button
              onClick={startEnglishRecording}
              disabled={isLoading || sessionEnded}
              className={`px-4 py-3 rounded-full font-semibold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title={isRecording ? 'Click to stop and send' : 'Speak in English'}
            >
              <Mic className="w-5 h-5" />
              <span className="hidden xs:inline">{isRecording ? 'Stop' : 'Speak in English'}</span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? '🎤 Listening...' : '💬 Type your message...'}
              disabled={isLoading || isRecording}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 shadow-sm text-sm sm:text-base"
            />

            <button
              onClick={handleSendClick}
              disabled={isLoading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>

          </div>

          <p className="text-xs text-slate-500 text-center">
            {sessionEnded
              ? `Session limit reached (${SESSION_LIMIT} messages).`
              : '💡 Press Enter to send • 🎤 Click mic to speak'}
          </p>
        </div>
      </div>

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