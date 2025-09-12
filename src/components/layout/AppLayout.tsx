import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { UserManagement } from "@/components/users/UserManagement";
import { ReportsView } from "@/components/reports/ReportsView";
import { NewShowDialog } from "@/components/shows/NewShowDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Music, 
  Users, 
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  MoreHorizontal
} from "lucide-react";

interface AppLayoutProps {
  userRole: "dev" | "admin" | "user";
  onLogout: () => void;
}

export const AppLayout = ({ userRole, onLogout }: AppLayoutProps) => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Dashboard inline component to avoid import conflicts
  const DashboardView = () => {
    // Mock data para demonstração
    const upcomingShows = [
      {
        id: 1,
        venue: "Casa de Shows Rock City",
        date: "2024-01-15",
        time: "21:00",
        location: "São Paulo, SP",
        status: "confirmado"
      },
      {
        id: 2,
        venue: "Festival de Verão",
        date: "2024-01-22",
        time: "19:30",
        location: "Rio de Janeiro, RJ",
        status: "pendente"
      },
      {
        id: 3,
        venue: "Bar do João",
        date: "2024-02-03",
        time: "22:00",
        location: "Belo Horizonte, MG",
        status: "confirmado"
      }
    ];

    const stats = {
      showsThisMonth: 8,
      totalRevenue: "R$ 12.500",
      nextShow: "3 dias",
      bandMembers: 5
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da sua banda</p>
          </div>
          <NewShowDialog userRole={userRole} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shows este Mês</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.showsThisMonth}</div>
              <p className="text-xs text-muted-foreground">+2 vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Show</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nextShow}</div>
              <p className="text-xs text-muted-foreground">Casa de Shows Rock City</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membros da Banda</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bandMembers}</div>
              <p className="text-xs text-muted-foreground">Ativos na banda</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Shows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Shows</CardTitle>
                <CardDescription>Seus shows agendados para as próximas semanas</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage("calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingShows.map((show) => (
                <div key={show.id} className="flex items-center justify-between p-4 border rounded-lg transition-smooth hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{show.venue}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{new Date(show.date).toLocaleDateString('pt-BR')} às {show.time}</span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {show.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={show.status === "confirmado" ? "default" : "secondary"}>
                      {show.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardView />;
      case "calendar":
        return <CalendarView userRole={userRole} />;
      case "users":
        return userRole !== "user" ? <UserManagement userRole={userRole as "dev" | "admin"} /> : <div>Acesso negado</div>;
      case "reports":
        return <ReportsView userRole={userRole} />;
      case "invoices":
        return userRole !== "user" ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Faturas</h1>
              <p className="text-muted-foreground">Gerencie faturas e relatórios financeiros</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Módulo de faturas em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        ) : <div>Acesso negado</div>;
      case "settings":
        return userRole === "dev" ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
              <p className="text-muted-foreground">Gerencie configurações globais e permissões</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Módulo de configurações em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        ) : <div>Acesso negado</div>;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-subtle">
      <Sidebar 
        userRole={userRole}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={onLogout}
      />
      
      <main className="flex-1 md:ml-0 p-6 overflow-auto">
        {renderCurrentPage()}
      </main>
    </div>
  );
};