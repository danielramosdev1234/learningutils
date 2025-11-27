// Assessment utilities
export const CEFR_TO_NUMBER = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'C1': 5,
  'C2': 6
};

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_BELTS = {
  'A1': { color: 'white', gradient: 'from-gray-100 to-gray-300', name: 'Iniciante' },
  'A2': { color: 'blue', gradient: 'from-blue-400 to-blue-600', name: 'Básico' },
  'B1': { color: 'purple', gradient: 'from-purple-400 to-purple-600', name: 'Intermediário' },
  'B2': { color: 'brown', gradient: 'from-amber-700 to-amber-900', name: 'Intermediário Superior' },
  'C1': { color: 'black', gradient: 'from-gray-800 to-black', name: 'Avançado' },
  'C2': { color: 'red', gradient: 'from-red-600 to-red-800', name: 'Proficiente' }
};

// Algoritmo adaptativo
export const getNextLevel = (currentLevel, correctCount, totalQuestions) => {
  const accuracy = (correctCount / totalQuestions) * 100;
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel);

  if (correctCount === totalQuestions) { // 5/5 = 100%
    return CEFR_LEVELS[Math.min(currentIndex + 2, CEFR_LEVELS.length - 1)];
  }
  if (correctCount >= 4) { // 4/5 = 80%
    return CEFR_LEVELS[Math.min(currentIndex + 1, CEFR_LEVELS.length - 1)];
  }
  if (correctCount >= 3) { // 3/5 = 60%
    return currentLevel; // Mantém
  }
  // < 3/5 = desce
  return CEFR_LEVELS[Math.max(currentIndex - 1, 0)];
};

export const calculateSkillLevels = (answers) => {
  const skills = {};

  Object.keys(answers).forEach(skill => {
    const results = answers[skill];
    const correctByLevel = {};

    // Agrupa por nível
    results.forEach(({ correct, level }) => {
      if (!correctByLevel[level]) correctByLevel[level] = { correct: 0, total: 0 };
      correctByLevel[level].total++;
      if (correct) correctByLevel[level].correct++;
    });

    // Encontra nível mais alto com >= 60% acerto
    let finalLevel = 'A1';
    CEFR_LEVELS.forEach(level => {
      const data = correctByLevel[level];
      if (data && (data.correct / data.total) >= 0.6) {
        finalLevel = level;
      }
    });

    const finalData = correctByLevel[finalLevel] || { correct: 0, total: 1 };
    skills[skill] = {
      level: finalLevel,
      score: Math.round((finalData.correct / finalData.total) * 100)
    };
  });

  return skills;
};

export const calculateOverallLevel = (skills) => {
  const levels = Object.values(skills).map(s => CEFR_LEVELS.indexOf(s.level));
  const avgIndex = Math.floor(levels.reduce((a, b) => a + b) / levels.length);
  return CEFR_LEVELS[avgIndex];
};

export const generateAndDownloadCertificate = async (data) => {
  try {
    const { generateCertificate } = await import('../components/assessment/CertificateGenerator');
    const blob = await generateCertificate(data);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnFun_Certificate_${data.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
};