import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, School, Users, Search, Building2, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import { SimpleTable } from '@/components/ui/simple-table';
import { StatCard } from '@/components/StatCard';
import { addSchool, updateSchool, deleteSchool } from '@/services/novoAdminService';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SchoolsPage = () => {
  interface School {
    id: string;
    name: string;
    schoolCode?: string;
    location: string;
    students: number;
    teachers: number;
    organization?: string; // Made optional
    email?: string;
    phoneNumber?: string;
    fullName?: string;
    noOfStudents?: number;
    password?: string;
  }

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const { toast } = useToast();

  // Load schools from Firestore (both independent and organization schools)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const allSchools: School[] = [];
    const unsubscribers: (() => void)[] = [];

    // Load independent schools directly under admin
    const independentSchoolsUnsub = onSnapshot(
      collection(db, `users/${auth.currentUser.uid}/schools`),
      (snapshot) => {
        const independentSchools = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          location: doc.data().location || '',
          students: doc.data().studentCount || 0,
          teachers: 0,
          organization: 'Independent',
          email: doc.data().email || '',
          phoneNumber: doc.data().phone || '',
          fullName: doc.data().adminName || '',
          noOfStudents: doc.data().studentCount || 0
        }));
        
        // Combine with organization schools
        setSchools(prev => {
          const orgSchools = prev.filter(s => s.organization !== 'Independent');
          return [...independentSchools, ...orgSchools];
        });
      },
      (error) => {
        console.error('[SchoolsPage] Error loading independent schools:', error);
      }
    );
    unsubscribers.push(independentSchoolsUnsub);

    // Load schools from all organizations
    const loadOrgSchools = async () => {
      try {
        const orgsSnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/organizations`));
        
        orgsSnapshot.docs.forEach(orgDoc => {
          const orgId = orgDoc.id;
          const orgName = orgDoc.data().name || '';
          
          const schoolsUnsub = onSnapshot(
            collection(db, `users/${auth.currentUser.uid}/organizations/${orgId}/schools`),
            (snapshot) => {
              const orgSchools = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || '',
                location: doc.data().location || '',
                students: doc.data().studentCount || 0,
                teachers: 0,
                organization: orgName,
                email: doc.data().email || '',
                phoneNumber: doc.data().phone || '',
                fullName: doc.data().adminName || '',
                noOfStudents: doc.data().studentCount || 0
              }));
              
              // Update schools, keeping independent schools and other org schools
              setSchools(prev => {
                const filtered = prev.filter(s => 
                  s.organization === 'Independent' || 
                  (s.organization !== orgName && s.organization !== 'Independent')
                );
                return [...filtered, ...orgSchools];
              });
            },
            (error) => {
              console.error(`[SchoolsPage] Error loading schools for org ${orgId}:`, error);
            }
          );
          unsubscribers.push(schoolsUnsub);
        });
      } catch (error) {
        console.error('[SchoolsPage] Error loading organizations:', error);
      }
    };
    loadOrgSchools();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Load organizations for dropdown from admin's subcollection
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const loadOrganizations = async () => {
      const snapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/organizations`));
      const orgs = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || ''
      }));
      setOrganizations(orgs);
    };
    loadOrganizations();
  }, []);

  interface SchoolFormData {
    name: string;
    schoolCode?: string;
    location: string;
    organization: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    noOfStudents: string;
    password: string;
  }

  const [newSchool, setNewSchool] = useState<SchoolFormData>({ 
    name: '', 
    location: '', 
    organization: '',
    email: '',
    phoneNumber: '',
    fullName: '',
    noOfStudents: '',
    password: ''
  });

  const handleAddSchool = async () => {
    alert('handleAddSchool function called!');
    console.log('[handleAddSchool] Button clicked!', newSchool);
    
    if (!newSchool.name || !newSchool.email || !newSchool.password) {
      console.log('[handleAddSchool] Validation failed');
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[addSchool] Starting school creation...');
      
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      await addSchool({
        name: newSchool.name,
        location: newSchool.location,
        email: newSchool.email,
        password: newSchool.password,
        phone: newSchool.phoneNumber,
        adminName: newSchool.fullName,
        studentCount: newSchool.noOfStudents,
        adminUserId: auth.currentUser.uid,
        organizationId: newSchool.organization || undefined
      });

      toast({
        title: 'Success',
        description: 'School added successfully'
      });

      setNewSchool({ 
        name: '', 
        location: '', 
        organization: '',
        email: '',
        phoneNumber: '',
        fullName: '',
        noOfStudents: '',
        password: ''
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error('[addSchool] Error adding school:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add school',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchool = async () => {
    if (!selectedSchool || !selectedSchool.name || !selectedSchool.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      const updateData: any = {
        schoolId: selectedSchool.id,
        adminUserId: auth.currentUser.uid,
        name: selectedSchool.name,
        location: selectedSchool.location,
        phone: selectedSchool.phoneNumber || '',
        adminName: selectedSchool.fullName || '',
        studentCount: selectedSchool.noOfStudents?.toString() || '0'
      };

      // Include organizationId if school belongs to an organization
      if (selectedSchool.organization && selectedSchool.organization !== 'Independent') {
        // Find organization ID from organizations list
        const org = organizations.find(o => o.name === selectedSchool.organization);
        if (org) {
          updateData.organizationId = org.id;
        }
      }

      await updateSchool(updateData);

      toast({
        title: 'Success',
        description: 'School updated successfully'
      });

      setEditDialogOpen(false);
      setSelectedSchool(null);
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update school',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    if (!selectedSchool) return;

    setLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      const deleteData: any = {
        schoolId: selectedSchool.id,
        adminUserId: auth.currentUser.uid
      };

      // Include organizationId if school belongs to an organization
      if (selectedSchool.organization && selectedSchool.organization !== 'Independent') {
        const org = organizations.find(o => o.name === selectedSchool.organization);
        if (org) {
          deleteData.organizationId = org.id;
        }
      }

      await deleteSchool(deleteData);

      toast({
        title: 'Success',
        description: 'School deleted successfully'
      });

      setDeleteDialogOpen(false);
      setSelectedSchool(null);
      setDeleteConfirmationText('');
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete school',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!schools.length) {
      toast({
        title: 'No data to export',
        description: 'There are no schools available to export.',
        variant: 'destructive'
      });
      return;
    }

    const headers = [
      'School Name',
      'Location',
      'Organization',
      'Email',
      'Phone',
      'Contact Person',
      'No. of Students'
    ];

    const rows = schools.map((school) => [
      school.name || '',
      school.location || '',
      school.organization || 'Independent',
      school.email || '',
      school.phoneNumber || '',
      school.fullName || '',
      (school.noOfStudents ?? 0).toString()
    ]);

    const escapeCSVValue = (value: string) => {
      let v = value || '';
      if (v.includes('"')) {
        v = v.replace(/"/g, '""');
      }
      if (v.includes(',') || v.includes('\n') || v.includes('"')) {
        return `"${v}"`;
      }
      return v;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSVValue).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'schools.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const independentSchools = schools.filter(s => s.organization === 'Independent');
  const organizationSchools = schools.filter(s => s.organization !== 'Independent');
  
  const totalSchools = schools.length;
  const totalStudents = schools.reduce((sum, school) => sum + (school.noOfStudents || 0), 0);

  // Filter schools based on active tab
  const getSchoolsByTab = () => {
    switch (activeTab) {
      case 'independent':
        return independentSchools;
      case 'organization':
        return organizationSchools;
      default:
        return schools;
    }
  };

  const filteredSchools = getSchoolsByTab().filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.phoneNumber?.includes(searchTerm) ||
    school.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'School Name', accessor: 'name' as const },
    { header: 'Location', accessor: 'location' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Phone', accessor: 'phoneNumber' as const },
    { header: 'Full Name', accessor: 'fullName' as const },
    { header: 'No. of Students', accessor: 'noOfStudents' as const },
    {
      header: 'Actions',
      accessor: (row: any) => row.id,
      cell: (id: string, row: School) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/admin/schools/${id}`)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSchool(row);
              setEditDialogOpen(true);
            }}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSchool(row);
              setDeleteDialogOpen(true);
            }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">All Schools</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New School
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
                <DialogDescription>
                  Update the school details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAddSchool(); }} className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                   School Name
                  </Label>
                  <Input
                    id="name"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter school name"
                    required
                  />
                </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schoolCode" className="text-right">
                   School Code
                  </Label>
                  <Input
                    id="schoolCode"
                    value={newSchool.schoolCode || ''}
                    onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter school code"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newSchool.location}
                    onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSchool.email}
                    onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                    className="col-span-3"
                    placeholder="contact@example.com"
                    required
                  />
                

                </div> 
                  <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newSchool.password || ''}
                    onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter password"
                    required
                  />
                </div>  
               
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={newSchool.fullName}
                    onChange={(e) => setNewSchool({ ...newSchool, fullName: e.target.value })}
                    className="col-span-3"
                    placeholder="Contact person's full name"
                    required
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={newSchool.phoneNumber}
                    onChange={(e) => setNewSchool({ ...newSchool, phoneNumber: e.target.value })}
                    className="col-span-3"
                    placeholder="+911234567890"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="noOfStudents" className="text-right">
                    No. of Students
                  </Label>
                  <Input
                    id="noOfStudents"
                    type="number"
                    value={newSchool.noOfStudents || ''}
                    onChange={(e) => setNewSchool({ ...newSchool, noOfStudents: e.target.value })}
                    className="col-span-3"
                    min="0"
                    required
                  />
                </div>
               
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="organization" className="text-right">
                    Organization
                  </Label>
                  <Select
                    value={newSchool.organization || "none"}
                    onValueChange={(value) => setNewSchool({ ...newSchool, organization: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select organization (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Independent School)</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading || !newSchool.name || !newSchool.email || !newSchool.password}
                  >
                    {loading ? 'Adding...' : 'Add School'}
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Schools"
            value={totalSchools.toString()}
            icon={<School className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Independent Schools"
            value={independentSchools.length.toString()}
            icon={<School className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Organization Schools"
            value={organizationSchools.length.toString()}
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            icon={<Users className="h-6 w-6" />}
            color="green"
          />
        </div>

        {/* Tabs and Table */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                  <TabsTrigger value="all">All Schools ({totalSchools})</TabsTrigger>
                  <TabsTrigger value="independent">Independent ({independentSchools.length})</TabsTrigger>
                  <TabsTrigger value="organization">Organization ({organizationSchools.length})</TabsTrigger>
                </TabsList>
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>

              <TabsContent value="all" className="mt-0">
                <SimpleTable 
                  columns={columns} 
                  data={filteredSchools} 
                  keyField="id"
                />
              </TabsContent>

              <TabsContent value="independent" className="mt-0">
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">
                    Showing {filteredSchools.length} independent school{filteredSchools.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <SimpleTable 
                  columns={columns} 
                  data={filteredSchools} 
                  keyField="id"
                />
              </TabsContent>

              <TabsContent value="organization" className="mt-0">
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm font-medium text-indigo-900">
                    Showing {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''} from organizations
                  </p>
                </div>
                <SimpleTable 
                  columns={columns} 
                  data={filteredSchools} 
                  keyField="id"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit School Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
              <DialogDescription>
                Update the school details below.
              </DialogDescription>
            </DialogHeader>
            {selectedSchool && (
              <form onSubmit={(e) => { e.preventDefault(); handleEditSchool(); }} className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">School Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedSchool.name}
                    onChange={(e) => setSelectedSchool({...selectedSchool, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter school name"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-schoolCode" className="text-right">School Code</Label>
                  <Input
                    id="edit-schoolCode"
                    value={selectedSchool.schoolCode || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, schoolCode: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter school code"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">Location</Label>
                  <Input
                    id="edit-location"
                    value={selectedSchool.location}
                    onChange={(e) => setSelectedSchool({...selectedSchool, location: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter location"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-fullName" className="text-right">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={selectedSchool.fullName || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, fullName: e.target.value})}
                    className="col-span-3"
                    placeholder="Contact person's full name"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phoneNumber" className="text-right">Phone</Label>
                  <Input
                    id="edit-phoneNumber"
                    type="tel"
                    value={selectedSchool.phoneNumber || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, phoneNumber: e.target.value})}
                    className="col-span-3"
                    placeholder="+911234567890"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-noOfStudents" className="text-right">No. of Students</Label>
                  <Input
                    id="edit-noOfStudents"
                    type="number"
                    value={selectedSchool.noOfStudents || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, noOfStudents: parseInt(e.target.value) || 0})}
                    className="col-span-3"
                    min="0"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-organization" className="text-right">Organization</Label>
                  <Select
                    value={selectedSchool.organization === 'Independent' ? 'none' : (organizations.find(o => o.name === selectedSchool.organization)?.id || 'none')}
                    onValueChange={(value) => {
                      const orgName = value === 'none' ? 'Independent' : (organizations.find(o => o.id === value)?.name || 'Independent');
                      setSelectedSchool({...selectedSchool, organization: orgName});
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select organization (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Independent School)</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update School'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setDeleteConfirmationText('');
          } else {
            setDeleteDialogOpen(true);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="rounded-full bg-red-100 p-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-center text-lg font-semibold">Delete School</DialogTitle>
              </div>
              <DialogDescription className="text-center">
                <p className="mb-4">Are you sure you want to delete this school?</p>
                <p className="text-sm text-muted-foreground">
                  This will delete {selectedSchool?.name} and all its data including students and teachers. This action cannot be undone.
                </p>
                <p className="mt-4 text-sm">
                  Type <span className="font-mono font-semibold">{selectedSchool?.name}</span> to confirm:
                </p>
                <Input
                  type="text"
                  className={`mt-2 ${deleteConfirmationText !== selectedSchool?.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={selectedSchool?.name || ''}
                  autoComplete="off"
                />
                {deleteConfirmationText !== selectedSchool?.name && deleteConfirmationText.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">The text doesn't match</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteConfirmationText('');
                }}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={deleteConfirmationText !== selectedSchool?.name || loading}
                onClick={handleDeleteSchool}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete School
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SchoolsPage;
