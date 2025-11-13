import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Mail, ExternalLink } from "lucide-react";

const Volunteering = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);

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

  useEffect(() => {
    if (user) {
      loadOpportunities();
    }
  }, [user]);

  const loadOpportunities = async () => {
    const { data, error } = await supabase
      .from("volunteering_opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOpportunities(data);
    }
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cleanup':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'planting':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'education':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={user} />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-eco bg-clip-text text-transparent">Volunteering Opportunities</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Make a real difference in your community and for our planet
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="shadow-soft border-border/50 hover:shadow-eco transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.opportunity_type)}`}>
                    {opportunity.opportunity_type}
                  </span>
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                <CardDescription>{opportunity.organization}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {opportunity.description}
                  </p>
                  
                  {opportunity.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {opportunity.location}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {opportunity.contact_email && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.location.href = `mailto:${opportunity.contact_email}`}
                    >
                      <Mail className="h-4 w-4" />
                      Contact via Email
                    </Button>
                  )}
                  
                  {opportunity.website_url && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => window.open(opportunity.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Volunteering;