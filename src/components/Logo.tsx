interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo = ({ size = 'md', showSubtitle = true }: LogoProps) => {
  const iconSizes = {
    sm: 28,
    md: 40,
    lg: 52,
  };

  const titleSizes = {
    sm: '1.25rem',
    md: '1.75rem',
    lg: '2.25rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Os nós da rede representam um canal seguro. */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Linhas de conexão */}
            <line x1="28" y1="52" x2="68" y2="28" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="52" x2="68" y2="76" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />

            {/* Nós destacados */}
            <circle cx="28" cy="52" r="16" fill="white" filter="drop-shadow(0 0 8px rgba(255,255,255,0.8))" />
            <circle cx="68" cy="28" r="12" fill="white" filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))" />
            <circle cx="68" cy="76" r="12" fill="white" filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))" />
          </svg>
        </div>

        {/* Marca SafeLine */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: titleSizes[size],
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                fontFamily: 'var(--font-primary)',
              }}
            >
              SafeLine
            </span>
          </div>
        </div>
      </div>

      {showSubtitle && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Segurança • Tecnologia • Inovação
        </span>
      )}
    </div>
  );
};
