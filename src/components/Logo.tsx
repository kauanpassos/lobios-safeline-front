import shieldLogo from '../../img/safe-line_shield.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo = ({ size = 'md', showSubtitle = true }: LogoProps) => {
  // Tamanhos levemente aumentados para compensar o layout vertical
  const iconSizes = {
    sm: 40,
    md: 60,
    lg: 80,
  };

  return (
    <div 
      className={`safeline-logo safeline-logo-${size}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
    >
      <div 
        className="safeline-logo-mark"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
      >
        <div className="safeline-logo-icon">
          <img
            src={shieldLogo}
            alt="SafeLine Shield"
            width={iconSizes[size]}
            height={iconSizes[size]}
            style={{ objectFit: 'contain' }}
          />
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
        <span 
          className="safeline-logo-subtitle" 
          style={{ textAlign: 'center', marginTop: '4px' }}
        >
          Segurança • Tecnologia • Inovação
        </span>
      )}
    </div>
  );
};
