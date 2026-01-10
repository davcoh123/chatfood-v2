import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PlasmaButtonProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hero";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
}

const PlasmaButton: React.FC<PlasmaButtonProps> = ({ 
  children, 
  variant = "outline", 
  size = "lg", 
  className = "",
  onClick 
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const plasmaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const plasma = plasmaRef.current;
    
    if (!button || !plasma) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      plasma.style.left = `${x}px`;
      plasma.style.top = `${y}px`;
      plasma.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      plasma.style.opacity = '0';
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Button 
      ref={buttonRef}
      variant={variant} 
      size={size} 
      className={`relative overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      <div 
        ref={plasmaRef}
        className="absolute w-6 h-6 pointer-events-none opacity-0 transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle, #25D366 0%, rgba(37, 211, 102, 0.6) 30%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
      <div 
        className="absolute w-12 h-12 pointer-events-none opacity-0 transition-all duration-400"
        style={{
          background: 'radial-gradient(circle, rgba(37, 211, 102, 0.3) 0%, rgba(37, 211, 102, 0.1) 50%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          left: plasmaRef.current?.style.left || '50%',
          top: plasmaRef.current?.style.top || '50%',
          zIndex: 0,
        }}
      />
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

export default PlasmaButton;