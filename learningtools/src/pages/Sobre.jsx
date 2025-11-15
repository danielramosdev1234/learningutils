import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { Target, Users, Zap, Heart } from 'lucide-react';

const Sobre = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "LearnFun",
      "description": "Plataforma interativa para aprendizado de inglês"
    }
  };

  return (
    <>
      <SEOHead
        title="Sobre o LearnFun - Nossa Missão e Valores"
        description="Conheça a história do LearnFun, nossa missão de tornar o aprendizado de inglês acessível e eficaz para todos os brasileiros."
        keywords="sobre learnfun, missão learnfun, história learnfun, equipe learnfun"
        canonical="https://learnfun-sigma.vercel.app/sobre"
        schema={schema}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <article>
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">Sobre o LearnFun</h1>
              <p className="text-xl text-gray-600">
                Transformando o aprendizado de inglês através de tecnologia e inovação
              </p>
            </header>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-600" />
                Nossa Missão
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Tornar o aprendizado de inglês acessível, prático e motivador para todos os brasileiros, 
                independentemente de sua localização, horário disponível ou nível inicial de conhecimento.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Acreditamos que todos merecem ter acesso a uma educação de qualidade, e que a tecnologia 
                pode ser uma ferramenta poderosa para democratizar o aprendizado de idiomas.
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                Nossa Visão
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Ser a plataforma de referência para aprendizado de inglês no Brasil, reconhecida pela 
                qualidade do conteúdo, inovação tecnológica e resultados comprovados dos nossos estudantes.
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                Nossos Valores
              </h2>
              <ul className="space-y-4 text-lg text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Acessibilidade:</strong> Acreditamos que educação de qualidade deve ser acessível a todos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Inovação:</strong> Utilizamos tecnologia de ponta para criar experiências de aprendizado únicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Resultados:</strong> Focamos em metodologias comprovadas que geram resultados reais</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold">•</span>
                  <span><strong>Comunidade:</strong> Construímos uma comunidade de aprendizes que se apoiam mutuamente</span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                Por que o LearnFun?
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                O LearnFun foi criado por uma equipe de educadores, desenvolvedores e entusiastas de idiomas 
                que entenderam as dificuldades que brasileiros enfrentam ao aprender inglês.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Combinamos as melhores práticas de ensino de idiomas com tecnologia de reconhecimento de voz, 
                gamificação e análise de dados para criar uma experiência de aprendizado única, eficaz e, 
                acima de tudo, divertida.
              </p>
            </section>

            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-block bg-purple-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                Começar a Aprender Agora
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default Sobre;

