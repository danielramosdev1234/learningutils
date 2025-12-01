import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Estilos profissionais do PDF - JURIDICAMENTE SEGURO
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },

  // Header com borda decorativa
  headerBorder: {
    height: 10,
    backgroundColor: '#4F46E5'
  },

  header: {
    padding: 25,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid'
  },

  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    letterSpacing: 1,
    marginBottom: 5
  },

  certificateTitle: {
    fontSize: 14,
    color: '#374151',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 5
  },

  certificationSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 0.8
  },

  // Corpo do certificado - COMPACTO
  body: {
    padding: 30,
    paddingTop: 25,
    paddingBottom: 20
  },

  declarationText: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 1.5
  },

  nameSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 6
  },

  nameLabel: {
    fontSize: 9,
    color: '#6B7280',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
    paddingHorizontal: 20
  },

  // Seção de resultados - COMPACTA
  resultsSection: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid'
  },

  resultsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    borderLeftStyle: 'solid'
  },

  resultLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  resultValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827'
  },

  levelBadge: {
    backgroundColor: '#4F46E5',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 15
  },

  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.5
  },

  // Framework CEFR - COMPACTO
  cefrSection: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'solid'
  },

  cefrTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4338CA',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.8
  },

  cefrText: {
    fontSize: 8.5,
    color: '#4338CA',
    textAlign: 'center',
    lineHeight: 1.4
  },

  // Footer - COMPACTO
  footer: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid'
  },

  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dateSection: {
    flex: 1
  },

  dateLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  dateValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 8
  },

  qrSection: {
    alignItems: 'center',
    flex: 1
  },

  qrCode: {
    width: 60,
    height: 60,
    marginBottom: 5
  },

  qrText: {
    fontSize: 7,
    color: '#6B7280',
    textAlign: 'center'
  },

  signatureSection: {
    flex: 1,
    alignItems: 'flex-end'
  },

  signatureLine: {
    width: 130,
    height: 1,
    backgroundColor: '#9CA3AF',
    marginBottom: 5
  },

  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827'
  },

  signatureRole: {
    fontSize: 7.5,
    color: '#6B7280',
    fontStyle: 'italic'
  },

  // Disclaimer - JURIDICAMENTE OBRIGATÓRIO
  disclaimerSection: {
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderTopWidth: 2,
    borderTopColor: '#F59E0B',
    borderTopStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
    borderBottomStyle: 'solid'
  },

  disclaimerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  disclaimerText: {
    fontSize: 7.5,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 1.4
  },

  // Rodapé final - COMPACTO
  bottomFooter: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center'
  },

  bottomText: {
    fontSize: 7,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 1.3
  },

  certificateId: {
    fontSize: 6.5,
    color: '#D1D5DB',
    marginTop: 3,
    letterSpacing: 0.8
  }
});

// Descrições CEFR específicas por habilidade
const CEFR_DESCRIPTIONS = {
  speaking: {
    'A1': 'Can pronounce basic words and phrases with understandable clarity. Able to introduce themselves and answer simple personal questions with short responses.',
    'A2': 'Can communicate in simple conversations about familiar topics with acceptable pronunciation. Able to describe basic aspects of their life and immediate environment.',
    'B1': 'Can speak with reasonable fluency on familiar topics. Able to express opinions, describe experiences, and handle most travel situations with clear pronunciation.',
    'B2': 'Demonstrates fluent and natural speech with native speakers. Can articulate clear viewpoints on various subjects with good pronunciation and intonation control.',
    'C1': 'Exhibits advanced speaking proficiency with flexible expression for social, academic, and professional contexts. Can produce clear, well-structured speech with natural flow.',
    'C2': 'Shows speaking mastery comparable to educated native speakers. Can express themselves spontaneously and fluently with precise articulation and natural intonation patterns.'
  },
  listening: {
    'A1': 'Can understand familiar words and basic phrases when people speak slowly and clearly. Able to comprehend simple questions about personal information.',
    'A2': 'Can understand phrases and common vocabulary on familiar topics. Able to grasp the main point in short, clear messages and announcements.',
    'B1': 'Can understand the main points of clear standard speech on familiar matters. Able to follow the main points of extended discussion on topics of personal interest.',
    'B2': 'Demonstrates ability to understand extended speech and lectures on complex topics. Can follow most TV news and current affairs programs with good comprehension.',
    'C1': 'Exhibits advanced listening comprehension of extended speech even when not clearly structured. Can understand television programs and films without much effort.',
    'C2': 'Shows listening mastery comparable to educated native speakers. Can understand any kind of spoken language with ease, including fast-paced conversations and various accents.'
  }
};

// Componente do PDF
const CertificatePDF = ({ name, level, skill, score, date, qrCodeUrl }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const skillName = skill === 'speaking' ? 'Speaking' : 'Listening';
  const certificateId = `LF-${Date.now().toString(36).toUpperCase()}-${skill.substring(0, 3).toUpperCase()}`;

  // ✅ Obter descrição específica da habilidade
  const cefrDescription = CEFR_DESCRIPTIONS[skill]?.[level] || CEFR_DESCRIPTIONS.speaking[level];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Borda decorativa top */}
        <View style={styles.headerBorder} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LEARNFUN</Text>
          <Text style={styles.certificateTitle}>Certificate of Completion</Text>
          <Text style={styles.certificationSubtitle}>CEFR-Based Language Assessment</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>


          {/* Nome do certificado */}
          <View style={styles.nameSection}>
            <Text style={styles.nameLabel}>Participant</Text>
            <Text style={styles.name}>{name}</Text>
          </View>

          {/* Texto de conquista */}
          <Text style={styles.declarationText}>
            Has completed an English language assessment on the LearnFun platform.
            The assessment is based on the Common European Framework of Reference for Languages (CEFR) guidelines
            for educational and progress tracking purposes.
          </Text>

          {/* Resultados */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Assessment Summary</Text>

            <View style={styles.resultRow}>
              <View>
                <Text style={styles.resultLabel}>Skill Assessed</Text>
                <Text style={styles.resultValue}>{skillName}</Text>
              </View>
            </View>

            <View style={styles.resultRow}>
              <View>
                <Text style={styles.resultLabel}>Estimated CEFR Level</Text>
                <Text style={styles.resultValue}>Level {level}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{level}</Text>
              </View>
            </View>

            {/* Informação CEFR - Específica da habilidade */}
            <View style={styles.cefrSection}>
              <Text style={styles.cefrTitle}>CEFR Level {level} - {skillName} Proficiency</Text>
              <Text style={styles.cefrText}>{cefrDescription}</Text>
            </View>
          </View>
        </View>

        {/* DISCLAIMER LEGAL - OBRIGATÓRIO */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Legal Notice</Text>
          <Text style={styles.disclaimerText}>
            This certificate is issued for educational and informational purposes only by the LearnFun online platform.
            It is NOT an official CEFR certification and is NOT recognized by academic institutions, employers, or government agencies.
            This assessment does not replace official language proficiency tests such as Cambridge English, IELTS, TOEFL, DELF/DALF, or other accredited examinations.
            For official certification, please contact an authorized testing center.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            {/* Data */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
              <Text style={styles.dateLabel}>Document ID</Text>
              <Text style={styles.dateValue}>{certificateId}</Text>
            </View>

            {/* QR Code */}
            {qrCodeUrl && (
              <View style={styles.qrSection}>
                <Image src={qrCodeUrl} style={styles.qrCode} />
                <Text style={styles.qrText}>Verify online</Text>
              </View>
            )}

            {/* Assinatura */}
            <View style={styles.signatureSection}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>LearnFun Platform</Text>
              <Text style={styles.signatureRole}>Automated Assessment System</Text>
              <Text style={styles.signatureRole}>learnfun-sigma.vercel.app</Text>
            </View>
          </View>
        </View>

        {/* Rodapé final */}
        <View style={styles.bottomFooter}>
          <Text style={styles.bottomText}>
            This is an informal assessment certificate generated automatically by LearnFun's educational platform.{'\n'}
            For questions about this document, visit learnfun-sigma.vercel.app/support
          </Text>
          <Text style={styles.certificateId}>Reference: {certificateId}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Função para gerar certificado
export const generateCertificate = async (certificateData) => {
  try {
    console.log('📄 Gerando certificado educacional com dados:', certificateData);

    // Validar dados obrigatórios
    if (!certificateData.name || !certificateData.level || !certificateData.skill) {
      throw new Error('Dados incompletos para gerar certificado');
    }

    // Gerar QR Code com URL de verificação
    const certificateId = `LF-${Date.now().toString(36).toUpperCase()}-${certificateData.skill.substring(0, 3).toUpperCase()}`;
    const qrCodeUrl = `${window.location.origin}/verify/${certificateId}`;
    let qrCodeDataUrl = null;

    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (qrError) {
      console.warn('Aviso: QR Code não pôde ser gerado, continuando sem QR:', qrError);
    }

    // Criar documento PDF
    const pdfDocument = (
      <CertificatePDF
        name={certificateData.name}
        level={certificateData.level}
        skill={certificateData.skill}
        score={certificateData.score || 0}
        date={certificateData.date || new Date().toISOString()}
        qrCodeUrl={qrCodeDataUrl}
      />
    );

    // Gerar blob do PDF
    const blob = await pdf(pdfDocument).toBlob();

    console.log('✅ Certificado educacional gerado com sucesso');
    return blob;
  } catch (error) {
    console.error('❌ Erro ao gerar certificado:', error);
    throw error;
  }
};

// Função auxiliar para download
export const downloadCertificate = (blob, filename = 'LearnFun_Assessment_Certificate.pdf') => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default CertificatePDF;