import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Phone,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ShowDetailsDialogProps {
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
    createdAt?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: "dev" | "admin" | "usuario";
  onEdit?: (showId: number) => void;
  onDelete?: (showId: number) => void;
  onStatusChange?: (showId: number, status: "confirmado" | "cancelado") => void;
}

export const ShowDetailsDialog = ({ 
  show, 
  isOpen, 
  onClose, 
  userRole, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: ShowDetailsDialogProps) => {
  if (!show) return null;

  const canManageShows = userRole === "dev" || userRole === "admin";
  
  const statusConfig = {
    confirmado: { 
      variant: "default" as const, 
      label: "Confirmado", 
      icon: CheckCircle,
      color: "text-green-600"
    },
    pendente: { 
      variant: "secondary" as const, 
      label: "Pendente", 
      icon: Clock,
      color: "text-yellow-600"
    },
    cancelado: { 
      variant: "destructive" as const, 
      label: "Cancelado", 
      icon: XCircle,
      color: "text-red-600"
    }
  };

  const StatusIcon = statusConfig[show.status].icon;

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      dev: "Desenvolvedor",
      admin: "Administrador",
      usuario: "Usuário"
    };
    return roleLabels[role as keyof typeof roleLabels] || "Usuário";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{show.venue}</DialogTitle>
              <DialogDescription className="flex items-center space-x-2 mt-2">
                <MapPin className="h-4 w-4" />
                <span>{show.location}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusConfig[show.status].color}`} />
              <Badge {...statusConfig[show.status]}>
                {statusConfig[show.status].label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date and Time */}
          <div className="bg-gradient-subtle rounded-lg p-4">
            <h3 className="font-semibold mb-3">Data e Horário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {new Date(show.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Data do show</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{show.time}</p>
                  <p className="text-sm text-muted-foreground">Horário de início</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          {show.value && (
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="font-semibold mb-3">Informações Financeiras</h3>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-lg">{show.value}</p>
                  <p className="text-sm text-muted-foreground">Valor do cachê</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {show.contact && (
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="font-semibold mb-3">Contato</h3>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{show.contact}</p>
                  <p className="text-sm text-muted-foreground">Contratante responsável</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {show.description && (
            <div className="bg-gradient-subtle rounded-lg p-4">
              <h3 className="font-semibold mb-3">Observações</h3>
              <p className="text-sm leading-relaxed">{show.description}</p>
            </div>
          )}

          {/* Created By */}
          <div className="bg-gradient-subtle rounded-lg p-4">
            <h3 className="font-semibold mb-3">Informações de Cadastro</h3>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={show.createdBy.avatar} />
                <AvatarFallback>
                  {show.createdBy.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{show.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getRoleLabel(show.createdBy.role)}
                </p>
              </div>
              {show.createdAt && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(show.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canManageShows && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => onEdit?.(show.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Show
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDelete?.(show.id)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Show
                </Button>
              </div>

              {show.status === "pendente" && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button
                    onClick={() => onStatusChange?.(show.id, "confirmado")}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Show
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onStatusChange?.(show.id, "cancelado")}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Show
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};