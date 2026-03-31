import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const CyberbullyingAwareness = () => {
  const navigate = useNavigate();
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:bg-blue-50 flex items-center gap-2 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Back to Safety Resources
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Cyberbullying & Online Harassment
          </h1>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            Learn how to recognize, prevent, and respond to cyberbullying and online harassment.
            You deserve to feel safe online. Let's learn how to protect yourself and others.
          </p>
        </div>

        <div className="space-y-8">
          {/* Why This Matters */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">
                The internet is a wonderful place to learn, play, and connect with friends. But sometimes, 
                people use technology to hurt others. When you know how to stay safe online, you can enjoy 
                all the good things about the internet while protecting yourself and your friends. 
                You have the power to make the online world a kinder place!
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
                Cyberbullying is when someone uses phones, computers, or social media to hurt, 
                embarrass, or scare another person. This can include:
              </p>
              <div className="space-y-2 text-gray-700 pl-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Sending mean messages or comments
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Sharing embarrassing photos or videos without permission
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Spreading rumors or lies online
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Excluding someone from online groups on purpose
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Can Affect You */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-xl text-purple-900">How It Can Affect You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800 leading-relaxed">
                Being bullied online can make you feel sad, angry, scared, or alone. You might not want 
                to go to school or use your phone. You might have trouble sleeping or feel sick to your stomach. 
                These feelings are completely normal, and it's not your fault if someone is being mean to you online. 
                Remember, what happens online can feel very real and hurtful.
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
                Every student deserves to feel safe and respected, both in person and online. 
                You have the right to learn, grow, and have fun without being hurt by others. 
                No one should make you feel bad about yourself. You are important, you matter, 
                and there are people who care about you and want to help.
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
                  <span className="text-blue-600 mr-2">✓</span>
                  Don't respond to mean messages - block and report the person instead
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Save evidence by taking screenshots of bullying messages
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Tell a trusted adult like a parent, teacher, or counselor
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Keep your personal information private on social media
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Use privacy settings to control who can contact you
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Take breaks from social media if it makes you feel bad
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
                Being a good friend means standing up for others. If you see cyberbullying:
              </p>
              <ul className="space-y-2 text-orange-800">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Don't share or like mean posts about someone
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Send a kind message to the person being bullied
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Report the bullying to the app or website
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Tell a trusted adult what you've seen
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
                  You have the right to feel safe online and offline
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to privacy and respect
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to get help when you need it
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to report bullying without fear
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to use technology for positive purposes
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Good Habits to Stay Safe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Good Habits to Stay Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🛡️</span>
                  Think before you post - would you say it face-to-face?
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🛡️</span>
                  Keep passwords private and change them regularly
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🛡️</span>
                  Only accept friend requests from people you actually know
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🛡️</span>
                  Talk to parents or teachers about your online experiences
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">🛡️</span>
                  Use kind words online - treat others how you want to be treated
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
                  <strong>Remember:</strong> You are never alone. These people are here to help you 24/7.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Cyber Crime Helpline", number: "1930", desc: "Report cyberbullying and online crimes" },
                  { name: "Childline India", number: "1098", desc: "Help for children in difficult situations" },
                  { name: "Mental Health Helpline", number: "9152987821", desc: "Talk to someone about your feelings" },
                  { name: "Student Helpline", number: "1800-11-4477", desc: "Support for students and families" }
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
                You are stronger than you know, and you are never alone. Every student deserves 
                to feel safe and happy online. By learning about cyberbullying and how to prevent it, 
                you're helping to make the internet a better place for everyone. 
                <strong> You matter, you are loved, and help is always available.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CyberbullyingAwareness;
