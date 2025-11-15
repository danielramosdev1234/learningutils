import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { PlayCircle, Mic, Trophy, BarChart3, CheckCircle } from 'lucide-react';

const ComoFunciona = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Como Funciona o LearnFun",
    "description": "Aprenda como usar a plataforma LearnFun para melhorar seu inglês"
  };

  return (
    <>
      <SEOHead
        title="Como Funciona o LearnFun - Guia Completo"
        description="Descubra como usar o LearnFun para aprender inglês: desde o cadastro até o uso dos recursos avançados de pronúncia e gamificação."
        keywords="como funciona learnfun, tutorial learnfun, guia learnfun, como usar learnfun"
        canonical="https://learnfun-sigma.vercel.app/como-funciona"
        schema={schema}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <article>
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">Como Funciona o LearnFun</h1>
              <p className="text-xl text-gray-600">
                Um guia completo para começar sua jornada de aprendizado de inglês
              </p>
            </header>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <PlayCircle className="w-8 h-8 text-green-500" />
                Passo 1: Comece Agora
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Não é necessário criar conta para começar! Você pode começar a praticar imediatamente. 
                No entanto, criar uma conta gratuita permite salvar seu progresso e participar do sistema de gamificação.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Acesse a plataforma sem necessidade de cadastro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Ou crie uma conta gratuita para salvar seu progresso</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span>Escolha seu modo de treinamento preferido</span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Mic className="w-8 h-8 text-purple-600" />
                Passo 2: Pratique com Reconhecimento de Voz
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Nossa tecnologia de reconhecimento de voz analisa sua pronúncia em tempo real. 
                Quando você fala uma frase, o sistema:
              </p>
              <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                <li>Captura seu áudio usando o microfone do dispositivo</li>
                <li>Analisa sua pronúncia usando algoritmos avançados</li>
                <li>Compara com a pronúncia nativa</li>
                <li>Fornece feedback instantâneo sobre acurácia</li>
                <li>Mostra análise fonética detalhada (IPA) quando necessário</li>
              </ol>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Passo 3: Ganhe XP e Suba de Nível
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Cada exercício completado com sucesso te dá pontos de experiência (XP). 
                Conforme você ganha XP, você sobe de nível e desbloqueia novos recursos.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700">
                  <strong>Dica:</strong> Mantenha uma sequência diária de prática (streak) para ganhar bônus de XP!
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                Passo 4: Acompanhe Seu Progresso
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Use o dashboard para acompanhar:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span>Seu nível atual e XP total</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span>Sua sequência de dias praticados (streak)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span>Estatísticas de acurácia e progresso</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span>Sua posição no ranking global</span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Modos de Treinamento Disponíveis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Categories</h3>
                  <p className="text-gray-700 text-sm">Pratique frases por categorias temáticas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Speak Phrases</h3>
                  <p className="text-gray-700 text-sm">Treine pronúncia de frases completas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Translate</h3>
                  <p className="text-gray-700 text-sm">Pratique tradução português-inglês</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Challenge</h3>
                  <p className="text-gray-700 text-sm">Desafios cronometrados com ranking</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Video Learning</h3>
                  <p className="text-gray-700 text-sm">Aprenda com cenas de filmes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-2">Live Rooms</h3>
                  <p className="text-gray-700 text-sm">Pratique com outros estudantes</p>
                </div>
              </div>
            </section>

            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-block bg-purple-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                Começar a Praticar Agora
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default ComoFunciona;

