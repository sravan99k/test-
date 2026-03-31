import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from '@/integrations/firebase';
import { useOrgSchools } from "@/hooks/useOrganizationQueries";
import { useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { addSchool } from '@/services/novoAdminService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationSchoolsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [newSchool, setNewSchool] = useState({
    name: '',
    schoolCode: '',
    location: '',
    email: '',
    password: '',
    phone: '',
    adminName: '',
    noOfStudents: ''
  });

  const { data: schools = [], isLoading: loading } = useOrgSchools();

  const cities = Array.from(new Set(schools.map(s => s.city))).sort();

  const handleAddSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newSchool.name || !newSchool.email || !newSchool.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in name, email, and password',
        variant: 'destructive'
      });
      return;
    }

    if (!auth.currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a school',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const adminId = userData?.parentAdminId || auth.currentUser.uid;
      const organizationId = userData?.organizationId;

      if (!organizationId) {
        toast({
          title: 'Error',
          description: 'No organization linked to this account',
          variant: 'destructive'
        });
        setSubmitting(false);
        return;
      }

      await addSchool({
        ...newSchool,
        organizationId: organizationId,
        parentAdminId: adminId
      });

      queryClient.invalidateQueries({ queryKey: ['orgSchools'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboardData'] });

      toast({
        title: 'Success',
        description: 'New school added successfully',
      });
      setIsAddDialogOpen(false);
      setNewSchool({
        name: '',
        schoolCode: '',
        location: '',
        email: '',
        password: '',
        phone: '',
        adminName: '',
        noOfStudents: ''
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to add school",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSchool = async () => {
    if (!selectedSchool || !auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const adminId = userData?.parentAdminId || auth.currentUser.uid;
      const organizationId = userData?.organizationId;

      const schoolRef = doc(db, `users/${adminId}/organizations/${organizationId}/schools/${selectedSchool.id}`);
      await updateDoc(schoolRef, {
        name: selectedSchool.name,
        schoolCode: selectedSchool.schoolCode,
        location: selectedSchool.city,
        phone: selectedSchool.phone,
        adminName: selectedSchool.adminName,
        noOfStudents: selectedSchool.noOfStudents
      });

      queryClient.invalidateQueries({ queryKey: ['orgSchools'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboardData'] });

      toast({
        title: 'Success',
        description: 'School details updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedSchool(null);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!auth.currentUser || !window.confirm("Are you sure you want to delete this school?")) return;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const adminId = userData?.parentAdminId || auth.currentUser.uid;
      const organizationId = userData?.organizationId;

      const schoolRef = doc(db, `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`);
      await deleteDoc(schoolRef);

      queryClient.invalidateQueries({ queryKey: ['orgSchools'] });
      queryClient.invalidateQueries({ queryKey: ['orgDashboardData'] });

      toast({
        title: 'Success',
        description: 'School deleted successfully',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (schoolId: string, schoolName: string) => {
    navigate(`/organization/schools/${schoolId}`, {
      state: {
        schoolName: schoolName
      }
    });
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = (school.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === "all" || school.city === filterCity;
    return matchesSearch && matchesCity;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <p className="text-muted-foreground mt-2">Manage all schools in your organization</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button id="org-tour-schools-add">
              <Plus className="h-4 w-4 mr-2" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  placeholder="Enter school name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="schoolCode">School Code</Label>
                <Input
                  id="schoolCode"
                  value={newSchool.schoolCode}
                  onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
                  placeholder="Enter school code (e.g., NOVO001)"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newSchool.location}
                  onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSchool.email}
                  onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  autoComplete="off"
                  placeholder="contact@school.edu"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newSchool.password}
                  onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                  autoComplete="new-password"
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="noOfStudents">Number of Students *</Label>
                <Input
                  id="noOfStudents"
                  type="number"
                  value={newSchool.noOfStudents || ''}
                  onChange={(e) => setNewSchool({ ...newSchool, noOfStudents: e.target.value })}
                  placeholder="Enter number of students"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={newSchool.adminName}
                  onChange={(e) => setNewSchool({ ...newSchool, adminName: e.target.value })}
                  placeholder="Contact person's name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newSchool.phone}
                  onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                  placeholder="+911234567890"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add School'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search schools by name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card id="org-tour-schools-table">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{school.name}</div>
                      <div className="text-xs text-gray-500">{school.schoolCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{school.students}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.teachers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(school.id, school.name)}
                          className="hover:bg-blue-50 text-blue-600 border-blue-100"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedSchool(school);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSchool(school.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSchools.length === 0 && (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-gray-300" />
                <p>No schools found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit School Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEditSchool(); }} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">School Name *</Label>
              <Input
                id="edit-name"
                value={selectedSchool?.name || ''}
                onChange={(e) => setSelectedSchool({ ...selectedSchool, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-schoolCode">School Code</Label>
              <Input
                id="edit-schoolCode"
                value={selectedSchool?.schoolCode || ''}
                onChange={(e) => setSelectedSchool({ ...selectedSchool, schoolCode: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={selectedSchool?.city || ''}
                onChange={(e) => setSelectedSchool({ ...selectedSchool, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-noOfStudents">Number of Students *</Label>
              <Input
                id="edit-noOfStudents"
                type="number"
                value={selectedSchool?.noOfStudents || ''}
                onChange={(e) => setSelectedSchool({ ...selectedSchool, noOfStudents: e.target.value })}
                required
              />
            </div>
            <div className="pt-4 flex gap-2">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
