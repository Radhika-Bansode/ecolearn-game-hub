import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Leaf } from "lucide-react";

interface SustainableChoicesProps {
  userId?: string;
}

const scenarios = [
  {
    question: "You're going to the grocery store. What bag do you bring?",
    options: [
      { text: "Plastic bag from store", impact: -2, feedback: "Plastic bags harm marine life and take 1000 years to decompose." },
      { text: "Paper bag from store", impact: 0, feedback: "Better than plastic, but requires energy and trees to produce." },
      { text: "Reusable cloth bag", impact: 2, feedback: "Excellent! Reusable bags reduce waste significantly." },
    ],
  },
  {
    question: "How do you commute to work/school today?",
    options: [
      { text: "Drive alone in car", impact: -2, feedback: "Cars emit significant CO2. Consider carpooling!" },
      { text: "Take public transport", impact: 1, feedback: "Good choice! Public transport reduces carbon footprint." },
      { text: "Bike or walk", impact: 2, feedback: "Perfect! Zero emissions and great for your health!" },
    ],
  },
  {
    question: "You want to buy new clothes. Where do you shop?",
    options: [
      { text: "Fast fashion store", impact: -2, feedback: "Fast fashion creates massive waste and pollution." },
      { text: "Regular retail store", impact: 0, feedback: "Okay choice, but consider sustainable brands next time." },
      { text: "Thrift store or sustainable brand", impact: 2, feedback: "Excellent! Reduces waste and supports circular economy." },
    ],
  },
  {
    question: "How do you handle food waste?",
    options: [
      { text: "Throw everything in trash", impact: -2, feedback: "Food waste in landfills produces methane, a potent greenhouse gas." },
      { text: "Recycle what I can", impact: 1, feedback: "Good! But composting is even better for food waste." },
      { text: "Compost organic waste", impact: 2, feedback: "Perfect! Composting creates nutrient-rich soil and reduces methane." },
    ],
  },
];

const SustainableChoices = ({ userId }: SustainableChoicesProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const handleChoice = (optionIndex: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(optionIndex);
    const impact = scenarios[currentScenario].options[optionIndex].impact;
    setScore(score + impact);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentScenario + 1 < scenarios.length) {
        setCurrentScenario(currentScenario + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        setGameComplete(true);
      }
    }, 3000);
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setGameComplete(false);
  };

  if (gameComplete) {
    const maxScore = scenarios.length * 2;
    const percentage = ((score + maxScore / 2) / maxScore) * 100;

    return (
      <Card className="shadow-soft border-border/50">
        <CardHeader>
          <CardTitle>Choices Complete!</CardTitle>
          <CardDescription>See how sustainable your choices were</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🌟" : percentage >= 60 ? "🌿" : percentage >= 40 ? "🌱" : "🌍"}
            </div>
            <h3 className="text-2xl font-bold text-primary">
              {percentage >= 80
                ? "Eco Champion!"
                : percentage >= 60
                ? "Eco Warrior!"
                : percentage >= 40
                ? "Eco Learner"
                : "Keep Learning!"}
            </h3>
            <p className="text-muted-foreground">
              Your sustainability score: {Math.round(percentage)}%
            </p>
            <Button onClick={resetGame} className="w-full">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scenario = scenarios[currentScenario];
  const selectedOptionData = selectedOption !== null ? scenario.options[selectedOption] : null;

  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardDescription>
            Scenario {currentScenario + 1} of {scenarios.length}
          </CardDescription>
          <CardDescription>Impact Score: {score}</CardDescription>
        </div>
        <CardTitle className="text-xl">{scenario.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {scenario.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleChoice(index)}
              disabled={selectedOption !== null}
              variant={selectedOption === index ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-4"
            >
              <span className="flex-1">{option.text}</span>
              {selectedOption === index && (
                <CheckCircle2 className="h-5 w-5 ml-2" />
              )}
            </Button>
          ))}
        </div>

        {showFeedback && selectedOptionData && (
          <div className={`p-4 rounded-lg ${
            selectedOptionData.impact > 0
              ? "bg-success/10 border border-success"
              : selectedOptionData.impact < 0
              ? "bg-destructive/10 border border-destructive"
              : "bg-muted border border-border"
          }`}>
            <div className="flex items-start gap-3">
              <Leaf className={`h-5 w-5 mt-0.5 ${
                selectedOptionData.impact > 0
                  ? "text-success"
                  : selectedOptionData.impact < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`} />
              <div>
                <h4 className="font-semibold mb-1">
                  {selectedOptionData.impact > 0 ? "Great Choice!" : selectedOptionData.impact < 0 ? "Consider This" : "Good Try"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOptionData.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SustainableChoices;