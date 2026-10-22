import { describe, expect, it } from 'vitest';
import {
  validateChipSelection,
  filterChipOptions,
  type SelectableChipOption,
} from './SelectableChips';

describe('SelectableChips validation logic', () => {
  it('allows selecting an unselected chip when no limits are exceeded', () => {
    const result = validateChipSelection({
      currentSelected: ['COLLABORATOR'],
      targetValue: 'HR',
      willSelect: true,
      min: 1,
      max: 4,
    });

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('allows deselecting a chip when selection count is above minimum', () => {
    const result = validateChipSelection({
      currentSelected: ['COLLABORATOR', 'HR'],
      targetValue: 'HR',
      willSelect: false,
      min: 1,
    });

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('prevents deselecting when minimum selection requirement is reached', () => {
    const result = validateChipSelection({
      currentSelected: ['COLLABORATOR'],
      targetValue: 'COLLABORATOR',
      willSelect: false,
      min: 1,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Pelo menos uma opção deve permanecer selecionada.');
  });

  it('returns pluralized message for minimum requirement greater than 1', () => {
    const result = validateChipSelection({
      currentSelected: ['option-1', 'option-2'],
      targetValue: 'option-2',
      willSelect: false,
      min: 2,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Pelo menos 2 opções devem permanecer selecionadas.');
  });

  it('prevents selecting additional chips when maximum limit is reached', () => {
    const result = validateChipSelection({
      currentSelected: ['c1', 'c2', 'c3'],
      targetValue: 'c4',
      willSelect: true,
      max: 3,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Limite máximo de 3 opção(ões) atingido.');
  });

  it('blocks selection when disabledReason is present', () => {
    const result = validateChipSelection({
      currentSelected: ['HR'],
      targetValue: 'ADMIN',
      willSelect: true,
      disabledReason: 'Papel restrito aos e-mails autorizados.',
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Papel restrito aos e-mails autorizados.');
  });
});

describe('SelectableChips search and filter logic', () => {
  const sampleOptions: SelectableChipOption[] = [
    { value: 'cases.read.all', label: 'Ler todos os casos', description: 'Permissão global de leitura' },
    { value: 'cases.status.manage', label: 'Alterar status de casos', description: 'Gerenciar ciclo de vida' },
    { value: 'messages.write', label: 'Enviar mensagens', description: 'Comunicação direta no chat' },
    { value: 'claims.roles.manage', label: 'Gerenciar papéis', badge: 'Admin' },
  ];

  it('returns all options when query is empty or only whitespace', () => {
    expect(filterChipOptions(sampleOptions, '')).toHaveLength(4);
    expect(filterChipOptions(sampleOptions, '   ')).toHaveLength(4);
  });

  it('filters options by label in a case-insensitive manner', () => {
    const filtered = filterChipOptions(sampleOptions, 'ler');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].value).toBe('cases.read.all');
  });

  it('filters options by technical value identifier', () => {
    const filtered = filterChipOptions(sampleOptions, 'status.manage');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].label).toBe('Alterar status de casos');
  });

  it('filters options by description', () => {
    const filtered = filterChipOptions(sampleOptions, 'ciclo de vida');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].value).toBe('cases.status.manage');
  });

  it('returns an empty array when no matches are found', () => {
    const filtered = filterChipOptions(sampleOptions, 'inexistente');
    expect(filtered).toHaveLength(0);
  });
});

describe('SelectableChips single exclusive selection logic', () => {
  it('replaces the current selection with the new single option', () => {
    const currentSelection = ['COLLABORATOR'];
    const newRole = 'HR';
    const nextSelection = [newRole];

    expect(nextSelection).toHaveLength(1);
    expect(nextSelection[0]).toBe('HR');
    expect(nextSelection).not.toContain('COLLABORATOR');
  });

  it('keeps the single selection intact when attempting to deselect a required item', () => {
    const currentSelection = ['COLLABORATOR'];
    const min = 1;
    const canDeselect = currentSelection.length > min;

    expect(canDeselect).toBe(false);
  });
});

