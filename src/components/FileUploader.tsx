
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onFileUpload: (content: string, fileName: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  accept = ".yul,.hex,.txt",
  maxSizeMB = 10
}) => {
  const { toast } = useToast();
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      
      if (!file) return;
      
      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${maxSizeMB}MB`,
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileUpload(content, file.name);
      };
      reader.readAsText(file);
    },
    [maxSizeBytes, maxSizeMB, onFileUpload, toast]
  );
  
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        
        if (file.size > maxSizeBytes) {
          toast({
            title: "File too large",
            description: `Maximum file size is ${maxSizeMB}MB`,
            variant: "destructive",
          });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          onFileUpload(content, file.name);
        };
        reader.readAsText(file);
      }
    },
    [maxSizeBytes, maxSizeMB, onFileUpload, toast]
  );
  
  const preventDefaultHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="bg-muted/50 border-dashed border-2 border-muted">
      <CardContent>
        <div
          className="flex flex-col items-center justify-center py-10 px-4 text-center"
          onDrop={handleDrop}
          onDragOver={preventDefaultHandler}
          onDragEnter={preventDefaultHandler}
        >
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Upload Contract Code</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag and drop your Yul or bytecode files here
          </p>
          <div className="flex gap-2 items-center">
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              <FileUp className="mr-2 h-4 w-4" />
              Select File
            </Button>
            <input
              id="file-upload"
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Max file size: {maxSizeMB}MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
