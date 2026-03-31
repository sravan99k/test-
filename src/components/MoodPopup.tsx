import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { auth } from "@/integrations/firebase";
import { useToast } from "@/hooks/use-toast";
import { saveMoodEntry } from "@/services/wellnessService";

interface MoodPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoodPopup: React.FC<MoodPopupProps> = ({ isOpen, onClose }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  console.log('[MoodPopup] Render - isOpen:', isOpen);

  const moodOptions = [
    { score: 1, label: "Terrible", emoji: "😭", bgColor: "bg-red-50/80", borderColor: "border-red-200", hoverBorderColor: "hover:border-red-300", textColor: "text-red-600" },
    { score: 2, label: "Bad", emoji: "😩", bgColor: "bg-orange-50/80", borderColor: "border-orange-200", hoverBorderColor: "hover:border-orange-300", textColor: "text-orange-600" },
    { score: 3, label: "Meh", emoji: "😕", bgColor: "bg-amber-50/80", borderColor: "border-amber-200", hoverBorderColor: "hover:border-amber-300", textColor: "text-amber-600" },
    { score: 4, label: "Okay", emoji: "🙂", bgColor: "bg-yellow-50/80", borderColor: "border-yellow-200", hoverBorderColor: "hover:border-yellow-300", textColor: "text-yellow-600" },
    { score: 5, label: "Good", emoji: "😊", bgColor: "bg-lime-50/80", borderColor: "border-lime-200", hoverBorderColor: "hover:border-lime-300", textColor: "text-lime-600" },
    { score: 6, label: "Great", emoji: "😃", bgColor: "bg-green-50/80", borderColor: "border-green-200", hoverBorderColor: "hover:border-green-300", textColor: "text-green-600" },
    { score: 7, label: "Super", emoji: "😁", bgColor: "bg-teal-50/80", borderColor: "border-teal-200", hoverBorderColor: "hover:border-teal-300", textColor: "text-teal-600" },
    { score: 8, label: "Amazing", emoji: "🥰", bgColor: "bg-cyan-50/80", borderColor: "border-cyan-200", hoverBorderColor: "hover:border-cyan-300", textColor: "text-cyan-600" },
    { score: 9, label: "Awesome", emoji: "😎", bgColor: "bg-blue-50/80", borderColor: "border-blue-200", hoverBorderColor: "hover:border-blue-300", textColor: "text-blue-600" },
    { score: 10, label: "Perfect", emoji: "🤩", bgColor: "bg-purple-50/80", borderColor: "border-purple-200", hoverBorderColor: "hover:border-purple-300", textColor: "text-purple-600" },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await saveMoodEntry({
        userId: user.uid,
        moodScore: selectedMood,
        moodLabel: moodOptions.find(m => m.score === selectedMood)?.label || '',
        notes: ''
      });

      setSaveSuccess(true);
      
      // Show success state for 1.5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        toast({
          title: "✨ Nice! Your mood is tracked",
          description: "You're building a great habit!"
        });
        
        // Store today's check before closing
        const user = auth.currentUser;
        if (user) {
          const today = new Date().toISOString();
          localStorage.setItem(`lastMoodCheck_${user.uid}`, today);
          console.log('[MoodPopup] Stored mood check for today:', today);
        }
        
        onClose();
        setSelectedMood(null);
      }, 1500);

    } catch (error) {
      console.error('Error saving mood:', error);
      setLoading(false);
      setSaveSuccess(false);
      toast({
        title: "Oops!",
        description: "Couldn't save that. Try again?",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">How are you feeling today?</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mood Selection - Single row only */}
        <div className="p-4 md:p-6 lg:p-8">
          {/* Mood Options - Single row with responsive sizing */}
          <div className="flex justify-center gap-0.5 md:gap-1 lg:gap-2 mb-6">
            {moodOptions.map((mood) => {
              return (
                <button
                  key={mood.score}
                  onClick={() => setSelectedMood(mood.score)}
                  aria-label={`Select ${mood.label} mood`}
                  className={`flex flex-col items-center gap-0.5 md:gap-1 lg:gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl p-0.5 md:p-1 lg:p-2
                    ${selectedMood === mood.score ? 'scale-110' : 'hover:scale-125'}`}
                >
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-4 text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl relative
                      ${mood.bgColor} ${mood.borderColor} ${mood.hoverBorderColor} ${selectedMood === mood.score ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                  >
                    {selectedMood === mood.score && (
                      <div 
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-full border border-white"
                        style={{ backgroundColor: mood.borderColor.replace('border-', '#').substring(0, 7) }}
                      />
                    )}
                    <span role="img" aria-label={mood.label}>
                      {mood.emoji}
                    </span>
                  </div>
                  <span className={`text-xs xs:text-xs sm:text-xs md:text-sm lg:text-sm font-semibold transition-colors whitespace-nowrap
                    ${selectedMood === mood.score ? mood.textColor : 'text-gray-600'}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Save Button with Enhanced States */}
          <div className="max-w-sm mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || loading || saveSuccess}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm md:text-base h-10 md:h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${saveSuccess ? 'scale-105' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : saveSuccess ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Saved!
                </span>
              ) : (
                "Save Mood"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPopup;
