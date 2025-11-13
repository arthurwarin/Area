// Temporary workaround until backend includes 'data' field in /services endpoint
// This maps action/reaction IDs to their required configuration fields

export const ACTION_FIELDS_FALLBACK: Record<number, string[]> = {
  1: ["repositoryOwner", "repositoryName"], // GitHub Push
  2: ["time"], // Timer Daily - HH:MM format
  3: ["date"], // Timer Annual Date - DD/MM format
  4: ["daysAhead"], // Timer Future Date - number of days
  5: [], // Spotify Track Saved - no configuration needed
  6: ["subreddit"], // Reddit New Post - subreddit name (without r/)
  7: ["channelId"], // Slack New Message - Slack channel ID (C01234ABCDE)
  // Add more as needed when backend adds more actions
};

export const REACTION_FIELDS_FALLBACK: Record<number, string[]> = {
  1: ["channelId", "message", "guildId"], // Discord Message - [channelId, message] sent to backend, guildId for UI only
  // Add more as needed when backend adds more reactions
};

export function getActionFields(action: { id: number; data?: string[] }): string[] {
  if (action.data && Array.isArray(action.data)) {
    return action.data;
  }
  return ACTION_FIELDS_FALLBACK[action.id] || [];
}

export function getReactionFields(reaction: { id: number; data?: string[] }): string[] {
  if (reaction.data && Array.isArray(reaction.data)) {
    return reaction.data;
  }
  return REACTION_FIELDS_FALLBACK[reaction.id] || [];
}
