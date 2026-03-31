import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top for wellness pages
    if (pathname.startsWith('/wellness/') || pathname === '/wellness-dashboard') {
      return;
    }
    
    // Scroll to the top of the page when the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]); // Trigger effect when pathname changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;
