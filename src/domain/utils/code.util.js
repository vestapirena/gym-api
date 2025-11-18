// /src/domain/utils/code.util.js
/**
 * Arma el código interno: XXX-0001
 * - Prefijo: primeras 3 letras/números del nombre del gym (sin acentos), mayúsculas.
 * - Secuencia: pad a 4 dígitos.
 */
const removeDiacritics = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function gymPrefix(name = '') {
  const clean = removeDiacritics(String(name)).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!clean) return 'GYM';
  return clean.slice(0, 3).padEnd(3, 'X');
}

function padSeq(n, width = 4) {
  return String(n).padStart(width, '0');
}

function buildClientCode(gymName, seq) {
  return `${gymPrefix(gymName)}-${padSeq(seq)}`;
}

module.exports = { gymPrefix, padSeq, buildClientCode };
