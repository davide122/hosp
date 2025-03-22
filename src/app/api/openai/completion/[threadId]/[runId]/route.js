import { NextResponse } from 'next/server';
import axios from 'axios';

const openAIKey = process.env.OPENAI_KEY;
const MAX_RETRIES = 5;
const INITIAL_TIMEOUT = 800;
const MAX_TIMEOUT = 8000;

// Funzione per calcolare il delay con exponential backoff
const getBackoffDelay = (retryCount) => {
  return Math.min(INITIAL_TIMEOUT * Math.pow(2, MAX_RETRIES - retryCount), MAX_TIMEOUT);
};

// Funzione per controllare lo stato della run con retry e exponential backoff
async function checkRunStatusWithRetry(threadId, runId, retries = MAX_RETRIES) {
  const startTime = Date.now();
  try {
    const response = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          Authorization: `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        timeout: getBackoffDelay(retries),
      }
    );
    const responseTime = Date.now() - startTime;
    console.log(`API Response Time: ${responseTime}ms, Status: ${response.status}, Run Status: ${response.data.status}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      console.warn(`Rate limit hit. Retry-After: ${retryAfter}s, X-RateLimit-Remaining: ${error.response.headers['x-ratelimit-remaining'] || 'N/A'}`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return checkRunStatusWithRetry(threadId, runId, retries);
    }

    if (retries > 0) {
      const delay = getBackoffDelay(retries);
      console.warn(`Tentativo fallito per controllo stato run, riprovo tra ${delay}ms... (${MAX_RETRIES - retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return checkRunStatusWithRetry(threadId, runId, retries - 1);
    }

    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error("Errore nel controllo dello stato della run:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Handler per controllare lo stato di completamento della run
export async function GET(req, { params }) {
  const { threadId, runId } = params;

  const result = await checkRunStatusWithRetry(threadId, runId);

  if (result.success) {
    // If the run is completed, fetch token usage
    if (result.data.status === 'completed') {
      try {
        const usageResponse = await axios.get(
          `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`,
          {
            headers: {
              Authorization: `Bearer ${openAIKey}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v2',
            }
          }
        );

        const steps = usageResponse.data.data;
        let totalTokens = 0;
        let promptTokens = 0;
        let completionTokens = 0;

        steps.forEach(step => {
          if (step.usage) {
            promptTokens += step.usage.prompt_tokens || 0;
            completionTokens += step.usage.completion_tokens || 0;
            totalTokens += step.usage.total_tokens || 0;
          }
        });

        return NextResponse.json({
          ...result.data,
          token_usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens
          }
        }, { status: 200 });
      } catch (error) {
        console.error('Error fetching token usage:', error);
        // Return the result even if token usage fetch fails
        return NextResponse.json(result.data, { status: 200 });
      }
    }
    return NextResponse.json(result.data, { status: 200 });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
