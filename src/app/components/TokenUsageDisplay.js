'use client';

import { useEffect, useState } from 'react';

export function TokenUsageDisplay({ tokenUsage }) {
  if (!tokenUsage) return null;

  return (
    <div className="p-4 lg:p-6 rounded-3xl bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] duration-300">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
        Token Usage Statistics
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-2 hover:bg-gray-700/20 rounded-lg transition-colors">
          <span className="text-sm text-gray-300">Prompt Tokens:</span>
          <span className="text-sm text-blue-400 font-medium">{tokenUsage.promptTokens}</span>
        </div>
        <div className="flex justify-between items-center p-2 hover:bg-gray-700/20 rounded-lg transition-colors">
          <span className="text-sm text-gray-300">Completion Tokens:</span>
          <span className="text-sm text-blue-400 font-medium">{tokenUsage.completionTokens}</span>
        </div>
        <div className="flex justify-between items-center p-2 hover:bg-gray-700/20 rounded-lg transition-colors">
          <span className="text-sm text-gray-300">Total Tokens:</span>
          <span className="text-sm text-blue-400 font-medium">{tokenUsage.totalTokens}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="flex justify-between items-center p-2 hover:bg-gray-700/20 rounded-lg transition-colors">
            <span className="text-sm text-gray-300">Estimated Cost:</span>
            <span className="text-sm text-green-400 font-medium">${tokenUsage.totalCost.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}