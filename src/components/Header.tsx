
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <Logo />
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/nodes" className="text-foreground hover:text-primary transition-colors">
              Nodes
            </Link>
            <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
          
          <ThemeToggle />
          
          <Button asChild variant="default">
            <Link to="/admin">Admin Panel</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
