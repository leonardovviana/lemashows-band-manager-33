import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { UserManagement } from "@/components/users/UserManagement";
import { ReportsView } from "@/components/reports/ReportsView";
import { NewShowDialog } from "@/components/shows/NewShowDialog";
import { ShowCard } from "@/components/shows/ShowCard";
import { ShowDetailsDialog } from "@/components/shows/ShowDetailsDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Music, 
  Users, 
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  Eye
} from "lucide-react";

interface AppLayoutProps {
  userRole: "dev" | "admin" | "user";
  onLogout: () => void;
}

export const AppLayout = ({ userRole, onLogout }: AppLayoutProps) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [showDetailsOpen, setShowDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Dashboard inline component to avoid import conflicts
  const DashboardView = () => {
    // Enhanced mock data para demonstração
    const upcomingShows = [
      {
        id: 1,
        venue: "Casa de Shows Rock City",
        date: "2024-01-15",
        time: "21:00",
        location: "São Paulo, SP",
        status: "confirmado" as const,
        value: "R$ 2.500",
        contact: "João Silva - (11) 99999-9999",
        description: "Show de abertura da nova casa. Público esperado: 500 pessoas.",
        createdBy: {
          name: "João da Silva",
          avatar: "/placeholder-avatar.jpg",
          role: "admin" as const
        },
        createdAt: "2024-01-01"
      },
      {
        id: 2,
        venue: "Festival de Verão",
        date: "2024-01-22",
        time: "19:30",
        location: "Rio de Janeiro, RJ",
        status: "pendente" as const,
        value: "R$ 5.000",
        contact: "Maria Santos - (21) 88888-8888",
        description: "Festival com várias bandas. Palco principal.",
        createdBy: {
          name: "Maria Santos",
          avatar: "/placeholder-avatar.jpg",
          role: "dev" as const
        },
        createdAt: "2024-01-05"
      },
      {
        id: 3,
        venue: "Bar do João",
        date: "2024-02-03",
        time: "22:00",
        location: "Belo Horizonte, MG",
        status: "confirmado" as const,
        value: "R$ 1.200",
        contact: "João Pereira - (31) 77777-7777",
        description: "Show intimista no bar. Ambiente aconchegante.",
        createdBy: {
          name: "Pedro Costa",
          avatar: "/placeholder-avatar.jpg",
          role: "user" as const
        },
        createdAt: "2024-01-10"
      }
    ];

    const stats = {
      showsThisMonth: 8,
      totalRevenue: "R$ 12.500",
      nextShow: "3 dias",
      bandMembers: 5
    };

    const handleShowView = (showId: number) => {
      const show = upcomingShows.find(s => s.id === showId);
      if (show) {
        setSelectedShow(show);
        setShowDetailsOpen(true);
      }
    };

    const handleShowEdit = (showId: number) => {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A edição de shows será implementada em breve.",
      });
    };

    const handleShowDelete = (showId: number) => {
      toast({
        title: "Show excluído",
        description: "O show foi removido da agenda.",
        variant: "destructive",
      });
    };

    const handleStatusChange = (showId: number, status: "confirmado" | "cancelado") => {
      toast({
        title: `Show ${status}`,
        description: `O status do show foi atualizado para ${status}.`,
      });
    };

    return (
      <div className="space-y-6">
        {/* Mobile-optimized header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Visão geral da sua banda</p>
          </div>
          
          {/* Mobile-first: Agendar Show button prominente */}
          <div className="w-full">
            <NewShowDialog userRole={userRole} />
          </div>
        </div>

        {/* Mobile-first: Próximos Shows em destaque no topo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Próximos Shows</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage("calendar")}
              className="hidden sm:flex"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </Button>
          </div>
          
          {/* Mobile-optimized shows grid */}
          <div className="grid grid-cols-1 gap-4">
            {upcomingShows.slice(0, 3).map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                userRole={userRole}
                onView={handleShowView}
                onEdit={handleShowEdit}
                onDelete={handleShowDelete}
              />
            ))}
          </div>

          {upcomingShows.length > 3 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentPage("calendar")}
            >
              Ver todos os {upcomingShows.length} shows
            </Button>
          )}
        </div>

        {/* Stats Cards - Compact for mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs lg:text-sm font-medium">Shows/Mês</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl lg:text-2xl font-bold">{stats.showsThisMonth}</div>
              <p className="text-xs text-muted-foreground">+2 vs anterior</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs lg:text-sm font-medium">Faturamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg lg:text-2xl font-bold">{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">+15% vs anterior</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs lg:text-sm font-medium">Próximo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl lg:text-2xl font-bold">{stats.nextShow}</div>
              <p className="text-xs text-muted-foreground truncate">Rock City</p>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs lg:text-sm font-medium">Membros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl lg:text-2xl font-bold">{stats.bandMembers}</div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
        </div>
        <ShowDetailsDialog
          show={selectedShow}
          isOpen={showDetailsOpen}
          onClose={() => setShowDetailsOpen(false)}
          userRole={userRole}
          onEdit={handleShowEdit}
          onDelete={handleShowDelete}
          onStatusChange={handleStatusChange}
        />
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
      
      <main className="flex-1 md:ml-0 p-3 md:p-6 overflow-auto">
        {renderCurrentPage()}
      </main>
    </div>
  );
};