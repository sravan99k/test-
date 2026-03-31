import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '@/utils/pageTitles';

const usePageTitle = (title?: string) => {
  const location = useLocation();
  
  useEffect(() => {
    const pageTitle = title || getPageTitle(location.pathname);
    
    // Always append '– Novo Wellness' for all pages
    document.title = `${pageTitle} – Novo Wellness`;
    
    // Cleanup function to reset the title when the component unmounts
    return () => {
      document.title = 'Novo Wellness';
    };
  }, [location.pathname, title]);
};

export default usePageTitle;
