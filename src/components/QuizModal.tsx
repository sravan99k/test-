import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Check, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  quizType: 'cyberbullying' | 'csa' | 'adult';
  language: 'en' | 'hi';
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, questions, quizType, language }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen) return null;

  const title = () => {
    if (language === 'hi') {
      return quizType === 'cyberbullying'
        ? 'साइबर बुलिंग क्विज़'
        : quizType === 'csa'
        ? 'बाल सुरक्षा क्विज़'
        : 'वयस्क सीएसए जागरूकता क्विज़';
    }
    
    return quizType === 'cyberbullying'
      ? 'Cyberbullying Quiz'
      : quizType === 'csa'
      ? 'Child Safety Quiz'
      : 'Adult CSA Awareness Quiz';
  };

  const passingScore = Math.ceil(questions.length / 2);

  const resultMessage = score >= passingScore 
    ? language === 'hi' 
      ? 'बहुत अच्छे! आपने क्विज़ पास कर ली है!' 
      : "Great job! You've passed the quiz!"
    : language === 'hi'
      ? 'कोई बात नहीं! सामग्री को दोबारा देखें और फिर से प्रयास करें।'
      : "Don't worry! Review the material and try again.";

  const closeButtonText = language === 'hi' ? 'बंद करें' : 'Close';

  const handleAnswerSelect = (answer: string) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = () => {
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Quiz Results</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
              <p className="text-lg">Your Score: {score}/{questions.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(score / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button onClick={resetQuiz} className="w-full">
                Retake Quiz
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                {closeButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold mb-4">{title()}</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">Score: {score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{questions[currentQuestion].question}</CardTitle>
            </CardHeader>
            <CardContent>
              {questions[currentQuestion].type === 'multiple-choice' && questions[currentQuestion].options && (
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option && showFeedback
                          ? option === questions[currentQuestion].correctAnswer
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                          : selectedAnswer === option
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50'
                      } ${showFeedback ? 'pointer-events-none' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          showFeedback && option === questions[currentQuestion].correctAnswer
                            ? 'bg-green-500 border-green-500 text-white'
                            : selectedAnswer === option && showFeedback
                            ? 'bg-red-500 border-red-500 text-white'
                            : selectedAnswer === option
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {showFeedback && option === questions[currentQuestion].correctAnswer && (
                            <Check className="w-3 h-3" />
                          )}
                          {selectedAnswer === option && showFeedback && option !== questions[currentQuestion].correctAnswer && (
                            <X className="w-3 h-3" />
                          )}
                        </div>
                        {option}
                        {showFeedback && option === questions[currentQuestion].correctAnswer && (
                          <Check className="w-4 h-4 ml-2 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questions[currentQuestion].type === 'true-false' && (
                <div className="space-y-3">
                  {(language === 'hi' ? ['सही', 'गलत'] : ['True', 'False']).map((option) => (
                    <div
                      key={option}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option && showFeedback
                          ? option === questions[currentQuestion].correctAnswer
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                          : selectedAnswer === option
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50'
                      } ${showFeedback ? 'pointer-events-none' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          showFeedback && option === questions[currentQuestion].correctAnswer
                            ? 'bg-green-500 border-green-500 text-white'
                            : selectedAnswer === option && showFeedback
                            ? 'bg-red-500 border-red-500 text-white'
                            : selectedAnswer === option
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {showFeedback && option === questions[currentQuestion].correctAnswer && (
                            <Check className="w-3 h-3" />
                          )}
                          {selectedAnswer === option && showFeedback && option !== questions[currentQuestion].correctAnswer && (
                            <X className="w-3 h-3" />
                          )}
                        </div>
                        {option}
                        {showFeedback && option === questions[currentQuestion].correctAnswer && (
                          <Check className="w-4 h-4 ml-2 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showFeedback && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        isCorrect ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      {!isCorrect && (
                        <p className="text-red-700 text-sm mt-1">
                          Correct answer: {questions[currentQuestion].correctAnswer}
                        </p>
                      )}
                      <p className="text-gray-700 text-sm mt-2">
                        {questions[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {!showFeedback ? (
                  <Button 
                    onClick={handleSubmitAnswer} 
                    disabled={!selectedAnswer}
                    className="flex-1"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="flex-1">
                    {currentQuestion + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
