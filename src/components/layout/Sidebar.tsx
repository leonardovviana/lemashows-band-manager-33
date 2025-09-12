import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Music
} from "lucide-react";

interface SidebarProps {
  userRole: "dev" | "admin" | "user";
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ userRole, currentPage, onPageChange, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["dev", "admin", "user"] },
    { id: "calendar", label: "Calendário", icon: Calendar, roles: ["dev", "admin", "user"] },
    { id: "users", label: "Usuários", icon: Users, roles: ["dev", "admin"] },
    { id: "reports", label: "Relatórios", icon: BarChart3, roles: ["dev", "admin", "user"] },
    { id: "invoices", label: "Faturas", icon: FileText, roles: ["dev", "admin"] },
    { id: "settings", label: "Configurações", icon: Settings, roles: ["dev"] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      dev: { label: "Dev", variant: "default" as const },
      admin: { label: "Admin", variant: "secondary" as const },
      user: { label: "Usuário", variant: "outline" as const },
    };
    return roleConfig[role as keyof typeof roleConfig];
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300
        ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        md:relative md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-neon rounded-xl flex items-center justify-center glow-neon">
                <Music className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">LeMaShows</h2>
                <p className="text-sm text-muted-foreground">Sistema de Bandas</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">João da Silva</p>
                <div className="flex items-center space-x-2">
                  <Badge {...getRoleBadge(userRole)}>
                    {getRoleBadge(userRole).label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${isActive ? 'glow-neon' : ''}`}
                    onClick={() => onPageChange(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};