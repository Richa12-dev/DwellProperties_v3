import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { authReducer } from './Authentication/authentication'
import { persistReducer, persistStore } from 'redux-persist';
import { loginReducer } from './Login/loginSlice';
// import { chatReducer } from './Ai/aiSlice';
import aiReducer from './Ai/aiSlice';
import { propertiesReducer } from './Properties/propertiesSlice';
import queriesReducer from './Queries/queriesSlice'; 

// import { disbursalReducer } from './Disbursal/disbursalSlice';
// import { leadGenerationReducer } from './LeadGneration/leadGenerationSlice';
// import { payoutReducer } from './Payout/payoutSlice';

const persistConfig = {
  key: '@studyApp',
  storage: AsyncStorage,
   blacklist: ['properties'],
};

// Separate persist config for properties (only persist the actual data)
const propertiesPersistConfig = {
  key: 'properties',
  storage: AsyncStorage,
  blacklist: ['loading', 'error'], // Don't persist loading and error states
};

const rootReducer = combineReducers({
  loginData: loginReducer,
  // chat: chatReducer,
    ai: aiReducer,
      queries: queriesReducer,
   properties: persistReducer(propertiesPersistConfig, propertiesReducer),
  // disbursalData: disbursalReducer,
  // payoutData: payoutReducer,
  // leadGenerationData:leadGenerationReducer,
  // productData: productReducer,
  // cartData: cartReducer,
  // awpData: awpReducer,
  // redeemData: redeemReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    // getDefaultMiddleware({ serializableCheck: false }),
   getDefaultMiddleware({ 
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      }
    }),
});

export const persistor = persistStore(store);
