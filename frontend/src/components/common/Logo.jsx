// Brand logo (wide banner artwork: icon + InternLite wordmark + tagline).
// withText is kept for API compatibility and ignored.
const Logo = ({ size = 'md', className = '' }) => {
    const height = size === 'sm' ? 26 : size === 'lg' ? 46 : 34;
    return (
        <span className={`logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img
                src="/logo.png"
                alt="InternLite — Discover • Apply • Grow"
                style={{ height, width: 'auto', maxWidth: '100%', display: 'block', flexShrink: 0 }}
            />
        </span>
    );
};

export default Logo;
