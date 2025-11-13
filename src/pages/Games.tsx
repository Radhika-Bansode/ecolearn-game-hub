import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TreeGame from "@/components/games/TreeGame";
import TriviaGame from "@/components/games/TriviaGame";
import SustainableChoices from "@/components/games/SustainableChoices";

const Games = () => {
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
            <span className="bg-gradient-eco bg-clip-text text-transparent">Mini-Games</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn about sustainability through fun interactive games
          </p>
        </div>

        <Tabs defaultValue="tree" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tree">Grow Your Tree</TabsTrigger>
            <TabsTrigger value="choices">Sustainable Choices</TabsTrigger>
            <TabsTrigger value="trivia">Eco Trivia</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tree" className="max-w-2xl mx-auto">
            <TreeGame userId={user.id} />
          </TabsContent>
          
          <TabsContent value="choices" className="max-w-2xl mx-auto">
            <SustainableChoices userId={user.id} />
          </TabsContent>
          
          <TabsContent value="trivia" className="max-w-2xl mx-auto">
            <TriviaGame userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Games;