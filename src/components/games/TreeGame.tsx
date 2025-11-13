import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Droplets, TreePine } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TreeGameProps {
  userId?: string;
}

const TreeGame = ({ userId }: TreeGameProps) => {
  const [treeLevel, setTreeLevel] = useState(1);
  const [waterCount, setWaterCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const watersNeeded = treeLevel * 5;

  useEffect(() => {
    if (userId) {
      loadTreeProgress();
    }
  }, [userId]);

  const loadTreeProgress = async () => {
    const { data, error } = await supabase
      .from("tree_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Error loading tree",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setTreeLevel(data.tree_level);
      setWaterCount(data.water_count);
    } else {
      await supabase.from("tree_progress").insert({
        user_id: userId,
        tree_level: 1,
        water_count: 0,
      });
    }
    setLoading(false);
  };

  const waterTree = async () => {
    const newWaterCount = waterCount + 1;
    let newTreeLevel = treeLevel;

    if (newWaterCount >= watersNeeded) {
      newTreeLevel = treeLevel + 1;
      
      toast({
        title: "🎉 Tree Level Up!",
        description: `Your tree is now level ${newTreeLevel}!`,
      });

      await supabase
        .from("tree_progress")
        .update({
          tree_level: newTreeLevel,
          water_count: 0,
          last_watered_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      setTreeLevel(newTreeLevel);
      setWaterCount(0);
    } else {
      await supabase
        .from("tree_progress")
        .update({
          water_count: newWaterCount,
          last_watered_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      setWaterCount(newWaterCount);
      
      toast({
        title: "Tree watered!",
        description: `${watersNeeded - newWaterCount} more waters needed to level up`,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading your tree...</p>
        </CardContent>
      </Card>
    );
  }

  const getTreeEmoji = (level: number) => {
    if (level <= 2) return "🌱";
    if (level <= 5) return "🌿";
    if (level <= 10) return "🌳";
    return "🌲";
  };

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <CardTitle>Grow Your Virtual Tree</CardTitle>
        <CardDescription>
          Water your tree to help it grow. Complete activities to earn water!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-8xl mb-4">{getTreeEmoji(treeLevel)}</div>
          <h3 className="text-2xl font-bold mb-2">Level {treeLevel}</h3>
          <p className="text-muted-foreground">
            {waterCount} / {watersNeeded} waters
          </p>
        </div>

        <Progress value={(waterCount / watersNeeded) * 100} className="h-3" />

        <Button onClick={waterTree} className="w-full" size="lg">
          <Droplets className="mr-2 h-5 w-5" />
          Water Tree
        </Button>

        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            Tree Facts
          </h4>
          <p className="text-sm text-muted-foreground">
            A single mature tree can absorb up to 48 pounds of CO2 per year and release enough oxygen for 2 people!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreeGame;