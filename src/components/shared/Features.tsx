
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MentalHealthTipsCarousel from "../MentalHealthTipsCarousel";
import { Brain, BookOpenText, GraduationCap, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Mental Health Assessment",
      description: "Comprehensive assessments covering stress, depression, eating behaviors, and more.",
      icon: "Brain",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Personalized Resources",
      description: "Age-appropriate resources and activities tailored to your specific needs.",
      icon: "BookOpenText",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "School Support",
      description: "Connect with school counselors and administrators for additional support.",
      icon: "GraduationCap",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Progress Tracking",
      description: "Monitor your mental health journey with regular check-ins and assessments.",
      icon: "BarChart3",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <div className="bg-white">
      {/* Enhanced Mental Health Awareness Section */}
      <div className="w-full flex flex-col items-center justify-center py-12 px-2 bg-gradient-to-r from-teal-50/80 via-blue-50/90 to-purple-50/80 border-b border-blue-100 mb-12 shadow-lg rounded-b-3xl">
        {/* SVG Illustration */}
      
        <h2 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-teal-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg text-center">
          Your Mind Matters
        </h2>
        {/* Tip Carousel (simple auto-rotating tips) */}
        <MentalHealthTipsCarousel />
      </div>
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.color} border-2 border-accent/30 rounded-xl shadow-md p-6 h-full flex flex-col [&:hover]:shadow-md [&:hover]:scale-100`}> 
                <CardHeader className="text-center px-0 pt-0 pb-4">
                  <div className="mb-4">
                    {feature.icon === 'Brain' && <Brain className="w-12 h-12 mx-auto text-blue-600" />}
                    {feature.icon === 'BookOpenText' && <BookOpenText className="w-12 h-12 mx-auto text-green-600" />}
                    {feature.icon === 'GraduationCap' && <GraduationCap className="w-12 h-12 mx-auto text-purple-600" />}
                    {feature.icon === 'BarChart3' && <BarChart3 className="w-12 h-12 mx-auto text-orange-600" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 pt-0 mt-auto">
                  <CardDescription className="text-gray-600 text-center text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
