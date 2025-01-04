import { InteractiveBrowserCredential } from '@azure/identity';
import axios from 'axios';

// Azure configuration
const endpoint = process.env.ENDPOINT_URL || 'https://analyze23456.openai.azure.com/';
const deployment = process.env.DEPLOYMENT_NAME || 'gpt-4o';

// Function to get access token from Azure
async function getAccessToken(): Promise<string> {
  const credential = new InteractiveBrowserCredential({
    clientId: process.env.CLIENT_ID || '046506ff-553c-44a6-9555-1ce5c4b594d1',
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000',
  });
  const scope = 'https://cognitiveservices.azure.com/.default';

  try {
    const tokenResponse = await credential.getToken(scope);
    return tokenResponse?.token || '';
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw new Error('Authentication failed');
  }
}

// Function to analyze code using Azure OpenAI
async function analyzeCode(req: { body: { code: string }; method: string }, res: any, code: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'api-version': '2024-05-01-preview',
    };

    const payload = {
      prompt: `Analyze the following code:\n\n${code}`,
      max_tokens: 150,
    };

    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/completions`,
      payload,
      { headers }
    );

    return response.data; // Return the response from Azure OpenAI
  } catch (error) {
    console.error('Error analyzing code:', (error as any).message);
    throw new Error('Error analyzing code');
  }
}

// Function to generate test cases using Azure OpenAI
export async function generateTestCases(req: { body: { code: string }; method: string }, res: any): Promise<void> {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'api-version': '2024-05-01-preview',
    };

    const payload = {
      prompt: `Generate test cases for the following code:\n\n${code}`,
      max_tokens: 150,
    };

    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/completions`,
      payload,
      { headers }
    );

    const testCases = response.data.choices.map((choice: any) => choice.text.trim());

    res.status(200).json({ testCases });
  } catch (error) {
    console.error('Error generating test cases:', (error as any).message);
    res.status(500).json({ error: 'Error generating test cases' });
  }
}

// Exportable function to handle the request for code analysis
export async function handleRequest(
  req: { body: { code: string }; method: string },
  res: any,
  callback?: (err?: Error) => void
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    callback?.(new Error('Method not allowed'));
    return;
  }

  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    callback?.(new Error('Code is required'));
    return;
  }

  try {
    const analysisResult = await analyzeCode(req, res, code);

    res.status(200).json({
      analysis: analysisResult,
    });

    callback?.();
  } catch (error) {
    res.status(500).json({
      error: 'Error analyzing code',
      details: (error as any).message || 'Unknown error',
    });
    callback?.(error as Error);
  }
}

export default handleRequest;
