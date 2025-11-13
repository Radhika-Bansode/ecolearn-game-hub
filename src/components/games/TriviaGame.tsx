import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

interface TriviaGameProps {
  userId?: string;
}

const TriviaGame = ({ userId }: TriviaGameProps) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("trivia_questions")
      .select("*")
      .limit(5);

    if (error) {
      toast({
        title: "Error loading questions",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setQuestions(data || []);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correct_answer;

    if (correct) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameComplete(true);
        if (userId) {
          saveScore();
        }
      }
    }, 2000);
  };

  const saveScore = async () => {
    await supabase.from("quiz_scores").insert({
      user_id: userId,
      quiz_type: "trivia",
      score: score,
      total_questions: questions.length,
    });
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
    loadQuestions();
  };

  if (!questions || questions.length === 0) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (gameComplete) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>
            You scored {score} out of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-4xl font-bold text-primary">
              {Math.round((score / questions.length) * 100)}%
            </p>
            <p className="text-muted-foreground">
              {score === questions.length
                ? "Perfect! You're an eco expert! 🌱"
                : score >= questions.length / 2
                ? "Great job! Keep learning! 🌿"
                : "Good try! Practice makes perfect! 🌍"}
            </p>
            <Button onClick={resetGame} className="w-full">
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  if (!question) {
    return (
      <Card className="shadow-soft border-border/50">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading question...</p>
        </CardContent>
      </Card>
    );
  }
  
  const options = question.options;

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardDescription>
            Question {currentQuestion + 1} of {questions.length}
          </CardDescription>
          <CardDescription>Score: {score}</CardDescription>
        </div>
        <CardTitle className="text-xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option: string) => {
          const isCorrect = option === question.correct_answer;
          const isSelected = option === selectedAnswer;

          return (
            <Button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              variant={
                showResult && isSelected
                  ? isCorrect
                    ? "default"
                    : "destructive"
                  : "outline"
              }
              className="w-full justify-between text-left h-auto py-3"
            >
              <span>{option}</span>
              {showResult && isSelected && (
                isCorrect ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TriviaGame;