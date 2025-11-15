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
    <div className="min-h-screen bg-gradient-subtle animate-fade-in">
      <Navbar user={user} />
      
      <main className="container py-8 space-y-8">
        {/* User Profile Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-8 rounded-2xl bg-gradient-hero shadow-eco-lg hover:shadow-glow transition-all duration-500 animate-scale-in">
          <Avatar className="h-24 w-24 border-4 border-white/30 shadow-eco animate-float">
            <AvatarFallback className="text-3xl font-bold bg-white/95 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Welcome back, {userName}! 🌟
            </h1>
            <p className="text-white/95 text-xl drop-shadow-md">
              Continue your journey to make our planet greener 🌍
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary" className="text-lg px-6 py-3 bg-white/20 backdrop-blur-sm text-white border-white/30 shadow-soft hover:bg-white/30 transition-all">
              <Star className="h-5 w-5 mr-2 text-yellow-300" />
              Level {stats?.treeLevel || 0}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="shadow-eco border-primary/20 hover:scale-[1.05] transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-gradient-eco shadow-eco group-hover:animate-glow">
                  <TreePine className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">{stats?.treeLevel || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-semibold">Tree Level</p>
            </CardContent>
          </Card>

          <Card className="shadow-eco border-accent/20 hover:scale-[1.05] transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-gradient-accent shadow-eco group-hover:animate-glow">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">{stats?.waterCount || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-semibold">Water Count</p>
            </CardContent>
          </Card>

          <Card className="shadow-eco border-primary/20 hover:scale-[1.05] transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-gradient-eco shadow-eco group-hover:animate-glow">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-eco bg-clip-text text-transparent">{stats?.totalQuizzes || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground font-semibold">Quizzes Taken</p>
            </CardContent>
          </Card>

          <Card className="shadow-eco border-accent/20 hover:scale-[1.05] transition-all cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-gradient-accent shadow-eco group-hover:animate-glow">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">{stats?.averageScore || 0}%</span>
              </div>
              <p className="text-sm text-muted-foreground font-semibold">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        {stats && stats.badges.length > 0 && (
          <Card className="shadow-eco-lg border-primary/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-eco shadow-eco">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-3xl">Your Achievements</CardTitle>
              </div>
              <CardDescription className="text-base">
                Badges you've earned on your eco-learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-wrap gap-4">
                {stats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-eco/10 border-2 border-primary/30 shadow-eco hover:shadow-eco-lg hover:scale-[1.05] transition-all cursor-pointer backdrop-blur-sm"
                  >
                    <span className="text-3xl animate-float">{getBadgeIcon(badge)}</span>
                    <span className="font-bold text-lg bg-gradient-eco bg-clip-text text-transparent">{badge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Towards Next Badge */}
        {stats && (
          <Card className="shadow-eco border-accent/30 bg-gradient-to-br from-accent/5 via-primary/5 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-accent opacity-5"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 rounded-lg bg-gradient-accent shadow-eco">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                Next Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              {stats.treeLevel < 5 && (
                <div className="p-4 rounded-xl bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-primary/20 shadow-inner">
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-semibold">Reach Tree Level 5 (Sapling Badge) 🌿</span>
                    <span className="text-base text-primary font-bold">{stats.treeLevel}/5</span>
                  </div>
                  <Progress value={(stats.treeLevel / 5) * 100} className="h-3 shadow-inner" />
                </div>
              )}
              {stats.totalQuizzes < 5 && (
                <div className="p-4 rounded-xl bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-accent/20 shadow-inner">
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-semibold">Complete 5 Quizzes (Knowledge Seeker Badge) 🔍</span>
                    <span className="text-base text-accent font-bold">{stats.totalQuizzes}/5</span>
                  </div>
                  <Progress value={(stats.totalQuizzes / 5) * 100} className="h-3 shadow-inner" />
                </div>
              )}
              {stats.averageScore < 80 && stats.totalQuizzes > 0 && (
                <div className="p-4 rounded-xl bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-primary/20 shadow-inner">
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-semibold">Achieve 80% Average Score (Eco Expert Badge) ⭐</span>
                    <span className="text-base text-primary font-bold">{stats.averageScore}%/80%</span>
                  </div>
                  <Progress value={(stats.averageScore / 80) * 100} className="h-3 shadow-inner" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-3xl font-bold mb-6 bg-gradient-eco bg-clip-text text-transparent">Explore</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/games" className="group">
              <Card className="shadow-eco border-primary/30 hover:shadow-eco-lg hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-eco opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-eco flex items-center justify-center mb-4 shadow-eco group-hover:shadow-eco-lg group-hover:scale-110 transition-all duration-300">
                    <Gamepad2 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Mini-Games</CardTitle>
                  <CardDescription className="text-base">
                    Play fun games to learn about sustainability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="glow" size="lg">
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/visualization" className="group">
              <Card className="shadow-eco border-accent/30 hover:shadow-eco-lg hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-4 shadow-eco group-hover:shadow-eco-lg group-hover:scale-110 transition-all duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Climate Data</CardTitle>
                  <CardDescription className="text-base">
                    Explore real-time environmental statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="accent" size="lg">
                    View Data
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/news" className="group">
              <Card className="shadow-eco border-primary/30 hover:shadow-eco-lg hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-eco opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-eco flex items-center justify-center mb-4 shadow-eco group-hover:shadow-eco-lg group-hover:scale-110 transition-all duration-300">
                    <Newspaper className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">News & Updates</CardTitle>
                  <CardDescription className="text-base">
                    Stay informed about climate action worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="glow" size="lg">
                    Read News
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/volunteering" className="group">
              <Card className="shadow-eco border-accent/30 hover:shadow-eco-lg hover:scale-[1.05] transition-all duration-500 cursor-pointer h-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-4 shadow-eco group-hover:shadow-eco-lg group-hover:scale-110 transition-all duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Volunteering</CardTitle>
                  <CardDescription className="text-base">
                    Find opportunities to make a real difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="accent" size="lg">
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