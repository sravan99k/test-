import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

// Types
type Answer = {
  text: string;
  clusters: { [key: string]: number };
};

type Question = {
  id: number;
  text: string;
  answers: Answer[];
};

type ClusterScore = {
  name: string;
  score: number;
  subclusters: { name: string; score: number }[];
};

const questions: Question[] = [
  {
    id: 1,
    text: "You find a chest full of tools. Which one excites you the most?",
    answers: [
      { text: "Gold coins & ledgers", clusters: { "Financial Services": 3 } },
      { text: "Tablet & coding kit", clusters: { "Digital Technology": 3 } },
      { text: "Medical kit & books", clusters: { "Healthcare and Human Services": 3 } },
      { text: "Paints & music instruments", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 2,
    text: "Your school is hosting a big event. Which role do you take?",
    answers: [
      { text: "Plan and lead the team", clusters: { "Management and Entrepreneurship": 3 } },
      { text: "Promote and sell tickets", clusters: { "Marketing and Sales": 3 } },
      { text: "Organize food, guests, and activities", clusters: { "Hospitality, Events & Tourism": 3 } },
      { text: "Perform on stage / design posters", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 3,
    text: "Your town faces water shortage. What do you do?",
    answers: [
      { text: "Build a rainwater system", clusters: { "Construction": 3 } },
      { text: "Start a campaign to educate others", clusters: { "Public Service and Safety": 3 } },
      { text: "Design an app to track water usage", clusters: { "Digital Technology": 3 } },
      { text: "Research farming methods to save water", clusters: { "Agriculture": 3 } }
    ]
  },
  {
    id: 4,
    text: "In class, you're given a project. Which role excites you?",
    answers: [
      { text: "Leader & organizer", clusters: { "Management and Entrepreneurship": 3 } },
      { text: "Problem solver with machines/tools", clusters: { "Advanced Manufacturing": 3 } },
      { text: "Teaching or guiding classmates", clusters: { "Education": 3 } },
      { text: "Creative designer/presenter", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 5,
    text: "Fast forward 15 years—what are you doing?",
    answers: [
      { text: "Running a business", clusters: { "Management and Entrepreneurship": 3 } },
      { text: "Inventing renewable energy tech", clusters: { "Energy and Natural Resources": 3 } },
      { text: "Flying planes or delivering goods", clusters: { "Supply Chain and Transportation": 3 } },
      { text: "Helping patients / teaching students", clusters: { "Healthcare and Human Services": 1.5, "Education": 1.5 } }
    ]
  },
  {
    id: 6,
    text: "You're given a puzzle. What's your approach?",
    answers: [
      { text: "Analyze numbers & logic", clusters: { "Financial Services": 3 } },
      { text: "Use computer/software to solve", clusters: { "Digital Technology": 3 } },
      { text: "Work in a group & explain solutions", clusters: { "Education": 3 } },
      { text: "Turn puzzle into a game/story", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 7,
    text: "You're part of an expedition. Which role excites you?",
    answers: [
      { text: "Accountant: manage money", clusters: { "Financial Services": 3 } },
      { text: "Navigator: plan routes & strategy", clusters: { "Supply Chain and Transportation": 3 } },
      { text: "Engineer: build survival tools", clusters: { "Construction": 1.5, "Advanced Manufacturing": 1.5 } },
      { text: "Photographer/performer", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 8,
    text: "A classmate is upset. What do you do?",
    answers: [
      { text: "Comfort & suggest health tips", clusters: { "Healthcare and Human Services": 3 } },
      { text: "Teach something fun to cheer them up", clusters: { "Education": 3 } },
      { text: "Share funny content / creative art", clusters: { "Arts, Entertainment & Design": 2, "Healthcare and Human Services": 1 } },
      { text: "Research info online to help", clusters: { "Digital Technology": 3 } }
    ]
  },
  {
    id: 9,
    text: "You must create something new. What excites you most?",
    answers: [
      { text: "A robot or machine", clusters: { "Advanced Manufacturing": 3 } },
      { text: "A farming technique or eco-friendly idea", clusters: { "Agriculture": 2, "Energy and Natural Resources": 1 } },
      { text: "An app/website", clusters: { "Digital Technology": 3 } },
      { text: "A play, video, or artwork", clusters: { "Arts, Entertainment & Design": 3 } }
    ]
  },
  {
    id: 10,
    text: "You're planning a big school party. What's your role?",
    answers: [
      { text: "Manage budget & money", clusters: { "Financial Services": 3 } },
      { text: "Lead the organizing team", clusters: { "Management and Entrepreneurship": 3 } },
      { text: "Arrange food, music & guest list", clusters: { "Hospitality, Events & Tourism": 3 } },
      { text: "Make posters & promote", clusters: { "Marketing and Sales": 3 } }
    ]
  },
  {
    id: 11,
    text: "There's a sudden storm in your town. What's your instinct?",
    answers: [
      { text: "Help organize rescue & protect people", clusters: { "Public Service and Safety": 3 } },
      { text: "Provide first aid & medical help", clusters: { "Healthcare and Human Services": 3 } },
      { text: "Use tech (app/social media) to alert", clusters: { "Digital Technology": 3 } },
      { text: "Rebuild shelters & restore power", clusters: { "Construction": 2, "Energy and Natural Resources": 1 } }
    ]
  },
  {
    id: 12,
    text: "If you could try something new today, what would it be?",
    answers: [
      { text: "Invest in a stock game", clusters: { "Financial Services": 3 } },
      { text: "Start an online shop", clusters: { "Management and Entrepreneurship": 2, "Marketing and Sales": 1 } },
      { text: "Plant trees or build solar gadgets", clusters: { "Agriculture": 1.5, "Energy and Natural Resources": 1.5 } },
      { text: "Travel and host an event", clusters: { "Hospitality, Events & Tourism": 3 } }
    ]
  }
];

const clusterStructure = {
  "Investing in the future": ["Financial Services"],
  "Connecting and supporting success": ["Management and Entrepreneurship", "Digital Technology", "Marketing and Sales"],
  "Caring for communities": ["Education", "Healthcare and Human Services", "Public Service and Safety"],
  "Cultivating Resources": ["Agriculture", "Energy and Natural Resources"],
  "Building and Moving": ["Construction", "Advanced Manufacturing", "Supply Chain and Transportation"],
  "Creating and Experiencing": ["Hospitality, Events & Tourism", "Arts, Entertainment & Design"]
};

const CareerQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<{[key: string]: number}>({});

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = { ...answers, [currentQuestion]: answerIndex };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
      setShowResults(true);
    }
  };

  const calculateResults = (userAnswers: {[key: number]: number}) => {
    const newScores: {[key: string]: number} = {};
    
    Object.entries(userAnswers).forEach(([questionIndex, answerIndex]) => {
      const question = questions[parseInt(questionIndex)];
      const answer = question.answers[answerIndex];
      
      Object.entries(answer.clusters).forEach(([cluster, score]) => {
        newScores[cluster] = (newScores[cluster] || 0) + score;
      });
    });
    
    setScores(newScores);
  };

  const getTopClusters = (): ClusterScore[] => {
    // Initialize all main clusters with zero scores
    const clusterScores: {[key: string]: ClusterScore} = {};

    // First, initialize all main clusters with all their subclusters
    Object.entries(clusterStructure).forEach(([clusterName, subclusters]) => {
      clusterScores[clusterName] = {
        name: clusterName,
        score: 0,
        subclusters: subclusters.map(subclusterName => ({
          name: subclusterName,
          score: 0
        }))
      };
    });

    // Then add scores from user answers
    Object.entries(scores).forEach(([subcluster, score]) => {
      // Find which main cluster this subcluster belongs to
      let mainCluster = '';
      for (const [cluster, subclusters] of Object.entries(clusterStructure)) {
        if (subclusters.includes(subcluster)) {
          mainCluster = cluster;
          break;
        }
      }

      if (mainCluster && clusterScores[mainCluster]) {
        clusterScores[mainCluster].score += score;
        // Update the score for the specific subcluster
        const subclusterIndex = clusterScores[mainCluster].subclusters.findIndex(
          sub => sub.name === subcluster
        );
        if (subclusterIndex !== -1) {
          clusterScores[mainCluster].subclusters[subclusterIndex].score = score;
        }
      }
    });

    // Sort subclusters by score
    Object.values(clusterScores).forEach(cluster => {
      cluster.subclusters.sort((a, b) => b.score - a.score);
    });

    // Convert to array and sort by total score
    return Object.values(clusterScores)
      .sort((a, b) => b.score - a.score);
  };

  const progress = ((currentQuestion) / questions.length) * 100;

  if (showResults) {
    const topClusters = getTopClusters();
    
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Career Exploration Results</CardTitle>
            <CardDescription>Based on your answers, here are your top career clusters:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topClusters.map((cluster, index) => (
                <div key={cluster.name} className="space-y-2">
                  <h3 className="text-lg font-semibold">{index + 1}. {cluster.name}</h3>
                  <div className="space-y-2 pl-4">
                    {cluster.subclusters.map(sub => (
                      <div key={sub.name} className="flex items-center">
                        <span className="w-48">{sub.name}</span>
                        <Progress value={(sub.score / 9) * 100} className="h-2 flex-1 mx-2" />
                        <span className="w-8 text-right">{sub.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="mt-6 w-full" 
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setScores({});
              }}
            >
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mission {currentQ.id}: {currentQ.text}</CardTitle>
          <CardDescription>Question {currentQ.id} of {questions.length}</CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQ.answers.map((answer, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start p-6 text-left h-auto whitespace-normal"
                  onClick={() => handleAnswer(index)}
                >
                  <span>{answer.text}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerQuiz;
