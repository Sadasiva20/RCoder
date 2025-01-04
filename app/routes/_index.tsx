import React, { useEffect, useState } from 'react';
import Home from '../Components/app'; // Adjust the import to the correct path of your Home component
import handleRequest from './api/analyzeCode'; // Adjust to the correct relative path to your API file

export const fetchData = async () => {
  try {
    // Simulate a POST request to the API using the handleRequest function
    const req = {
      method: 'POST',
      body: { code: 'console.log("Hello, World!");' }, // Example code for testing
    };

    let response: any = {};
    const res = {
      status: (statusCode: number) => {
        response.statusCode = statusCode;
        return res;
      },
      json: (data: any) => {
        response.data = data;
      },
    };

    await handleRequest(req, res as any);
    if (response.statusCode !== 200) {
      throw new Error(response.data.error || 'Error fetching data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error instanceof Error ? error.message : 'Unknown error');
    return { message: 'Error fetching data' };
  }
};

export default function Index() {
  const [data, setData] = useState({ message: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setIsAnalyzing(true);
      const result = await fetchData();
      setData(result);
      setIsAnalyzing(false);
    };
    getData();
  }, []);

  return (
    <div>
      <h1>{data.message || 'Welcome to the Code Analyzer App'}</h1>

      {isAnalyzing && <p>Analyzing code, please wait...</p>}

      {/* Render the Home component, which contains the UI for file analysis */}
      <Home />
    </div>
  );
}
