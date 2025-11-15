/**
 * Script de Prerendering para gerar HTML estático
 * 
 * Este script gera versões estáticas das páginas principais
 * para melhorar a indexação por IAs e motores de busca.
 * 
 * Uso: node scripts/prerender.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

// Páginas para prerenderizar
const pages = [
  { path: '/', output: 'index.html' },
  { path: '/home', output: 'home.html' },
  { path: '/sobre', output: 'sobre.html' },
  { path: '/como-funciona', output: 'como-funciona.html' },
  { path: '/precos', output: 'precos.html' },
  { path: '/faq', output: 'faq.html' },
];

console.log('🚀 Iniciando prerendering...');
console.log('📝 Nota: Este script cria arquivos HTML estáticos básicos.');
console.log('💡 Para prerendering completo, considere usar Vercel ou Netlify que fazem isso automaticamente.\n');

// Cria diretório dist se não existir
if (!existsSync(distPath)) {
  mkdirSync(distPath, { recursive: true });
}

// HTML base com conteúdo estático
const baseHTML = (title, description, content) => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="https://learnfun-sigma.vercel.app${pages.find(p => p.output === content)?.path || ''}" />
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <noscript>
      <h1>${title}</h1>
      <p>${description}</p>
      <p>Por favor, habilite JavaScript para usar a aplicação completa.</p>
    </noscript>
  </body>
</html>`;

// Gera HTML para cada página
pages.forEach(({ path, output }) => {
  const title = output === 'index.html' 
    ? 'LearnFun - Aprenda Inglês Online | Plataforma Interativa com IA'
    : output.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const description = 'Plataforma completa para aprender inglês com exercícios práticos, gamificação e feedback instantâneo.';
  
  const html = baseHTML(title, description, output);
  const filePath = join(distPath, output);
  
  writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ Gerado: ${output}`);
});

console.log('\n✨ Prerendering concluído!');
console.log('📌 Nota: O Vercel faz prerendering automático em produção.');
console.log('📌 Para desenvolvimento, use: npm run build && npm run preview');

