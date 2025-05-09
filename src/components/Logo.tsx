
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
        <span className="text-white font-bold text-2xl">Z</span>
      </div>
      <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        ZenoScale
      </span>
    </div>
  );
};

export default Logo;
