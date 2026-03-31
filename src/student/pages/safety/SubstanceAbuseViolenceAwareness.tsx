import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Heart, AlertTriangle, Phone, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const SubstanceAbuseViolenceAwareness = () => {
  const navigate = useNavigate();
  
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
            Substance Abuse & Violence Awareness
          </h1>
          <p className="text-gray-600">
            Stay informed and safe. Learn about the dangers of substance abuse and how to recognize and prevent violence.
          </p>
        </div>

        <div className="space-y-8">
          {/* Why This Matters */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-xl text-red-900">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 leading-relaxed">
                Substance abuse and violence can have serious consequences on your health, safety, and future. 
                Understanding the risks and knowing how to protect yourself is crucial for your well-being.experience physical violence or bullying. Learning about 
                these challenges and how to handle them helps you make smart, safe choices that protect 
                your body and mind. When you know how to stay safe and say "no" confidently, you can 
                focus on your dreams and goals while keeping yourself protected.
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
                Substance abuse means using drugs, alcohol, or other harmful substances that can hurt 
                your body and mind. Violence includes physical bullying, hitting, pushing, or any 
                behavior that makes you feel unsafe or threatened. These can include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Substance-Related Issues:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      Being offered cigarettes, alcohol, or drugs
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      Peer pressure to try substances
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      Being told "everyone is doing it"
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Violence & Bullying:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      Physical hitting, pushing, or hurting
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      Threatening or intimidating behavior
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      Damaging your belongings
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Can Affect You */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-xl text-red-900">How It Can Affect You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 leading-relaxed">
                Both substance abuse and violence can seriously harm your growing body and mind. Substances 
                can affect your memory, concentration, and ability to learn. Violence can cause physical injuries, 
                emotional trauma, and make you feel scared, angry, or sad. Both can lead to problems at school, 
                fights with family, trouble sleeping, and losing interest in activities you used to love. 
                Most importantly, they can affect your confidence and ability to trust others.
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
                You deserve to grow up healthy, strong, safe, and free from harm. Your body and mind are 
                developing, and you have the right to protect them from substances and violence. Real friends 
                will respect your choices and never try to hurt you or pressure you into unsafe situations. 
                You don't need substances to be fun or cool, and you should never have to fear being hurt by 
                others. You are already amazing just as you are, and you deserve to feel safe and supported.
              </p>
            </CardContent>
          </Card>

          {/* What You Can Do */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3">For Substance Abuse:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Practice saying "No, thank you" confidently
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Choose friends who respect your values
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Find healthy ways to have fun
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Talk to trusted adults about pressure
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3">For Violence & Bullying:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Tell a trusted adult immediately
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Stay in groups when possible
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Avoid isolated areas
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      Document incidents (keep records)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* If You See It Happening */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">If You See It Happening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed mb-4">
                If you see friends struggling with substance use or experiencing violence:
              </p>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Don't judge them, but show that you care about their wellbeing
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Encourage them to talk to a trusted adult
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Never ignore violence - always report it
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Be a positive influence by making healthy, safe choices yourself
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Support your friends in getting professional help
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
                  You have the right to say no to substances without explanation
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to a safe, violence-free school environment
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to get help if you're struggling or being hurt
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to choose friends who support healthy, safe choices
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to report violence without fear of retaliation
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
                  <span className="text-green-600 mr-2">💪</span>
                  Build confidence through achievements in school, sports, or hobbies
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Surround yourself with positive role models and supportive friends
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Practice stress management through exercise, music, or art
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Stay aware of your surroundings and trust your instincts
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Communicate openly with trusted adults about your concerns
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
                  <strong>Remember:</strong> Getting help for substance problems or reporting violence is brave and the right thing to do.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Emergency Services", number: "112", desc: "For immediate danger or violence" },
                  { name: "Drug De-addiction Helpline", number: "1800-11-0031", desc: "Free support for substance abuse problems" },
                  { name: "Childline India", number: "1098", desc: "Help for children facing violence or abuse" },
                  { name: "Police Helpline", number: "100", desc: "Report violence and get immediate help" },
                  { name: "NIMHANS Helpline", number: "080-26995000", desc: "Mental health and addiction treatment" },
                  { name: "Youth Helpline", number: "1800-233-3330", desc: "Support and counseling for young people" }
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
                You are stronger than any pressure or threat you might face, and you have the power to make 
                choices that protect your health, safety, and future. True friends will respect your decisions 
                and support you in staying healthy and safe. Every day you choose to stay substance-free and 
                violence-free is a victory for your body, mind, and dreams. 
                <strong>You are valuable, you are capable, and you deserve a bright, healthy, and safe future.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubstanceAbuseViolenceAwareness;
