// src/utils/shareCardGenerator.js

/**
 * Gera um card visual bonito para compartilhamento
 * Retorna data URL da imagem PNG
 */
export const generateShareCard = async ({
  phraseText,
  accuracy,
  totalPracticed = 0,
  streak = 0
}) => {
  // Cria canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Dimensões otimizadas para redes sociais (1080x1080 - Instagram)
  canvas.width = 1080;
  canvas.height = 1080;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  if (accuracy >= 90) {
    // Verde dourado (excelente)
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#059669');
    gradient.addColorStop(1, '#047857');
  } else if (accuracy >= 80) {
    // Verde (bom)
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.5, '#16a34a');
    gradient.addColorStop(1, '#15803d');
  } else if (accuracy >= 70) {
    // Laranja (ok)
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(0.5, '#d97706');
    gradient.addColorStop(1, '#b45309');
  } else {
    // Azul (tente novamente)
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#2563eb');
    gradient.addColorStop(1, '#1d4ed8');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Overlay pattern (pontos decorativos)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 40 + 10;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Container branco central
  const padding = 80;
  const containerX = padding;
  const containerY = padding + 100;
  const containerWidth = canvas.width - (padding * 2);
  const containerHeight = canvas.height - (padding * 2) - 200;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;

  // Bordas arredondadas
  roundRect(ctx, containerX, containerY, containerWidth, containerHeight, 30);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Emoji no topo
  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 80 ? '🎉' : accuracy >= 70 ? '💪' : '🔥';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(emoji, canvas.width / 2, containerY + 150);

  // Porcentagem grande
  ctx.font = 'bold 180px Arial';
  ctx.fillStyle = accuracy >= 80 ? '#10b981' : '#f59e0b';
  ctx.fillText(`${accuracy}%`, canvas.width / 2, containerY + 340);

  // Texto "Accuracy"
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Accuracy', canvas.width / 2, containerY + 410);

  // Frase praticada (quebra linha se muito longa)
  ctx.font = '38px Arial';
  ctx.fillStyle = '#374151';
  const maxWidth = containerWidth - 120;
  const words = phraseText.split(' ');
  let line = '';
  let y = containerY + 520;
  const lineHeight = 50;

  // Quebra texto em múltiplas linhas
  for (let word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, canvas.width / 2, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, canvas.width / 2, y);

  // Stats (se disponível)
  if (totalPracticed > 0 || streak > 0) {
    y += 100;
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#9ca3af';

    const stats = [];
    if (totalPracticed > 0) stats.push(`${totalPracticed} phrases practiced`);
    if (streak > 0) stats.push(`${streak} day streak 🔥`);

    ctx.fillText(stats.join(' • '), canvas.width / 2, y);
  }

  // Logo/Marca no topo
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText('LearnFun', canvas.width / 2, 110);
  ctx.shadowColor = 'transparent';

  // Subtitle
  ctx.font = '32px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('English Pronunciation Practice', canvas.width / 2, 160);

  // Call to action no rodapé
  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText('learnfun-sigma.vercel.app', canvas.width / 2, canvas.height - 80);
  ctx.shadowColor = 'transparent';

  ctx.font = '36px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('Try it FREE! 🚀', canvas.width / 2, canvas.height - 30);

  // Retorna data URL
  return canvas.toDataURL('image/png', 1.0);
};

/**
 * Helper: Desenha retângulo com bordas arredondadas
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}