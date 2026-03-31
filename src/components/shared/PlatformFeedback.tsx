import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

export const PlatformFeedback = () => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Feedback Submitted",
            description: "Thank you for helping us improve Novo Wellness!",
        });
        setRating(0);
        setFeedback("");
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Platform Feedback</CardTitle>
                <CardDescription>How can we make Novo Wellness better for you?</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 transition-colors ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                            >
                                <Star className="w-8 h-8" />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Tell us what you think..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                        required
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Submit Feedback
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PlatformFeedback;
