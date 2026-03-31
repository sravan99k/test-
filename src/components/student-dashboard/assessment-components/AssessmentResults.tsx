import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AssessmentResultsProps {
  userResponses: any; // Raw answers from user
  categories: string[];
  results?: Record<string, number> | null;
  onTakeAnother: () => void;
  userRole?: string;
}

const AssessmentResults = (props: AssessmentResultsProps) => {
  const { userResponses, categories, results: propResults, onTakeAnother } = props;
  const [results, setResults] = useState<Record<string, number> | null>(propResults || null);
  const [isLoading, setIsLoading] = useState(!propResults);

  // You must define assessmentQuestions here for getCategoryScore to work in useEffect
  const assessmentQuestions = {
    depression: [
      { question: "I often feel lonely or sad" },
      { question: "I feel like no one understands me" },
      { question: "I have felt hopeless or helpless recently" },
      { question: "I feel like giving up or hiding away from everyone" },
      { question: "I have thoughts that worry me or make me feel unsafe" },
      { question: "I find it difficult to share my feelings with others" },
      { question: "I feel overwhelmed by my emotions" },
      { question: "I enjoy doing things I used to enjoy" },
      { question: "I find it hard to smile or feel cheerful" },
      { question: "I sleep too much or too little" },
      { question: "I feel tired or have low energy most days" },
      { question: "I feel that I am not good at anything or that I am a burden" },
      { question: "I sometimes have thoughts that make me feel scared or unsafe" }
    ],
    stress: [
      { question: "I feel pressure from family to do well in school" },
      { question: "I find it hard to balance school and home responsibilities" },
      { question: "I feel like I can’t control important things in my life" },
      { question: "I get upset about things I can't control" },
      { question: "I find myself eating too much or skipping meals due to stress" },
      { question: "I worry about disappointing others" },
      { question: "I skip school work intentionally" },
      { question: "I feel calm even when things go wrong" },
      { question: "I feel supported by my family during difficult times" },
      { question: "My parents/caregivers listen when I share feelings" },
      { question: "I can ask for help without feeling ashamed" }
    ],
    anxiety: [
      { question: "I feel nervous or anxious without a clear reason" },
      { question: "I worry a lot about making mistakes" },
      { question: "I hesitate to speak or ask questions in class" },
      { question: "I avoid social events or eating in public due to nervousness" },
      { question: "I worry too much about how I look" },
      { question: "I feel like something bad might happen, even when things seem fine" },
      { question: "I have trouble relaxing even during breaks" },
      { question: "My body reacts when I feel nervous (sweating, heartbeat, stomach ache)" },
      { question: "I compare my looks or body with others often" },
      { question: "I feel anxious about food, weight, or eating in public" }
    ],
    adhd: [
      { question: "I find it hard to concentrate in class or while studying" },
      { question: "I lose things like notebooks or ID cards often" },
      { question: "I get distracted easily, even in quiet places" },
      { question: "I start tasks but don’t finish them" },
      { question: "I forget instructions or assignments" },
      { question: "I talk or move a lot, even when I’m not supposed to" },
      { question: "I interrupt or talk over others" },
      { question: "I act before thinking about the consequences" },
      { question: "I feel restless or find it hard to sit still" },
      { question: "I struggle to organize my time and tasks" }
    ],
    wellbeing: [
      { question: "I feel cheerful and in good spirits" },
      { question: "I feel calm and relaxed" },
      { question: "I feel active and full of energy" },
      { question: "I feel that my life has meaning and purpose" },
      { question: "I wake up feeling fresh and rested" },
      { question: "I am confident in myself" },
      { question: "I can adapt when things change" },
      { question: "I understand and respect others' feelings" },
      { question: "I feel like I belong in school" },
      { question: "I feel respected by classmates and teachers" },
      { question: "I am satisfied with my academic performance" },
      { question: "I get along well with classmates" },
      { question: "I believe I can solve difficult tasks with effort" },
      { question: "I can manage my time and submit work on time" },
      { question: "I feel safe at home" },
      { question: "I am happy with my body image" },
      { question: "I skip meals on purpose" },
      { question: "I overeat when stressed or emotional" },
      { question: "I feel guilty after eating" },
      { question: "I have tried smoking or alcohol out of curiosity or peer pressure" },
      { question: "I have taken part in bullying (online or offline)" },
      { question: "I have shared or seen hurtful messages online" },
      { question: "I have stayed silent when I saw something wrong" }
    ]
  };

  // Move these helper functions to the top-level of the component, outside useEffect
  const reverse_scored_items = [
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
  ];

  const optionScores: Record<string, number> = {
    'Always': 4,
    'Often': 3,
    'Sometimes': 2,
    'Rarely': 1,
    'Never': 0,
    'Yes': 4,
    'No': 0
  };

  const reverseScore = (score: number) => 4 - score;

  function getCategoryScore(category: string, userResponses: any, results: Record<string, number> | null, assessmentQuestions: any) {
    // First, try to get the score from the results object with suffix
    if (results && results[`${category}_score`] !== undefined) {
      return results[`${category}_score`];
    }

    // Second, try to get the score from the results object without suffix (new data-driven format)
    if (results && results[category] !== undefined) {
      return results[category];
    }

    // Only fall back to calculation if results are not provided at all
    // This fallback uses hardcoded questions that may not match the current assessment
    if (!userResponses) return 0;

    console.warn('[AssessmentResults] No propResults provided, falling back to legacy calculation for category:', category);

    let catQuestions: any[] = [];
    if (category === "overall") {
      Object.values(assessmentQuestions).forEach((qs: any) => {
        catQuestions = [...catQuestions, ...qs];
      });
    } else if (assessmentQuestions[category as keyof typeof assessmentQuestions]) {
      catQuestions = assessmentQuestions[category as keyof typeof assessmentQuestions];
    }
    let total = 0;
    let count = 0;
    catQuestions.forEach((q, idx) => {
      const answer = userResponses[idx];
      let score = optionScores.hasOwnProperty(answer) ? optionScores[answer] : null;
      if (score !== null) {
        if (reverse_scored_items.includes(q.question)) {
          score = reverseScore(score);
        }
        total += score;
        count++;
      }
    });
    if (count === 0) return 0;
    return Math.round((total / (count * 4)) * 100);
  }

  function getRiskLevel(score: number) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  }

  function getRiskColor(score: number) {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  useEffect(() => {
    if (propResults) {
      setResults(propResults);
      setIsLoading(false);
      return;
    }

    const calculatedResults: Record<string, number> = {};
    categories.forEach(category => {
      calculatedResults[`${category}_score`] = getCategoryScore(category, userResponses, results, assessmentQuestions);
    });
    setResults(calculatedResults);
    setIsLoading(false);
  }, [userResponses, propResults]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );

  if (!results) return (
    <div className="text-center py-10">
      <p className="text-red-500">Failed to load assessment results. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-teal-800">Assessment Complete!</CardTitle>
          <CardDescription className="text-teal-600">

          </CardDescription>
        </CardHeader>
      </Card>

      {categories.map((category, idx) => (
        <Card key={category} className="border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="capitalize">
              {category === 'overall' ? 'Overall Wellbeing Risk Assessment' : `${category} Assessment`}
            </CardTitle>
            <CardDescription>
              {category === 'depression' && "Assessment of feelings of sadness, hopelessness, and emotional well-being"}
              {category === 'stress' && "Evaluation of stress levels related to studies, exams, and daily life"}
              {category === 'adhd' && "Screening for attention, focus, and hyperactivity symptoms"}
              {category === 'anxiety' && "Assessment of anxiety levels and social interaction concerns"}
              {category === 'wellbeing' && "Comprehensive assessment of life satisfaction and social connections"}
              {category === 'overall' && "Comprehensive evaluation of your mental wellbeing and potential risk factors"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700"></span>
                <span className="text-sm font-medium">{getRiskLevel(getCategoryScore(category, userResponses, results, assessmentQuestions))} Risk</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getRiskColor(getCategoryScore(category, userResponses, results, assessmentQuestions))}`}
                  style={{ width: `${getCategoryScore(category, userResponses, results, assessmentQuestions)}%` }}
                ></div>
              </div>
              <div className="text-3xl font-bold text-teal-700 text-center">
                {getCategoryScore(category, userResponses, results, assessmentQuestions)}%
              </div>
              {category === 'overall' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    {getCategoryScore(category, userResponses, results, assessmentQuestions) >= 70 ?
                      'Consider reaching out to a mental health professional for support.' :
                      getCategoryScore(category, userResponses, results, assessmentQuestions) >= 40 ?
                        'It might be helpful to check in with yourself and consider ways to support your well-being.' :
                        'Your results are in a healthy range. Keep up the good work!'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {props.userRole !== 'management' && (
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-800">Take Another Assessment</CardTitle>
              <CardDescription className="text-teal-600">
                Take another assessment to get a better understanding of your mental health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={onTakeAnother}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                Retake Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Additional Resources</CardTitle>
            <CardDescription className="text-blue-600">
              Access mental health resources and support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => window.location.href = '/resources'}
            >
              Browse Resources
            </Button>
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => window.location.href = '/student-dashboard'}
            >
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Your responses have been securely recorded and will be reviewed by authorized counselors if needed.
              All information is confidential and handled according to privacy guidelines.
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span>
                Assessment completed on {new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </span>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResults;
