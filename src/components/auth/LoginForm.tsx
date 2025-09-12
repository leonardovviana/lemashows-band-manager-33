import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (role?: "dev" | "admin" | "user") => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login para demonstração
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      // Simula diferentes tipos de usuário baseado no email
      const role = email.includes("dev") ? "dev" : 
                   email.includes("admin") ? "admin" : "user";
      onLogin(role);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md transition-smooth hover:shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center glow-neon">
            <span className="text-2xl font-bold text-primary-foreground">LM</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">LeMaShows</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Gerenciamento de Bandas
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 transition-smooth focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 transition-smooth focus:ring-primary"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-medium transition-bounce"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Esqueci minha senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};