import {
  useState,
  useId,
  useMemo,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react';
import { Check, Plus, Search, AlertCircle, Loader2, X } from 'lucide-react';
import './SelectableChips.css';

export interface SelectableChipOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SelectionValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateChipSelection<T extends string>({
  currentSelected,
  targetValue: _targetValue,
  willSelect,
  min,
  max,
  disabledReason,
}: {
  currentSelected: readonly T[];
  targetValue: T;
  willSelect: boolean;
  min?: number;
  max?: number;
  disabledReason?: string;
}): SelectionValidationResult {
  if (disabledReason) {
    return { isValid: false, errorMessage: disabledReason };
  }

  const currentCount = currentSelected.length;

  if (!willSelect && min !== undefined && currentCount <= min) {
    return {
      isValid: false,
      errorMessage:
        min === 1
          ? 'Pelo menos uma opção deve permanecer selecionada.'
          : `Pelo menos ${min} opções devem permanecer selecionadas.`,
    };
  }

  if (willSelect && max !== undefined && currentCount >= max) {
    return {
      isValid: false,
      errorMessage: `Limite máximo de ${max} opção(ões) atingido.`,
    };
  }

  return { isValid: true };
}

export function filterChipOptions<T extends string>(
  options: readonly SelectableChipOption<T>[],
  query: string
): SelectableChipOption<T>[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...options];

  return options.filter((option) => {
    const matchLabel = option.label.toLowerCase().includes(normalized);
    const matchValue = option.value.toLowerCase().includes(normalized);
    const matchDescription = option.description?.toLowerCase().includes(normalized) ?? false;
    return matchLabel || matchValue || matchDescription;
  });
}

export interface SelectableChipsProps<T extends string = string> {
  id?: string;
  label?: string;
  helperText?: string;
  options: readonly SelectableChipOption<T>[];
  value: readonly T[];
  onChange?: (selectedValues: T[]) => void;
  onToggle?: (value: T, nextSelected: boolean) => void | Promise<void>;
  min?: number;
  max?: number;
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  pendingValues?: readonly T[];
  showCounter?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchMessage?: string;
  emptyOptionsMessage?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  renderLeadingIcon?: (option: SelectableChipOption<T>, isSelected: boolean) => ReactNode;
}

export function SelectableChips<T extends string = string>({
  id: customId,
  label,
  helperText,
  options,
  value,
  onChange,
  onToggle,
  min,
  max,
  multiple = true,
  error: externalError,
  disabled = false,
  isLoading = false,
  pendingValues = [],
  showCounter,
  searchable = false,
  searchPlaceholder = 'Filtrar opções...',
  emptySearchMessage = 'Nenhuma opção encontrada para a busca.',
  emptyOptionsMessage = 'Nenhuma opção disponível.',
  ariaLabel,
  size = 'md',
  className = '',
  renderLeadingIcon,
}: SelectableChipsProps<T>) {
  const generatedId = useId();
  const id = customId || generatedId;
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const [searchQuery, setSearchQuery] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const selectedSet = useMemo(() => new Set(value), [value]);
  const pendingSet = useMemo(() => new Set(pendingValues), [pendingValues]);
  const selectedCount = value.length;
  const totalOptions = options.length;
  const shouldShowCounter = showCounter !== undefined ? showCounter : multiple;

  // Filter options based on search query
  const filteredOptions = useMemo(
    () => filterChipOptions(options, searchQuery),
    [options, searchQuery]
  );

  const activeError = externalError || internalError;
  const isMinRestricted = min !== undefined && selectedCount < min;
  const isMaxReached = max !== undefined && selectedCount >= max;

  const handleToggle = async (option: SelectableChipOption<T>) => {
    if (disabled || isLoading) return;
    if (pendingSet.has(option.value)) return;

    const isSelected = selectedSet.has(option.value);

    // Single select mode (exclusive selection)
    if (!multiple) {
      if (isSelected) {
        if (min === 1) {
          // Already the selected single option, keep selected
          return;
        }
        setInternalError(null);
        if (onToggle) await onToggle(option.value, false);
        if (onChange) onChange([]);
        return;
      }

      if (option.disabledReason) {
        setInternalError(option.disabledReason);
        setAnnouncement(option.disabledReason);
        return;
      }

      setInternalError(null);
      setAnnouncement(`Opção ${option.label} selecionada.`);
      if (onToggle) await onToggle(option.value, true);
      if (onChange) onChange([option.value]);
      return;
    }

    const willSelect = !isSelected;

    const validation = validateChipSelection({
      currentSelected: value,
      targetValue: option.value,
      willSelect,
      min,
      max,
      disabledReason: option.disabledReason,
    });

    if (!validation.isValid) {
      if (validation.errorMessage) {
        setInternalError(validation.errorMessage);
        setAnnouncement(validation.errorMessage);
      }
      return;
    }

    // Clear previous internal error if action is permitted
    setInternalError(null);

    const nextSelectedValues = willSelect
      ? [...value, option.value]
      : value.filter((v) => v !== option.value);

    const actionText = willSelect ? 'selecionada' : 'desmarcada';
    setAnnouncement(
      `Opção ${option.label} ${actionText}. Total: ${nextSelectedValues.length} selecionada(s).`
    );

    if (onToggle) {
      await onToggle(option.value, willSelect);
    }

    if (onChange) {
      onChange(nextSelectedValues);
    }
  };

  const handleChipKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    option: SelectableChipOption<T>
  ) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      void handleToggle(option);
    }
  };

  const handleClearSearch = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSearchQuery('');
  };

  return (
    <div
      className={`safeline-chips ${className}`}
      id={id}
      role={multiple ? 'group' : 'radiogroup'}
      aria-labelledby={label ? labelId : undefined}
      aria-label={!label ? ariaLabel : undefined}
      aria-describedby={
        [
          helperText ? helperId : null,
          activeError ? errorId : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
    >
      {/* Live Region for Screen Readers */}
      <div
        className="safeline-chips__sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Header with Label and Counter */}
      {(label || shouldShowCounter) && (
        <div className="safeline-chips__header">
          <div className="safeline-chips__label-wrapper">
            {label && (
              <span id={labelId} className="safeline-chips__label">
                {label}
              </span>
            )}
            {helperText && (
              <span id={helperId} className="safeline-chips__helper">
                {helperText}
              </span>
            )}
          </div>

          {shouldShowCounter && (
            <span
              className={`safeline-chips__counter${
                isMaxReached
                  ? ' is-max-reached'
                  : isMinRestricted
                  ? ' is-min-warning'
                  : ''
              }`}
              aria-label={`${selectedCount} de ${
                max !== undefined ? max : totalOptions
              } opções selecionadas`}
            >
              {selectedCount} / {max !== undefined ? max : totalOptions}
            </span>
          )}
        </div>
      )}

      {/* Optional Search Filter Bar */}
      {searchable && options.length > 0 && (
        <div className="safeline-chips__search">
          <Search size={15} className="safeline-chips__search-icon" aria-hidden="true" />
          <input
            type="search"
            className="safeline-chips__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            disabled={disabled || isLoading}
          />
          {searchQuery && (
            <button
              type="button"
              className="safeline-chips__search-clear"
              onClick={handleClearSearch}
              aria-label="Limpar pesquisa"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Chips Container */}
      {options.length === 0 ? (
        <p className="safeline-chips__empty">{emptyOptionsMessage}</p>
      ) : filteredOptions.length === 0 ? (
        <p className="safeline-chips__empty">{emptySearchMessage}</p>
      ) : (
        <div className="safeline-chips__list">
          {filteredOptions.map((option) => {
            const isSelected = selectedSet.has(option.value);
            const isPending = pendingSet.has(option.value);
            const isOptionDisabled =
              disabled ||
              isLoading ||
              isPending ||
              option.disabled ||
              (multiple && !isSelected && isMaxReached);

            let title = option.description || option.label;
            if (option.disabledReason) {
              title = option.disabledReason;
            } else if (multiple && !isSelected && isMaxReached) {
              title = `Limite máximo de ${max} opções atingido.`;
            } else if (isSelected && min !== undefined && selectedCount <= min) {
              title = `Mínimo de ${min} opção(ões) obrigatória(s).`;
            }

            return (
              <button
                key={option.value}
                type="button"
                className={`safeline-chip safeline-chip--${size}${
                  isSelected ? ' is-selected' : ''
                }${isOptionDisabled ? ' is-disabled' : ''}${
                  isPending ? ' is-pending' : ''
                }`}
                disabled={isOptionDisabled && !isSelected && !option.disabledReason}
                role={multiple ? 'button' : 'radio'}
                aria-checked={!multiple ? isSelected : undefined}
                aria-pressed={multiple ? isSelected : undefined}
                aria-disabled={isOptionDisabled}
                aria-label={`${option.label}, ${
                  isSelected ? 'selecionado' : 'não selecionado'
                }${option.disabledReason ? `, indisponível: ${option.disabledReason}` : ''}`}
                title={title}
                onClick={() => void handleToggle(option)}
                onKeyDown={(e) => handleChipKeyDown(e, option)}
              >
                {/* Leading Icon or Loading Spinner */}
                <span className="safeline-chip__icon" aria-hidden="true">
                  {isPending ? (
                    <Loader2 size={13} className="safeline-chips__spin" />
                  ) : renderLeadingIcon ? (
                    renderLeadingIcon(option, isSelected)
                  ) : isSelected ? (
                    <Check size={13} strokeWidth={2.8} />
                  ) : (
                    <Plus size={13} strokeWidth={2.2} />
                  )}
                </span>

                {/* Option Label */}
                <span className="safeline-chip__label">{option.label}</span>

                {/* Optional Trailing Badge */}
                {option.badge && (
                  <span className="safeline-chip__badge">{option.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Validation or Error Message */}
      {activeError && (
        <div className="safeline-chips__error" id={errorId} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
