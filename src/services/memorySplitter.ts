
import { SplitOptions } from '@/components/SplitterControls';
import { BytecodeAnalysisResult, extractModules } from './bytecodeParser';
import { SplitContract } from '@/components/ResultDisplay';

// Function to split the contract according to the given options
export const splitContract = async (
  code: string,
  type: 'yul' | 'bytecode',
  analysisResult: BytecodeAnalysisResult,
  options: SplitOptions
): Promise<SplitContract[]> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (options.strategy === 'auto') {
    return splitContractAuto(code, type, analysisResult, options);
  } else {
    return splitContractManual(code, type, options);
  }
};

// Automatic contract splitting based on analysis
const splitContractAuto = async (
  code: string,
  type: 'yul' | 'bytecode',
  analysisResult: BytecodeAnalysisResult,
  options: SplitOptions
): Promise<SplitContract[]> => {
  // Extract modules from the code
  const modules = extractModules(code, type);
  
  // Create contracts based on the analysis recommendation
  const contracts: SplitContract[] = [];
  
  // Use the analysis recommendation for creating contracts
  const { contracts: recommendedContracts } = analysisResult.contractSplitRecommendation;
  
  for (let i = 0; i < recommendedContracts.length; i++) {
    const recommended = recommendedContracts[i];
    const contractModules = modules.filter(m => 
      recommended.functions.includes(m.name)
    );
    
    // If we couldn't match functions to modules, just include some modules
    const modulesToInclude = contractModules.length > 0
      ? contractModules
      : modules.slice(
          Math.floor((i * modules.length) / recommendedContracts.length),
          Math.floor(((i + 1) * modules.length) / recommendedContracts.length)
        );
    
    // Generate contract code by combining modules
    let contractCode = '';
    let dependencies: string[] = [];
    
    if (type === 'yul') {
      contractCode = `object "${recommended.name}" {\n`;
      contractCode += `  code {\n`;
      contractCode += `    // Combined modules for ${recommended.name}\n`;
      contractCode += modulesToInclude.map(m => `    ${m.code}`).join('\n\n');
      contractCode += `\n  }\n`;
      contractCode += `}\n`;
    } else {
      // For bytecode, just concatenate the chunks
      contractCode = modulesToInclude.map(m => m.code).join('');
    }
    
    // Collect dependencies from modules
    modulesToInclude.forEach(m => {
      dependencies = [...dependencies, ...m.dependencies.filter(
        d => !modulesToInclude.some(mod => mod.name === d)
      )];
    });
    
    // Deduplicate dependencies
    dependencies = [...new Set(dependencies)];
    
    // Create split contract
    contracts.push({
      name: recommended.name,
      code: contractCode,
      type,
      byteSize: type === 'bytecode'
        ? contractCode.replace('0x', '').length / 2
        : contractCode.length,
      dependencies
    });
  }
  
  return contracts;
};

// Manual contract splitting based on custom split points
const splitContractManual = async (
  code: string,
  type: 'yul' | 'bytecode',
  options: SplitOptions
): Promise<SplitContract[]> => {
  const { customSplitPoints = [] } = options;
  
  // Sort split points
  const sortedSplitPoints = [...customSplitPoints].sort((a, b) => a - b);
  
  // Create contracts by splitting at the specified points
  const contracts: SplitContract[] = [];
  let startPoint = 0;
  
  for (let i = 0; i <= sortedSplitPoints.length; i++) {
    const endPoint = i < sortedSplitPoints.length
      ? sortedSplitPoints[i]
      : code.length;
    
    const contractCode = code.slice(startPoint, endPoint);
    
    // Skip empty contracts
    if (contractCode.trim().length === 0) {
      startPoint = endPoint;
      continue;
    }
    
    const contractName = `Contract${i + 1}`;
    
    let formattedCode = contractCode;
    if (type === 'yul' && !contractCode.trim().startsWith('object')) {
      formattedCode = `object "${contractName}" {\n`;
      formattedCode += `  code {\n`;
      formattedCode += `    ${contractCode}\n`;
      formattedCode += `  }\n`;
      formattedCode += `}\n`;
    }
    
    contracts.push({
      name: contractName,
      code: formattedCode,
      type,
      byteSize: type === 'bytecode'
        ? formattedCode.replace('0x', '').length / 2
        : formattedCode.length,
      dependencies: i > 0 ? [`Contract${i}`] : []
    });
    
    startPoint = endPoint;
  }
  
  return contracts;
};

// Helper function to download split contracts
export const downloadSplitContracts = (
  contracts: SplitContract[]
) => {
  const zip = new JSZip();
  const folder = zip.folder('split-contracts');
  
  if (folder) {
    contracts.forEach((contract, index) => {
      const fileName = `${contract.name}.${contract.type === 'yul' ? 'yul' : 'hex'}`;
      folder.file(fileName, contract.code);
    });
    
    // Create a README file
    const readmeContent = `# Split Contract Files
    
This folder contains ${contracts.length} split contract files generated by EVM Bytecode Splitter.

## Contracts

${contracts.map((c, i) => `${i + 1}. ${c.name} - ${(c.byteSize / 1024).toFixed(2)}KB`).join('\n')}

## Dependencies

${contracts.map(c => 
  `${c.name} depends on: ${c.dependencies.length ? c.dependencies.join(', ') : 'None'}`
).join('\n')}

## How to Use

These contracts need to be deployed in the correct order to ensure dependencies are available.
`;
    
    folder.file('README.md', readmeContent);
    
    // Generate metadata file
    const metadata = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      contracts: contracts.map(c => ({
        name: c.name,
        type: c.type,
        size: c.byteSize,
        dependencies: c.dependencies
      }))
    };
    
    folder.file('metadata.json', JSON.stringify(metadata, null, 2));
    
    // Create and download the zip file
    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'split-contracts.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
};

// Mock implementation for JSZip
// In a real app, we would use the actual JSZip library
class JSZip {
  private files: Map<string, string>;
  
  constructor() {
    this.files = new Map();
  }
  
  folder(name: string) {
    return {
      file: (fileName: string, content: string) => {
        this.files.set(`${name}/${fileName}`, content);
      }
    };
  }
  
  async generateAsync({ type }: { type: string }): Promise<Blob> {
    // Convert files to a Blob
    // In a real app, this would create a proper ZIP file
    const filesArray = Array.from(this.files.entries()).map(
      ([path, content]) => `${path}:\n${content}\n\n`
    );
    
    return new Blob([filesArray.join('---\n')], { type: 'application/zip' });
  }
}
