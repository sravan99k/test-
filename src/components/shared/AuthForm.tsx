import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfanityFilteredInput } from "@/components/ui/profanity-filtered-input";
import { Label } from "@/components/ui/label";

import { auth, db } from "@/integrations/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onAuthComplete: () => void;
}

const AuthForm = ({ onAuthComplete }: AuthFormProps) => {
  useEffect(() => {
    document.title = "Login | Novo Wellness";
  }, []);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        duration: 2000,
      });
      onAuthComplete();
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center p-1">
            <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center bg-white">
              <img 
                src="/favicon.ico" 
                alt="Novo Wellness Logo" 
                className="h-full w-full object-contain p-1"
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Novo Wellness</CardTitle>
          <CardDescription>
            Please sign in to access the mental health platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <ProfanityFilteredInput
                id="email"
                type="email"
                placeholder="name@example.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <ProfanityFilteredInput
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
