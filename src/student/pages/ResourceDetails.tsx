import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import GameContainer from "@/components/games/GameContainer";
// import GameResults from "@/components/games/GameResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, BookOpen, Users, MessageSquare, Target, Brain, Heart, Utensils, HandHeart } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

const ResourceDetails = () => {
  const { category } = useParams<{ category: string }>();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  
  // Set page title based on the resource category
  usePageTitle(
    category 
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Resources`
      : 'Resource Details'
  );
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState<{score: number, gameType: string} | null>(null);

  const handleStartGame = (gameId: string) => {
    setCurrentGame(gameId);
    setShowResults(false);
  };

  const handleGameComplete = (score: number) => {
    setGameResults({ score, gameType: currentGame! });
    setShowResults(true);
  };

  const handleBackToResource = () => {
    setCurrentGame(null);
    setShowResults(false);
    setGameResults(null);
  };

  const handleSelectAnotherGame = () => {
    setShowResults(false);
    setGameResults(null);
  };

  // if (showResults && gameResults) {
  //   return <GameResults 
  //     results={gameResults} 
  //     onBack={handleBackToResource} 
  //     onSelectAnother={handleSelectAnotherGame}
  //   />;
  // }

  if (currentGame) {
    return <GameContainer gameType={currentGame} onComplete={handleGameComplete} onBack={handleBackToResource} />;
  }

  const getResourceData = (categoryName: string) => {
    const resources = {
      "stress-management": {
        title: "Stress Management Resources",
        icon: Brain,
        color: "from-blue-500 to-blue-600",
        description: "Learn effective techniques to manage stress and stay calm under pressure",
        content: {
          overview: "Stress is a normal part of life, but learning how to manage it effectively is crucial for your mental health and academic success. These resources will help you develop healthy coping strategies.",
          techniques: [
            { name: "Deep Breathing", description: "Simple breathing exercises to calm your mind instantly", effectiveness: "95%" },
            { name: "Progressive Muscle Relaxation", description: "Tense and release muscle groups to reduce physical tension", effectiveness: "88%" },
            { name: "Mindfulness Meditation", description: "Focus on the present moment to reduce anxiety", effectiveness: "92%" },
            { name: "Time Management", description: "Organize your schedule to reduce overwhelming feelings", effectiveness: "85%" }
          ],
          warnings: [
            "Chronic stress can affect your physical health",
            "Don't ignore persistent feelings of overwhelm",
            "Seek help if stress interferes with daily activities"
          ],
          journalPrompts: [
            "What situations make me feel most stressed?",
            "How does my body feel when I'm stressed?",
            "What relaxation techniques work best for me?",
            "Who can I talk to when I feel overwhelmed?"
          ],
          forumTopics: [
            { title: "Exam Stress: How do you cope?", replies: 23, category: "Academic" },
            { title: "Breathing exercises that actually work", replies: 15, category: "Techniques" },
            { title: "Balancing school and social life", replies: 31, category: "Lifestyle" }
          ],
          games: [
            { id: "breathing", title: "Calm Bubble Breathing", description: "Practice breathing techniques with visual guidance" },
            { id: "stroop", title: "Focus Under Pressure", description: "Build attention control when stressed" }
          ]
        }
      },
      "emotional-wellbeing": {
        title: "Emotional Wellbeing Resources",
        icon: Heart,
        color: "from-purple-500 to-purple-600",
        description: "Understand and nurture your emotional health for better relationships and happiness",
        content: {
          overview: "Emotional wellbeing involves understanding, expressing, and managing your emotions in healthy ways. It's the foundation for building strong relationships and resilience.",
          techniques: [
            { name: "Emotion Identification", description: "Learn to recognize and name your feelings accurately", effectiveness: "90%" },
            { name: "Journaling", description: "Write about your experiences to process emotions", effectiveness: "87%" },
            { name: "Social Connection", description: "Build supportive relationships with friends and family", effectiveness: "93%" },
            { name: "Self-Compassion", description: "Treat yourself with kindness during difficult times", effectiveness: "89%" }
          ],
          warnings: [
            "Persistent sadness may indicate depression",
            "Emotional numbness is a sign to seek help",
            "Don't hesitate to reach out to trusted adults"
          ],
          journalPrompts: [
            "What emotions did I experience today?",
            "What triggers my strongest emotional reactions?",
            "How do I show kindness to myself?",
            "What makes me feel most connected to others?"
          ],
          forumTopics: [
            { title: "Dealing with friendship drama", replies: 19, category: "Relationships" },
            { title: "How to handle rejection", replies: 27, category: "Coping" },
            { title: "Building self-confidence", replies: 42, category: "Self-esteem" }
          ],
          games: [
            { id: "emotion", title: "Emotion Detective", description: "Practice recognizing emotions in faces" },
            { id: "breathing", title: "Emotional Regulation Breathing", description: "Use breathing to manage intense emotions" }
          ]
        }
      },
      "eating-habits": {
        title: "Healthy Eating Habits",
        icon: Utensils,
        color: "from-green-500 to-green-600",
        description: "Develop a positive relationship with food and nourish your growing body",
        content: {
          overview: "Healthy eating during adolescence supports physical growth, brain development, and emotional stability. It's about nourishing your body, not restricting it.",
          techniques: [
            { name: "Mindful Eating", description: "Pay attention to hunger cues and food enjoyment", effectiveness: "85%" },
            { name: "Balanced Meals", description: "Include proteins, carbs, fats, and vegetables", effectiveness: "92%" },
            { name: "Regular Meal Times", description: "Eat consistently to maintain energy levels", effectiveness: "88%" },
            { name: "Hydration", description: "Drink water throughout the day for optimal health", effectiveness: "95%" }
          ],
          warnings: [
            "Extreme dieting can harm growing bodies",
            "Skipping meals affects concentration and mood",
            "Eating disorders require professional help"
          ],
          journalPrompts: [
            "How do different foods make me feel?",
            "When do I eat when I'm not hungry?",
            "What does my body need right now?",
            "How can I make mealtimes more enjoyable?"
          ],
          forumTopics: [
            { title: "Healthy snacks for studying", replies: 35, category: "Nutrition" },
            { title: "Dealing with body image pressure", replies: 28, category: "Body Image" },
            { title: "Cooking simple, healthy meals", replies: 22, category: "Cooking" }
          ],
          games: [
            { id: "pattern", title: "Nutrition Pattern Game", description: "Learn about balanced meal patterns" },
            { id: "reaction", title: "Quick Healthy Choices", description: "Practice making fast, healthy decisions" }
          ]
        }
      },
      "behavioral-support": {
        title: "Behavioral Support Resources",
        icon: HandHeart,
        color: "from-orange-500 to-orange-600",
        description: "Build positive habits and manage challenging behaviors effectively",
        content: {
          overview: "Behavioral support helps you develop self-control, make good decisions, and build habits that serve your goals. It's about understanding why we act certain ways and choosing better responses.",
          techniques: [
            { name: "Goal Setting", description: "Set clear, achievable objectives for behavior change", effectiveness: "87%" },
            { name: "Self-Monitoring", description: "Track your behaviors to identify patterns", effectiveness: "90%" },
            { name: "Positive Reinforcement", description: "Reward yourself for good choices", effectiveness: "83%" },
            { name: "Problem-Solving", description: "Break down challenges into manageable steps", effectiveness: "89%" }
          ],
          warnings: [
            "Sudden behavior changes may indicate underlying issues",
            "Persistent aggression or withdrawal needs attention",
            "Don't try to change everything at once"
          ],
          journalPrompts: [
            "What behaviors do I want to change?",
            "What triggers my challenging behaviors?",
            "When do I make my best decisions?",
            "How can I reward myself for positive changes?"
          ],
          forumTopics: [
            { title: "Breaking bad habits that hurt my grades", replies: 33, category: "Academic" },
            { title: "Managing anger in healthy ways", replies: 24, category: "Emotions" },
            { title: "Building better morning routines", replies: 18, category: "Habits" }
          ],
          games: [
            { id: "nback", title: "Impulse Control Trainer", description: "Build self-control and working memory" },
            { id: "stroop", title: "Decision Making Under Pressure", description: "Practice making good choices quickly" }
          ]
        }
      }
    };

    return resources[categoryName as keyof typeof resources] || null;
  };

  const resourceData = getResourceData(category || "");

  if (!resourceData) {
    return (
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resource Not Found</h1>
          <Link to="/resources">
            <Button>Back to Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = resourceData.icon;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${resourceData.color} text-white py-16`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link to="/resources">
              <Button variant="ghost" className="text-white hover:bg-transparent hover:text-white/90 px-2 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <Icon className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {resourceData.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto">
              {resourceData.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              {resourceData.content.overview}
            </p>
          </CardContent>
        </Card>

        {/* Techniques Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Effective Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Technique</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                    <th className="text-left p-4 font-semibold">Effectiveness</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceData.content.techniques.map((technique, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{technique.name}</td>
                      <td className="p-4 text-gray-600">{technique.description}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {technique.effectiveness}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Journal Prompts and Forum Topics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Journal Prompts
              </CardTitle>
              <CardDescription>
                Reflect on these questions to deepen your understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resourceData.content.journalPrompts.map((prompt, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      {index + 1}. {prompt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Related Forum Discussions
              </CardTitle>
              <CardDescription>
                Join conversations with your peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resourceData.content.forumTopics.map((topic, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900">{topic.title}</h4>
                      <Badge variant="outline" className="ml-2">
                        {topic.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{topic.replies} replies</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Signs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Target className="w-6 h-6 mr-2" />
              Important Warning Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-6 rounded-lg">
              <ul className="space-y-2">
                {resourceData.content.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start text-red-700">
                    <span className="text-red-500 mr-2 mt-1">⚠️</span>
                    {warning}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-red-800 font-semibold">
                If you experience any of these signs, please talk to a trusted adult or counselor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Practice Games
            </CardTitle>
            <CardDescription>
              Strengthen your skills with these interactive activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {resourceData.content.games.map((game, index) => (
                <div key={index} className="p-6 border rounded-xl hover:shadow-lg transition-all">
                  <h3 className="text-xl font-semibold mb-3">{game.title}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>
                  <Button onClick={() => handleStartGame(game.id)} className="w-full text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourceDetails;