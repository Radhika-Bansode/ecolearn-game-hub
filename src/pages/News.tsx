import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Calendar } from "lucide-react";

const News = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);

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
      loadArticles();
    }
  }, [user]);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setArticles(data);
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
            <span className="bg-gradient-eco bg-clip-text text-transparent">News & Updates</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay informed about the latest environmental developments
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {articles.map((article) => (
            <Card key={article.id} className="shadow-soft border-border/50 hover:shadow-eco transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {article.source && ` • ${article.source}`}
                    </CardDescription>
                  </div>
                  <Newspaper className="h-6 w-6 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default News;