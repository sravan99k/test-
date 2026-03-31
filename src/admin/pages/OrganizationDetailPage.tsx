import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { SimpleTable } from '@/components/ui/simple-table';
import { addSchool, updateSchool, deleteSchool } from '@/services/novoAdminService';
import { collection, doc, getDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const OrganizationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [organization, setOrganization] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const { toast } = useToast();

  // Load organization data from admin's subcollection
  useEffect(() => {
    if (!id || !user?.uid) return;
    const loadOrganization = async () => {
      const orgDoc = await getDoc(doc(db, `users/${user.uid}/organizations/${id}`));
      if (orgDoc.exists()) {
        setOrganization({ id: orgDoc.id, ...orgDoc.data() });
      }
    };
    loadOrganization();
  }, [id, user]);

  // Load schools from organization's subcollection with real counts
  useEffect(() => {
    if (!id || !user?.uid) return;
    
    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/organizations/${id}/schools`),
      async (snapshot) => {
        const schoolsPromises = snapshot.docs.map(async (schoolDoc) => {
          const schoolId = schoolDoc.id;
          const schoolData = schoolDoc.data();
          
          // Count students
          const studentsPath = `users/${user.uid}/organizations/${id}/schools/${schoolId}/students`;
          const studentsSnapshot = await getDocs(collection(db, studentsPath));
          const studentCount = studentsSnapshot.size;
          
          // Count teachers
          const teachersPath = `users/${user.uid}/organizations/${id}/schools/${schoolId}/teachers`;
          const teachersSnapshot = await getDocs(collection(db, teachersPath));
          const teacherCount = teachersSnapshot.size;
          
          return {
            id: schoolId,
            name: schoolData.name || '',
            location: schoolData.location || '',
            email: schoolData.email || '',
            phone: schoolData.phone || '',
            adminName: schoolData.adminName || '',
            schoolCode: schoolData.schoolCode || '',
            studentCount: schoolData.studentCount || 0,
            students: studentCount,
            teachers: teacherCount,
            type: organization?.type || ''
          };
        });
        
        const schoolsData = await Promise.all(schoolsPromises);
        setSchools(schoolsData);
      }
    );
    return () => unsubscribe();
  }, [id, user, organization]);


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

  const handleAddSchool = async () => {
    console.log('[handleAddSchool] Button clicked on OrganizationDetailPage!', newSchool);
    
    if (!newSchool.name || !newSchool.email || !newSchool.password) {
      console.log('[handleAddSchool] Validation failed');
      toast({
        title: 'Validation Error',
        description: 'Please fill in name, email, and password',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid || !id) {
        throw new Error('Missing user or organization ID');
      }
      
      console.log('[addSchool] Starting school creation...');
      
      // Use the secure addSchool function from novoAdminService
      await addSchool({
        name: newSchool.name,
        location: newSchool.location,
        email: newSchool.email,
        password: newSchool.password,
        phone: newSchool.phone,
        adminName: newSchool.adminName,
        studentCount: '0',
        adminUserId: user.uid,
        organizationId: id
      });

      toast({
        title: 'Success',
        description: 'School added successfully'
      });

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

  const handleViewSchoolDetails = (schoolId: string, schoolName: string) => {
    navigate(`/admin/schools/${schoolId}`, {
      state: {
        organizationId: id,
        organizationName: organization?.name
      }
    });
  };

  const handleEditSchool = async () => {
    if (!selectedSchool || !selectedSchool.name) {
      toast({
        title: 'Validation Error',
        description: 'School name is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid || !id) {
        throw new Error('Missing user or organization ID');
      }

      await updateSchool({
        schoolId: selectedSchool.id,
        adminUserId: user.uid,
        organizationId: id,
        name: selectedSchool.name,
        location: selectedSchool.location,
        adminName: selectedSchool.adminName,
        studentCount: selectedSchool.studentCount,
        schoolCode: selectedSchool.schoolCode,
      });

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
      if (!user?.uid || !id) {
        throw new Error('Missing user or organization ID');
      }

      await deleteSchool({
        schoolId: selectedSchool.id,
        adminUserId: user.uid,
        organizationId: id
      });

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

  const schoolColumns = [
    { header: 'School Name', accessor: 'name' as const },
    { header: 'Location', accessor: 'location' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Phone', accessor: 'phone' as const },
    { header: 'Admin Name', accessor: 'adminName' as const },
    { header: 'Students', accessor: 'students' as const },
    { header: 'Teachers', accessor: 'teachers' as const },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/organizations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{organization?.name || 'Loading...'}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{organization?.type || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{organization?.email || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Phone:</span>
                <span>{organization?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Contact Person:</span>
                <span>{organization?.adminName || '-'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{schools.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Schools</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add School
                    </Button>
                  </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New School</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); handleAddSchool(); }} className="space-y-4">
                        <div>
                          <Label>School Name *</Label>
                          <Input
                            value={newSchool.name}
                            onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                            placeholder="Enter school name"
                            required
                          />
                        </div>
                        <div>
                          <Label>School Code</Label>
                          <Input
                            value={newSchool.schoolCode}
                            onChange={(e) => setNewSchool({ ...newSchool, schoolCode: e.target.value })}
                            placeholder="Enter school code (e.g., NOVO001)"
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={newSchool.location}
                            onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={newSchool.email}
                            onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                            autoComplete="off"
                            placeholder="contact@school.edu"
                            required
                          />
                        </div>
                        <div>
                          <Label>Password *</Label>
                          <Input
                            type="password"
                            value={newSchool.password}
                            onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })}
                            autoComplete="new-password"
                            placeholder="Enter password"
                            required
                          />
                        </div>
                        <div>
                          <Label>Number of Students</Label>
                          <Input
                            type="number"
                            value={newSchool.noOfStudents}
                            onChange={(e) => setNewSchool({ ...newSchool, noOfStudents: e.target.value })}
                            placeholder="Enter number of students"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            type="tel"
                            value={newSchool.phone}
                            onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                            placeholder="+911234567890"
                          />
                        </div>
                        <div>
                          <Label>Admin Name</Label>
                          <Input
                            value={newSchool.adminName}
                            onChange={(e) => setNewSchool({ ...newSchool, adminName: e.target.value })}
                            placeholder="Contact person's name"
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Adding...' : 'Add School'}
                        </Button>
                      </form>
                </DialogContent>
              </Dialog>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {schoolColumns.map((col) => (
                        <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.adminName || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.students}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.teachers}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/schools/${school.id}`, { state: { organizationId: id, organizationName: organization?.name } })}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSchool(school);
                                setEditDialogOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSchool(school);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit School Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit School</DialogTitle>
            </DialogHeader>
            {selectedSchool && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-school-name" className="text-right">School Name</Label>
                  <Input
                    id="edit-school-name"
                    value={selectedSchool.name}
                    onChange={(e) => setSelectedSchool({...selectedSchool, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-school-code" className="text-right">School Code</Label>
                  <Input
                    id="edit-school-code"
                    value={selectedSchool.schoolCode || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, schoolCode: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-school-location" className="text-right">Location</Label>
                  <Input
                    id="edit-school-location"
                    value={selectedSchool.location}
                    onChange={(e) => setSelectedSchool({...selectedSchool, location: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-school-fullname" className="text-right">Full Name</Label>
                  <Input
                    id="edit-school-fullname"
                    value={selectedSchool.adminName || ''}
                    onChange={(e) => setSelectedSchool({...selectedSchool, adminName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-school-students" className="text-right">No of Students</Label>
                  <Input
                    id="edit-school-students"
                    type="number"
                    min="0"
                    value={selectedSchool.studentCount ?? 0}
                    onChange={(e) => setSelectedSchool({...selectedSchool, studentCount: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleEditSchool} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update School'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete School Confirmation Dialog */}
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

export default OrganizationDetailPage;