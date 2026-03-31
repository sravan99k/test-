import React from "react";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchBar from "@/components/SearchBar";
import {
  Home,
  ClipboardList,
  School,
  BookOpen,
  User,
  LogOut,
  Settings,
  Bell,
  Users,
  BarChart3,
  FileText,
  TrendingUp,
  Heart,
  ShieldCheck,
  Brain,
  Gamepad2,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  MessageSquareWarning,
  BellRing,
  Shield,
  GraduationCap,
  CreditCard,
  Flame,
  Sun,
  Calendar
} from "lucide-react";
import { useAuthFirebase } from "@/hooks/useAuthFirebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  id?: string;
  badge?: number;
  subItems?: { name: string; path: string; id?: string; icon?: React.ComponentType<{ className?: string }> }[];
}

// Custom Icon for Wellness (Heart + Sparkle)
const WellnessIcon = ({ className }: { className?: string }) => (
  <div className="relative flex items-center justify-center">
    <Heart className={className} />
  </div>
);

const NavItem = ({
  item,
  isActive,
  isMobile = false,
  onNavigate
}: {
  item: MenuItemProps;
  isActive: boolean;
  isMobile?: boolean;
  onNavigate?: (e: React.MouseEvent) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = item.icon;

  const content = (
    <div className={cn(
      "flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
      isActive
        ? "bg-blue-50 text-blue-700 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      isMobile ? "py-3" : "py-2"
    )}>
      <div className="flex items-center">
        <div className={cn(
          "p-2 rounded-lg mr-3 transition-colors",
          isActive ? "bg-white text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold">{item.name}</span>
      </div>

      {item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="ml-2 rounded-full px-2">
          {item.badge}
        </Badge>
      )}

      {hasSubItems && (
        <ChevronDown className={cn(
          "w-4 h-4 ml-2 transition-transform duration-200 text-slate-400",
          isOpen ? "transform rotate-180" : ""
        )} />
      )}
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      onNavigate(e);
    }

    // Close the mobile menu if open
    const mobileMenu = document.querySelector('[data-state="open"]');
    if (mobileMenu && isMobile) {
      (mobileMenu as HTMLElement).click();
    }
  };

  if (hasSubItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild className="w-full">
          <div className="cursor-pointer">
            {content}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1 border-l-2 border-slate-100 ml-4">
          {item.subItems?.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors",
                isActive ? "bg-blue-50/50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
              onClick={handleClick}
            >
              {subItem.icon && (
                <subItem.icon className="w-4 h-4 mr-2 opacity-70" />
              )}
              {subItem.name}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={item.path}
      id={item.id}
      className="block"
      onClick={(e) => {
        if (onNavigate) {
          onNavigate(e);
        }
        const mobileMenu = document.querySelector('[data-state="open"]');
        if (mobileMenu && isMobile) {
          (mobileMenu as HTMLElement).click();
        }
      }}
    >
      {content}
    </Link>
  );
};

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { user, logout, loading } = useAuthFirebase();
  const { toast } = useToast();

  const userRole = (user?.role as 'student' | 'management' | 'teacher' | 'admin' | 'organization' | undefined) || 'student';

  const { isManagement, isStudent, isTeacher, isAdmin, isOrganization } = useMemo(
    () => ({
      isManagement: userRole === 'management',
      isStudent: userRole === 'student',
      isTeacher: userRole === 'teacher',
      isAdmin: userRole === 'admin',
      isOrganization: userRole === 'organization'
    }),
    [userRole]
  );

  interface HeaderNavItem {
    name: string;
    path: string;
    id?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }

  const headerNavItems = useMemo<HeaderNavItem[]>(() => {
    if (loading) return []; // Return empty while loading to prevent role flashing

    if (isAdmin) {
      return [
        { name: "Dashboard", path: "/admin", icon: Home },
        { name: "Organizations", path: "/admin/organizations", icon: Users },
        { name: "Schools", path: "/admin/schools", icon: School },
      ];
    }

    if (isOrganization) {
      return [
        { name: "Dashboard", path: "/organization-dashboard", icon: Home },
        { name: "Schools", path: "/organization/schools", icon: School },
      ];
    }

    if (isTeacher) {
      return [
        { name: "Dashboard", path: "/teacher/dashboard", icon: Home },
        { name: "Student List", path: "/teacher/students", icon: Users },
        { name: "Assessments", path: "/teacher/assessments", icon: ClipboardList },
        { name: "Resources", path: "/teacher/resources", icon: BookOpen },
      ];
    }

    if (isManagement) {
      return [
        { name: "Home", path: "/", icon: Home },
        { name: "Management", path: "/management", icon: BarChart3 },
        { name: "Assessments", path: "/management/assessments", icon: ClipboardList },
      ];
    }

    // Default for students - Updated for cleaner, friendlier UI
    return [
      { name: "Home", path: "/", icon: Home },
      { name: "Wellness", path: "/wellness-dashboard", icon: WellnessIcon }, // Custom Heart+Sparkle Icon
      { name: "Cognitive Tasks", path: "/cognitive-tasks", id: "nav-cognitive-tasks", icon: Gamepad2 },
      { name: "Resources", path: "/resources", id: "nav-resources", icon: BookOpen },
    ];
  }, [isAdmin, isOrganization, isTeacher, isManagement, loading]);

  // Sidebar/Mobile logic remains similar but updated visually via NavItem
  const navItems = useMemo(() => {
    if (loading) return []; // Return empty while loading to prevent role flashing

    const commonItems = [
      { name: "Home", path: "/", icon: Home },
      { name: "Wellness", path: "/wellness-dashboard", icon: WellnessIcon },
      { name: "Cognitive Tasks", path: "/cognitive-tasks", id: "nav-cognitive-tasks", icon: Gamepad2 },
      { name: "Resources", path: "/resources", id: "nav-resources", icon: BookOpen },
    ];

    if (userRole === 'admin') {
      return [
        { name: "Dashboard", path: "/admin", icon: Home },
        { name: "Organizations", path: "/admin/organizations", icon: Users },
        { name: "Schools", path: "/admin/schools", icon: School },
      ];
    } else if (userRole === 'management') {
      return [
        { name: "Home", path: "/", icon: Home },
        { name: "Management", path: "/management", icon: BarChart3 },
        { name: "Assessments", path: "/management/assessments", icon: ClipboardList },
      ];
    }

    if (userRole === 'teacher') {
      return [
        { name: "Dashboard", path: "/teacher/dashboard", icon: Home },
        { name: "Student List", path: "/teacher/students", icon: Users },
        { name: "Assessments", path: "/teacher/assessments", icon: ClipboardList },
        { name: "Resources", path: "/teacher/resources", icon: BookOpen },
      ];
    }

    return commonItems;
  }, [userRole, loading]);

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (path.startsWith('/school-dashboard') && userRole !== 'management') {
      e.preventDefault();
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      return;
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    if (path === '/admin') return location.pathname === path || location.pathname === '/admin/';
    if (path === '/management/students') return location.pathname === path || location.pathname.startsWith('/management/students/');
    if (path === '/wellness-dashboard') return location.pathname.startsWith('/wellness') || location.pathname === '/wellness-dashboard';
    if (path === '/management') return location.pathname === path || location.pathname === '/management/' || location.pathname === '/school-dashboard';
    if (path === '/school-dashboard') return location.pathname === '/school-dashboard' || location.pathname === '/management';
    // Check for exact match with query strings
    const currentPathWithQuery = location.pathname + location.search;
    if (path.includes('?')) {
      return currentPathWithQuery === path;
    }

    return location.pathname.startsWith(path);
  };

  const studentMenuItems = [
    { name: "My Dashboard", path: "/student-dashboard", icon: BarChart3 },
    // { name: "Progress Tracking", path: "/progress-tracking", icon: TrendingUp },
    { name: "Career Counseling", path: "/career-counseling", icon: Users },
    { name: "BuddySafe", path: "/buddysafe", id: "nav-buddysafe", icon: ShieldCheck },
  ];

  const managementMenuItems = [
    {
      name: "Alerts & Notifications",
      path: "/alerts",
      icon: Bell,
      badge: 3,
      subItems: [
        { name: "High Risk Alerts", path: "/alerts/high-risk", icon: AlertTriangle },
        { name: "Intervention Updates", path: "/alerts/interventions", icon: MessageSquareWarning },
        { name: "System Notifications", path: "/alerts/system", icon: BellRing },
      ]
    },
  ];

  const teacherProfileItems = [
    { name: "FAQ", path: "/teacher/faq", icon: HelpCircle },
    { name: "Plan Activity", path: "/teacher/activities", icon: Calendar },
   
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully", description: "See you next time!", duration: 2000 });
    } catch (error) {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive", duration: 2000 });
    }
  };

  const userInitials = useMemo(() => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }, [user?.displayName, user?.email]);

  const userName = useMemo(() => {
    return user?.demographics?.name || user?.displayName || user?.email || "User";
  }, [user?.demographics?.name, user?.displayName, user?.email]);

  if (location.pathname === '/auth') return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0 transition-transform hover:scale-105 duration-200">
            <Link to="/">
              <img src="/logo.png" alt="Novo Wellness" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation - Absolutely Centered & Airy */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-1">
              {headerNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    id={item.id}
                    className={cn(
                      "flex items-center px-3 py-2 text-[14px] font-semibold rounded-full transition-all duration-300",
                      active
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                        : "text-slate-500 hover:text-blue-600 hover:bg-white/80"
                    )}
                    onClick={(e) => handleNavigation(e, item.path)}
                  >
                    {Icon && <Icon className={cn("h-4.5 w-4.5 mr-2", active ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500")} />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions - Visible on Desktop, Modified for Mobile */}
          <div className="flex items-center gap-3 md:gap-4">

          

            {/* Profile Section - First from left */}
            {!user ? (
              <Link to="/auth">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            ) : (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="onboarding-profile-trigger"
                    variant="ghost"
                    className="relative h-9 w-9 md:h-10 md:w-10 rounded-full p-0 hover:bg-slate-100 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none transition-colors order-1"
                  >
                    <Avatar>
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs md:text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl border-slate-100 shadow-xl bg-white/95 backdrop-blur-sm" align="end">
                  <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 rounded-xl">
                    <Avatar className="h-10 w-10 border border-white shadow-sm">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <p className="font-bold text-sm text-slate-900 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {isOrganization ? "Organization" : isManagement ? "Management" : isTeacher ? "Teacher" : "Student"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Role Based Menu Items - Show in Dropdown for Desktop, or if needed */}
                    {isStudent && studentMenuItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild className="rounded-lg cursor-pointer focus:bg-blue-50 focus:text-blue-700">
                        <Link to={item.path} id={item.id} className="flex items-center w-full px-2 py-2">
                          <item.icon className="w-4 h-4 mr-2.5 text-slate-400" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {isManagement && managementMenuItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild className="rounded-lg cursor-pointer focus:bg-blue-50 focus:text-blue-700">
                        <Link to={item.path} className="flex items-center w-full px-2 py-2">
                          <item.icon className="w-4 h-4 mr-2.5 text-slate-400" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {isTeacher && teacherProfileItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild className="rounded-lg cursor-pointer focus:bg-blue-50 focus:text-blue-700">
                        <Link to={item.path} className="flex items-center w-full px-2 py-2">
                          <item.icon className="w-4 h-4 mr-2.5 text-slate-400" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-slate-100" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                    <LogOut className="w-4 h-4 mr-2.5" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button - Second from left (Three Dots/Hamburger) */}
            <div className="flex md:hidden items-center order-2">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <div className="w-6 h-6 flex items-center justify-center">✕</div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="block w-6 h-0.5 bg-slate-600 rounded-full"></span>
                    <span className="block w-4 h-0.5 bg-slate-600 rounded-full ml-auto"></span>
                    <span className="block w-5 h-0.5 bg-slate-600 rounded-full ml-auto"></span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Overlay */}
          <div
            className={cn(
              "fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden flex flex-col",
              mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
            )}
            style={{ top: '64px', height: 'calc(100vh - 64px)' }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Menu</p>
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive(item.path)}
                  isMobile={true}
                  onNavigate={(e) => {
                    handleNavigation(e, item.path);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </div>

            {user && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Avatar className="h-10 w-10 border border-white shadow-sm">
                    <AvatarFallback className="bg-blue-600 text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">
                      {isManagement ? 'Management' : isStudent ? 'Student' : 'User'}
                    </p>
                  </div>
                </div>
                <div className="mb-4 space-y-1">
                  {isManagement && managementMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-2.5 text-slate-400" />
                      {item.name}
                    </Link>
                  ))}
                  {isTeacher && teacherProfileItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-2.5 text-slate-400" />
                      {item.name}
                    </Link>
                  ))}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full rounded-xl shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;