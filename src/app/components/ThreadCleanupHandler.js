'use client';

import { useEffect, useState } from 'react';
import { calculateTokenCost } from '../utils/tokenCost';
import { saveTokenUsage } from '../utils/tokenStorage';

export function ThreadCleanupHandler({ threadId, onNewThread }) {
  const [tokenUsage, setTokenUsage] = useState(null);
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (!threadId) {
        console.log('No threadId available for cleanup');
        return;
      }
      console.log('Starting cleanup for threadId:', threadId);

      try {
        // Create a new thread before cleaning up the old one
        console.log('Creating new thread...');
        const createResponse = await fetch('/api/openai/threads', {
          method: 'POST',
        });
        const newThreadData = await createResponse.json();
        console.log('New thread created:', newThreadData);

        if (newThreadData.id) {
          // Store the new thread ID for next session
          localStorage.setItem('lastThreadId', newThreadData.id);
          console.log('New threadId stored in localStorage:', newThreadData.id);

          // Fetch runs first to get the latest run ID
          console.log('Fetching runs for threadId:', threadId);
          const runsResponse = await fetch(`/api/openai/threads/${threadId}/runs`, {
            method: 'GET',
          });
          const runsData = await runsResponse.json();
          console.log('Runs data received:', runsData);

          // Get the latest run ID
          const latestRun = runsData.data?.[0];
          if (latestRun?.id) {
            console.log('Fetching token usage for latest run:', latestRun.id);
            const completionResponse = await fetch(`/api/openai/completion/${threadId}/${latestRun.id}`, {
              method: 'GET',
            });
            const completionData = await completionResponse.json();
            console.log('Completion data received:', completionData);
          
          if (completionData.usage) {
            console.log('Token usage data found:', completionData.usage);
            const costInfo = calculateTokenCost(completionData.usage);
            console.log('Calculated cost info:', costInfo);
            setTokenUsage(costInfo);
            saveTokenUsage(threadId, costInfo);
          } else {
            console.log('No usage data found in completion response');
          }

          // Cancel any ongoing runs using the already fetched runs data

          // Cancel any active runs
          if (runsData.data) {
            for (const run of runsData.data) {
              if (['in_progress', 'queued'].includes(run.status)) {
                console.log('Cancelling active run:', run.id);
                await fetch(`/api/openai/threads/${threadId}/runs/${run.id}/cancel`, {
                  method: 'POST',
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [threadId]);

  return null;
}