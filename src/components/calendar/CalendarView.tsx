import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewShowDialog } from "@/components/shows/NewShowDialog";
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Download,
  Edit,
  Trash2
} from "lucide-react";

interface CalendarViewProps {
  userRole: "dev" | "admin" | "usuario";
}

export const CalendarView = ({ userRole }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  // Mock data para shows
  const shows = [
    {
      id: 1,
      title: "Rock City Show",
      date: "2024-01-15",
      time: "21:00",
      venue: "Casa de Shows Rock City",
      location: "São Paulo, SP",
      status: "confirmado",
      value: "R$ 2.500"
    },
    {
      id: 2,
      title: "Festival de Verão",
      date: "2024-01-22", 
      time: "19:30",
      venue: "Palco Principal",
      location: "Rio de Janeiro, RJ",
      status: "pendente",
      value: "R$ 5.000"
    },
    {
      id: 3,
      title: "Bar do João",
      date: "2024-02-03",
      time: "22:00", 
      venue: "Bar do João",
      location: "Belo Horizonte, MG",
      status: "confirmado",
      value: "R$ 1.200"
    }
  ];

  const canManageShows = userRole === "dev" || userRole === "admin";

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendário & Agenda</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus shows</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <NewShowDialog userRole={userRole} />
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {(["month", "week", "day"] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(viewType)}
                >
                  {viewType === "month" ? "Mês" : 
                   viewType === "week" ? "Semana" : "Dia"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Shows List */}
      <Card>
        <CardHeader>
          <CardTitle>Shows Agendados</CardTitle>
          <CardDescription>
            {shows.length} show{shows.length !== 1 ? 's' : ''} agendado{shows.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shows.map((show) => (
              <div 
                key={show.id} 
                className="flex items-center justify-between p-4 border rounded-lg transition-smooth hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div>
                    <h3 className="font-medium">{show.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(show.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {show.time}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {show.location}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{show.venue}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-medium">{show.value}</p>
                    <Badge variant={show.status === "confirmado" ? "default" : "secondary"}>
                      {show.status}
                    </Badge>
                  </div>
                  
                  {canManageShows && (
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};