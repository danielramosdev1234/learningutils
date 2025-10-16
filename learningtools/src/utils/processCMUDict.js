// Script para baixar e processar o CMU Pronouncing Dictionary
// Execute com: node src/utils/processCMUDict.js

import fs from 'fs';
import https from 'https';

const ARPA_TO_IPA = {
  'AA': 'ɑ', 'AE': 'æ', 'AH': 'ʌ', 'AO': 'ɔ', 'AW': 'aʊ',
  'AY': 'aɪ', 'EH': 'ɛ', 'ER': 'ɝ', 'EY': 'eɪ', 'IH': 'ɪ',
  'IY': 'i', 'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'u',
  'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'F': 'f',
  'G': 'g', 'HH': 'h', 'JH': 'dʒ', 'K': 'k', 'L': 'l',
  'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'ɹ',
  'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v',
  'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ'
};

function convertArpaToIPA(arpaPhones) {
  return arpaPhones
    .map(phone => {
      // Remove números de stress (0, 1, 2)
      const cleanPhone = phone.replace(/[0-9]/g, '');
      return ARPA_TO_IPA[cleanPhone] || phone;
    })
    .join('');
}

function processCMUDict(fileContent) {
  const lines = fileContent.split('\n');
  const dictionary = {};
  let processedLines = 0;
  let skippedLines = 0;

  console.log(`Total de linhas no arquivo: ${lines.length}`);
  console.log('Processando primeiras 5 linhas como exemplo:');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Ignora comentários e linhas vazias
    if (!line || line.startsWith(';;;')) {
      skippedLines++;
      if (i < 5) console.log(`Linha ${i}: [IGNORADA] ${line.substring(0, 50)}`);
      continue;
    }

    // Tenta diferentes padrões de regex
    // Padrão 1: word  PHONEME1 PHONEME2 ...
    // Padrão 2: word(1)  PHONEME1 PHONEME2 ...
    const patterns = [
      /^([a-z'-]+)\s+(.+)$/i,           // Palavra simples (case insensitive)
      /^([a-z'-]+)\(\d+\)\s+(.+)$/i,    // Palavra com variação
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const word = match[1].toLowerCase();
        const arpaPhones = match[2].trim().split(/\s+/);
        const ipa = convertArpaToIPA(arpaPhones);

        // Só adiciona se ainda não existe (pega a primeira pronúncia)
        if (!dictionary[word]) {
          dictionary[word] = ipa;
          processedLines++;

          if (i < 5) {
            console.log(`Linha ${i}: [PROCESSADA] ${word} -> ${ipa}`);
          }
        }
        matched = true;
        break;
      }
    }

    if (!matched && i < 10) {
      console.log(`Linha ${i}: [NÃO RECONHECIDA] ${line.substring(0, 100)}`);
    }
  }

  console.log(`\nLinhas processadas: ${processedLines}`);
  console.log(`Linhas ignoradas/comentários: ${skippedLines}`);
  console.log(`Linhas não reconhecidas: ${lines.length - processedLines - skippedLines}`);

  return dictionary;
}

// URLs alternativas para tentar
const urls = [
  'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict',
  'https://raw.githubusercontent.com/Alexir/CMUdict/master/cmudict-0.7b',
  'https://svn.code.sf.net/p/cmusphinx/code/trunk/cmudict/cmudict-0.7b'
];

let currentUrlIndex = 0;

function tryDownload() {
  const url = urls[currentUrlIndex];
  console.log(`\nTentando baixar de: ${url}`);

  https.get(url, (res) => {
    if (res.statusCode === 404 && currentUrlIndex < urls.length - 1) {
      console.log('URL não encontrada, tentando próxima...');
      currentUrlIndex++;
      tryDownload();
      return;
    }

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Download completo! Tamanho: ${(data.length / 1024).toFixed(2)} KB\n`);

      const dictionary = processCMUDict(data);

      console.log(`\n✅ Total de palavras únicas processadas: ${Object.keys(dictionary).length}`);

      if (Object.keys(dictionary).length === 0) {
        console.error('\n❌ ERRO: Nenhuma palavra foi processada!');
        console.error('Salvando arquivo bruto para debug...');
        fs.writeFileSync('debug_cmudict_raw.txt', data.substring(0, 5000));
        console.error('Primeiros 5000 caracteres salvos em: debug_cmudict_raw.txt');
        return;
      }

      // Salva como módulo ES
      const output = `// Dicionário CMU completo convertido para IPA
// Total de palavras: ${Object.keys(dictionary).length}
// Gerado automaticamente - não editar manualmente

export const CMU_DICTIONARY_IPA = ${JSON.stringify(dictionary, null, 2)};
`;

      fs.writeFileSync('src/utils/cmuDictionaryIPA.js', output);
      console.log('\n✅ Arquivo salvo: src/utils/cmuDictionaryIPA.js');
      console.log(`📦 Tamanho do arquivo: ${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB`);
      console.log('\n📚 Exemplos de palavras no dicionário:');
      const sampleWords = Object.keys(dictionary).slice(0, 10);
      sampleWords.forEach(word => {
        console.log(`   ${word} -> ${dictionary[word]}`);
      });
      console.log('\n💡 Para usar no seu código:');
      console.log('   import { CMU_DICTIONARY_IPA } from "./cmuDictionaryIPA.js";');
    });
  }).on('error', (err) => {
    console.error('❌ Erro ao baixar:', err.message);
    if (currentUrlIndex < urls.length - 1) {
      console.log('Tentando próxima URL...');
      currentUrlIndex++;
      tryDownload();
    }
  });
}

console.log('🚀 Iniciando download do CMU Pronouncing Dictionary...\n');
tryDownload();