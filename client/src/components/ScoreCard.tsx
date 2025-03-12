import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Loader2 } from "lucide-react";
import { Team } from "@shared/schema";
import { audioManager } from "@/lib/utils";

interface ScoreCardProps {
  team: Team;
  onIncrement: () => void;
  onDecrement: () => void;
  isPending: boolean;
}

export default function ScoreCard({
  team,
  onIncrement,
  onDecrement,
  isPending,
}: ScoreCardProps) {
  // Handler for increment with sound
  const handleIncrement = () => {
    audioManager.playPlusSound();
    onIncrement();
  };
  
  // Handler for decrement with sound
  const handleDecrement = () => {
    audioManager.playMinusSound();
    onDecrement();
  };
  
  // Format number with commas for thousands
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };
  
  // Card border style using team color
  const cardStyle = {
    borderColor: team.color,
    borderWidth: '5px'
  };
  
  // Header style using team color
  const headerStyle = {
    backgroundColor: team.color
  };
  
  // Get semi-transparent color for button background (10% opacity)
  const getTransparentColor = (hexColor: string): string => {
    // Return rgba with 10% opacity
    return `${hexColor}1A`; // 1A is hex for 10% opacity
  };
  
  // Button styles
  const buttonStyle = {
    color: team.color,
    borderColor: team.color,
    backgroundColor: getTransparentColor(team.color)
  };
  
  return (
    <Card className="overflow-hidden" style={cardStyle}>
      <CardHeader className="p-4 text-white" style={headerStyle}>
        <h2 className="text-xl font-semibold text-center">{team.name}</h2>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center relative">
        <div className="text-7xl font-bold text-slate-800 my-8 score-value">
          {formatNumber(team.score)}
        </div>
        
        {/* Left/Minus Button */}
        <div className="absolute bottom-4 left-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full text-2xl border-2 flex items-center justify-center"
            style={buttonStyle}
            onClick={handleDecrement}
            disabled={isPending || team.score === 0}
            data-team-id={team.id}
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Minus className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        {/* Right/Plus Button */}
        <div className="absolute bottom-4 right-4">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full text-2xl border-2 flex items-center justify-center"
            style={buttonStyle}
            onClick={handleIncrement}
            disabled={isPending}
            data-team-id={team.id}
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
