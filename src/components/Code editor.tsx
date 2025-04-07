
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language?: 'yul' | 'bytecode' | 'solidity';
  onChange: (code: string) => void;
  readOnly?: boolean;
  title?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'yul',
  onChange,
  readOnly = false,
  title = 'Code Editor'
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Simple syntax highlighting for demo purposes
  const highlightCode = (code: string, language: string) => {
    if (language === 'bytecode') {
      return code;
    }
    
    // Very basic highlighting for Yul
    if (language === 'yul') {
      return code
        .replace(/(function|let|for|if|switch|case|default|break)/g, '<span class="syntax-keyword">$1</span>')
        .replace(/(\w+)(?=\s*\()/g, '<span class="syntax-function">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="syntax-string">"$1"</span>')
        .replace(/(\b\d+\b)/g, '<span class="syntax-number">$1</span>')
        .replace(/(\/\/[^\n]*)/g, '<span class="syntax-comment">$1</span>');
    }
    
    return code;
  };

  useEffect(() => {
    // We would integrate a proper code editor like monaco-editor in a production app
    // This is just a placeholder for the demo
  }, []);

  return (
    <Card className="border border-border bg-code h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8 w-8 p-0">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <CardContent className="p-0">
        {code ? (
          <Tabs defaultValue="editor">
            <div className="border-b border-border">
              <TabsList className="bg-transparent">
                <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
                <TabsTrigger value="raw" className="text-xs">Raw</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="p-0 m-0">
              {readOnly ? (
                <pre className="code-block h-[400px] overflow-auto">
                  <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
                </pre>
              ) : (
                <textarea
                  className="w-full h-[400px] bg-code text-code-foreground font-mono p-4 outline-none resize-none"
                  value={code}
                  onChange={(e) => onChange(e.target.value)}
                  spellCheck={false}
                />
              )}
            </TabsContent>
            <TabsContent value="raw" className="p-0 m-0">
              <pre className="code-block h-[400px] overflow-auto">{code}</pre>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No code loaded
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
