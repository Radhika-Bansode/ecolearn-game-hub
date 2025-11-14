import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, BarChart3, Newspaper, Heart, Leaf, TreePine, Trophy, Droplets, Target, Award, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface UserStats {
  treeLevel: number;
  waterCount: number;
  totalQuizzes: number;
  averageScore: number;
  badges: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);

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
      } else {
        loadUserStats(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserStats = async (userId: string) => {
    // Load tree progress
    const { data: treeData } = await supabase
      .from("tree_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Load quiz scores
    const { data: quizData } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", userId);

    const treeLevel = treeData?.tree_level || 0;
    const waterCount = treeData?.water_count || 0;
    const totalQuizzes = quizData?.length || 0;
    const averageScore = totalQuizzes > 0 
      ? Math.round((quizData?.reduce((acc, q) => acc + (q.score / q.total_questions) * 100, 0) || 0) / totalQuizzes)
      : 0;

    // Calculate badges
    const badges: string[] = [];
    if (treeLevel >= 1) badges.push("Seedling");
    if (treeLevel >= 5) badges.push("Sapling");
    if (treeLevel >= 10) badges.push("Tree Master");
    if (totalQuizzes >= 1) badges.push("Quiz Starter");
    if (totalQuizzes >= 5) badges.push("Knowledge Seeker");
    if (averageScore >= 80) badges.push("Eco Expert");
    if (averageScore === 100) badges.push("Perfect Score");

    setStats({
      treeLevel,
      waterCount,
      totalQuizzes,
      averageScore,
      badges,
    });
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Seedling": return "🌱";
      case "Sapling": return "🌿";
      case "Tree Master": return "🌳";
      case "Quiz Starter": return "📚";
      case "Knowledge Seeker": return "🔍";
      case "Eco Expert": return "⭐";
      case "Perfect Score": return "🏆";
      default: return "🎖️";
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

  const userName = user.email?.split('@')[0] || "Explorer";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar user={user} />
      
      <main className="container py-8 space-y-8">
        {/* User Profile Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-xl bg-gradient-eco shadow-eco">
          <Avatar className="h-20 w-20 border-4 border-white/20">
            <AvatarFallback className="text-2xl font-bold bg-white/90 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-white/90 text-lg">
              Continue your journey to make our planet greener 🌍
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Star className="h-4 w-4 mr-1" />
              Level {stats?.treeLevel || 0}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TreePine className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats?.treeLevel || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Tree Level</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats?.waterCount || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Water Count</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats?.totalQuizzes || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Quizzes Taken</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats?.averageScore || 0}%</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        {stats && stats.badges.length > 0 && (
          <Card className="shadow-eco border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                <CardTitle>Your Achievements</CardTitle>
              </div>
              <CardDescription>
                Badges you've earned on your eco-learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 shadow-soft"
                  >
                    <span className="text-2xl">{getBadgeIcon(badge)}</span>
                    <span className="font-semibold text-primary">{badge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Towards Next Badge */}
        {stats && (
          <Card className="shadow-soft border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Next Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.treeLevel < 5 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Reach Tree Level 5 (Sapling Badge)</span>
                    <span className="text-sm text-muted-foreground">{stats.treeLevel}/5</span>
                  </div>
                  <Progress value={(stats.treeLevel / 5) * 100} className="h-2" />
                </div>
              )}
              {stats.totalQuizzes < 5 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Complete 5 Quizzes (Knowledge Seeker Badge)</span>
                    <span className="text-sm text-muted-foreground">{stats.totalQuizzes}/5</span>
                  </div>
                  <Progress value={(stats.totalQuizzes / 5) * 100} className="h-2" />
                </div>
              )}
              {stats.averageScore < 80 && stats.totalQuizzes > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Achieve 80% Average Score (Eco Expert Badge)</span>
                    <span className="text-sm text-muted-foreground">{stats.averageScore}%/80%</span>
                  </div>
                  <Progress value={(stats.averageScore / 80) * 100} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Explore</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/games" className="group">
              <Card className="shadow-soft border-border/50 hover:shadow-eco hover:scale-[1.02] transition-all cursor-pointer h-full">
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
              <Card className="shadow-soft border-border/50 hover:shadow-eco hover:scale-[1.02] transition-all cursor-pointer h-full">
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
              <Card className="shadow-soft border-border/50 hover:shadow-eco hover:scale-[1.02] transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                    <Newspaper className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>News & Updates</CardTitle>
                  <CardDescription>
                    Stay informed about climate action worldwide
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
              <Card className="shadow-soft border-border/50 hover:shadow-eco hover:scale-[1.02] transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-gradient-eco flex items-center justify-center mb-2">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Volunteering</CardTitle>
                  <CardDescription>
                    Find opportunities to make a real difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Get Involved
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;