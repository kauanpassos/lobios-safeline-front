import { describe, it, expect } from 'vitest';
import { decodeHtmlEntities } from './htmlEntities';

describe('htmlEntities.ts - decodeHtmlEntities', () => {
  it('deve decodificar entidades HTML numéricas decimais como &#231;', () => {
    const raw = 'Assédio Moral - Bob Esponja sem cal&#231;a quadrada!!!';
    expect(decodeHtmlEntities(raw)).toBe('Assédio Moral - Bob Esponja sem calça quadrada!!!');
  });

  it('deve decodificar entidades numéricas decimais e hexadecimais variadas', () => {
    expect(decodeHtmlEntities('Ol&#225;, voc&#234; est&#225; a&#237;?')).toBe('Olá, você está aí?');
    expect(decodeHtmlEntities('Aten&#xE7;&#xE3;o!')).toBe('Atenção!');
  });

  it('deve decodificar entidades nomeadas comuns', () => {
    expect(decodeHtmlEntities('&quot;Teste&quot; &amp; &apos;Outro&apos;')).toBe('"Teste" & \'Outro\'');
    expect(decodeHtmlEntities('Relato de fraude &ccedil; e &atilde;')).toBe('Relato de fraude ç e ã');
  });

  it('deve lidar com valores vazios ou nulos graciosamente', () => {
    expect(decodeHtmlEntities('')).toBe('');
    expect(decodeHtmlEntities(null)).toBe('');
    expect(decodeHtmlEntities(undefined)).toBe('');
  });

  it('deve decodificar entidades duplamente codificadas', () => {
    expect(decodeHtmlEntities('&amp;#231;')).toBe('ç');
  });
});
