import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], input, textarea')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], input, textarea')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 hidden lg:block">
      {/* Main cursor */}
      <div
        className={`fixed w-4 h-4 bg-primary rounded-full transition-all duration-150 ease-out ${
          isHovering ? 'scale-150 bg-secondary' : ''
        } ${isClicking ? 'scale-75' : ''}`}
        style={{
          left: position.x - 8,
          top: position.y - 8,
          transition: 'transform 0.1s ease-out, background-color 0.2s ease-out',
        }}
      />
      
      {/* Cursor trail */}
      <div
        className={`fixed w-8 h-8 border-2 border-primary/30 rounded-full transition-all duration-300 ease-out ${
          isHovering ? 'scale-200 border-secondary/50' : ''
        }`}
        style={{
          left: position.x - 16,
          top: position.y - 16,
        }}
      />
    </div>
  );
};

export default CustomCursor;