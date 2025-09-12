import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  User
} from "lucide-react";

interface ShowCardProps {
  show: {
    id: number;
    venue: string;
    date: string;
    time: string;
    location: string;
    status: "confirmado" | "pendente" | "cancelado";
    value?: string;
    contact?: string;
    description?: string;
    createdBy: {
      name: string;
      avatar?: string;
      role: "dev" | "admin" | "usuario";
    };
  };
  userRole: "dev" | "admin" | "usuario";
  onEdit?: (showId: number) => void;
  onDelete?: (showId: number) => void;
  onView?: (showId: number) => void;
}

export const ShowCard = ({ show, userRole, onEdit, onDelete, onView }: ShowCardProps) => {
  const canManageShows = userRole === "dev" || userRole === "admin";
  
  const statusConfig = {
    confirmado: { variant: "default" as const, label: "Confirmado" },
    pendente: { variant: "secondary" as const, label: "Pendente" },
    cancelado: { variant: "destructive" as const, label: "Cancelado" }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      dev: "bg-primary text-primary-foreground",
      admin: "bg-secondary text-secondary-foreground", 
      usuario: "bg-accent text-accent-foreground"
    };
    return colors[role as keyof typeof colors] || colors.usuario;
  };

  return (
    <Card className="w-full transition-smooth hover:shadow-lg border-l-4 border-l-primary">
      <CardContent className="p-4 space-y-4">
        {/* Header with venue and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{show.venue}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge {...statusConfig[show.status]}>
                {statusConfig[show.status].label}
              </Badge>
              {show.value && (
                <span className="text-sm font-medium text-primary">{show.value}</span>
              )}
            </div>
          </div>
        </div>

        {/* Date and time - prominent for mobile */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {new Date(show.date).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{show.time}</span>
            </div>
          </div>
        </div>

        {/* Location and contact */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{show.location}</span>
          </div>
          
          {show.contact && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{show.contact}</span>
            </div>
          )}
        </div>

        {/* Created by info */}
        <div className="flex items-center space-x-2 text-xs bg-accent/50 rounded-lg p-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Cadastrado por:</span>
          <div className="flex items-center space-x-2">
            <Avatar className="h-4 w-4">
              <AvatarImage src={show.createdBy.avatar} />
              <AvatarFallback className="text-xs">
                {show.createdBy.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{show.createdBy.name}</span>
            <Badge className={`text-xs ${getRoleColor(show.createdBy.role)}`}>
              {show.createdBy.role}
            </Badge>
          </div>
        </div>

        {/* Description if exists */}
        {show.description && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>{show.description}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView?.(show.id)}
            className="flex-1 mr-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
          
          {canManageShows && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(show.id)}
                className="px-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(show.id)}
                className="px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};