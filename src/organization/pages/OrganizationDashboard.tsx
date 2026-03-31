import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, Users, GraduationCap, AlertCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useOrgInfo, useOrgDashboardData } from '@/hooks/useOrganizationQueries';

export default function OrganizationDashboard() {
  const { data: orgInfo, isLoading: isOrgLoading } = useOrgInfo();
  const { data: dashboardData, isLoading: isDashboardLoading } = useOrgDashboardData();
  const location = useLocation();
  const isFromLogin = location.state?.fromLogin;

  if ((isOrgLoading || isDashboardLoading) && !isFromLogin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  const organizationName = orgInfo?.name || 'Organization';

  const stats = [
    {
      title: "Total Schools",
      value: (dashboardData?.totalSchools || 0).toString(),
      change: `${dashboardData?.totalSchools || 0} school${dashboardData?.totalSchools !== 1 ? 's' : ''} in network`,
      icon: School,
      color: "text-blue-500",
      link: "/organization/schools"
    },
    {
      title: "Total Students",
      value: new Intl.NumberFormat().format(dashboardData?.totalStudents || 0),
      change: `Across all schools`,
      icon: GraduationCap,
      color: "text-green-500",
      link: "/organization/students"
    },
    {
      title: "Total Teachers",
      value: new Intl.NumberFormat().format(dashboardData?.totalTeachers || 0),
      change: `Active educators`,
      icon: Users,
      color: "text-purple-500",
      link: "/organization/teachers"
    },
  ];

  const recentAlerts = dashboardData?.schoolsData
    ?.filter(s => s.highRisk > 0)
    ?.slice(0, 3)
    ?.map(s => ({
      school: s.name,
      message: `${s.highRisk} high-risk student${s.highRisk > 1 ? 's' : ''} identified`,
      severity: s.highRisk > 5 ? 'high' : s.highRisk > 2 ? 'medium' : 'low'
    })) || [];

  const topSchools = [...(dashboardData?.schoolsData || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 id="org-tour-welcome" className="text-3xl font-bold">Welcome, {organizationName}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your network of schools and monitor student wellbeing across all institutions
        </p>
      </div>

      {/* Stats Grid */}
      <div id="org-tour-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card id="org-tour-alerts" className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                    <AlertCircle className={`h-5 w-5 shrink-0 ${alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{alert.school}</div>
                      <p className="text-sm text-muted-foreground truncate">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground">
                <p>No recent alerts found</p>
              </div>
            )}
            <div className="mt-auto pt-6 text-left">
              <Link to="/organization/alerts" className="text-sm text-blue-500 hover:underline">
                View all alerts
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* School Performance Overview */}
        <Card id="org-tour-performance" className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Top Performing Schools</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="space-y-4">
              {topSchools.map((school, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-semibold">{school.name}</div>
                    <p className="text-sm text-muted-foreground">{school.students} students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{school.score}</div>
                    <p className="text-xs text-muted-foreground">Wellness Score</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 text-left">
              <Link to="/organization/schools" className="text-sm text-blue-500 hover:underline">
                Manage all schools
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
