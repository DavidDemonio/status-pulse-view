
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { BarChart, Server, Settings, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link to="/nodes" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Server className="h-4 w-4" />
              <span>Nodes</span>
            </Link>
            <Link to="/settings" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
          
          <ThemeToggle />
          
          <Button asChild variant="default">
            <Link to="/admin" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
