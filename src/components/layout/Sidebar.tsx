import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
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
  userRole: "dev" | "admin" | "usuario";
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ userRole, currentPage, onPageChange, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["dev", "admin", "usuario"] },
    { id: "calendar", label: "Calendário", icon: Calendar, roles: ["dev", "admin", "usuario"] },
    { id: "users", label: "Usuários", icon: Users, roles: ["dev", "admin"] },
    { id: "reports", label: "Relatórios", icon: BarChart3, roles: ["dev", "admin", "usuario"] },
    { id: "invoices", label: "Faturas", icon: FileText, roles: ["dev", "admin"] },
    { id: "settings", label: "Configurações", icon: Settings, roles: ["dev"] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleMenuItemClick = (itemId: string) => {
    onPageChange(itemId);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      dev: { label: "Dev", variant: "default" as const },
      admin: { label: "Admin", variant: "secondary" as const },
      usuario: { label: "Usuário", variant: "outline" as const },
    };
    return roleConfig[role as keyof typeof roleConfig];
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-3 left-3 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-neon rounded-xl flex items-center justify-center glow-neon">
                <Music className="h-4 w-4 lg:h-6 lg:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base lg:text-lg truncate">LeMaShows</h2>
                <p className="text-xs lg:text-sm text-muted-foreground truncate">Sistema de Bandas</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 lg:p-6 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-xs lg:text-sm">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm lg:text-base truncate">João da Silva</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge {...getRoleBadge(userRole)} className="text-xs">
                    {getRoleBadge(userRole).label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4">
            <div className="space-y-1 lg:space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start text-sm lg:text-base h-10 lg:h-11 ${isActive ? 'glow-neon' : ''}`}
                    onClick={() => handleMenuItemClick(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 lg:p-4 border-t">
            <Button
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive text-sm lg:text-base h-10 lg:h-11"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};