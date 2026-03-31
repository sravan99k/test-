import { useState, useEffect } from "react";
import { useAuthFirebase } from "@/hooks/useAuthFirebase";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { Save, School, Users, Lock, Bell, Shield, Mail, Calendar, BookOpen, Key, User, Check, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "../integrations/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

// Form schema for school information
const schoolFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolBranch: z.string().min(1, "School branch is required"),
  state: z.string().min(2, "State must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  pincode: z.string().min(4, "Pincode must be at least 4 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  email: z.string().email("Please enter a valid email"),
  about: z.string().max(500, "About section cannot exceed 500 characters").optional(),
  currentPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters").optional(),
  confirmPassword: z.string().min(8, "Please confirm your password").optional(),
}).refine((data) => {
  if (data.newPassword || data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

// Default form values
const defaultValues: Partial<SchoolFormValues> = {
  fullName: "",
  schoolName: "Example High School",
  schoolBranch: "Main",
  state: "",
  city: "",
  pincode: "",
  address: "123 Education St, Learning City",
  email: "info@examplehigh.edu",
  about: "A leading educational institution committed to excellence in learning and student development.",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SchoolSettings() {
  const { user } = useAuthFirebase();
  const isManagement = user?.role === 'management';
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReports: true,
    systemUpdates: true,
  });
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: "medium",
  });

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues,
  });

  // Real-time Firestore listener for school info
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "schools", user.uid), (docSnap) => {
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        form.reset({
          fullName: data.fullName || "",
          schoolName: data.schoolName || "",
          schoolBranch: data.schoolBranch || "",
          state: data.state || "",
          city: data.city || "",
          pincode: data.pincode || "",
          email: data.email || user.email || "",
        });
      } else {
        form.reset(defaultValues);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  const onSubmit = async (data: SchoolFormValues) => {
    try {
      setIsSaving(true);
      // Save to Firestore 'schools' collection, doc id = user.uid
      if (!user?.uid) throw new Error("No user ID found");
      await setDoc(doc(db, "schools", user.uid), {
        ...data,
        updatedAt: new Date().toISOString(),
        email: user.email, // always use the current user's email
      });

      toast({
        title: "School settings updated successfully!",
        description: "Your changes have been saved.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      if (!user?.uid) throw new Error("No user ID found");
      await setDoc(
        doc(db, "schools", user.uid),
        { notifications },
        { merge: true }
      );
      toast({
        title: "Notification preferences updated!",
        description: "Your notification settings have been saved.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecurityChange = (key: keyof typeof security, value: any) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    form.setValue("newPassword", newPassword, { shouldValidate: true });
    validatePassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
                <p className="text-muted-foreground">
                  Manage your school's profile, notifications, and security settings
                </p>
              </div>
            </div>
          </div>
          <Tabs 
            defaultValue="general" 
            className="space-y-6"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center justify-center gap-2">
                <School className="w-4 h-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="academics" className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Academics</span>
              </TabsTrigger>
            </TabsList>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">School Information</CardTitle>
                        <CardDescription>
                          Update your school's basic information and contact details
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="h-8" type="submit" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            placeholder="Enter your full name"
                            {...form.register("fullName")}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input 
                            id="schoolName" 
                            placeholder="Enter school name"
                            {...form.register("schoolName")}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schoolBranch">School Branch</Label>
                          <Input 
                            id="schoolBranch" 
                            placeholder="Enter school branch"
                            {...form.register("schoolBranch")}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="school@example.com"
                            {...form.register("email")}
                            className="bg-white"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input 
                            id="state" 
                            placeholder="Enter state"
                            {...form.register("state")}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            placeholder="Enter city"
                            {...form.register("city")}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input 
                            id="pincode" 
                            placeholder="Enter pincode"
                            {...form.register("pincode")}
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Notification switches and settings here */}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="button" onClick={handleSaveNotifications} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          handleSecurityChange("twoFactorAuth", checked)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Select
                        value={security.sessionTimeout.toString()}
                        onValueChange={(value) =>
                          handleSecurityChange("sessionTimeout", parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="0">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Time before automatic sign-out due to inactivity
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Password Policy</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="password-policy-low"
                            name="password-policy"
                            value="low"
                            checked={security.passwordPolicy === "low"}
                            onChange={() => handleSecurityChange("passwordPolicy", "low")}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="password-policy-low" className="font-normal">
                            Low (minimum 6 characters)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="password-policy-medium"
                            name="password-policy"
                            value="medium"
                            checked={security.passwordPolicy === "medium"}
                            onChange={() => handleSecurityChange("passwordPolicy", "medium")}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="password-policy-medium" className="font-normal">
                            Medium (8+ characters, letters & numbers)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="password-policy-high"
                            name="password-policy"
                            value="high"
                            checked={security.passwordPolicy === "high"}
                            onChange={() => handleSecurityChange("passwordPolicy", "high")}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="password-policy-high" className="font-normal">
                            High (12+ characters, mixed case, numbers & symbols)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Update Security Settings"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="academics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Settings</CardTitle>
                    <CardDescription>
                      {/* Academic settings description here */}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Academic settings content here */}
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Academic Settings"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
