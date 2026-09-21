import React from 'react';

const Badge = ({ tone = 'gray', children, title }) => (
    <span className={`badge badge-${tone}`} title={title}>
        {children}
    </span>
);

export default Badge;
