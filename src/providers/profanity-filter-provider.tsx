import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { useProfanityFilter } from '@/hooks/useProfanityFilter';
import { toast } from '@/hooks/use-toast';

interface ProfanityFilterContextType {
  checkProfanity: (text: string) => boolean;
  filterProfanity: (text: string) => string;
  showWarning: () => void;
}

const ProfanityFilterContext = createContext<ProfanityFilterContextType | undefined>(undefined);

export const useProfanityFilterContext = () => {
  const context = useContext(ProfanityFilterContext);
  if (!context) {
    throw new Error('useProfanityFilterContext must be used within a ProfanityFilterProvider');
  }
  return context;
};

export const ProfanityFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { checkProfanity, filterProfanity } = useProfanityFilter();
  const [warningShown, setWarningShown] = useState(false);

  const showWarning = useCallback(() => {
    if (!warningShown) {
      toast({
        title: "Inappropriate Content",
        description: "Please keep your content appropriate and respectful.",
        variant: "destructive",
        duration: 3000,
      });
      setWarningShown(true);

      // Reset warning after 5 seconds
      setTimeout(() => setWarningShown(false), 5000);
    }
  }, [warningShown]);

  const value = {
    checkProfanity,
    filterProfanity,
    showWarning,
  };

  return (
    <ProfanityFilterContext.Provider value={value}>
      {children}
    </ProfanityFilterContext.Provider>
  );
};

export default ProfanityFilterProvider;
