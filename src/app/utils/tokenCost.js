// Utility function to calculate OpenAI API costs based on token usage

// GPT-4o mini pricing model
// - Input: $0.150 per 1M tokens (regular input processing)
// - Cached Input: $0.075 per 1M tokens (for repeated/cached inputs)
// - Output: $0.600 per 1M tokens (model-generated responses)
const PRICE_PER_1M_TOKENS = {
  input: 0.15,      // $0.150 per 1M tokens
  cachedInput: 0.075, // $0.075 per 1M tokens
  output: 0.6       // $0.600 per 1M tokens
};

export function calculateTokenCost(tokenUsage) {
  console.log('Calculating token cost for usage:', tokenUsage);
  if (!tokenUsage) {
    console.log('No token usage data provided');
    return { total: 0, breakdown: {} };
  }

  const {
    prompt_tokens = 0,
    completion_tokens = 0,
    cached_tokens = 0
  } = tokenUsage;

  console.log('Token breakdown:', {
    prompt_tokens,
    completion_tokens,
    cached_tokens
  });

  // Calculate costs for each type
  const inputCost = (prompt_tokens / 1_000_000) * PRICE_PER_1M_TOKENS.input;
  const cachedCost = (cached_tokens / 1_000_000) * PRICE_PER_1M_TOKENS.cachedInput;
  const outputCost = (completion_tokens / 1_000_000) * PRICE_PER_1M_TOKENS.output;

  // Total cost
  const total = inputCost + cachedCost + outputCost;

  const result = {
    total: parseFloat(total.toFixed(6)),
    breakdown: {
      input: parseFloat(inputCost.toFixed(6)),
      cached: parseFloat(cachedCost.toFixed(6)),
      output: parseFloat(outputCost.toFixed(6))
    }
  };

  console.log('Calculated costs:', result);
  return result;
}