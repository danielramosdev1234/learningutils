import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  // ... mais estilos
});

const CertificatePDF = ({ name, level, skills, date }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>LearnFun English Assessment</Text>
        <Text style={styles.level}>CEFR Level: {level}</Text>
      </View>
      {/* Adicionar: nome, data, skills breakdown, QR code */}
    </Page>
  </Document>
);

export const generateCertificate = async (data) => {
  const blob = await pdf(<CertificatePDF {...data} />).toBlob();
  return blob;
};