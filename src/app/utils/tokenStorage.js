'use client';

const TOKEN_HISTORY_KEY = 'tokenUsageHistory';

export function saveTokenUsage(threadId, tokenUsage) {
  console.log('Attempting to save token usage for thread:', threadId);
  console.log('Token usage data to save:', tokenUsage);

  if (!threadId || !tokenUsage) {
    console.log('Missing required data for saving token usage');
    return;
  }

  try {
    // Get existing history
    const history = getTokenHistory();
    console.log('Current token history:', history);

    // Add new entry
    const entry = {
      threadId,
      timestamp: new Date().toISOString(),
      ...tokenUsage
    };
    console.log('New token usage entry:', entry);

    history.push(entry);

    // Store updated history
    localStorage.setItem(TOKEN_HISTORY_KEY, JSON.stringify(history));
    console.log('Token usage history updated successfully');
  } catch (error) {
    console.error('Error saving token usage:', error);
  }
}

export function getTokenHistory() {
  try {
    const history = localStorage.getItem(TOKEN_HISTORY_KEY);
    console.log('Retrieved token history from storage:', history);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting token history:', error);
    return [];
  }
}

export function getThreadTokens(threadId) {
  console.log('Getting tokens for thread:', threadId);
  
  if (!threadId) {
    console.log('No threadId provided for token retrieval');
    return null;
  }
  
  try {
    const history = getTokenHistory();
    const threadTokens = history.filter(entry => entry.threadId === threadId);
    console.log('Found token entries for thread:', threadTokens);
    return threadTokens;
  } catch (error) {
    console.error('Error getting thread tokens:', error);
    return null;
  }
}