
import React from 'react';
import { Sparkles, Split } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Split className="h-6 w-6 text-primary animate-pulse-slow" />
          <h1 className="text-xl font-bold tracking-tight">EVM Bytecode Splitter</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Split large contracts to overcome 24KB limit
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
