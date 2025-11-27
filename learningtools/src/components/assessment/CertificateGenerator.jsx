import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc'
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  body: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10
  },
  level: {
    fontSize: 18,
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30
  },
  skillsSection: {
    marginBottom: 30
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center'
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid'
  },
  skillName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold'
  },
  skillLevel: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: 'bold'
  },
  skillScore: {
    fontSize: 12,
    color: '#6b7280'
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  qrTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10
  },
  qrCode: {
    width: 80,
    height: 80
  },
  verificationText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center'
  },
  signature: {
    marginTop: 20,
    alignItems: 'center'
  },
  signatureLine: {
    width: 200,
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 5
  },
  signatureText: {
    fontSize: 12,
    color: '#6b7280'
  }
});

// Componente do PDF
const CertificatePDF = ({ name, level, skills, date, qrCodeUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>LearnFun</Text>
        <Text style={styles.title}>English Assessment Certificate</Text>
        <Text style={styles.subtitle}>CEFR Level Certification</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.level}>CEFR Level: {level}</Text>
        <Text style={styles.date}>
          Issued on {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {/* Skills Breakdown */}
        <View style={styles.skillsSection}>
          <Text style={styles.skillsTitle}>Skill Assessment Results</Text>

          {Object.entries(skills).map(([skill, data]) => (
            <View key={skill} style={styles.skillRow}>
              <View>
                <Text style={styles.skillName}>
                  {skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.skillScore}>{data.score}% accuracy</Text>
              </View>
              <Text style={styles.skillLevel}>{data.level}</Text>
            </View>
          ))}
        </View>

        {/* Footer with QR Code */}
        <View style={styles.footer}>
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Certificate Verification</Text>
            <Image src={qrCodeUrl} style={styles.qrCode} />
          </View>
          <Text style={styles.verificationText}>
            Scan QR code to verify certificate authenticity
          </Text>

          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>LearnFun Assessment System</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Função para gerar certificado
export const generateCertificate = async (data) => {
  try {
    // Gerar QR Code
    const qrCodeUrl = `https://learnfun.app/verify/${Date.now()}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });

    // Criar PDF
    const doc = <CertificatePDF {...data} qrCodeUrl={qrCodeDataUrl} />;
    const blob = await pdf(doc).toBlob();

    return blob;
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
};

export default CertificatePDF;