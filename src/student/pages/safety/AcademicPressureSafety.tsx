import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const AcademicPressureAwareness = () => {
  const navigate = useNavigate();
  
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/buddysafe')}
          className="text-blue-600 hover:bg-blue-50 flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety Resources
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Understanding Academic Pressure & Mental Health
          </h1>
          <p className="text-gray-600">
            Your mental health is just as important as your grades. Let's learn how to balance both.
          </p>
        </div>

        <div className="space-y-8">
          {/* Why This Matters */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-xl text-purple-900">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800 leading-relaxed">
                School is important, but so is your happiness and mental health. When you learn 
                how to manage stress and take care of your mind, you can actually do better in 
                your studies AND feel good about yourself. It's okay to feel worried sometimes, 
                but you don't have to carry that weight alone. Taking care of your mental health 
                helps you become stronger and more successful in everything you do.
              </p>
            </CardContent>
          </Card>

          {/* What Is It? */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">What Is It?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Academic pressure happens when the stress of school becomes too much to handle. 
                It can include feelings about:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Worrying constantly about grades and test scores
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Feeling overwhelmed by homework and assignments
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Fear of disappointing parents or teachers
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Comparing yourself to other students all the time
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Losing sleep or appetite because of school worries
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How It Can Affect You */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">How It Can Affect You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">
                Too much academic pressure can make you feel tired, sad, or worried all the time. 
                You might have headaches, trouble sleeping, or lose interest in things you used to enjoy. 
                Sometimes you might feel like giving up or that you're not good enough. You might also 
                feel angry or irritated easily. These feelings can make it even harder to focus on your 
                studies, creating a cycle that feels difficult to break.
              </p>
            </CardContent>
          </Card>

          {/* Why You Deserve Better */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-xl text-green-900">Why You Deserve Better</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 leading-relaxed">
                You are so much more than your grades or test scores. You deserve to learn and grow 
                in a way that feels good and healthy. Your worth as a person doesn't depend on being 
                perfect in school. You have unique talents and qualities that make you special. 
                Education should help you discover your strengths, not make you feel stressed or sad. 
                You deserve support, understanding, and the chance to learn at your own pace.
              </p>
            </CardContent>
          </Card>

          {/* What You Can Do */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Break big tasks into smaller, manageable pieces
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Set aside time for activities you enjoy every day
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Talk to someone you trust about how you're feeling
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Practice deep breathing or relaxation when stressed
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Get enough sleep and eat healthy foods regularly
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Ask for help from teachers when you don't understand something
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* If You See It Happening */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-xl text-orange-900">If You See It Happening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-800 leading-relaxed mb-4">
                If you notice a friend struggling with academic pressure:
              </p>
              <ul className="space-y-2 text-orange-800">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Listen without judging and let them know you care
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Encourage them to talk to a trusted adult
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Invite them to do fun, relaxing activities together
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Remind them that their worth isn't determined by grades
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Tell an adult if you're worried about their safety
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights as a Student */}
          <Card className="border-teal-200 bg-teal-50">
            <CardHeader>
              <CardTitle className="text-xl text-teal-900">Your Rights as a Student</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-teal-800">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to learn in a supportive environment
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to ask for help when you need it
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to make mistakes and learn from them
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to mental health support and counseling
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to a balanced life with time for rest and play
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Good Habits to Stay Safe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Good Habits for Mental Wellness</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🧠</span>
                  Create a daily routine that includes study time and fun time
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🧠</span>
                  Practice mindfulness or meditation for a few minutes each day
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🧠</span>
                  Stay connected with friends and family who support you
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🧠</span>
                  Exercise regularly - even a short walk can help reduce stress
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🧠</span>
                  Keep a journal to express your thoughts and feelings
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Get Help Now */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-xl text-red-900 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Get Help Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Remember:</strong> Asking for help is brave and smart, not weak.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Mental Health Helpline", number: "9152987821", desc: "Talk to counselors about stress and anxiety" },
                  { name: "iCall Psychosocial Helpline", number: "9152987821", desc: "Professional mental health support" },
                  { name: "Sneha Suicide Prevention", number: "044-24640050", desc: "Crisis support and counseling" },
                  { name: "Student Helpline", number: "1800-11-4477", desc: "Academic support and guidance" }
                ].map((contact, index) => (
                  <div key={index} className="p-3 bg-white rounded border border-red-200">
                    <div className="font-medium text-red-800">{contact.name}</div>
                    <div className="text-sm text-red-600 mb-2">{contact.desc}</div>
                    <Button
                      size="sm"
                      onClick={() => handleCall(contact.number)}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Call {contact.number}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Remember */}
          <Card className="border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="text-xl text-pink-900">Remember</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pink-800 leading-relaxed text-center">
                Your mental health journey is unique to you, and it's okay to have ups and downs. 
                Learning to manage stress and take care of your mind is a life skill that will 
                help you forever. You are capable, you are resilient, and you are enough just as you are. 
                <strong>Your wellbeing matters more than any grade, and you have the strength to create balance in your life.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AcademicPressureAwareness;
