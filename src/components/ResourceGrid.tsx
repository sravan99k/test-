
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ResourceGrid = () => {
  const [activeFilter, setActiveFilter] = useState("All Resources");

  const filters = ["All Resources", "Stress Management", "Emotional Wellbeing", "Eating Habits", "Behavioral Support"];

  const resources = [
    {
      id: "stress-management",
      title: "Deep Breathing Exercises for Teens",
      description: "Simple 5-minute breathing techniques to reduce stress and anxiety.",
      category: "Stress Management",
      icon: "🧘",
      color: "bg-blue-50 border-blue-200",
      path: "/resources/stress-management"
    },
    {
      id: "emotional-wellbeing",
      title: "Understanding Your Emotions",
      description: "Learn to identify and process different emotional states.",
      category: "Emotional Wellbeing",
      icon: "💭",
      color: "bg-purple-50 border-purple-200",
      path: "/resources/emotional-wellbeing"
    },
    {
      id: "eating-habits",
      title: "Healthy Eating for Growing Bodies",
      description: "Nutrition tips for teenagers and developing positive eating habits.",
      category: "Eating Habits",
      icon: "🥗",
      color: "bg-green-50 border-green-200",
      path: "/resources/eating-habits"
    },
    {
      id: "behavioral-support",
      title: "Conflict Resolution Skills",
      description: "How to handle disagreements with friends and family in a healthy way.",
      category: "Behavioral Support",
      icon: "🤝",
      color: "bg-orange-50 border-orange-200",
      path: "/resources/behavioral-support"
    },
    {
      id: "stress-management",
      title: "Mindfulness Meditation for Beginners",
      description: "Simple guided meditations for students to practice mindfulness.",
      category: "Stress Management",
      icon: "🧠",
      color: "bg-blue-50 border-blue-200",
      path: "/resources/stress-management"
    },
    {
      id: "emotional-wellbeing",
      title: "Building Positive Self-Talk",
      description: "Exercises to challenge negative thoughts and develop confidence.",
      category: "Emotional Wellbeing",
      icon: "💪",
      color: "bg-purple-50 border-purple-200",
      path: "/resources/emotional-wellbeing"
    },
    {
      id: "eating-habits",
      title: "Meal Planning for Teens",
      description: "Easy and nutritious meal ideas for busy students.",
      category: "Eating Habits",
      icon: "🍎",
      color: "bg-green-50 border-green-200",
      path: "/resources/eating-habits"
    },
    {
      id: "behavioral-support",
      title: "Building Healthy Relationships",
      description: "Tips for maintaining positive friendships and family relationships.",
      category: "Behavioral Support",
      icon: "👥",
      color: "bg-orange-50 border-orange-200",
      path: "/resources/behavioral-support"
    }
  ];

  const filteredResources = activeFilter === "All Resources" 
    ? resources 
    : resources.filter(resource => resource.category === activeFilter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            onClick={() => setActiveFilter(filter)}
            className={`${
              activeFilter === filter 
                ? "bg-teal-500 text-white hover:bg-teal-600" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource, index) => (
          <Link to={resource.path} key={resource.id + index} className="block h-full">
            <Card className={`${resource.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer group`}>
              <CardHeader className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{resource.icon}</div>
                  <Badge variant="secondary" className="text-xs">
                    {resource.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {resource.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  {resource.description}
                </CardDescription>
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-white hover:shadow-md transition-all duration-200 group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:text-teal-600"
                  >
                    View Resource →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResourceGrid;
