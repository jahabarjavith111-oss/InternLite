import { Briefcase } from 'lucide-react';

const Logo = ({ size = 'md', withText = true, className = '' }) => {
    const sz = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;
    return (
        <span className={`logo ${className}`} style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif"}}>
            <span style={{
                width: sz, height: sz, borderRadius: '9px',
                background: 'linear-gradient(135deg, #5B4BFF 0%, #4438D6 100%)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(91,75,255,0.25)'
            }}>
                <Briefcase size={sz * 0.58} strokeWidth={2} />
            </span>
            {withText && (
                <span style={{fontWeight: 800, letterSpacing: '-0.03em', fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '1.35rem' : '1.15rem', lineHeight: 1}}>
                    <span style={{color: '#111827'}}>INTERN</span><span style={{color: '#5B4BFF'}}>LITE</span>
                </span>
            )}
        </span>
    );
};

export default Logo;
