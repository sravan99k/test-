import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Pencil, Trash2, Building2, School, Users, Search, Download, Loader2 } from 'lucide-react';
import { SimpleTable } from '@/components/ui/simple-table';
import { StatCard } from '@/components/StatCard';
import { addOrganization, updateOrganization, deleteOrganization } from '@/services/novoAdminService';
import { collection, onSnapshot, collectionGroup, getDocs } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  type: string;
  schools: number;
  contact: string;
  location?: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
  students: number;
}

const OrganizationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const { toast } = useToast();

  const [newOrg, setNewOrg] = useState({
    name: '',
    type: 'NGO',
    contact: '',
    location: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    schools: 0,
    students: 0
  });

  // Load organizations from Firestore (as subcollections under current admin)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(
      collection(db, `users/${auth.currentUser.uid}/organizations`), 
      async (snapshot) => {
        const orgsPromises = snapshot.docs.map(async (doc) => {
          const orgData = doc.data();
          
          // Fetch schools count for this organization
          const schoolsPath = `users/${auth.currentUser!.uid}/organizations/${doc.id}/schools`;
          const schoolsSnapshot = await getDocs(collection(db, schoolsPath));
          const schoolsCount = schoolsSnapshot.size;
          
          // Count total students across all schools
          let totalStudents = 0;
          for (const schoolDoc of schoolsSnapshot.docs) {
            const studentsPath = `${schoolsPath}/${schoolDoc.id}/students`;
            const studentsSnapshot = await getDocs(collection(db, studentsPath));
            totalStudents += studentsSnapshot.size;
          }
          
          return {
            id: doc.id,
            name: orgData.name || '',
            type: orgData.type || '',
            schools: schoolsCount,
            contact: orgData.email || '',
            location: orgData.location || '',
            fullName: orgData.adminName || '',
            phoneNumber: orgData.phone || '',
            students: totalStudents
          };
        });
        
        const orgs = await Promise.all(orgsPromises);
        setOrganizations(orgs);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddOrganization = async () => {
    if (!newOrg.name || !newOrg.contact || !newOrg.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (name, email, and password)',
        variant: 'destructive'
      });
      return;
    }

    if (newOrg.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }
      
      await addOrganization({
        name: newOrg.name,
        type: newOrg.type,
        location: newOrg.location,
        email: newOrg.contact,
        password: newOrg.password,
        phone: newOrg.phoneNumber,
        adminName: newOrg.fullName,
        adminUserId: auth.currentUser.uid
      });

      toast({
        title: 'Success',
        description: 'Organization added successfully'
      });

      setNewOrg({
        name: '',
        type: 'NGO',
        contact: '',
        location: '',
        fullName: '',
        phoneNumber: '',
        password: '',
        schools: 0,
        students: 0
      });
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding organization:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add organization',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrganization = async () => {
    if (!selectedOrg || !selectedOrg.name || !selectedOrg.contact) {
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
        organizationId: selectedOrg.id,
        adminUserId: auth.currentUser.uid,
        name: selectedOrg.name,
        type: selectedOrg.type,
        location: selectedOrg.location,
        phone: selectedOrg.phoneNumber || '',
        adminName: selectedOrg.fullName || ''
      };

      await updateOrganization(updateData);

      toast({
        title: 'Success',
        description: 'Organization updated successfully'
      });

      setEditDialogOpen(false);
      setSelectedOrg(null);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg) return;

    setLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      await deleteOrganization({
        organizationId: selectedOrg.id,
        adminUserId: auth.currentUser.uid
      });

      toast({
        title: 'Success',
        description: 'Organization and all its schools deleted successfully'
      });

      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      setDeleteConfirmationText('');
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete organization',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!auth.currentUser) {
      toast({
        title: 'Error',
        description: 'Not authenticated',
        variant: 'destructive'
      });
      return;
    }

    try {
      const adminId = auth.currentUser.uid;
      const orgsSnapshot = await getDocs(collection(db, `users/${adminId}/organizations`));

      if (orgsSnapshot.empty) {
        toast({
          title: 'No data to export',
          description: 'There are no organizations to export.',
          variant: 'destructive'
        });
        return;
      }

      const headers = [
        'Organization Name',
        'Organization Type',
        'Organization Location',
        'Organization Email',
        'Organization Phone',
        'Organization Contact Person',
        'School Name',
        'School Code',
        'School Location',
        'School Email',
        'School Phone',
        'School Contact Person',
        'School Student Count'
      ];

      const rows: string[][] = [];

      for (const orgDoc of orgsSnapshot.docs) {
        const orgData = orgDoc.data() as any;

        const orgName = orgData.name || '';
        const orgType = orgData.type || '';
        const orgLocation = orgData.location || '';
        const orgEmail = orgData.email || '';
        const orgPhone = orgData.phone || '';
        const orgAdminName = orgData.adminName || '';

        const schoolsPath = `users/${adminId}/organizations/${orgDoc.id}/schools`;
        const schoolsSnapshot = await getDocs(collection(db, schoolsPath));

        if (schoolsSnapshot.empty) {
          rows.push([
            orgName,
            orgType,
            orgLocation,
            orgEmail,
            orgPhone,
            orgAdminName,
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ]);
        } else {
          schoolsSnapshot.forEach((schoolDoc) => {
            const schoolData = schoolDoc.data() as any;

            rows.push([
              orgName,
              orgType,
              orgLocation,
              orgEmail,
              orgPhone,
              orgAdminName,
              schoolData.name || '',
              schoolData.schoolCode || '',
              schoolData.location || '',
              schoolData.email || '',
              schoolData.phone || '',
              schoolData.adminName || '',
              (schoolData.studentCount ?? 0).toString()
            ]);
          });
        }
      }

      if (!rows.length) {
        toast({
          title: 'No data to export',
          description: 'There are no organizations or schools to export.',
          variant: 'destructive'
        });
        return;
      }

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
      link.setAttribute('download', 'organizations-with-schools.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[OrganizationsPage] Error exporting organizations CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to export organizations CSV',
        variant: 'destructive'
      });
    }
  };

  // Calculate statistics
  const totalOrganizations = organizations.length;
  const totalSchools = organizations.reduce((sum, org) => sum + org.schools, 0);
  const totalStudents = organizations.reduce((sum, org) => sum + org.students, 0);

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.phoneNumber?.includes(searchTerm) ||
    org.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Location', accessor: 'location' as const },
    { header: 'Contact', accessor: 'contact' as const },
    { header: 'No of Schools', accessor: 'schools' as const },
    {
      header: 'Actions',
      accessor: (row: Organization) => row.id,
      cell: (id: string, row: Organization) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/organizations/${row.id}`)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOrg(row);
              setEditDialogOpen(true);
            }}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedOrg(row);
              setDeleteDialogOpen(true);
            }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Delete
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
            <h1 className="text-2xl font-bold">Organizations</h1>
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
                  Add New Organization
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Organization</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Organization Name
                  </Label>
                  <Input
                    id="name"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <select
                    id="type"
                    value={newOrg.type}
                    onChange={(e) => setNewOrg({...newOrg, type: e.target.value})}
                    className="col-span-3 p-2 border rounded"
                  >
                    <option value="NGO">NGO</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newOrg.location}
                    onChange={(e) => setNewOrg({...newOrg, location: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter location"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="contact"
                    type="email"
                    value={newOrg.contact}
                    onChange={(e) => setNewOrg({...newOrg, contact: e.target.value})}
                    className="col-span-3"
                    placeholder="contact@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newOrg.password}
                    onChange={(e) => setNewOrg({...newOrg, password: e.target.value})}
                    className="col-span-3"
                    placeholder="Minimum 6 characters"
                    minLength={6}
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
                    value={newOrg.phoneNumber}
                    onChange={(e) => setNewOrg({...newOrg, phoneNumber: e.target.value})}
                    className="col-span-3"
                    placeholder="+911234567890"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={newOrg.fullName}
                    onChange={(e) => setNewOrg({...newOrg, fullName: e.target.value})}
                    className="col-span-3"
                    placeholder="Contact person's full name"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleAddOrganization} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading || !newOrg.name || !newOrg.contact || !newOrg.password}
                  >
                    {loading ? 'Adding...' : 'Add Organization'}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Organizations"
            value={totalOrganizations.toString()}
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Total Schools"
            value={totalSchools.toString()}
            icon={<School className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            icon={<Users className="h-6 w-6" />}
            color="purple"
          />
        </div>

        {/* Search and Table */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full md:w-[300px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SimpleTable 
              columns={columns} 
              data={filteredOrgs} 
              keyField="id"
            />
          </CardContent>
        </Card>

        {/* Edit Organization Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>
                Update the organization details below.
              </DialogDescription>
            </DialogHeader>
            {selectedOrg && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Organization Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedOrg.name}
                    onChange={(e) => setSelectedOrg({...selectedOrg, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">
                    Type
                  </Label>
                  <select
                    id="edit-type"
                    value={selectedOrg.type}
                    onChange={(e) => setSelectedOrg({...selectedOrg, type: e.target.value})}
                    className="col-span-3 p-2 border rounded"
                  >
                    <option value="NGO">NGO</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={selectedOrg.location || ''}
                    onChange={(e) => setSelectedOrg({...selectedOrg, location: e.target.value})}
                    className="col-span-3"
                    placeholder="Enter location"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={selectedOrg.phoneNumber || ''}
                    onChange={(e) => setSelectedOrg({...selectedOrg, phoneNumber: e.target.value})}
                    className="col-span-3"
                    placeholder="+911234567890"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-fullName" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="edit-fullName"
                    value={selectedOrg.fullName || ''}
                    onChange={(e) => setSelectedOrg({...selectedOrg, fullName: e.target.value})}
                    className="col-span-3"
                    placeholder="Contact person's full name"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleEditOrganization} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Organization'}
                  </Button>
                </div>
              </div>
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
              <DialogTitle className="text-center text-lg font-semibold">Delete Organization</DialogTitle>
            </div>
            <DialogDescription className="text-center">
              <p className="mb-4">Are you sure you want to delete this organization?</p>
              <p className="text-sm text-muted-foreground">
                This will delete {selectedOrg?.name} and all its schools. This action cannot be undone.
              </p>
              <p className="mt-4 text-sm">
                Type <span className="font-mono font-semibold">{selectedOrg?.name}</span> to confirm:
              </p>
              <Input
                type="text"
                className={`mt-2 ${deleteConfirmationText !== selectedOrg?.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={selectedOrg?.name || ''}
                autoComplete="off"
              />
              {deleteConfirmationText !== selectedOrg?.name && deleteConfirmationText.length > 0 && (
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
              disabled={deleteConfirmationText !== selectedOrg?.name || loading}
              onClick={handleDeleteOrganization}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Organization
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

export default OrganizationsPage;