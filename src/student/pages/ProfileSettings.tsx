
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfanityFilteredInput } from "@/components/ui/profanity-filtered-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { db, auth } from "@/integrations/firebase";
import { collection, query, where, getDocs, updateDoc, addDoc, doc, onSnapshot } from "firebase/firestore";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
    pincode: "",
    class: "",
    gender: "",
    roll_no: "",
    schoolName: "",
    address: "",
    schoolPhone: "",
    schoolEmail: "",
    branch: "",
    parentName: "",
    parentPhone: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!user) return;
    // Real-time Firestore listener for demographics
    const q = query(collection(db, "demographics"), where("user_id", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap ? docSnap.data() : {};
      setProfileData({
        name: (user as any).displayName || user?.demographics?.name || "",
        email: user.email || "",
        state: data.state || "",
        city: data.city || "",
        pincode: data.pincode || "",
        class: data.grade || "",
        gender: data.gender || "",
        roll_no: data.roll_no || "",
        schoolName: data.school || "",
        address: data.address || "",
        schoolPhone: data.school_phone || "",
        schoolEmail: data.school_email || "",
        branch: data.branch || "",
        parentName: data.parent_name || "",
        parentPhone: data.parent_phone || ""
      });
    }, (error) => {
      console.error('Error listening to profile data:', error);
    });
    return () => unsubscribe();
  }, [user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { id, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleRollNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters
    if (/^[A-Z0-9]*$/.test(value) || value === '') {
      setProfileData(prev => ({
        ...prev,
        roll_no: value
      }));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    // Utility to clean undefined values
    function cleanProfileData(data: typeof profileData) {
      const cleaned: any = {};
      Object.entries(data).forEach(([key, value]) => {
        cleaned[key] = value === undefined ? "" : value;
      });
      return cleaned;
    }

    try {
      // 1. Update Firebase Auth displayName and email
      if (auth.currentUser) {
        if (profileData.name !== auth.currentUser.displayName) {
          await updateProfile(auth.currentUser, { displayName: profileData.name });
        }
        if (profileData.email !== auth.currentUser.email) {
          await updateEmail(auth.currentUser, profileData.email);
        }
      }

      // 2. Update Firestore demographics
      const demographicsRef = collection(db, "demographics");
      const q = query(demographicsRef, where("user_id", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const cleanedData = cleanProfileData(profileData);
      if (!querySnapshot.empty) {
        // Update ALL docs for this user_id
        await Promise.all(querySnapshot.docs.map(docSnap =>
          updateDoc(doc(db, "demographics", docSnap.id), {
            ...cleanedData,
            user_id: user.uid,
          })
        ));
      } else {
        // Create new doc
        await addDoc(demographicsRef, {
          ...cleanedData,
          user_id: user.uid,
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!auth.currentUser) throw new Error("No authenticated user");
      await updatePassword(auth.currentUser, passwordData.newPassword);
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-lg text-gray-600">
              Manage your personal information and account security
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <ProfanityFilteredInput
                          id="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <ProfanityFilteredInput
                          id="state"
                          value={profileData.state}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <ProfanityFilteredInput
                          id="city"
                          value={profileData.city}
                          onChange={handleInputChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <ProfanityFilteredInput
                          id="pincode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={profileData.pincode}
                          onChange={(e) => {
                            // Only allow numeric input
                            const value = e.target.value.replace(/\D/g, '');
                            setProfileData(prev => ({
                              ...prev,
                              pincode: value
                            }));
                          }}
                          disabled={loading}
                        />
                      </div>
                      {user?.role === 'student' && (
                        <div className="space-y-2">
                          <Label htmlFor="roll_no">Roll Number</Label>
                          <Input
                            id="roll_no"
                            name="roll_no"
                            value={profileData.roll_no}
                            onChange={e => setProfileData(prev => ({ ...prev, roll_no: e.target.value }))}
                            disabled={loading}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          value={profileData.gender} 
                          onValueChange={(value) => setProfileData(prev => ({
                            ...prev,
                            gender: value
                          }))}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {user?.role === 'student' && (
                        <div className="space-y-2">
                          <Label htmlFor="class">Class</Label>
                          <Select
                            name="class"
                            value={profileData.class}
                            onValueChange={(value) => {
                              setProfileData(prev => ({
                                ...prev,
                                class: value,
                                // Update roll number format if it matches the old grade
                                roll_no: prev.roll_no && prev.roll_no.length > 0
                                  ? `${value}${prev.roll_no.substring(1)}`
                                  : prev.roll_no
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your class" />
                            </SelectTrigger>
                            <SelectContent>
                              {[6, 7, 8, 9, 10].map((grade) => (
                                <SelectItem key={grade} value={grade.toString()}>
                                  Grade {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-lg font-medium mb-4">School Information</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="schoolName" className="text-sm font-medium text-gray-700">School Name</Label>
                            <Input
                              id="schoolName"
                              value={profileData.schoolName}
                              onChange={(e) => setProfileData({...profileData, schoolName: e.target.value})}
                              disabled={loading}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="branch" className="text-sm font-medium text-gray-700">School Branch</Label>
                            <Input
                              id="branch"
                              value={profileData.branch || ''}
                              onChange={(e) => setProfileData({...profileData, branch: e.target.value})}
                              disabled={loading}
                              className="w-full"
                              placeholder="Enter school branch name"
                            />
                          </div>
                        </div>
                      </div>


                    </div>

                    {user?.role === 'student' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parentName">Parent/Guardian Name</Label>
                          <ProfanityFilteredInput
                            id="parentName"
                            value={profileData.parentName}
                            onChange={(e) => setProfileData({...profileData, parentName: e.target.value})}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                          <ProfanityFilteredInput
                            id="parentPhone"
                            type="tel"
                            value={profileData.parentPhone}
                            onChange={(e) => setProfileData({...profileData, parentPhone: e.target.value})}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="bg-teal-500 hover:bg-teal-600"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <ProfanityFilteredInput
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        disabled={loading}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <ProfanityFilteredInput
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        disabled={loading}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <ProfanityFilteredInput
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        disabled={loading}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-teal-500 hover:bg-teal-600"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSettings;
