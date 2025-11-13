import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Thermometer } from "lucide-react";

const Visualization = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [climateData, setClimateData] = useState<any[]>([]);

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
      loadClimateData();
    }
  }, [user]);

  const loadClimateData = async () => {
    const { data, error } = await supabase
      .from("climate_data")
      .select("*")
      .order("recorded_at", { ascending: true });

    if (!error && data) {
      const formattedData = data.reduce((acc: any[], item) => {
        const date = new Date(item.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        
        if (existing) {
          existing[item.data_type] = item.value;
        } else {
          acc.push({
            date,
            [item.data_type]: item.value,
          });
        }
        
        return acc;
      }, []);

      setClimateData(formattedData);
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={user} />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-eco bg-clip-text text-transparent">Climate Data Visualization</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time environmental statistics and trends
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                CO2 Emissions (Past Week)
              </CardTitle>
              <CardDescription>
                Atmospheric CO2 concentration in parts per million (ppm)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[410, 420]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="co2_emissions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="CO2 (ppm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-accent" />
                Global Temperature Trend
              </CardTitle>
              <CardDescription>
                Average global temperature in degrees Celsius
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[14, 18]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle>Key Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Current CO2 Level</p>
                  <p className="text-2xl font-bold text-primary">416.9 ppm</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Safe CO2 Level</p>
                  <p className="text-2xl font-bold">350 ppm</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-border/50">
              <CardHeader>
                <CardTitle>Did You Know?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>CO2 levels are higher now than at any point in human history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>The Earth's temperature has risen by 1.1°C since pre-industrial times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Renewable energy adoption is growing at record rates worldwide</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Visualization;