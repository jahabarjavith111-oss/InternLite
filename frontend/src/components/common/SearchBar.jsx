import React from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = ({ keyword, location, onKeyword, onLocation, onSubmit, compact = false }) => (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
        }}
        className="hero-search"
        role="search"
        aria-label="Search internships"
    >
        <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
                value={keyword}
                onChange={(e) => onKeyword?.(e.target.value)}
                placeholder="Job title, skill or company"
                aria-label="Job title, skill or company"
            />
        </div>
        <div className="search-field" style={compact ? { maxWidth: 220 } : undefined}>
            <MapPin size={18} aria-hidden="true" />
            <input
                value={location}
                onChange={(e) => onLocation?.(e.target.value)}
                placeholder="Location"
                aria-label="Location"
            />
        </div>
        <button type="submit" className="btn btn-primary btn-lg">
            Search
        </button>
    </form>
);

export default SearchBar;
