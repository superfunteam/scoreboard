import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ScoreCard from "./ScoreCard";
import SettingsPanel from "./SettingsPanel";
import { Team, Settings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Settings as SettingsIcon, Shuffle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ScoreKeeper() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [shuffleOnReset, setShuffleOnReset] = useState(false);
  const [pendingTeamId, setPendingTeamId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch teams data
  const {
    data: teams,
    isLoading: isLoadingTeams,
    error: teamsError,
  } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch settings data
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Update team score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({
      teamId,
      score,
    }: {
      teamId: number;
      score: number;
    }) => {
      setPendingTeamId(teamId);
      await apiRequest("PUT", `/api/teams/${teamId}`, { score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setPendingTeamId(null);
    },
    onError: () => {
      setPendingTeamId(null);
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    },
  });

  // Reset scores mutation
  const resetScoresMutation = useMutation({
    mutationFn: async ({ shuffleNames }: { shuffleNames: boolean }) => {
      await apiRequest("POST", "/api/reset-scores", { shuffleNames });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Success",
        description: "All scores have been reset",
        duration: 3000, // Auto-dismiss after 3 seconds
      });
      setIsResetDialogOpen(false);
      setShuffleOnReset(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset scores",
        variant: "destructive",
      });
      setIsResetDialogOpen(false);
    },
  });

  // Handle score increment/decrement
  const handleScoreChange = (
    teamId: number,
    currentScore: number,
    isIncrement: boolean
  ) => {
    // If there's already a pending operation for this team, don't allow another
    if (pendingTeamId === teamId) {
      return;
    }
    
    const increment = settings?.scoreIncrement || 1;
    const newScore = isIncrement
      ? currentScore + increment
      : Math.max(0, currentScore - increment);

    updateScoreMutation.mutate({ teamId, score: newScore });
  };

  // Handle reset scores
  const handleReset = () => {
    setIsResetDialogOpen(true);
  };
  
  const confirmReset = () => {
    resetScoresMutation.mutate({ shuffleNames: shuffleOnReset });
  };

  // Show error toast if data fetching fails
  useEffect(() => {
    if (teamsError) {
      toast({
        title: "Error",
        description: "Failed to load teams data",
        variant: "destructive",
      });
    }

    if (settingsError) {
      toast({
        title: "Error",
        description: "Failed to load settings data",
        variant: "destructive",
      });
    }
  }, [teamsError, settingsError, toast]);

  const isLoading = isLoadingTeams || isLoadingSettings;

  return (
    <div className="relative min-h-screen pb-24 pt-6">
      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-lg">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams?.map((team) => (
              <ScoreCard
                key={team.id}
                team={team}
                onIncrement={() =>
                  handleScoreChange(team.id, team.score, true)
                }
                onDecrement={() =>
                  handleScoreChange(team.id, team.score, false)
                }
                isPending={pendingTeamId === team.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Reset Button */}
      <div className="fixed bottom-4 left-4 z-10">
        <Button
          variant="destructive"
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={handleReset}
          disabled={resetScoresMutation.isPending}
        >
          {resetScoresMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <RotateCcw className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Settings Button */}
      <div className="fixed bottom-4 right-4 z-10">
        <Button
          variant="default"
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
          style={{ backgroundColor: "#4F46E5" }}
          onClick={() => setIsSettingsOpen(true)}
        >
          <SettingsIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Settings Panel */}
      {settings && (
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          teams={teams || []}
        />
      )}
      
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Scores</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all scores to zero?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 my-4 p-2 bg-gray-50 rounded-md">
            <input 
              type="checkbox" 
              id="shuffle-names" 
              className="h-5 w-5 rounded text-indigo-600" 
              checked={shuffleOnReset}
              onChange={(e) => setShuffleOnReset(e.target.checked)}
            />
            <label htmlFor="shuffle-names" className="flex items-center text-sm font-medium cursor-pointer">
              <Shuffle className="h-4 w-4 mr-1" /> 
              Also shuffle team names
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
