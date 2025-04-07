import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BarChart, Activity, AlertCircle, Clipboard, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisResult {
  byteCodeSize: number;
  memoryAccessPatterns: {
    type: string;
    count: number;
    locations: number[];
  }[];
  functionCalls: {
    name: string;
    callCount: number;
    byteSize: number;
  }[];
  contractSplitRecommendation: {
    contracts: {
      name: string;
      byteSize: number;
      functions: string[];
    }[];
  };
}

interface AnalysisPanelProps {
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isAnalyzing,
  analysisResult
}) => {
  // Calculate contract size as percentage of the 24KB limit
  const contractSizePercentage = analysisResult ? (analysisResult.byteCodeSize / (24 * 1024)) * 100 : 0;
  const isOverLimit = contractSizePercentage > 100;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Contract Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4 py-8 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Analyzing contract code...</p>
          </div>
        ) : analysisResult ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contract Size</span>
                <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-primary'}`}>
                  {(analysisResult.byteCodeSize / 1024).toFixed(2)} KB / 24 KB
                </span>
              </div>
              <Progress 
                value={Math.min(contractSizePercentage, 100)} 
                className={isOverLimit ? "bg-destructive/20" : ""}
              />
              {isOverLimit && (
                <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Exceeds EVM's 24KB contract size limit</span>
                </div>
              )}
            </div>

            <Separator />

            <Tabs defaultValue="memory">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="memory">Memory Access</TabsTrigger>
                <TabsTrigger value="functions">Functions</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="memory" className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Memory Access Patterns</h3>
                <div className="space-y-2">
                  {analysisResult.memoryAccessPatterns.map((pattern, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{pattern.type}</span>
                      <span className="text-muted-foreground">{pattern.count} accesses</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="functions" className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Function Size Analysis</h3>
                <div className="space-y-3">
                  {analysisResult.functionCalls
                    .sort((a, b) => b.byteSize - a.byteSize)
                    .map((func, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono">{func.name}</span>
                        <span className="text-muted-foreground">{(func.byteSize / 1024).toFixed(2)} KB</span>
                      </div>
                      <Progress value={(func.byteSize / analysisResult.byteCodeSize) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Recommended Contract Splitting</h3>
                <div className="space-y-4">
                  {analysisResult.contractSplitRecommendation.contracts.map((contract, i) => (
                    <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Contract {i + 1}: {contract.name}</span>
                        <span className={`text-xs ${contract.byteSize > 24 * 1024 ? 'text-destructive' : 'text-primary'}`}>
                          {(contract.byteSize / 1024).toFixed(2)} KB
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contract.functions.length} functions
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center text-muted-foreground">
            <BarChart className="h-12 w-12 mb-2" />
            <p>Upload contract code to analyze</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
