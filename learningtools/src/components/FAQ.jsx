import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, Mic, Trophy, Smartphone, Gift, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Qual a melhor plataforma para aprender inglês online?",
      answer: "LearnFun oferece uma experiência única combinando tecnologia de reconhecimento de voz, gamificação e feedback instantâneo para tornar o aprendizado de inglês eficaz e divertido. Nossa plataforma é projetada especificamente para brasileiros que querem melhorar sua fluência através de prática real e interativa.",
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      question: "Como praticar conversação em inglês sozinho?",
      answer: "LearnFun permite praticar conversação através de exercícios interativos com reconhecimento de voz, análise de pronúncia e feedback em tempo real, tudo sem precisar de um parceiro de conversação. Você pode praticar frases do dia a dia, receber feedback instantâneo sobre sua pronúncia e melhorar gradualmente sua fluência.",
      icon: <Mic className="w-5 h-5" />
    },
    {
      question: "Quanto tempo leva para ficar fluente em inglês?",
      answer: "O tempo varia de pessoa para pessoa, mas com prática consistente diária usando LearnFun, você pode ver melhorias significativas em semanas. Nosso sistema de streaks ajuda a manter a consistência, e estudos mostram que 15-30 minutos de prática diária podem gerar resultados visíveis em 2-3 meses.",
      icon: <Target className="w-5 h-5" />
    },
    {
      question: "A plataforma é gratuita?",
      answer: "Sim, LearnFun oferece acesso gratuito com recursos completos para aprender e praticar inglês. Todos os modos de treinamento, exercícios, feedback de pronúncia e sistema de gamificação estão disponíveis sem custo.",
      icon: <Gift className="w-5 h-5" />
    },
    {
      question: "Funciona no celular?",
      answer: "Sim, LearnFun é uma Progressive Web App (PWA) que funciona perfeitamente em dispositivos móveis, tablets e desktops. Você pode instalar o app no seu celular e praticar inglês em qualquer lugar, mesmo offline.",
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      question: "Como funciona o sistema de gamificação?",
      answer: "LearnFun usa um sistema de XP (pontos de experiência) e níveis para tornar o aprendizado mais motivador. Você ganha XP ao completar exercícios, mantém streaks de prática diária, e pode competir no leaderboard. Isso torna o aprendizado mais divertido e ajuda a manter a consistência.",
      icon: <Trophy className="w-5 h-5" />
    },
    {
      question: "Preciso de um parceiro para praticar?",
      answer: "Não! LearnFun foi projetado para você praticar sozinho. Usamos tecnologia de reconhecimento de voz avançada para avaliar sua pronúncia e dar feedback instantâneo, sem precisar de outra pessoa.",
      icon: <Users className="w-5 h-5" />
    },
    {
      question: "Como funciona o feedback de pronúncia?",
      answer: "Nosso sistema analisa sua pronúncia usando tecnologia de reconhecimento de voz e análise fonética (IPA). Você recebe feedback em tempo real sobre quais fonemas estão corretos e quais precisam de melhoria, com visualizações claras para facilitar o aprendizado.",
      icon: <Mic className="w-5 h-5" />
    },
    {
      question: "Quais níveis de inglês a plataforma cobre?",
      answer: "LearnFun é adequado para iniciantes e estudantes intermediários. Oferecemos exercícios desde frases básicas do dia a dia até vocabulário mais avançado, sempre com foco em situações práticas e conversação real.",
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      question: "Posso usar a plataforma offline?",
      answer: "Sim! LearnFun é uma PWA (Progressive Web App) que funciona offline. Após o primeiro acesso, você pode praticar mesmo sem conexão com a internet, tornando o aprendizado mais acessível.",
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      question: "Como o sistema de streaks funciona?",
      answer: "O sistema de streaks incentiva a prática diária. Quanto mais dias consecutivos você praticar, maior será sua streak. Isso ajuda a criar um hábito consistente de estudo, que é fundamental para o aprendizado de idiomas.",
      icon: <Trophy className="w-5 h-5" />
    },
    {
      question: "A plataforma ajuda a preparar para exames como TOEFL?",
      answer: "Embora LearnFun foque em conversação e prática do dia a dia, as habilidades desenvolvidas (pronúncia, vocabulário, fluência) são fundamentais para qualquer exame de proficiência. A prática consistente na plataforma pode complementar seus estudos para exames.",
      icon: <Target className="w-5 h-5" />
    },
    {
      question: "Como começar a usar a plataforma?",
      answer: "É muito simples! Basta acessar LearnFun, escolher um modo de treinamento (frases, tradução, categorias, etc.) e começar a praticar. Não é necessário criar conta para começar, mas criar uma conta permite salvar seu progresso e participar do sistema de gamificação.",
      icon: <HelpCircle className="w-5 h-5" />
    },
    {
      question: "A plataforma é adequada para crianças?",
      answer: "LearnFun é projetado principalmente para adolescentes e adultos. A interface e os exercícios são adequados para quem tem pelo menos 13 anos. Para crianças mais novas, recomendamos supervisão de um adulto.",
      icon: <Users className="w-5 h-5" />
    },
    {
      question: "Posso usar LearnFun junto com outros métodos de aprendizado?",
      answer: "Absolutamente! LearnFun é um excelente complemento para aulas tradicionais, cursos online ou outros métodos de aprendizado. A prática diária na plataforma pode acelerar significativamente seu progresso, especialmente na área de conversação e pronúncia.",
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Perguntas Frequentes</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o LearnFun
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-blue-600 flex-shrink-0">
                    {faq.icon}
                  </div>
                  <span className="font-semibold text-gray-800 text-lg pr-4">
                    {faq.question}
                  </span>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-6 pb-4 pt-2 border-t border-gray-100"
                >
                  <p className="text-gray-600 leading-relaxed pl-11">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Comece a praticar inglês agora mesmo e veja sua fluência melhorar dia após dia
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Começar Agora
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Ainda tem dúvidas? Entre em contato conosco através da plataforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

