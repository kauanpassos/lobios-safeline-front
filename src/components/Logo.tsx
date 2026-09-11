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

  return (
    <div className={`safeline-logo safeline-logo-${size}`}>
      <div className="safeline-logo-mark">

        <div className="safeline-logo-icon">
          <svg
            width={iconSizes[size]}
            height={iconSizes[size]}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            <line x1="28" y1="52" x2="68" y2="28" stroke="var(--color-primary-hover)" strokeWidth="6" strokeLinecap="round" />
            <line x1="28" y1="52" x2="68" y2="76" stroke="var(--color-primary-hover)" strokeWidth="6" strokeLinecap="round" />

            <circle cx="28" cy="52" r="16" fill="white" filter="drop-shadow(0 0 8px rgba(255,255,255,0.8))" />
            <circle cx="68" cy="28" r="12" fill="white" filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))" />
            <circle cx="68" cy="76" r="12" fill="white" filter="drop-shadow(0 0 6px rgba(255,255,255,0.7))" />
          </svg>
        </div>

        <div className="safeline-logo-name-wrap">
          <div className="safeline-logo-name-row">
            <span className="safeline-logo-name">
              SafeLine
            </span>
          </div>
        </div>
      </div>

      {showSubtitle && (
        <span className="safeline-logo-subtitle">
          Segurança • Tecnologia • Inovação
        </span>
      )}
    </div>
  );
};
