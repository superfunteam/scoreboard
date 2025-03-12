import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localApi } from "./localApi";
import { Team, Settings } from "@shared/schema";

// This function handles API requests using the local API
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Parse the URL to determine which API to call
  const endpoint = url.split('/').pop() || '';
  const id = parseInt(url.split('/').slice(-1)[0]);
  
  try {
    // Handle each endpoint
    if (url === '/api/teams') {
      if (method === 'GET') {
        return await localApi.getTeams();
      } else if (method === 'POST') {
        return await localApi.createTeam(data as any);
      }
    } 
    else if (url.startsWith('/api/teams/') && !isNaN(id)) {
      if (method === 'GET') {
        return await localApi.getTeam(id);
      } else if (method === 'PUT') {
        return await localApi.updateTeam(id, data as any);
      } else if (method === 'DELETE') {
        return await localApi.deleteTeam(id);
      }
    } 
    else if (url === '/api/settings') {
      if (method === 'GET') {
        return await localApi.getSettings();
      } else if (method === 'PUT') {
        return await localApi.updateSettings(data as any);
      }
    } 
    else if (url === '/api/reset-scores') {
      return await localApi.resetScores(data as any || { shuffleNames: false });
    } 
    else if (url === '/api/shuffle-team-names') {
      return await localApi.shuffleTeamNames();
    }
    
    throw new Error(`Unhandled request: ${method} ${url}`);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Define query function that uses our local API instead of fetch
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    try {
      // Use our API request function
      return await apiRequest('GET', url);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
