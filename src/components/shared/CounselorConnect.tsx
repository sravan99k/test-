import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, Video } from "lucide-react";

export const CounselorConnect = () => {
    const contactMethods = [
        {
            title: "Chat with BuddyBot",
            description: "Get instant support and guidance from our AI-powered BuddyBot.",
            icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
            action: "Start Chat",
            onClick: () => {
                const chatButton = document.getElementById('onboarding-buddybot');
                if (chatButton) chatButton.click();
            }
        },
        {
            title: "Message School Counselor",
            description: "Send a secure message to your school counselor. They usually respond within 24 hours.",
            icon: <Mail className="w-6 h-6 text-blue-600" />,
            action: "Send Message",
        },
        {
            title: "Schedule Call",
            description: "Book a 15-minute voice call with a wellness professional.",
            icon: <Phone className="w-6 h-6 text-green-600" />,
            action: "Book Call",
        },
        {
            title: "Virtual Session",
            description: "Request a private video consultation for more in-depth support.",
            icon: <Video className="w-6 h-6 text-purple-600" />,
            action: "Request Session",
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {method.icon}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{method.title}</CardTitle>
                                <CardDescription className="text-sm mt-1">{method.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={method.onClick}
                            >
                                {method.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                        🚨 Immediate Support
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                        If you are in immediate danger or experiencing a crisis, please use these 24/7 helplines:
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="font-bold text-gray-900">Childline India</div>
                        <div className="text-xl font-bold text-blue-600 mt-1">1098</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="font-bold text-gray-900">NIMHANS Helpline</div>
                        <div className="text-xl font-bold text-blue-600 mt-1">080-46110007</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CounselorConnect;
