import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Team, TEAM_COLORS } from "@shared/schema";
import { generateRandomTeamName } from "@/lib/nameGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  teams: Team[];
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  teams,
}: SettingsPanelProps) {
  const { toast } = useToast();
  
  // Local state for form values
  const [teamCount, setTeamCount] = useState(settings.teamCount);
  const [scoreIncrement, setScoreIncrement] = useState(settings.scoreIncrement.toString());
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [teamColors, setTeamColors] = useState<string[]>([]);
  
  // Update local state when settings or teams change
  useEffect(() => {
    setTeamCount(settings.teamCount);
    setScoreIncrement(settings.scoreIncrement.toString());
    
    // Initialize team names and colors from current teams
    const names = Array(8).fill("");
    const colors = Array(8).fill("");
    
    teams.forEach((team) => {
      if (team.id <= 8) {
        names[team.id - 1] = team.name;
        colors[team.id - 1] = team.color;
      }
    });
    
    // Fill any empty colors with defaults
    for (let i = 0; i < colors.length; i++) {
      if (!colors[i]) {
        colors[i] = TEAM_COLORS[i % TEAM_COLORS.length];
      }
    }
    
    setTeamNames(names);
    setTeamColors(colors);
  }, [settings, teams]);
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: { teamCount: number; scoreIncrement: number }) => {
      await apiRequest("PUT", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });
  
  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, name, color }: { id: number; name: string; color: string }) => {
      await apiRequest("PUT", `/api/teams/${id}`, { name, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      });
    },
  });
  
  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      await apiRequest("POST", "/api/teams", { name, score: 0, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    },
  });
  
  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/teams/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    },
  });
  
  // Handle team name change
  const handleTeamNameChange = (index: number, value: string) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = value;
    setTeamNames(newTeamNames);
  };
  
  // Handle team color change
  const handleTeamColorChange = (index: number, color: string) => {
    const newTeamColors = [...teamColors];
    newTeamColors[index] = color;
    setTeamColors(newTeamColors);
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      // Update settings
      await updateSettingsMutation.mutateAsync({
        teamCount,
        scoreIncrement: parseInt(scoreIncrement),
      });
      
      // Update existing teams and create new ones if needed
      for (let i = 0; i < teamCount; i++) {
        const teamIndex = i + 1;
        const existingTeam = teams.find(t => t.id === teamIndex);
        const name = teamNames[i] || generateRandomTeamName();
        const color = teamColors[i] || TEAM_COLORS[i % TEAM_COLORS.length];
        
        if (existingTeam) {
          if (existingTeam.name !== name || existingTeam.color !== color) {
            await updateTeamMutation.mutateAsync({ id: existingTeam.id, name, color });
          }
        } else {
          await createTeamMutation.mutateAsync({ name, color });
        }
      }
      
      // Delete teams that are no longer needed
      for (const team of teams) {
        if (team.id > teamCount) {
          await deleteTeamMutation.mutateAsync(team.id);
        }
      }
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };
  
  const isPending = updateSettingsMutation.isPending || 
                   updateTeamMutation.isPending || 
                   createTeamMutation.isPending || 
                   deleteTeamMutation.isPending;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0" side="right">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="text-2xl font-bold text-gray-800">Settings</SheetTitle>
          </SheetHeader>
          
          <div className="p-6 overflow-y-auto flex-grow">
            {/* Number of Teams */}
            <div className="mb-6">
              <h3 className="block text-lg font-bold mb-2 text-gray-800">
                Number of Teams/Players
              </h3>
              <div className="flex items-center gap-3">
                <Slider
                  id="team-count"
                  min={2}
                  max={8}
                  step={1}
                  value={[teamCount]}
                  onValueChange={(value) => setTeamCount(value[0])}
                  className="flex-1"
                />
                <span className="text-lg font-medium w-8 text-center">{teamCount}</span>
              </div>
            </div>
            
            {/* Score Increment */}
            <div className="mb-6">
              <h3 className="block text-lg font-bold mb-2 text-gray-800">
                Score Increment Value
              </h3>
              <RadioGroup
                value={scoreIncrement}
                onValueChange={setScoreIncrement}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="increment-1" />
                  <Label htmlFor="increment-1" className="text-lg font-bold">1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="10" id="increment-10" />
                  <Label htmlFor="increment-10" className="text-lg font-bold">10</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100" id="increment-100" />
                  <Label htmlFor="increment-100" className="text-lg font-bold">100</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Team Settings (Names and Colors) */}
            <div className="mb-6">
              <h3 className="block text-lg font-bold mb-2 text-gray-800">Team Settings</h3>
              <div className="space-y-5">
                {Array.from({ length: teamCount }).map((_, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor={`team-name-${index + 1}`} className="block text-base font-medium mb-1">
                      Team {index + 1} Name
                    </Label>
                    <Input
                      id={`team-name-${index + 1}`}
                      value={teamNames[index] || ""}
                      onChange={(e) => handleTeamNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className="w-full mb-3 text-base"
                    />
                    
                    <Label className="block text-base font-medium mb-2">
                      Team Color
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_COLORS.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            teamColors[index] === color ? 'border-black ring-2 ring-offset-2' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleTeamColorChange(index, color)}
                          aria-label={`Select color ${colorIndex + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter className="p-6 border-t">
            <Button
              className="w-full font-bold text-white"
              style={{ backgroundColor: "#4f46e5" }} /* Indigo color */
              onClick={handleSaveSettings}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
