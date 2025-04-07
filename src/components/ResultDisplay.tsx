
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Check, FileJson, FileCode, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CodeEditor from './CodeEditor';

export interface SplitContract {
  name: string;
  code: string;
  type: 'yul' | 'bytecode';
  byteSize: number;
  dependencies: string[];
}

interface ResultDisplayProps {
  splitResults: SplitContract[] | null;
  onDownload: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  splitResults,
  onDownload
}) => {
  const [selectedContractIndex, setSelectedContractIndex] = React.useState(0);
  
  if (!splitResults || splitResults.length === 0) {
    return (
      <Card className="border border-border h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileJson className="h-5 w-5 text-primary" />
            Split Contracts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileCode className="h-12 w-12 mb-4" />
          <p className="text-center">No split contracts yet</p>
          <p className="text-sm text-center mt-2">
            Analyze and split your contract to see results here
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedContract = splitResults[selectedContractIndex];

  return (
    <Card className="border border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            <span>Split Contracts ({splitResults.length})</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {selectedContract.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-y border-border">
          <div className="flex overflow-x-auto p-2 gap-2 bg-muted/30">
            {splitResults.map((contract, index) => (
              <Button
                key={index}
                variant={index === selectedContractIndex ? "secondary" : "ghost"}
                size="sm"
                className="flex items-center h-8 justify-between gap-2 whitespace-nowrap"
                onClick={() => setSelectedContractIndex(index)}
              >
                <span className="text-xs font-medium">{contract.name}</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {(contract.byteSize / 1024).toFixed(1)}KB
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {selectedContract.dependencies.length > 0 && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContract.dependencies.map((dep, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}
          
          <div className="h-[400px]">
            <CodeEditor
              code={selectedContract.code}
              language={selectedContract.type}
              readOnly
              title={selectedContract.name}
              onChange={() => {}}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-muted-foreground">
              Contract {selectedContractIndex + 1} of {splitResults.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedContractIndex === 0}
                onClick={() => setSelectedContractIndex(selectedContractIndex - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedContractIndex === splitResults.length - 1}
                onClick={() => setSelectedContractIndex(selectedContractIndex + 1)}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border">
        <Button onClick={onDownload} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download All Contracts
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultDisplay;
