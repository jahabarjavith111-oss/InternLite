import { Briefcase } from 'lucide-react';

const Logo = ({ size = 'md', withText = true, className = '' }) => {
    const sz = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;
    return (
        <span className={`logo ${className}`} style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontFamily: 'var(--font-body)'}}>
            <span style={{
                width: sz, height: sz, borderRadius: '9px',
                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
                <Briefcase size={sz * 0.58} strokeWidth={2} />
            </span>
            {withText && (
                <span style={{fontWeight: 700, letterSpacing: '-0.03em', fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '1.35rem' : '1.15rem', lineHeight: 1, color: 'var(--color-ink)'}}>
                    <span>INTERN</span><span style={{color: 'var(--color-accent)'}}>LITE</span>
                </span>
            )}
        </span>
    );
};

export default Logo;
