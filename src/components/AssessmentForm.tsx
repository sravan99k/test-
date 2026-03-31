import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProfanityFilteredInput } from "@/components/ui/profanity-filtered-input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveIncompleteAssessmentForUser } from "@/services/incompleteAssessmentService";

type ResponseValue = string | string[];

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const pulse = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse" as const
  }
};
type OptionScore = 0 | 1 | 2 | 3 | 4;
type OptionKey = 'Never' | 'Rarely' | 'Sometimes' | 'Often' | 'Always' | 'Yes' | 'No';

interface AssessmentFormProps {
  selectedCategories: string[];
  onComplete?: (results: any) => void;
  initialResponses?: Record<number, ResponseValue>;
  initialStep?: number;
  onResponseChange?: (responses: Record<number, ResponseValue>) => void;
  onQuestionsLoaded?: (count: number) => void;
  questionsOverride?: { id?: string; question: string; type: 'radio' | 'checkbox' | 'textarea'; options?: string[] }[];
}

const AssessmentForm = ({
  selectedCategories,
  onComplete,
  initialResponses = {},
  initialStep = 0,
  onResponseChange,
  onQuestionsLoaded,
  questionsOverride
}: AssessmentFormProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [responses, setResponses] = useState<Record<number, ResponseValue>>({ ...initialResponses });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assessmentQuestions = {
    depression: [
      { question: "I often feel lonely or sad", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel like no one understands me", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I have felt hopeless or helpless recently", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel like giving up or hiding away from everyone", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I have thoughts that worry me or make me feel unsafe", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I find it difficult to share my feelings with others", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel overwhelmed by my emotions", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I enjoy doing things I used to enjoy", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I find it hard to smile or feel cheerful", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I sleep too much or too little", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel tired or have low energy most days", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel that I am not good at anything or that I am a burden", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I sometimes have thoughts that make me feel scared or unsafe", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] }
    ],
    stress: [
      { question: "I feel pressure from family to do well in school", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I find it hard to balance school and home responsibilities", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel like I can’t control important things in my life", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I get upset about things I can't control", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I find myself eating too much or skipping meals due to stress", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I worry about disappointing others", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I skip school work intentionally", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel calm even when things go wrong", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel supported by my family during difficult times", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "My parents/caregivers listen when I share feelings", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I can ask for help without feeling ashamed", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] }
    ],
    anxiety: [
      { question: "I feel nervous or anxious without a clear reason", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I worry a lot about making mistakes", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I hesitate to speak or ask questions in class", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I avoid social events or eating in public due to nervousness", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I worry too much about how I look", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel like something bad might happen, even when things seem fine", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I have trouble relaxing even during breaks", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "My body reacts when I feel nervous (sweating, heartbeat, stomach ache)", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I compare my looks or body with others often", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel anxious about food, weight, or eating in public", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] }
    ],
    adhd: [
      { question: "I find it hard to concentrate in class or while studying", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I lose things like notebooks or ID cards often", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I get distracted easily, even in quiet places", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I start tasks but don’t finish them", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I forget instructions or assignments", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I talk or move a lot, even when I’m not supposed to", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I interrupt or talk over others", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I act before thinking about the consequences", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel restless or find it hard to sit still", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I struggle to organize my time and tasks", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] }
    ],
    wellbeing: [
      { question: "I feel cheerful and in good spirits", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel calm and relaxed", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel active and full of energy", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel that my life has meaning and purpose", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I wake up feeling fresh and rested", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I am confident in myself", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I can adapt when things change", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I understand and respect others' feelings", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel like I belong in school", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel respected by classmates and teachers", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I am satisfied with my academic performance", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I get along well with classmates", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I believe I can solve difficult tasks with effort", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I can manage my time and submit work on time", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel safe at home", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I am happy with my body image", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I skip meals on purpose", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I overeat when stressed or emotional", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I feel guilty after eating", type: "radio", options: ["Always", "Often", "Sometimes", "Rarely", "Never"] },
      { question: "I have tried smoking or alcohol out of curiosity or peer pressure", type: "radio", options: ["Yes", "No"] },
      { question: "I have taken part in bullying (online or offline)", type: "radio", options: ["Yes", "No"] },
      { question: "I have shared or seen hurtful messages online", type: "radio", options: ["Yes", "No"] },
      { question: "I have stayed silent when I saw something wrong", type: "radio", options: ["Yes", "No"] }
    ]
  } as const;

  const reverseScoredQuestions = [
    "I enjoy doing things I used to enjoy",
    "I feel calm even when things go wrong",
    "I feel supported by my family during difficult times",
    "My parents/caregivers listen when I share feelings",
    "I can ask for help without feeling ashamed",
    "I feel cheerful and in good spirits",
    "I feel calm and relaxed",
    "I feel active and full of energy",
    "I feel that my life has meaning and purpose",
    "I wake up feeling fresh and rested",
    "I am confident in myself",
    "I can adapt when things change",
    "I understand and respect others' feelings",
    "I feel like I belong in school",
    "I feel respected by classmates and teachers",
    "I am satisfied with my academic performance",
    "I get along well with classmates",
    "I believe I can solve difficult tasks with effort",
    "I can manage my time and submit work on time",
    "I feel safe at home",
    "I am happy with my body image"
  ] as const;

  const optionScores: Record<string, OptionScore> = {
    'Never': 0, 'No': 0, 'Not at all': 0, 'Strongly Disagree': 0,
    'Rarely': 1, 'A little': 1, 'Disagree': 1,
    'Sometimes': 2, 'Somewhat': 2, 'Neutral': 2, 'Maybe': 2, 'Not sure': 2, 'Prefer not to say': 2,
    'Often': 3, 'Quite a bit': 3, 'Agree': 3,
    'Always': 4, 'Yes': 4, 'Very much': 4, 'Strongly Agree': 4, 'Almost always': 4
  } as any;

  const reverseScore = (score: number): OptionScore => (4 - score) as OptionScore;

  const usingOverrides = !!questionsOverride && questionsOverride.length > 0;

  function buildQuestionsList() {
    if (usingOverrides && questionsOverride) {
      return questionsOverride;
    }

    let allQuestions: any[] = [];
    selectedCategories.forEach(category => {
      if (category === "overall") {
        Object.values(assessmentQuestions).forEach(categoryQuestions => {
          allQuestions = [...allQuestions, ...categoryQuestions];
        });
      } else if (assessmentQuestions[category as keyof typeof assessmentQuestions]) {
        allQuestions = [...allQuestions, ...assessmentQuestions[category as keyof typeof assessmentQuestions]];
      }
    });
    return allQuestions;
  }

  const questions = buildQuestionsList();
  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? Math.round(((currentStep + 1) / questions.length) * 100) : 0;
  const isCurrentQuestionAnswered = Boolean(responses[currentStep]);

  // Notify parent component about total questions count
  useEffect(() => {
    if (onQuestionsLoaded) {
      onQuestionsLoaded(questions.length);
    }
  }, [questions.length, onQuestionsLoaded]);

  const handleResponse = async (value: string) => {
    const newResponses: Record<number, ResponseValue> = {
      ...responses,
      [currentStep]: value
    };
    setResponses(newResponses);
    if (onResponseChange) {
      onResponseChange(newResponses);
    }

    // Save current progress to Firestore
    const user = auth.currentUser;
    if (user) {
      const nextQuestionIndex = currentStep < questions.length - 1 ? currentStep + 1 : currentStep;
      await saveIncompleteAssessmentForUser(user.uid, {
        startedAt: Date.now(),
        responses: newResponses,
        totalQuestions: questions.length,
        categories: ['overall'],
        currentQuestionIndex: nextQuestionIndex
      });
    }

    // Auto-advance to next question if not the last question
    if (currentStep < questions.length - 1) {
      // Small delay to show the selection
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCheckboxChange = async (option: string, checked: boolean) => {
    const currentResponse = responses[currentStep] || [];
    const currentResponses = Array.isArray(currentResponse) ? currentResponse : [currentResponse];

    const newResponses: Record<number, ResponseValue> = {
      ...responses,
      [currentStep]: checked
        ? [...currentResponses, option]
        : currentResponses.filter((item: string) => item !== option)
    };

    setResponses(newResponses);
    if (onResponseChange) {
      onResponseChange(newResponses);
    }

    // Save current progress to Firestore
    const user = auth.currentUser;
    if (user) {
      await saveIncompleteAssessmentForUser(user.uid, {
        startedAt: Date.now(),
        responses: newResponses,
        totalQuestions: questions.length,
        categories: ['overall'],
        currentQuestionIndex: currentStep
      });
    }
  };

  const calculateResults = () => {
    const categoryScores: Record<string, { total: number; count: number }> = {};

    // Initialize category scores
    selectedCategories.forEach(category => {
      categoryScores[category] = { total: 0, count: 0 };
    });

    // Process each response
    Object.entries(responses).forEach(([indexStr, answer]) => {
      const questionIndex = parseInt(indexStr, 10);
      const question = questions[questionIndex];

      if (!question || !answer) return;

      // When using overrides (JSON question bank), treat all scored questions as part of overall
      if (usingOverrides) {
        if (typeof answer === 'string' && selectedCategories.includes('overall')) {
          let score = (optionScores as any)[answer];

          if (score === undefined) {
            // Try index-based fallback if we have options/scale metadata
            const scaleSource = (question as any).options || [];
            const idx = scaleSource.indexOf(answer);
            if (idx !== -1) {
              score = idx;
            } else {
              score = 0; // Final fallback
            }
          }

          // Reverse scoring only if the text matches existing reverseScoredQuestions
          if (reverseScoredQuestions.includes(question.question)) {
            score = reverseScore(score);
          }

          categoryScores['overall'].total += score;
          categoryScores['overall'].count++;
        }

        return;
      }

      // Default path: map back into the built-in assessmentQuestions categories
      // Find which category this question belongs to
      let questionCategory = '';
      for (const [cat, catQuestions] of Object.entries(assessmentQuestions)) {
        if (catQuestions.some(q => q.question === question.question)) {
          questionCategory = cat;
          break;
        }
      }

      if (!questionCategory) return;

      // Calculate score for this response
      if (typeof answer === 'string' && answer in optionScores) {
        let score = optionScores[answer as keyof typeof optionScores];

        // Reverse score for positively worded questions
        if (reverseScoredQuestions.includes(question.question)) {
          score = reverseScore(score);
        }

        // Add to category total
        if (selectedCategories.includes(questionCategory)) {
          categoryScores[questionCategory].total += score;
          categoryScores[questionCategory].count++;
        }

        // Also add to overall if needed
        if (selectedCategories.includes('overall')) {
          categoryScores['overall'].total += score;
          categoryScores['overall'].count++;
        }
      }
    });

    // Calculate percentages for each category
    const results: Record<string, number> = {};

    Object.entries(categoryScores).forEach(([category, { total, count }]) => {
      if (count > 0) {
        // Convert to percentage (0-100) where higher scores indicate more severe symptoms
        results[category] = Math.min(100, Math.round((total / (count * 4)) * 100));
      } else {
        results[category] = 0;
      }
    });

    return results;
  };

  const saveAssessmentToDatabase = async (results: any) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No authenticated user found. Assessment not saved.');
      return results;
    }

    try {
      // Define the base assessment document
      const assessmentDoc: any = {
        user_id: user.uid,
        categories: selectedCategories,
        responses: responses,
        results: results,
        completed_at: new Date().toISOString(),
        timestamp: new Date().getTime()
      };

      // Try to fetch demographics, but don't fail if we can't
      try {
        const demographicsQuery = query(
          collection(db, 'demographics'),
          where('user_id', '==', user.uid)
        );
        const demographicsSnap = await getDocs(demographicsQuery);
        if (!demographicsSnap.empty) {
          assessmentDoc.demographics = demographicsSnap.docs[0].data();
        }
      } catch (demographicsError) {
        console.warn('Could not fetch demographics, continuing without them:', demographicsError);
      }

      // Save the assessment
      await addDoc(collection(db, 'assessment_responses'), assessmentDoc);
      console.log("Assessment saved successfully");
      return results;
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Save Error",
        description: "Failed to save assessment. Results will still be displayed.",
        variant: "destructive",
      });
      return results; // Return the results even if save fails
    }
  };
  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);

      try {
        // Calculate the results
        const results = calculateResults();

        toast({
          title: "Assessment Complete!",
          description: "Your responses have been recorded successfully.",
        });

        if (onComplete) {
          onComplete(results);
        }
      } catch (error) {
        console.error("Error completing assessment:", error);
        toast({
          title: "Completion Error",
          description: "There was an issue completing your assessment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-gray-600">No questions available for the selected categories.</p>
      </div>
    );
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.1 });

  // Animation for progress bar
  const progressBarVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${((currentStep + 1) / questions.length) * 100}%`,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any // Custom cubic-bezier for smoother animation
      }
    }
  };

  const getAssessmentTitle = () => {
    return 'Mental Health Assessment';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-100 w-full">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep + 1) / questions.length) * 100}%`,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
        />
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {getAssessmentTitle()}
            </h2>
          </div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium leading-relaxed text-gray-800">
                  {currentQuestion.question}
                </h3>

                {currentQuestion.type === "radio" && (
                  <RadioGroup
                    value={responses[currentStep] as string || ''}
                    onValueChange={handleResponse}
                  >
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option: string) => (
                        <motion.div
                          key={option}
                          variants={item}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`${currentStep}-${option}`}
                            className="h-5 w-5 text-blue-600"
                          />
                          <Label
                            htmlFor={`${currentStep}-${option}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {option}
                          </Label>
                        </motion.div>
                      ))}
                    </motion.div>
                  </RadioGroup>
                )}

                {currentQuestion.type === "checkbox" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option: string) => (
                      <motion.div
                        key={option}
                        variants={item}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`${currentStep}-${option}`}
                          checked={Array.isArray(responses[currentStep])
                            ? (responses[currentStep] as string[]).includes(option)
                            : false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleCheckboxChange(option, true);
                            } else {
                              handleCheckboxChange(option, false);
                            }
                          }}
                          className="h-5 w-5 text-blue-600 border-gray-300"
                        />
                        <Label
                          htmlFor={`${currentStep}-${option}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {currentQuestion.type === "textarea" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                  >
                    <Textarea
                      value={responses[currentStep] as string || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleResponse(e.target.value)
                      }
                      placeholder="Please share your thoughts..."
                      className="min-h-[120px] w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your response is completely private and will be used to better understand your needs.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="flex justify-between mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
                className="px-6 py-2 text-sm font-medium transition-colors"
              >
                ← Back
              </Button>
            </motion.div>

            {currentStep === questions.length - 1 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleNext}
                  className={`px-6 py-2 text-sm font-medium transition-colors ${loading || !responses[currentStep]
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  disabled={loading || !responses[currentStep]}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Submit
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                        className="ml-1"
                      >

                      </motion.span>
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
