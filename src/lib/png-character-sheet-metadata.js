export const CHARACTER_SHEET_METADATA_KEYWORD = 'furu.character_sheet';

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const concatBytes = (...parts) => {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
};

const uint32Bytes = (value) => new Uint8Array([
  (value >>> 24) & 0xff,
  (value >>> 16) & 0xff,
  (value >>> 8) & 0xff,
  value & 0xff,
]);

const readUint32 = (bytes, offset) => (
  ((bytes[offset] << 24) >>> 0)
  + (bytes[offset + 1] << 16)
  + (bytes[offset + 2] << 8)
  + bytes[offset + 3]
);

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return crc >>> 0;
});

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const hasPngSignature = (bytes) => (
  bytes.length >= PNG_SIGNATURE.length
  && PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)
);

const hasJpegSignature = (bytes) => (
  bytes.length >= 4
  && bytes[0] === 0xff
  && bytes[1] === 0xd8
  && bytes[2] === 0xff
);

const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

const dataUrlToBytes = (dataUrl) => {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(dataUrl));
  if (!match) throw new Error('PNG画像を読み込んでください。');
  try {
    return base64ToBytes(match[1].replace(/\s/g, ''));
  } catch {
    throw new Error('PNG画像を読み込んでください。');
  }
};

const parseChunks = (bytes) => {
  if (!hasPngSignature(bytes)) throw new Error('PNG画像を読み込んでください。');

  const chunks = [];
  let offset = PNG_SIGNATURE.length;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > bytes.length) throw new Error('PNG画像が壊れているため読み込めません。');

    const typeBytes = bytes.slice(offset + 4, offset + 8);
    const type = String.fromCharCode(...typeBytes);
    chunks.push({
      type,
      typeBytes,
      data: bytes.slice(dataStart, dataEnd),
      crc: readUint32(bytes, dataEnd),
      raw: bytes.slice(offset, chunkEnd),
    });
    offset = chunkEnd;
    if (type === 'IEND') break;
  }

  if (!chunks.some(({ type }) => type === 'IEND')) {
    throw new Error('PNG画像が壊れているため読み込めません。');
  }
  return chunks;
};

const createChunk = (type, data) => {
  const typeBytes = textEncoder.encode(type);
  return concatBytes(
    uint32Bytes(data.length),
    typeBytes,
    data,
    uint32Bytes(crc32(concatBytes(typeBytes, data))),
  );
};

const readKeyword = (data) => {
  const end = data.indexOf(0);
  return end >= 0 ? textDecoder.decode(data.slice(0, end)) : '';
};

const isCharacterSheetMetadataChunk = ({ type, data }) => (
  (type === 'iTXt' || type === 'tEXt') && readKeyword(data) === CHARACTER_SHEET_METADATA_KEYWORD
);

const createInternationalTextData = (text) => concatBytes(
  textEncoder.encode(CHARACTER_SHEET_METADATA_KEYWORD),
  new Uint8Array([0, 0, 0, 0, 0]),
  textEncoder.encode(text),
);

const readInternationalText = (data) => {
  const keywordEnd = data.indexOf(0);
  if (keywordEnd < 0 || data[keywordEnd + 1] !== 0) {
    throw new Error('画像内の設計データが壊れているため読み込めません。');
  }

  let cursor = keywordEnd + 3;
  const languageEnd = data.indexOf(0, cursor);
  if (languageEnd < 0) throw new Error('画像内の設計データが壊れているため読み込めません。');
  cursor = languageEnd + 1;
  const translatedKeywordEnd = data.indexOf(0, cursor);
  if (translatedKeywordEnd < 0) throw new Error('画像内の設計データが壊れているため読み込めません。');
  return textDecoder.decode(data.slice(translatedKeywordEnd + 1));
};

const inputToBytes = async (input) => {
  if (typeof input === 'string') {
    const match = /^data:image\/(?:png|jpeg);base64,([A-Za-z0-9+/=\s]+)$/i.exec(input);
    if (!match) throw new Error('PNGまたはJPEG画像を読み込んでください。');
    try {
      return base64ToBytes(match[1].replace(/\s/g, ''));
    } catch {
      throw new Error('PNGまたはJPEG画像を読み込んでください。');
    }
  }
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (input && typeof input.arrayBuffer === 'function') return new Uint8Array(await input.arrayBuffer());
  throw new Error('PNGまたはJPEG画像を読み込んでください。');
};

const validateMetadata = (metadata) => {
  if (
    !metadata
    || metadata.schema !== CHARACTER_SHEET_METADATA_KEYWORD
    || metadata.schema_version !== 1
    || typeof metadata.prompt !== 'string'
  ) {
    throw new Error('画像内の設計データが壊れているため読み込めません。');
  }
  return metadata;
};

export const createCharacterSheetMetadata = ({
  appVersion = '',
  prompt = '',
  character = {},
  generation = {},
  createdAt = new Date().toISOString(),
} = {}) => ({
  schema: CHARACTER_SHEET_METADATA_KEYWORD,
  schema_version: 1,
  app: 'Character Sheet Maker',
  app_version: String(appVersion),
  prompt: String(prompt),
  character,
  generation,
  created_at: createdAt,
});

export const embedCharacterSheetMetadata = (pngDataUrl, metadata) => {
  const bytes = dataUrlToBytes(pngDataUrl);
  const chunks = parseChunks(bytes);
  const json = JSON.stringify(validateMetadata(metadata));
  const metadataChunk = createChunk('iTXt', createInternationalTextData(json));
  const outputChunks = [];

  for (const chunk of chunks) {
    if (isCharacterSheetMetadataChunk(chunk)) continue;
    if (chunk.type === 'IEND') outputChunks.push(metadataChunk);
    outputChunks.push(chunk.raw);
  }

  return `data:image/png;base64,${bytesToBase64(concatBytes(PNG_SIGNATURE, ...outputChunks))}`;
};

const readCharacterSheetMetadata = (chunks) => {
  const chunk = chunks.find(isCharacterSheetMetadataChunk);
  if (!chunk) return null;

  const actualCrc = crc32(concatBytes(chunk.typeBytes, chunk.data));
  if (actualCrc !== chunk.crc) {
    throw new Error('画像内の設計データが壊れているため読み込めません。');
  }

  try {
    const text = chunk.type === 'iTXt'
      ? readInternationalText(chunk.data)
      : textDecoder.decode(chunk.data.slice(chunk.data.indexOf(0) + 1));
    return validateMetadata(JSON.parse(text));
  } catch (error) {
    if (/設計データ/.test(error.message)) throw error;
    throw new Error('画像内の設計データが壊れているため読み込めません。');
  }
};

export const extractCharacterSheetMetadata = async (input) => {
  const metadata = readCharacterSheetMetadata(parseChunks(await inputToBytes(input)));
  if (!metadata) throw new Error('このPNGにはCharacter Sheet Makerの設計データがありません。');
  return metadata;
};

export const importCharacterSheetImage = async (input) => {
  const bytes = await inputToBytes(input);
  let mimeType;
  let metadata = null;
  if (hasPngSignature(bytes)) {
    mimeType = 'image/png';
    metadata = readCharacterSheetMetadata(parseChunks(bytes));
  } else if (hasJpegSignature(bytes)) {
    mimeType = 'image/jpeg';
  } else {
    throw new Error('PNGまたはJPEG画像を読み込んでください。');
  }
  return {
    imageDataUrl: `data:${mimeType};base64,${bytesToBase64(bytes)}`,
    metadata,
  };
};
