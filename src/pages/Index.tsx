
import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import CodeEditor from '@/components/CodeEditor';
import AnalysisPanel from '@/components/AnalysisPanel';
import SplitterControls, { SplitOptions } from '@/components/SplitterControls';
import ResultDisplay, { SplitContract } from '@/components/ResultDisplay';
import { useToast } from '@/components/ui/use-toast';
import { detectCodeType, analyzeCode, BytecodeAnalysisResult } from '@/services/bytecodeParser';
import { splitContract, downloadSplitContracts } from '@/services/memorySplitter';
import JSZip from 'jszip';

const Index = () => {
  const { toast } = useToast();
  const [code, setCode] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [codeType, setCodeType] = useState<'yul' | 'bytecode' | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BytecodeAnalysisResult | null>(null);
  const [splitResults, setSplitResults] = useState<SplitContract[] | null>(null);
  
  // Handle file upload
  const handleFileUpload = useCallback(
    async (content: string, name: string) => {
      setCode(content);
      setFileName(name);
      
      // Reset state
      setAnalysisResult(null);
      setSplitResults(null);
      
      // Detect code type
      const detectedType = detectCodeType(content);
      
      if (detectedType === 'unknown') {
        toast({
          title: 'Unsupported file format',
          description: 'Please upload valid Yul or EVM bytecode.',
          variant: 'destructive',
        });
        setCodeType(null);
        return;
      }
      
      setCodeType(detectedType);
      
      // Automatically start analysis
      try {
        setIsAnalyzing(true);
        const result = await analyzeCode(content, detectedType);
        setAnalysisResult(result);
        
        toast({
          title: 'Analysis complete',
          description: `Contract size: ${(result.byteCodeSize / 1024).toFixed(2)}KB`,
        });
      } catch (error) {
        toast({
          title: 'Analysis failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [toast]
  );
  
  // Handle code editor changes
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      
      // Reset analysis if code changes
      setAnalysisResult(null);
      setSplitResults(null);
    },
    []
  );
  
  // Handle analyze button click
  const handleAnalyze = useCallback(
    async () => {
      if (!code || !codeType) {
        toast({
          title: 'No code to analyze',
          description: 'Please upload or enter code first.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        setIsAnalyzing(true);
        const result = await analyzeCode(code, codeType);
        setAnalysisResult(result);
        
        toast({
          title: 'Analysis complete',
          description: `Contract size: ${(result.byteCodeSize / 1024).toFixed(2)}KB`,
        });
      } catch (error) {
        toast({
          title: 'Analysis failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [code, codeType, toast]
  );
  
  // Handle contract splitting
  const handleSplit = useCallback(
    async (options: SplitOptions) => {
      if (!code || !codeType || !analysisResult) {
        toast({
          title: 'Cannot split contract',
          description: 'Please upload code and analyze it first.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        setIsProcessing(true);
        const results = await splitContract(code, codeType, analysisResult, options);
        setSplitResults(results);
        
        toast({
          title: 'Contract split complete',
          description: `Generated ${results.length} contract(s)`,
        });
      } catch (error) {
        toast({
          title: 'Splitting failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [code, codeType, analysisResult, toast]
  );
  
  // Handle download
  const handleDownload = useCallback(
    () => {
      if (!splitResults) {
        toast({
          title: 'No results to download',
          description: 'Please split the contract first.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        downloadSplitContracts(splitResults);
      } catch (error) {
        toast({
          title: 'Download failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      }
    },
    [splitResults, toast]
  );
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 space-y-8">
          {/* Intro section */}
          {!code && (
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold text-primary mb-4">EVM Bytecode Splitter</h1>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Automatically split large EVM contracts into deployable components 
                to overcome the 24KB contract size limit.
              </p>
            </div>
          )}
          
          {/* File upload section */}
          {!code && (
            <div className="max-w-xl mx-auto">
              <FileUploader onFileUpload={handleFileUpload} />
            </div>
          )}
          
          {/* Main interface once code is loaded */}
          {code && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Code editor and analysis */}
              <div className="lg:col-span-2 space-y-6">
                <CodeEditor
                  code={code}
                  language={codeType || 'yul'}
                  onChange={handleCodeChange}
                  title={fileName || 'Contract Code'}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnalysisPanel
                    isAnalyzing={isAnalyzing}
                    analysisResult={analysisResult}
                  />
                  
                  <SplitterControls
                    onSplit={handleSplit}
                    isAnalyzed={!!analysisResult}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
              
              {/* Right column: Results */}
              <div className="lg:col-span-1">
                <ResultDisplay
                  splitResults={splitResults}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t border-border py-4">
        <div className="container">
          <div className="flex justify-center text-xs text-muted-foreground">
            <p>EVM Bytecode Splitter — Solving the 24KB contract size limit</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
