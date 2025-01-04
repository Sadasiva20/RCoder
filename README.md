# RCoder


This is a web-based application that allows users to upload and analyze JavaScript/TypeScript code using Azure OpenAI. The app provides functionality for code analysis and test case generation, utilizing Azure's GPT-based models.

## Features

- **Code Upload**: Users can upload `.js`, `.jsx`, `.ts`, and `.tsx` files for analysis.
- **Code Analysis**: The app sends the uploaded code to Azure's GPT-4 model for analysis and receives a response.
- **Test Case Generation**: Users can generate test cases for the uploaded code using OpenAI's model.
- **Interactive UI**: A clean interface for easy code analysis and test case generation.

## Requirements

- **Node.js** (v16.x or higher)
- **Azure Subscription**: You will need an Azure subscription to use the Cognitive Services API.
- **OpenAI API Key**: Set up the environment variables for accessing the GPT-4 API.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/code-analyzer.git
   cd code-analyzer

1.	Install dependencies:
2.	Ensure you have npm or yarn installed. Then run:
3.	npm install
4.	
5.	Set up environment variables:
6.	You need to create a .env file with the following variables:
7.	ENDPOINT_URL=https://your-azure-endpoint
8.	DEPLOYMENT_NAME=gpt-4o
9.	CLIENT_ID=your-client-id
10.	TENANT_ID=your-tenant-id
11.	CLIENT_SECRET=your-client-secret
12.	
·	Replace your-azure-endpoint with your Azure Cognitive Services endpoint.
·	Replace gpt-4o with your deployment name.
·	You can get the Client ID, Tenant ID, and Client Secret from the Azure portal.
1.	Run the application:
2.	npm start
3.	
4.	This will start the development server and open the app in your browser.
Usage
1.	Upload Code: Click on the "Open File" button to select a .js, .jsx, .ts, or .tsx file from your local system.
2.	Analyze Code: After uploading the code, click the "Analyze Code" button to send the code to Azure OpenAI for analysis.
3.	Generate Test Cases: You can also use the application to generate test cases by calling the generateTestCases function.
4.	View Results: The results from the analysis or test case generation will appear in a new text box below the buttons.
Technologies Used
·	React: Frontend framework for building the user interface.
·	TypeScript: For type safety and better development experience.
·	Azure OpenAI (GPT-4): For code analysis and generating test cases.
·	Axios: To make HTTP requests to Azure services.
·	Azure Identity SDK: For authentication using InteractiveBrowserCredential.
