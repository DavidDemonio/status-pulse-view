
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/lovable-uploads/be6ee998-786e-490c-8a83-20d6dca074de.png" 
        alt="ZenoScale Logo" 
        className="h-10 w-10"
      />
      <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        ZenoScale
      </span>
    </div>
  );
};

export default Logo;
