/**
 * Formata e normaliza o código de protocolo único no padrão SafeLine (ex.: QBDU-DAFT-FS7A).
 */
export const formatProtocolCode = (protocolOrId?: string | null): string => {
  if (!protocolOrId) return 'N/A';
  const trimmed = protocolOrId.trim();

  // Padrão SafeLine: 3 blocos de 4 caracteres alfanuméricos separados por hífen
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Padrão com hífens existente (ex.: NH3 - YGW de testes antigos)
  if (/^[A-Z0-9]{3,4}\s*-\s*[A-Z0-9]{3,4}(\s*-\s*[A-Z0-9]{3,4})?$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Se for ID interno (GUID ou string sem formato), extrai 12 caracteres alfanuméricos e fatia no padrão 4-4-4
  const clean = trimmed.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length >= 12) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
  }

  if (clean.length >= 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-XXXX`;
  }

  return trimmed.toUpperCase();
};
