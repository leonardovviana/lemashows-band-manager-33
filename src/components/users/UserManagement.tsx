import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  User
} from "lucide-react";

interface UserManagementProps {
  userRole: "dev" | "admin";
}

export const UserManagement = ({ userRole }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data para usuários
  const users = [
    {
      id: 1,
      name: "João da Silva",
      email: "joao@lemashows.com",
      phone: "(11) 99999-9999",
      role: "admin",
      band: "Banda Rock City",
      joinDate: "2023-01-15",
      status: "ativo",
      avatar: "/placeholder-avatar-1.jpg"
    },
    {
      id: 2,
      name: "Maria Santos", 
      email: "maria@lemashows.com",
      phone: "(11) 88888-8888",
      role: "user",
      band: "Banda Rock City",
      joinDate: "2023-03-20",
      status: "ativo",
      avatar: "/placeholder-avatar-2.jpg"
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      email: "pedro@lemashows.com", 
      phone: "(11) 77777-7777",
      role: "user",
      band: "Banda Rock City",
      joinDate: "2023-06-10",
      status: "inativo",
      avatar: "/placeholder-avatar-3.jpg"
    },
    {
      id: 4,
      name: "Ana Costa",
      email: "ana@lemashows.com",
      phone: "(11) 66666-6666", 
      role: "admin",
      band: "Jazz Ensemble",
      joinDate: "2023-02-28",
      status: "ativo",
      avatar: "/placeholder-avatar-4.jpg"
    }
  ];

  const bands = [...new Set(users.map(user => user.band))];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.band.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      dev: { label: "Dev", variant: "default" as const },
      admin: { label: "Admin", variant: "secondary" as const },
      user: { label: "Usuário", variant: "outline" as const },
    };
    return roleConfig[role as keyof typeof roleConfig];
  };

  const getStatusBadge = (status: string) => {
    return status === "ativo" 
      ? { label: "Ativo", variant: "default" as const }
      : { label: "Inativo", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            {userRole === "dev" ? "Gerencie usuários de todas as bandas" : "Gerencie usuários da sua banda"}
          </p>
        </div>
        
        <Button className="glow-neon">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou banda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total de Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{bands.length}</p>
                <p className="text-xs text-muted-foreground">Bandas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg transition-smooth hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Desde {new Date(user.joinDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{user.band}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end space-y-1">
                    <Badge {...getRoleBadge(user.role)}>
                      {getRoleBadge(user.role).label}
                    </Badge>
                    <Badge {...getStatusBadge(user.status)}>
                      {getStatusBadge(user.status).label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};