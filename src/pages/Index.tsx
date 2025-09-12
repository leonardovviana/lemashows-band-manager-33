import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppLayout } from "@/components/layout/AppLayout";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"dev" | "admin" | "user">("user");

  const handleLogin = (role: "dev" | "admin" | "user" = "user") => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("user");
  };

  if (!isAuthenticated) {
    return (
      <div>
        <LoginForm onLogin={handleLogin} />
        {/* Botões de teste para diferentes tipos de usuário */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <div className="flex flex-col space-y-2 bg-card p-4 rounded-lg border shadow-lg">
            <p className="text-xs text-muted-foreground text-center">Teste rápido:</p>
            <button 
              onClick={() => handleLogin("dev")}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
            >
              Login como Dev
            </button>
            <button 
              onClick={() => handleLogin("admin")}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
            >
              Login como Admin
            </button>
            <button 
              onClick={() => handleLogin("user")}
              className="px-3 py-1 bg-accent text-accent-foreground rounded text-sm"
            >
              Login como Usuário
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AppLayout userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
