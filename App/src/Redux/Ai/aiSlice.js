// aiSlice.js - Speed-optimized Redux slice for AI chat functionality
import { createSlice, createSelector } from '@reduxjs/toolkit';
import { 
  sendChatMessage, 
  sendChatMessageWithImage, 
  getAISuggestions,
  testGeminiConnection
} from './services';

// Optimized initial state
const initialState = {
  messages: [],
  loading: false,
  error: null,
  currentSessionId: null,
  suggestions: [],
  isTyping: false,
  connectionStatus: 'disconnected',
  lastMessageId: null,
  totalTokensUsed: 0,
  conversationHistory: [],
};

// Optimized ID generation
let messageCounter = 0;
const generateMessageId = (prefix) => `${prefix}-${Date.now()}-${++messageCounter}`;

// Create the slice with performance optimizations
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Synchronous actions
    setCurrentSessionId: (state, action) => {
      state.currentSessionId = action.payload;
    },
    
    clearChatMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.conversationHistory = [];
      state.totalTokensUsed = 0;
    },
    
    clearChatError: (state) => {
      state.error = null;
    },
    
    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setIsTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    
    addUserMessage: (state, action) => {
      const { message, sessionId, image, imageUri } = action.payload;
      const userMessage = {
        id: generateMessageId('user'),
        type: 'user',
        message: message,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        hasImage: !!image || !!imageUri,
        imageUri: imageUri,
      };
      
      state.messages.push(userMessage);
      state.lastMessageId = userMessage.id;
    },
    
    addAIMessage: (state, action) => {
      const { response, sessionId, source } = action.payload;
      const aiMessage = {
        id: generateMessageId('ai'),
        type: 'ai',
        message: response,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        source: source || 'gemini',
      };
      
      state.messages.push(aiMessage);
      state.lastMessageId = aiMessage.id;
    },
    
    addErrorMessage: (state, action) => {
      const { error, sessionId } = action.payload;
      const errorMessage = {
        id: generateMessageId('error'),
        type: 'error',
        message: error,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      state.messages.push(errorMessage);
      state.lastMessageId = errorMessage.id;
    },
    
    updateTokenUsage: (state, action) => {
      const { tokensUsed } = action.payload;
      state.totalTokensUsed += tokensUsed || 0;
    },
    
    setSuggestions: (state, action) => {
      state.suggestions = action.payload || [];
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Send chat message cases
      .addCase(sendChatMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        
        // Add user message immediately
        const { message, sessionId } = action.meta.arg;
        const userMessage = {
          id: generateMessageId('user'),
          type: 'user',
          message: message,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          hasImage: false,
        };
        
        state.messages.push(userMessage);
        state.lastMessageId = userMessage.id;
        
        // Add to conversation history
        state.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        });
      })
      
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { response, sessionId, source, usage } = action.payload;
        
        // Add AI response
        const aiMessage = {
          id: generateMessageId('ai'),
          type: 'ai',
          message: response,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          source: source || 'gemini',
        };
        
        state.messages.push(aiMessage);
        state.lastMessageId = aiMessage.id;
        
        // Add to conversation history
        state.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        });
        
        // Update token usage
        if (usage && usage.totalTokenCount) {
          state.totalTokensUsed += usage.totalTokenCount;
        }
      })
      
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send message';
        
        // Add error message
        const errorMessage = {
          id: generateMessageId('error'),
          type: 'error',
          message: state.error,
          sessionId: state.currentSessionId,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        
        state.messages.push(errorMessage);
        state.lastMessageId = errorMessage.id;
      })

      // Send chat message with image cases
      .addCase(sendChatMessageWithImage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        
        // Add user message with image
        const { message, sessionId, imageUri } = action.meta.arg;
        const userMessage = {
          id: generateMessageId('user'),
          type: 'user',
          message: message || 'Sent an image',
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          hasImage: true,
          imageUri: imageUri,
        };
        
        state.messages.push(userMessage);
        state.lastMessageId = userMessage.id;
        
        // Add to conversation history
        state.conversationHistory.push({
          role: 'user',
          content: message || 'Image sent',
          timestamp: new Date().toISOString(),
          hasImage: true,
        });
      })
      
      .addCase(sendChatMessageWithImage.fulfilled, (state, action) => {
        state.loading = false;
        const { response, sessionId, source, usage } = action.payload;
        
        // Add AI response
        const aiMessage = {
          id: generateMessageId('ai'),
          type: 'ai',
          message: response,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          source: source || 'gemini',
          hasImage: true,
        };
        
        state.messages.push(aiMessage);
        state.lastMessageId = aiMessage.id;
        
        // Add to conversation history
        state.conversationHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
          hasImage: true,
        });
        
        // Update token usage
        if (usage && usage.totalTokenCount) {
          state.totalTokensUsed += usage.totalTokenCount;
        }
      })
      
      .addCase(sendChatMessageWithImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send image message';
        
        // Add error message
        const errorMessage = {
          id: generateMessageId('error'),
          type: 'error',
          message: state.error,
          sessionId: state.currentSessionId,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        
        state.messages.push(errorMessage);
        state.lastMessageId = errorMessage.id;
      })

      // Get AI suggestions cases
      .addCase(getAISuggestions.pending, (state) => {
        // Don't set loading for background suggestions
      })
      
      .addCase(getAISuggestions.fulfilled, (state, action) => {
        const { suggestions } = action.payload;
        state.suggestions = suggestions || [];
      })
      
      .addCase(getAISuggestions.rejected, (state, action) => {
        // Fallback suggestions
        state.suggestions = [
          "What can you help me with?",
          "Tell me about property maintenance",
          "How do I manage tenant issues?"
        ];
      })

      // Test connection cases
      .addCase(testGeminiConnection.pending, (state) => {
        state.connectionStatus = 'connecting';
      })
      
      .addCase(testGeminiConnection.fulfilled, (state, action) => {
        state.connectionStatus = 'connected';
      })
      
      .addCase(testGeminiConnection.rejected, (state, action) => {
        state.connectionStatus = 'error';
        state.error = action.payload || 'Connection test failed';
      });
  },
});

// Export actions
export const {
  setCurrentSessionId,
  clearChatMessages,
  clearChatError,
  setChatLoading,
  setIsTyping,
  setConnectionStatus,
  addUserMessage,
  addAIMessage,
  addErrorMessage,
  updateTokenUsage,
  setSuggestions,
} = aiSlice.actions;

// Optimized selectors with proper memoization
const selectAIState = (state) => state.ai || state.chat || state.aiChat || {};

// Base selectors (memoized automatically by createSelector)
const selectMessages = createSelector([selectAIState], (state) => state.messages || []);
const selectLoading = createSelector([selectAIState], (state) => state.loading || false);
const selectError = createSelector([selectAIState], (state) => state.error);
const selectCurrentSessionId = createSelector([selectAIState], (state) => state.currentSessionId);
const selectSuggestions = createSelector([selectAIState], (state) => state.suggestions || []);
const selectConnectionStatus = createSelector([selectAIState], (state) => state.connectionStatus || 'disconnected');
const selectTotalTokensUsed = createSelector([selectAIState], (state) => state.totalTokensUsed || 0);
const selectIsTyping = createSelector([selectAIState], (state) => state.isTyping || false);
const selectConversationHistory = createSelector([selectAIState], (state) => state.conversationHistory || []);
const selectLastMessageId = createSelector([selectAIState], (state) => state.lastMessageId);

export const chatSelectors = {
  getChatData: createSelector(
    [selectLoading, selectMessages, selectCurrentSessionId, selectError, selectSuggestions, selectIsTyping, selectConnectionStatus, selectTotalTokensUsed, selectConversationHistory, selectLastMessageId],
    (loading, messages, currentSessionId, error, suggestions, isTyping, connectionStatus, totalTokensUsed, conversationHistory, lastMessageId) => ({
      loading,
      messages,
      currentSessionId,
      error,
      suggestions,
      isTyping,
      connectionStatus,
      totalTokensUsed,
      conversationHistory,
      lastMessageId,
    })
  ),
  
  getMessages: selectMessages,
  isLoading: selectLoading,
  getError: selectError,
  getCurrentSessionId: selectCurrentSessionId,
  getSuggestions: selectSuggestions,
  getConnectionStatus: selectConnectionStatus,
  getTotalTokensUsed: selectTotalTokensUsed,
  getConversationHistory: selectConversationHistory,
  
  getLastMessage: createSelector(
    [selectMessages],
    (messages) => {
      return messages.length > 0 ? messages[messages.length - 1] : null;
    }
  ),
  
  getMessageById: createSelector(
    [selectMessages, (state, messageId) => messageId],
    (messages, messageId) => {
      return messages.find(msg => msg.id === messageId) || null;
    }
  ),
};

// Export the reducer
export default aiSlice.reducer;