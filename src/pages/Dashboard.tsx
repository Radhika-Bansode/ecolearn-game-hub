import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, BarChart3, Newspaper, Heart, Leaf, TreePine } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={user} />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-eco bg-clip-text text-transparent">{user.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your journey to make our planet greener 🌍
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/games" className="group">
            <Card className="shadow-soft border-border/50 hover:shadow-eco transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Mini-Games</CardTitle>
                <CardDescription>
                  Play fun games to learn about sustainability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Play Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/visualization" className="group">
            <Card className="shadow-soft border-border/50 hover:shadow-eco transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Climate Data</CardTitle>
                <CardDescription>
                  Explore real-time environmental statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Data
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/news" className="group">
            <Card className="shadow-soft border-border/50 hover:shadow-eco transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <CardTitle>News & Updates</CardTitle>
                <CardDescription>
                  Stay informed about environmental news
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Read News
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/volunteering" className="group">
            <Card className="shadow-soft border-border/50 hover:shadow-eco transition-shadow cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Volunteering</CardTitle>
                <CardDescription>
                  Find opportunities to make a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Get Involved
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="shadow-soft border-border/50 md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                Your Impact
              </CardTitle>
              <CardDescription>
                Every action counts towards a sustainable future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-medium">Activities Completed</p>
                    <p className="text-2xl font-bold text-primary">Growing! 🌱</p>
                  </div>
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep learning and playing to track your environmental impact!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;