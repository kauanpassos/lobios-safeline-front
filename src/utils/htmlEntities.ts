/**
 * Decodifica entidades HTML nomeadas e numéricas (decimais e hexadecimais)
 * para texto puro legível.
 *
 * Exemplo: 'Assédio Moral - Bob Esponja sem cal&#231;a quadrada!!!'
 *   -> 'Assédio Moral - Bob Esponja sem calça quadrada!!!'
 */
const NAMED_HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&ccedil;': 'ç',
  '&Ccedil;': 'Ç',
  '&atilde;': 'ã',
  '&Atilde;': 'Ã',
  '&otilde;': 'õ',
  '&Otilde;': 'Õ',
  '&aacute;': 'á',
  '&Aacute;': 'Á',
  '&eacute;': 'é',
  '&Eacute;': 'É',
  '&iacute;': 'í',
  '&Iacute;': 'Í',
  '&oacute;': 'ó',
  '&Oacute;': 'Ó',
  '&uacute;': 'ú',
  '&Uacute;': 'Ú',
  '&acirc;': 'â',
  '&Acirc;': 'Â',
  '&ecirc;': 'ê',
  '&Ecirc;': 'Ê',
  '&icirc;': 'î',
  '&Icirc;': 'Î',
  '&ocirc;': 'ô',
  '&Ocirc;': 'Ô',
  '&ucirc;': 'û',
  '&Ucirc;': 'Û',
};

const decodeNumericEntities = (value: string): string =>
  value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (entity, hexadecimal?: string, decimal?: string) => {
    const codePoint = Number.parseInt(hexadecimal ?? decimal ?? '', hexadecimal ? 16 : 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  });

export const decodeHtmlEntities = (value: string | null | undefined): string => {
  if (!value) return '';

  let decoded = decodeNumericEntities(value);

  for (const [entity, replacement] of Object.entries(NAMED_HTML_ENTITIES)) {
    decoded = decoded.replaceAll(entity, replacement);
  }

  // Segunda passagem para casos de dupla codificação (ex.: &amp;#231;)
  if (decoded.includes('&#')) {
    decoded = decodeNumericEntities(decoded);
  }

  return decoded;
};
