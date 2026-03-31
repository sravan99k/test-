import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX, Heart, Phone, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const SexualHarassmentAwareness = () => {
  const navigate = useNavigate();
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
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
            Understanding Sexual Harassment & Body Safety
          </h1>
          <p className="text-lg text-gray-600">
            Recognizing and responding to unsafe situations, body safety, building trust and communication.
          </p>
        </div>

        <div className="space-y-8">
          {/* Why This Matters */}
          <Card className="border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="text-xl text-pink-900">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-pink-800 leading-relaxed">
                Trusting adults and older children should not be dangerous. But in this day and age, 
                learning about how to protect yourself physically is very important. To safeguard yourself, 
                it is vital to increase sexual safety awareness where you learn about your body, setting 
                boundaries and how to respond to unsafe situations. You deserve to feel safe, respected, 
                and protected at all times.
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
                Child Sexual Abuse is when an adult or older child engages in activities of a sexual 
                nature with a minor (a child aged less than 18 years). This is a criminal offense and 
                is punishable by law. This can include:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <strong>Molestation:&nbsp; </strong> Touching private parts inappropriately
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <strong>Indecent exposure:&nbsp; </strong> Revealing their private parts to a child
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <strong>Pressuring and forcing:&nbsp; </strong> Making you engage in uncomfortable activities
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <strong>Inappropriate recording:&nbsp; </strong> Capturing you in photos or videos
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <strong>Uncomfortable comments:&nbsp; </strong> Saying inappropriate things about your body
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How It Can Affect You */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-xl text-red-900">How It Can Affect You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 leading-relaxed">
                Facing these kinds of harassment and abuse can lead to depression, anxiety, fear, 
                and physical injury as well. These people have broken your trust and have taken 
                advantage of your young age. You might feel confused, scared, angry, or blame yourself. 
                It's important to know that it's never your fault. You might have trouble sleeping, 
                concentrating in school, or feel uncomfortable around certain people. These feelings 
                are normal responses to something that should never happen to you.
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
                Your body belongs to you, and you have the right to say no to any touch that makes you 
                uncomfortable. You deserve to feel safe, respected, and protected by all the adults in 
                your life. No one has the right to hurt you, touch you inappropriately, or make you do 
                things that make you uncomfortable. You are precious and valuable, and you deserve 
                relationships that are safe, caring, and respectful. Adults should protect you, not harm you.
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
                  Trust your feelings - if something doesn't feel right, it probably isn't
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Learn about your body and understand what touches are appropriate
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Practice saying "No!" loudly and clearly if someone makes you uncomfortable
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Tell a trusted adult immediately if someone touches you inappropriately
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Keep telling different adults until someone believes you and helps you
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Stay away from people who make you feel uncomfortable or unsafe
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  Never keep "secrets" about touching - always tell a trusted adult
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* If You See It Happening */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">If You See It Happening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed mb-4">
                If you know someone who is being hurt or made uncomfortable:
              </p>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Believe them when they tell you - children rarely lie about this
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Tell them it's not their fault and that you care about them
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Help them tell a trusted adult who can protect them
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  If they're too scared to tell, you can tell a trusted adult for them
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Be a good friend by supporting them and helping them stay safe
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
                  You have the right to say no to any touch that makes you uncomfortable
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to privacy and respect for your body
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to be believed when you report inappropriate behavior
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to get help and protection from trusted adults
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">★</span>
                  You have the right to feel safe at school, home, and everywhere you go
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Prevention Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Prevention Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Build strong relationships with trusted adults who make you feel safe
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Learn about body safety and appropriate vs inappropriate touches
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Practice speaking up confidently when something doesn't feel right
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Stay in groups when possible and avoid being alone with people who make you uncomfortable
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">💪</span>
                  Remember that your body belongs to you and you make the rules about who can touch you
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
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Remember:</strong> It's never your fault, and you deserve help and protection. Speaking up is brave and the right thing to do.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Emergency Services", number: "112", desc: "For immediate danger" },
                  { name: "Childline India", number: "1098", desc: "24/7 helpline for children in need" },
                  { name: "Women Helpline", number: "181", desc: "Support for harassment and abuse" },
                  { name: "Police Helpline", number: "100", desc: "Report crimes and get immediate help" },
                  { name: "POCSO Helpline", number: "1098", desc: "Protection from sexual offenses against children" },
                  { name: "Cyber Crime Helpline", number: "1930", desc: "For online harassment and inappropriate content" }
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
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-xl text-purple-900">Remember</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800 leading-relaxed text-center">
                You are precious, valuable, and deserving of respect and safety. If someone has hurt you 
                or made you uncomfortable, it is never your fault. You are brave for learning about body 
                safety, and even braver if you speak up about inappropriate behavior. There are many caring 
                adults who want to help and protect you. Your voice matters, your safety matters, and you matter. 
                <strong>You deserve to feel safe, respected, and loved just as you are.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SexualHarassmentAwareness;
