import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Footer from "@/components/Footer";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  Search,
  SlidersHorizontal,
  XCircle
} from "lucide-react";

// Helper function to format dates
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Define types at the top level
type AlertType = 'high_risk' | 'intervention' | 'system';
type PriorityType = 'high' | 'medium' | 'low';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  studentName?: string;
  date: Date;
  read: boolean;
  priority: PriorityType;
}

interface AlertListProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
  selectedAlerts: string[];
  onToggleSelect: (id: string) => void;
  getTypeIcon: (type: AlertType) => React.ReactNode;
  getPriorityBadge: (priority: PriorityType) => React.ReactNode;
}

interface BadgeProps {
  variant: 'outline' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

interface ButtonProps {
  variant: 'outline' | 'ghost';
  size: 'sm';
  onClick: () => void;
  children: React.ReactNode;
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: () => void;
  className?: string;
}

interface InputProps {
  type: 'search';
  placeholder: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TabsProps {
  defaultValue: string;
  className?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export default function AlertsPage() {
  // State and other logic remains the same
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'high_risk',
      title: 'High Risk Behavior Detected',
      description: 'Student has shown signs of severe distress in recent assessment.',
      studentName: 'Rahul Sharma',
      date: new Date('2025-06-29T14:30:00'),
      read: false,
      priority: 'high'
    },

    {
      id: '3',
      type: 'system',
      title: 'New Feature Available',
      description: 'Check out the new reporting dashboard with advanced analytics.',
      date: new Date('2025-06-27T09:00:00'),
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'intervention',
      title: 'Follow-up Required',
      description: 'Student has completed the initial assessment. Schedule a follow-up.',
      studentName: 'Anjali Verma',
      date: new Date('2025-06-26T16:45:00'),
      read: true,
      priority: 'medium'
    },
  ]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'high_risk' && alert.type === 'high_risk') ||
      (activeTab === 'intervention' && alert.type === 'intervention') ||
      (activeTab === 'system' && alert.type === 'system');

    return matchesSearch && matchesTab;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const highRiskCount = alerts.filter(alert => alert.type === 'high_risk' && !alert.read).length;
  const interventionCount = alerts.filter(alert => alert.type === 'intervention' && !alert.read).length;

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markSelectedAsRead = () => {
    setAlerts(alerts.map(alert =>
      selectedAlerts.includes(alert.id) ? { ...alert, read: true } : alert
    ));
    setSelectedAlerts([]);
  };

  const toggleSelectAlert = (id: string) => {
    setSelectedAlerts(prev =>
      prev.includes(id)
        ? prev.filter(alertId => alertId !== id)
        : [...prev, id]
    );
  };

  const getPriorityBadge = (priority: PriorityType) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="ml-2">Medium</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">Low</Badge>;
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'high_risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'intervention':
        return <MessageSquareWarning className="w-5 h-5 text-amber-500" />;
      default:
        return <BellRing className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}`
                  : 'All caught up!'}
              </p>
            </div>
            <div className="flex space-x-2">
              {selectedAlerts.length > 0 && (
                <Button variant="outline" onClick={markSelectedAsRead}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as read
                </Button>
              )}
              <Button variant="outline">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Tabs
                  id="alerts-tabs"
                  defaultValue="all"
                  className="w-full"
                  onValueChange={setActiveTab}
                >
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="all">All Alerts</TabsTrigger>
                      <TabsTrigger value="high_risk" className="flex items-center">
                        High Risk
                        {highRiskCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {highRiskCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="intervention" className="flex items-center">
                        Interventions
                        {interventionCount > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {interventionCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search alerts..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <TabsContent value="all" className="mt-6">
                    <AlertList
                      alerts={filteredAlerts}
                      onMarkAsRead={markAsRead}
                      selectedAlerts={selectedAlerts}
                      onToggleSelect={toggleSelectAlert}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                    />
                  </TabsContent>
                  <TabsContent value="high_risk" className="mt-6">
                    <AlertList
                      alerts={filteredAlerts.filter(a => a.type === 'high_risk')}
                      onMarkAsRead={markAsRead}
                      selectedAlerts={selectedAlerts}
                      onToggleSelect={toggleSelectAlert}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                    />
                  </TabsContent>
                  <TabsContent value="intervention" className="mt-6">
                    <AlertList
                      alerts={filteredAlerts.filter(a => a.type === 'intervention')}
                      onMarkAsRead={markAsRead}
                      selectedAlerts={selectedAlerts}
                      onToggleSelect={toggleSelectAlert}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                    />
                  </TabsContent>
                  <TabsContent value="system" className="mt-6">
                    <AlertList
                      alerts={filteredAlerts.filter(a => a.type === 'system')}
                      onMarkAsRead={markAsRead}
                      selectedAlerts={selectedAlerts}
                      onToggleSelect={toggleSelectAlert}
                      getTypeIcon={getTypeIcon}
                      getPriorityBadge={getPriorityBadge}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}

function AlertList({
  alerts,
  onMarkAsRead,
  selectedAlerts,
  onToggleSelect,
  getTypeIcon,
  getPriorityBadge
}: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BellRing className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No alerts found</h3>
        <p className="text-sm text-muted-foreground">
          When new alerts appear, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(
            "relative overflow-hidden transition-all hover:shadow-md",
            !alert.read && "border-l-4 border-l-primary"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-0.5">
                <Checkbox
                  id={`select-${alert.id}`}
                  checked={selectedAlerts.includes(alert.id)}
                  onCheckedChange={() => onToggleSelect(alert.id)}
                  className="h-4 w-4 rounded"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTypeIcon(alert.type)}
                    <h3 className="ml-2 font-medium">
                      {alert.title}
                      {/* Priority badge removed due to type conflict */}
                    </h3>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(alert.date)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alert.description}
                </p>
                {alert.studentName && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Student: {alert.studentName}
                    </Badge>
                  </div>
                )}
                <div className="mt-3 flex space-x-2">
                  {!alert.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsRead(alert.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    View details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
