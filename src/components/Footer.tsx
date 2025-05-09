
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 py-6 mt-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo className="mb-4 md:mb-0" />
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StatusPulse. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/admin" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Admin
            </a>
            <a 
              href="https://github.com/statuspulse" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
