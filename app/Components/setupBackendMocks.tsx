import analyzeCode from '../routes/api/analyzeCode'; // Import the analyzeCode function

// Function to create a mock fetch response
function createMockResponse(body: any): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    url: '',
    type: 'basic',
    clone: jest.fn().mockReturnValue(body),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn(),
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    body: null,
    bodyUsed: false,
  } as unknown as Response;
}

// Function to setup backend mocks
export function setupBackendMocks(fileContent: string) {
  const mockFetch = global.fetch as jest.Mock;

  // Mocking OpenAI API response
  mockFetch.mockResolvedValueOnce(
    createMockResponse({
      choices: [{ text: 'Mocked Test Case' }],
    })
  );

  // Mocking ESLint API response
  mockFetch.mockResolvedValueOnce(
    createMockResponse([
      {
        filePath: 'mockFilePath.js',
        messages: [],
        errorCount: 0,
        warningCount: 0,
        suppressedMessages: [],
        fatalErrorCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
      },
    ])
  );

  console.log('Backend mocks have been set up');
}

// Function to run backend tests
export async function runBackendTests(fileContent: string) {
  setupBackendMocks(fileContent);

  // Mock the req and res objects to pass to analyzeCode
  const req = { body: { code: fileContent }, method: 'POST' };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // If the error is expected, pass a string to the `next` function
  await analyzeCode(req, res as any);

  // Validate results in your tests
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    numberOfLines: expect.any(Number),
    numberOfFunctions: expect.any(Number),
    generatedTestCases: { choices: [{ text: 'Mocked Test Case' }] },
  });

  console.log('Backend tests completed successfully');
}
