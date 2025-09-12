import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Music,
  Filter
} from "lucide-react";

interface ReportsViewProps {
  userRole: "dev" | "admin" | "usuario";
}

export const ReportsView = ({ userRole }: ReportsViewProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Mock data para histórico de shows
  const showHistory = [
    {
      id: 1,
      venue: "Casa de Shows Rock City",
      date: "2023-12-15",
      location: "São Paulo, SP",
      value: 2500,
      audience: 150,
      status: "realizado"
    },
    {
      id: 2,
      venue: "Festival de Verão",
      date: "2023-12-08", 
      location: "Rio de Janeiro, RJ",
      value: 5000,
      audience: 300,
      status: "realizado"
    },
    {
      id: 3,
      venue: "Bar do João",
      date: "2023-11-22",
      location: "Belo Horizonte, MG", 
      value: 1200,
      audience: 80,
      status: "realizado"
    },
    {
      id: 4,
      venue: "Clube de Jazz",
      date: "2023-11-10",
      location: "Porto Alegre, RS",
      value: 1800,
      audience: 120,
      status: "realizado"
    },
    {
      id: 5,
      venue: "Arena Music Hall",
      date: "2023-10-28",
      location: "Brasília, DF",
      value: 3200,
      audience: 200,
      status: "cancelado"
    }
  ];

  const completedShows = showHistory.filter(show => show.status === "realizado");
  const totalRevenue = completedShows.reduce((sum, show) => sum + show.value, 0);
  const totalAudience = completedShows.reduce((sum, show) => sum + show.audience, 0);
  const averagePerShow = totalRevenue / completedShows.length;

  const periods = [
    { value: "week", label: "Semana" },
    { value: "month", label: "Mês" },
    { value: "quarter", label: "Trimestre" },
    { value: "year", label: "Ano" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Histórico & Relatórios</h1>
          <p className="text-muted-foreground">Visualize dados e gere relatórios dos seus shows</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Período:</span>
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shows Realizados</CardTitle>
            <Music className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedShows.length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2 vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Público Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudience.toLocaleString('pt-BR')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8% vs período anterior
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Show</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averagePerShow.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3% vs período anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Show History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Shows</CardTitle>
          <CardDescription>
            Lista completa dos shows realizados e cancelados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {showHistory.map((show) => (
              <div 
                key={show.id}
                className="flex items-center justify-between p-4 border rounded-lg transition-smooth hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    show.status === "realizado" ? "bg-primary" : "bg-destructive"
                  }`}></div>
                  <div>
                    <h3 className="font-medium">{show.venue}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(show.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {show.location}
                      </span>
                      {show.status === "realizado" && (
                        <span>Público: {show.audience} pessoas</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-medium">
                      {show.value.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </p>
                    <Badge variant={show.status === "realizado" ? "default" : "destructive"}>
                      {show.status}
                    </Badge>
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