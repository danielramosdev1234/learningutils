import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { Mic, Trophy, Target, BookOpen, Zap, Users, CheckCircle } from 'lucide-react';

const Home = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "LearnFun",
    "alternateName": "LearnFunTools",
    "description": "Plataforma interativa para aprender e praticar inglês de forma divertida e eficaz",
    "url": "https://learnfun-sigma.vercel.app",
    "logo": "https://learnfun-sigma.vercel.app/pwa-512x512.png",
    "courseMode": "online",
    "educationalLevel": ["Beginner", "Intermediate", "Advanced"],
    "teaches": {
      "@type": "Language",
      "name": "English"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEOHead
        title="LearnFun - Aprenda Inglês Online | Plataforma Interativa com IA"
        description="Plataforma completa para aprender inglês com exercícios práticos, gamificação e feedback instantâneo. Ideal para brasileiros que buscam fluência real."
        keywords="aprender inglês online, curso de inglês, praticar inglês, exercícios de inglês, inglês para brasileiros, plataforma de inglês, aprender inglês sozinho, conversação em inglês"
        ogTitle="LearnFun - Aprenda Inglês de Forma Prática e Divertida"
        ogDescription="Domine o inglês com exercícios interativos, gamificação e IA"
        canonical="https://learnfun-sigma.vercel.app/"
        schema={schema}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section - Conteúdo visível para IAs */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              LearnFun - Plataforma de Inglês Online
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Aprenda inglês de forma prática e divertida com exercícios interativos, 
              feedback instantâneo de pronúncia e método gamificado. 
              Melhore sua fluência em inglês de forma eficaz através de reconhecimento de voz, 
              análise fonética e múltiplos modos de treinamento.
            </p>
          </div>
        </section>

        {/* Sobre */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Sobre</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              LearnFun é uma plataforma interativa para aprender e praticar inglês de forma 
              divertida e eficaz. Oferecemos exercícios práticos com feedback instantâneo, 
              método gamificado e foco em conversação real.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Nossa missão é tornar o aprendizado de inglês acessível, prático e motivador 
              para todos, especialmente para brasileiros que buscam melhorar sua fluência 
              através de tecnologia de ponta e metodologia comprovada.
            </p>
          </div>
        </section>

        {/* Público-Alvo */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Público-Alvo</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>Iniciantes em inglês</strong> que querem uma base sólida e prática desde o início</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>Estudantes intermediários</strong> buscando fluência em conversação e pronúncia</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>Profissionais</strong> que precisam de inglês para trabalho e comunicação internacional</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>Estudantes preparando-se para exames</strong> como TOEFL, IELTS e Cambridge</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Diferenciais</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">Exercícios Práticos Interativos</h3>
              </div>
              <p className="text-gray-700">
                Mais de 500 exercícios com reconhecimento de voz em tempo real. 
                Pratique pronúncia, vocabulário e gramática com feedback instantâneo.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-yellow-500" />
                <h3 className="text-2xl font-bold text-gray-800">Feedback Instantâneo com IA</h3>
              </div>
              <p className="text-gray-700">
                Correções em tempo real usando tecnologia de reconhecimento de voz avançada. 
                Saiba imediatamente o que está correto e o que precisa melhorar.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-orange-500" />
                <h3 className="text-2xl font-bold text-gray-800">Método Gamificado</h3>
              </div>
              <p className="text-gray-700">
                Sistema de XP, níveis, conquistas e desafios. Mantenha sua motivação com 
                streaks diários e competa no ranking com outros estudantes.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-800">Foco em Conversação Real</h3>
              </div>
              <p className="text-gray-700">
                Situações do dia a dia: trabalho, viagens, compras, restaurantes. 
                Aprenda inglês que você realmente usa em contextos reais.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-red-500" />
                <h3 className="text-2xl font-bold text-gray-800">Análise Fonética (IPA)</h3>
              </div>
              <p className="text-gray-700">
                Melhore sua pronúncia com análise detalhada usando o Alfabeto Fonético Internacional. 
                Visualize exatamente como pronunciar cada som corretamente.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-800">Múltiplos Modos de Treinamento</h3>
              </div>
              <p className="text-gray-700">
                Frases por categorias (incluindo Speak Phrases), tradução, números, vídeos e salas ao vivo. 
                Cada modo desenvolve habilidades específicas do inglês.
              </p>
            </div>
          </div>
        </section>

        {/* Principais Recursos */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Principais Recursos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Exercícios Interativos</h3>
              <p className="text-gray-700">
                Pratique gramática, vocabulário, listening e speaking com feedback instantâneo. 
                Mais de 500 exercícios em diferentes níveis de dificuldade.
              </p>
            </article>

            <article className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Sistema de Gamificação</h3>
              <p className="text-gray-700">
                Ganhe pontos, badges e mantenha streaks diários. Compete no ranking global 
                e veja seu progresso em tempo real.
              </p>
            </article>

            <article className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Conversação com IA</h3>
              <p className="text-gray-700">
                Pratique diálogos reais em diversas situações: trabalho, viagens, cotidiano. 
                Receba feedback imediato sobre sua pronúncia e fluência.
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Comece a praticar inglês agora mesmo e veja sua fluência melhorar dia após dia
            </p>
            <Link
              to="/"
              className="inline-block bg-white text-purple-600 font-bold px-8 py-4 rounded-lg hover:bg-purple-50 transition-colors shadow-lg text-lg"
            >
              Começar Agora - Grátis
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;

