import React from 'react';
import { useUniversalProfile } from '../hooks/use-universal-profile';

interface UniversalProfileIndicatorProps {
  className?: string;
}

export const UniversalProfileIndicator: React.FC<UniversalProfileIndicatorProps> = ({ 
  className = "" 
}) => {
  const upData = useUniversalProfile();

  if (!upData.isConnected) {
    return (
      <div className={`flex items-center gap-2 text-zinc-500 text-xs ${className}`}>
        <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
        <span>No Universal Profile detected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-400 text-xs font-mono">UP_CONNECTED</span>
      </div>

      {/* Profile info */}
      <div className="flex items-center gap-2 text-zinc-300 text-xs">
        {upData.name && (
          <span className="font-mono">{upData.name}</span>
        )}
        {upData.address && (
          <span className="text-zinc-500 font-mono">
            {upData.address.slice(0, 6)}...{upData.address.slice(-4)}
          </span>
        )}
      </div>

      {/* Archetype holder badge */}
      {upData.isArchetypeHolder && (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full">
          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
          <span className="text-orange-400 text-xs font-mono">
            ARCHETYPE_HOLDER
          </span>
          {upData.archetypeCount > 0 && (
            <span className="text-orange-300 text-xs font-mono">
              ({upData.archetypeCount})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalProfileIndicator;
