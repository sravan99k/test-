import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, School, Users } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const [stats, setStats] = useState([
    { title: 'Total Organizations', value: '0', icon: Building2, color: 'text-blue-600' },
    { title: 'Independent Schools', value: '0', icon: School, color: 'text-green-600' },
    { title: 'Organization Schools', value: '0', icon: School, color: 'text-purple-600' },
    { title: 'Total Students', value: '0', icon: Users, color: 'text-amber-600' },
  ]);

  // Fetch school, organization, and student counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (!auth.currentUser) return;
      try {
        const uid = auth.currentUser.uid;

        // Fire all top-level queries in parallel
        const [independentSchoolsSnapshot, orgsSnapshot] = await Promise.all([
          getDocs(collection(db, `users/${uid}/schools`)),
          getDocs(collection(db, `users/${uid}/organizations`)),
        ]);

        // Compute independent students immediately
        const independentStudents = independentSchoolsSnapshot.docs.reduce((sum, d) => sum + (d.data().studentCount || 0), 0);

        // Prepare all organization school queries, then fetch in parallel
        const orgSchoolQueries = orgsSnapshot.docs.map((orgDoc) =>
          getDocs(collection(db, `users/${uid}/organizations/${orgDoc.id}/schools`))
        );
        const orgSchoolsSnapshots = await Promise.all(orgSchoolQueries);

        // Aggregate org schools count and students
        const orgSchoolsCount = orgSchoolsSnapshots.reduce((acc, snap) => acc + snap.size, 0);
        const orgStudentsCount = orgSchoolsSnapshots.reduce(
          (acc, snap) => acc + snap.docs.reduce((sum, schoolDoc) => sum + (schoolDoc.data().studentCount || 0), 0),
          0
        );

        const totalStudents = independentStudents + orgStudentsCount;

        setStats([
          { ...stats[0], value: orgsSnapshot.size.toString() },
          { ...stats[1], value: independentSchoolsSnapshot.size.toString() },
          { ...stats[2], value: orgSchoolsCount.toString() },
          { ...stats[3], value: totalStudents.toLocaleString() },
        ]);
      } catch (error) {
        console.error('Error fetching counts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load school and organization data',
          variant: 'destructive',
        });
      }
    };
    
    fetchCounts();
  }, [auth.currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/organizations')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organizations Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage NGOs and other organizations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/schools')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Schools Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and manage all schools</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;