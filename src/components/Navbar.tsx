import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, Home, Gamepad2, BarChart3, Newspaper, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const navLinks = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/games", icon: Gamepad2, label: "Mini-Games" },
    { to: "/visualization", icon: BarChart3, label: "Climate Data" },
    { to: "/news", icon: Newspaper, label: "News" },
    { to: "/volunteering", icon: Heart, label: "Volunteering" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="bg-gradient-eco bg-clip-text text-transparent">EcoLearn</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "default" : "ghost"}
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {user.email}
            </span>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;