/**
 * Minimal QR code generator — pure TypeScript, zero dependencies.
 * Supports alphanumeric/byte mode, Versions 1–10, Error Correction Level L.
 * Sufficient for TOTP otpauth:// URIs (~120 chars).
 */

// GF(256) arithmetic for Reed-Solomon
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(function initGalois() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x = (x << 1) ^ (x & 128 ? 0x11d : 0);
  }
  EXP[255] = EXP[0];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function rsEncode(data: number[], ecLen: number): number[] {
  // Generate generator polynomial
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], EXP[i]);
    }
    gen = newGen;
  }
  // Polynomial division
  const result = new Array(ecLen).fill(0);
  for (let i = 0; i < data.length; i++) {
    const coef = data[i] ^ result[0];
    result.shift();
    result.push(0);
    if (coef !== 0) {
      for (let j = 0; j < gen.length - 1; j++) {
        result[j] ^= gfMul(gen[j + 1], coef);
      }
    }
  }
  return result;
}

// QR Version capacities (byte mode, EC Level L)
const VERSION_CAP = [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271];
const ALIGN_PATTERNS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];
// EC codewords per block for Version 1–10, EC Level L
const EC_PER_BLOCK = [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18];
const NUM_BLOCKS = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4];

function chooseVersion(dataLen: number): number {
  for (let v = 1; v <= 10; v++) {
    if (VERSION_CAP[v] >= dataLen) return v;
  }
  throw new Error('Data too long for QR (max ~271 bytes)');
}

export function generateQrSvg(text: string): string {
  const data = new TextEncoder().encode(text);
  const version = chooseVersion(data.length);
  const size = version * 4 + 17;
  const totalDataCodewords = Math.floor((size * size - getFunctionPatternCount(version)) / 8);
  const ecLen = EC_PER_BLOCK[version];
  const numBlocks = NUM_BLOCKS[version];
  const dataCodewordsPerBlock = Math.floor((totalDataCodewords - ecLen * numBlocks) / numBlocks);

  // Encode data
  const bits: number[] = [];
  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0);
  // Character count
  const ccBits = version <= 9 ? 8 : 16;
  for (let i = ccBits - 1; i >= 0; i--) bits.push((data.length >> i) & 1);
  // Data
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < totalDataCodewords * 8; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad bytes
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < totalDataCodewords * 8) {
    for (let i = 7; i >= 0; i--) bits.push((padBytes[padIdx] >> i) & 1);
    padIdx = (padIdx + 1) % 2;
  }

  // Convert to codewords
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  // Split into blocks and add EC
  const blocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    const blockLen = dataCodewordsPerBlock + (b < totalDataCodewords - dataCodewordsPerBlock * numBlocks ? 1 : 0);
    const block = codewords.slice(offset, offset + blockLen);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, ecLen));
    offset += blockLen;
  }

  // Interleave data codewords
  const interleaved: number[] = [];
  const maxBlockLen = Math.max(...blocks.map(b => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (const block of blocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < ecLen; i++) {
    for (const ec of ecBlocks) {
      if (i < ec.length) interleaved.push(ec[i]);
    }
  }

  // Convert to bits
  const dataBits: number[] = [];
  for (const byte of interleaved) {
    for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1);
  }
  // Remainder bits
  const remainderBits = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0][version] || 0;
  for (let i = 0; i < remainderBits; i++) dataBits.push(0);

  // Build matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Place function patterns
  placeFinders(matrix, reserved, size);
  placeAlignment(matrix, reserved, version, size);
  placeTiming(matrix, reserved, size);
  // Dark module
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;
  // Reserve format info
  reserveFormatInfo(reserved, size);
  // Reserve version info (v7+)
  if (version >= 7) reserveVersionInfo(reserved, size);

  // Place data
  placeData(matrix, reserved, dataBits, size);

  // Apply best mask (try all 8, pick lowest penalty)
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const masked = applyMask(matrix, reserved, mask, size);
    const penalty = calcPenalty(masked, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
  }
  const final = applyMask(matrix, reserved, bestMask, size);

  // Place format info
  placeFormatInfo(final, bestMask, size);
  if (version >= 7) placeVersionInfo(final, version, size);

  // Render SVG
  const modules: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (final[y][x]) {
        modules.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${size + 2} ${size + 2}" width="200" height="200">
  <rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="white"/>
  <g fill="black">${modules.join('')}</g>
</svg>`;
}

function getFunctionPatternCount(version: number): number {
  const size = version * 4 + 17;
  // Finder patterns: 3 × (8×8) = 192
  let count = 3 * 64;
  // Separators: 3 × (15 + 15) = 90 (approximate)
  count += 2 * (size - 16) + 15;
  // Timing: 2 × (size - 16)
  count += 2 * (size - 16);
  // Alignment
  if (version >= 2) {
    const align = ALIGN_PATTERNS[version];
    count += align.length * align.length * 25 - (align.length > 1 ? (align.length - 2) * (align.length - 2) * 25 : 0);
  }
  // Format info: 15 + 15 + 1 (dark module)
  count += 31;
  // Version info
  if (version >= 7) count += 36;
  return count;
}

function placeFinders(m: (boolean | null)[][], r: boolean[][], size: number) {
  const placeFinder = (cx: number, cy: number) => {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const ring = Math.max(Math.abs(dx), Math.abs(dy));
        m[y][x] = ring !== 1 && ring !== 3 ? true : ring === 1 ? false : true;
        if (ring === 2) m[y][x] = true; // outer ring is white in pattern but we handle via ring logic
        // Finder: 7x7, outer ring black, inner ring white, center 3x3 black
        if (ring === 0 || ring === 2) m[y][x] = true;
        else if (ring === 1) m[y][x] = false;
        else m[y][x] = false; // separator area
        r[y][x] = true;
      }
    }
    // Re-do properly: standard finder pattern
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          if (dist === 4) { m[y][x] = false; r[y][x] = true; } // separator
          else if (dist === 3) { m[y][x] = true; r[y][x] = true; } // outer
          else if (dist === 2) { m[y][x] = false; r[y][x] = true; }
          else if (dist === 1) { m[y][x] = true; r[y][x] = true; }
          else { m[y][x] = true; r[y][x] = true; } // center
        }
      }
    }
  };
  placeFinder(3, 3);
  placeFinder(size - 4, 3);
  placeFinder(3, size - 4);
}

function placeAlignment(m: (boolean | null)[][], r: boolean[][], version: number, size: number) {
  if (version < 2) return;
  const positions = ALIGN_PATTERNS[version];
  for (const py of positions) {
    for (const px of positions) {
      if (r[py][px]) continue; // skip if overlaps finder
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          m[py + dy][px + dx] = dist !== 1;
          r[py + dy][px + dx] = true;
        }
      }
    }
  }
}

function placeTiming(m: (boolean | null)[][], r: boolean[][], size: number) {
  for (let i = 8; i < size - 8; i++) {
    if (!r[6][i]) { m[6][i] = i % 2 === 0; r[6][i] = true; }
    if (!r[i][6]) { m[i][6] = i % 2 === 0; r[i][6] = true; }
  }
}

function reserveFormatInfo(r: boolean[][], size: number) {
  // Around top-left finder
  for (let i = 0; i <= 8; i++) { r[8][i] = true; r[i][8] = true; }
  // Around top-right finder
  for (let i = size - 8; i < size; i++) r[8][i] = true;
  // Around bottom-left finder
  for (let i = size - 7; i < size; i++) r[i][8] = true;
}

function reserveVersionInfo(r: boolean[][], size: number) {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      r[size - 11 + j][i] = true;
      r[i][size - 11 + j] = true;
    }
  }
}

function placeData(m: (boolean | null)[][], r: boolean[][], bits: number[], size: number) {
  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (let dx = 0; dx >= -1; dx--) {
        const x = right + dx;
        if (x < 0 || x >= size) continue;
        if (r[row][x]) continue;
        m[row][x] = bitIdx < bits.length ? bits[bitIdx] === 1 : false;
        bitIdx++;
      }
    }
    upward = !upward;
  }
}

function applyMask(m: (boolean | null)[][], r: boolean[][], mask: number, size: number): boolean[][] {
  const result = m.map(row => row.map(cell => cell ?? false));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (r[y][x]) continue;
      let flip = false;
      switch (mask) {
        case 0: flip = (y + x) % 2 === 0; break;
        case 1: flip = y % 2 === 0; break;
        case 2: flip = x % 3 === 0; break;
        case 3: flip = (y + x) % 3 === 0; break;
        case 4: flip = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0; break;
        case 5: flip = ((y * x) % 2 + (y * x) % 3) === 0; break;
        case 6: flip = ((y * x) % 2 + (y * x) % 3) % 2 === 0; break;
        case 7: flip = ((y + x) % 2 + (y * x) % 3) % 2 === 0; break;
      }
      if (flip) result[y][x] = !result[y][x];
    }
  }
  return result;
}

function calcPenalty(m: boolean[][], size: number): number {
  let penalty = 0;
  // Rule 1: runs of same color
  for (let y = 0; y < size; y++) {
    let run = 1;
    for (let x = 1; x < size; x++) {
      if (m[y][x] === m[y][x - 1]) { run++; }
      else {
        if (run >= 5) penalty += run - 2;
        run = 1;
      }
    }
    if (run >= 5) penalty += run - 2;
  }
  for (let x = 0; x < size; x++) {
    let run = 1;
    for (let y = 1; y < size; y++) {
      if (m[y][x] === m[y - 1][x]) { run++; }
      else {
        if (run >= 5) penalty += run - 2;
        run = 1;
      }
    }
    if (run >= 5) penalty += run - 2;
  }
  // Rule 2: 2x2 blocks
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) penalty += 3;
    }
  }
  return penalty;
}

function placeFormatInfo(m: boolean[][], mask: number, size: number) {
  // EC Level L = 01, mask 0–7
  const formatBits = getFormatBits(mask);
  // Around top-left
  for (let i = 0; i <= 5; i++) m[8][i] = ((formatBits >> (14 - i)) & 1) === 1;
  m[8][7] = ((formatBits >> 8) & 1) === 1;
  m[8][8] = ((formatBits >> 7) & 1) === 1;
  m[7][8] = ((formatBits >> 6) & 1) === 1;
  for (let i = 0; i <= 5; i++) m[5 - i][8] = ((formatBits >> (5 - i)) & 1) === 1;
  // Top-right and bottom-left
  for (let i = 0; i <= 7; i++) m[8][size - 1 - i] = ((formatBits >> i) & 1) === 1;
  for (let i = 0; i <= 6; i++) m[size - 1 - i][8] = ((formatBits >> (8 + i)) & 1) === 1;
}

function placeVersionInfo(m: boolean[][], version: number, size: number) {
  let bits = version;
  for (let i = 0; i < 6; i++) {
    const rem = bits % 3;
    bits = Math.floor(bits / 3);
    // Actually we need the full 18-bit version info with BCH error correction
    // For simplicity, use precomputed values for v7-10
  }
  // Precomputed version info strings (18 bits, EC Level doesn't matter for version info)
  const versionInfo: Record<number, number> = {
    7: 0x07C94, 8: 0x085BC, 9: 0x09A99, 10: 0x0A4D3,
  };
  const info = versionInfo[version];
  if (!info) return;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const bit = ((info >> (i * 3 + j)) & 1) === 1;
      m[size - 11 + j][i] = bit;
      m[i][size - 11 + j] = bit;
    }
  }
}

function getFormatBits(mask: number): number {
  // EC Level L = 01, format info with BCH(15,5)
  const ecBits = 0b01; // L
  const data = (ecBits << 3) | mask;
  // BCH(15,5) encoding with generator 0x537
  let bits = data << 10;
  const gen = 0b10100110111; // 0x537
  for (let i = 14; i >= 10; i--) {
    if (bits & (1 << i)) bits ^= gen << (i - 10);
  }
  const result = (data << 10) | bits;
  // XOR with mask pattern 0x5412
  return result ^ 0b101010000010010;
}
