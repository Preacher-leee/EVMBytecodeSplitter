
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Workflow, Settings, Zap, Split } from 'lucide-react';

interface SplitterControlsProps {
  onSplit: (options: SplitOptions) => void;
  isAnalyzed: boolean;
  isProcessing: boolean;
}

export interface SplitOptions {
  strategy: 'auto' | 'manual';
  maxContractSize: number;
  optimizeGas: boolean;
  preserveFunctionGroups: boolean;
  functionGroups?: string[][];
  customSplitPoints?: number[];
}

const SplitterControls: React.FC<SplitterControlsProps> = ({
  onSplit,
  isAnalyzed,
  isProcessing
}) => {
  const [splitOptions, setSplitOptions] = useState<SplitOptions>({
    strategy: 'auto',
    maxContractSize: 24, // in KB
    optimizeGas: true,
    preserveFunctionGroups: true,
    functionGroups: [],
    customSplitPoints: []
  });

  const handleStrategyChange = (strategy: 'auto' | 'manual') => {
    setSplitOptions({
      ...splitOptions,
      strategy
    });
  };

  const handleMaxContractSizeChange = (value: number[]) => {
    setSplitOptions({
      ...splitOptions,
      maxContractSize: value[0]
    });
  };

  const handleSplitClick = () => {
    onSplit(splitOptions);
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Split className="h-5 w-5 text-primary" />
          Splitter Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs 
          defaultValue="auto" 
          onValueChange={(v) => handleStrategyChange(v as 'auto' | 'manual')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Automatic</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Maximum Contract Size</Label>
                  <span className="text-sm text-muted-foreground">
                    {splitOptions.maxContractSize} KB
                  </span>
                </div>
                <Slider
                  defaultValue={[24]}
                  max={24}
                  min={1}
                  step={1}
                  onValueChange={handleMaxContractSizeChange}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-4">
                  <Label htmlFor="optimize-gas">Optimize for gas usage</Label>
                  <Switch
                    id="optimize-gas"
                    checked={splitOptions.optimizeGas}
                    onCheckedChange={(checked) => {
                      setSplitOptions({
                        ...splitOptions,
                        optimizeGas: checked
                      });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-4">
                  <Label htmlFor="preserve-groups">Preserve function groups</Label>
                  <Switch
                    id="preserve-groups"
                    checked={splitOptions.preserveFunctionGroups}
                    onCheckedChange={(checked) => {
                      setSplitOptions({
                        ...splitOptions,
                        preserveFunctionGroups: checked
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Custom Split Points (byte offsets, comma-separated)</Label>
              <Input
                placeholder="e.g. 8192, 16384"
                onChange={(e) => {
                  const values = e.target.value
                    .split(',')
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v));
                  
                  setSplitOptions({
                    ...splitOptions,
                    customSplitPoints: values
                  });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Specify exact byte positions where the contract should be split
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!isAnalyzed || isProcessing}
          onClick={handleSplitClick}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <Workflow className="mr-2 h-4 w-4" />
              Split Contract
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SplitterControls;
