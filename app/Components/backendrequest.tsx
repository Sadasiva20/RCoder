// analyzeCode.ts
import axios from 'axios';

// Simplified function to analyze code by calling the backend API directly
export async function analyzeCodeFromApi(code: string) {
  const req = {
    body: { code },
    method: 'POST',
  };

  // Define the response mock here for API consistency in frontend
  const res = {
    status: (statusCode: number) => ({
      json: (data: any) => {
        if (statusCode === 200) {
          return data;
        } else {
          throw new Error(data.error || 'Error analyzing code');
        }
      },
    }),
  };

  try {
    const response = await axios.post('/api/analyzeCode', req.body);
    return response.data; // Return the result from API call
  } catch (error: unknown) {
    // TypeScript requires type assertion for `unknown` errors
    if (error instanceof Error) {
      throw new Error('Error analyzing code: ' + error.message);
    } else {
      throw new Error('Unknown error occurred');
    }
  }
}
