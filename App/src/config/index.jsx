export const Config = {
  // API_URL: 'https://us-east-18gh6qa2z0.auth.us-east-1.amazoncognito.com',
  API_URL: 'https://3hc254p0l3.execute-api.us-east-1.amazonaws.com/prod/auth',
  COGNITO_REGION: 'us-east-1',
  COGNITO_CLIENT_ID: '4vq7alk8e8uu9ajt3hh4tassk2',
  COGNITO_IDP_URL: 'https://cognito-idp.us-east-1.amazonaws.com/',
  CHAT_API_URL: 'https://lugv3mp9l6.execute-api.us-east-1.amazonaws.com/chat',
  PROPERTIES_API_URL :'https://1vmmxi10ue.execute-api.us-east-1.amazonaws.com/items',
  
  USER_SERVICE: {
    // OAuth2 endpoints (for hosted UI)
    TOKEN_URL: '/oauth2/token',
  },

  //  API_URL: 'https://your-api-url.com',
  // CHAT_API_URL: 'https://your-chat-api-url.com',
  
  // Add this for the enhanced features
  GEMINI_API_KEY: 'AQ.Ab8RN6JDrgSGiS1YJ6GJEl08RUV2oi1VviFQPtRyp2y2jiemaQ',
  GEMINI_API_URL: 'https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent',
  
  // Feature flags
  ENABLE_IMAGE_ANALYSIS: true,
  ENABLE_AI_SUGGESTIONS: true,
  ENABLE_FALLBACK_AI: true,
  
  // Timeout settings
  PRIMARY_API_TIMEOUT: 30000,    // 30 seconds
  GEMINI_API_TIMEOUT: 45000,     // 45 seconds
  SUGGESTION_TIMEOUT: 15000,  

 ENDPOINTS: {
    SIGN_UP: 'AWSCognitoIdentityProviderService.SignUp',
    CONFIRM_SIGN_UP: 'AWSCognitoIdentityProviderService.ConfirmSignUp',
    INITIATE_AUTH: 'AWSCognitoIdentityProviderService.InitiateAuth',
     CHAT: '/chat',
  },
  
  // Common Headers
  HEADERS: {
    CONTENT_TYPE: 'application/x-amz-json-1.1',
    JSON_CONTENT_TYPE: 'application/json',
  },

};






