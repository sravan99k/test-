import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3,
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  FileText,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { useAuthFirebase } from "@/hooks/useAuthFirebase";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/teacher/dashboard', badge: 0 },
  { id: 'students', name: 'Student List', icon: Users, path: '/teacher/students', badge: 0 },
  { id: 'assessments', name: 'Assessments', icon: FileText, path: '/teacher/assessments', badge: 0 },
  { id: 'resources', name: 'Resources', icon: BookOpen, path: '/teacher/resources', badge: 0 },
  { id: 'support', name: 'Support', icon: MessageSquare, path: '/teacher/support', badge: 0 },
];

const quickActions = [
  { id: 'plan-activity', name: 'Plan Activity', icon: Calendar, path: '/teacher/resources' },
  { id: 'schedule-session', name: 'Schedule Session', icon: MessageSquare, path: '/teacher/resources' },
];

export const TeacherSidebar: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const { logout } = useAuthFirebase();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const teacherName = user?.demographics?.name || "Teacher";
  const userInitials = teacherName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r bg-card flex flex-col h-screen`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-0' : 'p-4'} border-b h-14 flex items-center`}>
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center h-full' : 'justify-between'}`}>
          {/* Favicon/logo - smaller when collapsed, larger when expanded */}
          {isCollapsed ? (
            <img src="/favicon.ico" alt="NovoWellness.ai" className="h-6 w-6" />
          ) : (
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="NovoWellness.ai" className="h-8 w-8" />
              <div>
                <p className="font-bold text-base">Novo Wellness</p>
                <p className="text-xs text-muted-foreground">Teacher Dashboard</p>
              </div>
            </div>
          )}

          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="p-0 h-auto w-auto hover:bg-transparent"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="hidden lg:block">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-0 h-auto w-auto hover:bg-transparent"
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? "Expand" : "Collapse"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Teacher Info */}
      <div className="p-4 border-b">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Teacher" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="font-medium text-sm">Hi, {teacherName}</p>
              <p className="text-xs text-muted-foreground">Grade 5 & 6 Teacher</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (isCollapsed) {
              return (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={onClose}
                          className="flex items-center justify-center w-12 h-12 rounded-md transition-colors hover:bg-muted"
                        >
                          <Icon className="h-5 w-5" />
                        </NavLink>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center justify-start text-sm font-medium rounded-md transition-colors px-3 py-2 ${
                    isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                  }`
                }
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <NavLink
                    key={action.id}
                    to={action.path}
                    onClick={onClose}
                    className="w-full justify-start flex items-center text-xs font-medium rounded-md transition-colors px-3 py-2 hover:bg-muted"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{action.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive w-12 h-12 flex items-center justify-center"
                      onClick={() => { handleLogout(); if (onClose) onClose(); }}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Sign Out
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive px-3"
              onClick={() => { handleLogout(); if (onClose) onClose(); }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
