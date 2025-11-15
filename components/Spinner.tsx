
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-16 w-16',
    };

    return (
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-t-transparent border-white`}></div>
    );
};

export default Spinner;
