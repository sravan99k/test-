
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

interface IncidentType {
  title: string;
  description: string;
  icon: string;
  color: string;
  helplines: Array<{
    name: string;
    number: string;
    description: string;
  }>;
  preventionTips: string[];
  isExpanded?: boolean;
}

const BuddySafe: React.FC = () => {
  usePageTitle("BuddySafe");
  const [incidents, setIncidents] = useState<IncidentType[]>([
    {
      title: "Cyberbullying & Online Harassment",
      description: "Digital harassment, social media bullying, and online threats affecting students' mental health and academic performance.",
      icon: "/images/cyberbulling.webp",
      color: "border-blue-200 bg-blue-50",
      helplines: [
        { name: "Cyber Crime Helpline", number: "1930", description: "24x7 cybercrime reporting" },
        { name: "Childline India", number: "1098", description: "Child protection services" },
        { name: "National Cyber Security Helpline", number: "155620", description: "Cyber security support" }
      ],
      preventionTips: [
        "Keep personal information private on social media",
        "Report and block users who send threatening messages",
        "Save evidence of cyberbullying (screenshots)",
        "Talk to trusted adults about online experiences"
      ],
      isExpanded: false
    },
    {
      title: "Substance Abuse & Violence",
      description: "Understanding substance abuse, peer pressure, and protecting yourself from physical harm.",
      icon: "/images/PhysicalBullyingViolence.webp",
      color: "border-red-200 bg-red-50",
      helplines: [
        { name: "Drug De-addiction Helpline", number: "1800-11-0031", description: "Substance abuse support" },
        { name: "NIMHANS Helpline", number: "080-26995000", description: "Mental health & addiction" },
        { name: "Youth Helpline", number: "1800-233-3330", description: "Youth counseling services" }
      ],
      preventionTips: [
        "Report incidents to trusted adults or school authorities immediately",
        "Stay with supportive friends, avoid isolated areas, and learn basic self-defense",
        "Confidently say 'NO' to negative peer pressure and choose healthy activities",
        "Document problems and seek help from counselors for safety or addiction issues"
      ],
      isExpanded: false
    },
    {
      title: "Academic Pressure & Mental Health",
      description: "Extreme academic stress, exam anxiety, and mental health challenges leading to depression and self-harm.",
      icon: "/images/AcademicPressureMentalHealth.webp",
      color: "border-purple-200 bg-purple-50",
      helplines: [
        { name: "Mental Health Helpline", number: "9152987821", description: "24x7 mental health support" },
        { name: "Sneha Suicide Prevention", number: "044-24640050", description: "Suicide prevention counseling" },
        { name: "iCall Psychosocial Helpline", number: "9152987821", description: "Psychological support" }
      ],
      preventionTips: [
        "Practice stress management techniques daily",
        "Maintain work-life balance with hobbies",
        "Seek counseling when feeling overwhelmed",
        "Talk openly about mental health with family"
      ],
      isExpanded: false
    },
    {
      title: "Sexual Harassment",
      description: "Recognizing and responding to unsafe situations, body safety, building trust and communication.",
      icon: "/images/SubstanceAbusePeerPressure.webp",
      color: "border-orange-200 bg-orange-50",
      helplines: [
        { name: "Childline India/POCSO ", number: "1098", description: "Child protection & rights" },
        { name: "National Commission for Women (NCW) Helpline", number: "7827-170-170", description: "Report sexual harassment and seek guidance" },
        { name: "Women Helpline", number: "181", description: "24x7 support for women and girls" }
      ],
      preventionTips: [
        "Recognize inappropriate behavior and set clear personal boundaries",
        "Report incidents immediately to trusted adults, teachers, or authorities",
        "Stay in safe, well-lit areas and avoid being alone with people you don’t trust",
        "Seek help from counselors or helplines for guidance and emotional support"
      ],
      isExpanded: false
    }
  ]);

  const navigate = useNavigate();

  const toggleExpand = (index: number) => {
    setIncidents(prevIncidents =>
      prevIncidents.map((incident, i) =>
        i === index
          ? { ...incident, isExpanded: !incident.isExpanded }
          : incident
      )
    );
  };

  const handleLearnMore = (title: string) => {
    // Map titles to their corresponding routes
    const routeMap: Record<string, string> = {
      'Cyberbullying & Online Harassment': 'cyberbullying',
      'Substance Abuse & Violence': 'substance-abuse-violence',
      'Academic Pressure & Mental Health': 'academic-pressure',
      'Sexual Harassment': 'sexual-harassment'
    };

    const route = routeMap[title] || title.toLowerCase().replace(/[&\s]+/g, '-');
    navigate(`/safety/${route}`);
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div id="onboarding-buddysafe-content" className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div id="onboarding-buddysafe-header" className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BuddySafe: Student Safety Awareness
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn about common challenges, discover prevention tips, and find helplines you can trust.
            You're not alone - support is always available.
          </p>
        </div>

        <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-left text-red-800 rounded text-sm">
          <strong>Need immediate help?</strong> If you're in immediate danger, please contact:<br />
          <strong>Emergency:</strong> 112 &nbsp;|&nbsp; <strong>Childline India:</strong> 1098 &nbsp;|&nbsp; <strong>POCSO:</strong> 1098
        </div>
        <div className="pb-8">
          <div id="onboarding-buddysafe-cards" className="space-y-6 mt-8">
            {incidents.map((incident, index) => (
              <Card key={index} className={`shadow-lg ${incident.color} overflow-hidden`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-90 transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={incident.icon}
                      alt={incident.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <CardTitle className="text-lg text-gray-900">
                      {incident.title}
                    </CardTitle>
                  </div>
                  <button
                    className="text-gray-600 hover:text-gray-900 text-2xl font-bold focus:outline-none w-6 h-6 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(index);
                    }}
                  >
                    {incident.isExpanded ? '−' : '+'}
                  </button>
                </div>

                {incident.isExpanded && (
                  <div className="animate-fadeIn">
                    <CardContent className="pt-0 space-y-4">
                      <p className="text-gray-700 text-sm mb-3">
                        {incident.description}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLearnMore(incident.title);
                          }}
                          className="text-blue-600 hover:underline ml-1 font-medium"
                        >
                          Learn more →
                        </button>
                      </p>

                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">📞 Get Help Now:</h4>
                        <div className="space-y-2">
                          {incident.helplines.map((helpline, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800">{helpline.name}</div>
                                <div className="text-xs text-gray-600">{helpline.description}</div>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCall(helpline.number);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
                              >
                                {helpline.number}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">🛡️ Prevention Tips:</h4>
                        <ul className="space-y-1">
                          {incident.preventionTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                              <span className="text-teal-600 mr-2">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Add spacing before National Resources */}
          <div className="h-8"></div>

          {/* National Resources Section */}
          <Card id="onboarding-buddysafe-national-resources" className="shadow-lg border-green-200 bg-green-50 mb-6">
            <div className="p-6 pb-0">
              <h2 className="text-xl font-semibold text-green-900 flex items-center gap-2">
                📞 National Emergency & Support Numbers
              </h2>
            </div>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Emergency Services", number: "112", desc: "Police, Fire, Medical Emergency" },
                  { name: "Childline India", number: "1098", desc: "Child protection & rights" },
                  { name: "POCSO", number: "1098", desc: "Child protection & rights" },
                  { name: "Mental Health Helpline", number: "9152987821", desc: "Psychological support" },
                  { name: "Cyber Crime", number: "1930", desc: "Report cybercrime incidents" },
                  { name: "Education Helpline", number: "1800-11-4477", desc: "Academic support services" }
                ].map((contact, index) => (
                  <div key={index} className="p-3 bg-white rounded border border-green-200">
                    <div className="font-medium text-green-800">{contact.name}</div>
                    <div className="text-sm text-green-600 mb-2">{contact.desc}</div>
                    <Button
                      size="sm"
                      onClick={() => handleCall(contact.number)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Call {contact.number}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> If you're not able to get the help you need from your parents, teachers, or other trusted adults,
              please remember you're not alone. You can call the helplines listed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuddySafe;
