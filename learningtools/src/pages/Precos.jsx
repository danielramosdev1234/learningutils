import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { CheckCircle, Gift } from 'lucide-react';

const Precos = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "LearnFun - Plano Gratuito",
    "price": "0",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "description": "Acesso completo e gratuito a todos os recursos do LearnFun"
  };

  return (
    <>
      <SEOHead
        title="Preços e Planos - LearnFun é 100% Gratuito"
        description="LearnFun oferece acesso completo e gratuito a todos os recursos: exercícios, gamificação, feedback de pronúncia e muito mais."
        keywords="preços learnfun, planos learnfun, learnfun grátis, custo learnfun"
        canonical="https://learnfun-sigma.vercel.app/precos"
        schema={schema}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <article>
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">Preços e Planos</h1>
              <p className="text-xl text-gray-600">
                Acesso completo e gratuito para sempre
              </p>
            </header>

            <section className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-white text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gift className="w-12 h-12" />
                <h2 className="text-4xl font-bold">Plano Gratuito</h2>
              </div>
              <div className="text-6xl font-bold mb-2">R$ 0</div>
              <p className="text-2xl text-purple-100 mb-8">Para sempre</p>
              
              <div className="bg-white/10 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Inclui tudo:</h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Acesso a todos os modos de treinamento</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Mais de 500 exercícios interativos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Feedback instantâneo de pronúncia com IA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Sistema completo de gamificação (XP, níveis, badges)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Análise fonética detalhada (IPA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Salas ao vivo para prática com outros estudantes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Dashboard completo com estatísticas e progresso</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Ranking global e competições</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Modo offline (PWA)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <span>Suporte da comunidade</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Por que é gratuito?</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Acreditamos que o aprendizado de idiomas deve ser acessível a todos. 
                Por isso, decidimos oferecer todos os recursos do LearnFun de forma completamente gratuita.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Não há pegadinhas, não há limites ocultos, não há necessidade de cartão de crédito. 
                Simplesmente comece a aprender e aproveite todos os recursos disponíveis.
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Perguntas Frequentes sobre Preços</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Vai continuar gratuito?</h3>
                  <p className="text-gray-700">
                    Sim! Nosso compromisso é manter o LearnFun gratuito para sempre. 
                    Acreditamos que educação de qualidade deve ser acessível a todos.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Há algum custo escondido?</h3>
                  <p className="text-gray-700">
                    Não. Não há custos escondidos, taxas de cancelamento ou qualquer outro tipo de cobrança. 
                    Tudo é 100% gratuito.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Preciso de cartão de crédito?</h3>
                  <p className="text-gray-700">
                    Não. Você pode usar o LearnFun sem fornecer nenhuma informação de pagamento. 
                    Nem mesmo para criar uma conta.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Posso cancelar quando quiser?</h3>
                  <p className="text-gray-700">
                    Como não há assinatura ou pagamento, não há nada para cancelar. 
                    Você pode parar de usar a plataforma a qualquer momento, sem nenhuma penalidade.
                  </p>
                </div>
              </div>
            </section>

            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-block bg-purple-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors shadow-lg text-lg"
              >
                Começar Agora - Grátis
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default Precos;

