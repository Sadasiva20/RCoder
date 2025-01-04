import { useState, useRef } from 'react';
import handleRequest, { generateTestCases } from '../routes/api/analyzeCode'; // Ensure correct import

const Home = () => {
  const [code, setCode] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [testCases, setTestCases] = useState<any>(null); // State for storing test cases
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const analyzeFile = async () => {
    if (!code) {
      setAnalysisResult({ error: 'No code to analyze' });
      setTestCases(null);
      return;
    }

    try {
      // Analyze code using the existing backend function
      const req = { body: { code }, method: 'POST' };

      // Mock res object with correct methods
      const res = {
        status: (statusCode: number) => ({
          json: (data: any) => {
            if (statusCode === 200) {
              setAnalysisResult(data.analysis); // Set the analysis result
            } else {
              setAnalysisResult({ error: data.error || 'Error analyzing code' });
            }
          },
        }),
      };

      await handleRequest(req, res as any);

      // Generate test cases using the `generateTestCases` function
      const testCasesResult = await generateTestCases(req ,code);
      setTestCases(testCasesResult);
    } catch (error) {
      setAnalysisResult({ error: 'Error analyzing code' });
      setTestCases(null);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-background min-h-screen">
      <h1 className="text-4xl font-extrabold text-primary mb-6">Code Analyzer</h1>
      <p className="text-lg text-textSecondary mb-10">Easily analyze and debug your JavaScript/TypeScript code!</p>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-md px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-indigo-600 transition-all ease-in-out duration-300 transform hover:scale-105 mb-4"
      >
        Open File
      </button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={openFile}
        accept=".js,.jsx,.ts,.tsx"
      />

      <textarea
        value={code}
        readOnly
        className="w-full max-w-3xl h-64 p-4 bg-gray-100 border border-borderColor rounded-md text-sm font-mono text-gray-700 resize-none shadow-sm mb-6"
      />

      <button
        onClick={analyzeFile}
        className="w-full max-w-md px-6 py-3 bg-secondary text-white rounded-lg shadow-md hover:bg-orange-600 transition-all ease-in-out duration-300 transform hover:scale-105"
      >
        Analyze Code
      </button>

      {analysisResult && (
        <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg mt-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Analysis Results</h2>
          <pre className="text-sm text-textPrimary whitespace-pre-wrap">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      )}

      {testCases && (
        <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg mt-8">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Generated Test Cases</h2>
          <textarea
            value={JSON.stringify(testCases, null, 2)}
            readOnly
            className="w-full h-64 p-4 bg-gray-100 border border-borderColor rounded-md text-sm font-mono text-gray-700 resize-none shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default Home;

