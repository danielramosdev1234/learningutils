import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const ResultsScreen = ({ answers }) => {
  const skillLevels = calculateSkillLevels(answers);
  const overallLevel = calculateOverallLevel(skillLevels);

  const data = [
    { skill: 'Speaking', level: CEFR_TO_NUMBER[skillLevels.speaking] },
    { skill: 'Listening', level: CEFR_TO_NUMBER[skillLevels.listening] },
    { skill: 'Reading', level: CEFR_TO_NUMBER[skillLevels.reading] },
    { skill: 'Writing (Trans)', level: CEFR_TO_NUMBER[skillLevels.writing_translate] },
    { skill: 'Writing (Order)', level: CEFR_TO_NUMBER[skillLevels.writing_order] }
  ];

  return (
    <div>
      <h2>Seu Nível: {overallLevel}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <Radar dataKey="level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>

      <button onClick={generateAndDownloadCertificate}>
        <Download /> Baixar Certificado
      </button>
    </div>
  );
};