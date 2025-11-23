import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import { authReducer } from './Authentication/authentication'
import { persistReducer, persistStore } from 'redux-persist';
import { loginReducer } from './Login/loginSlice';
// import { chatReducer } from './Ai/aiSlice';
import aiReducer from './Ai/aiSlice';
import { propertiesReducer } from './Properties/propertiesSlice';
//import queriesReducer from './Queries/queriesSlice';
import maintenanceReducer from './Maintenance/maintenanceSlice';


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

// Separate persist config for AI chat
const aiPersistConfig = {
  key: 'ai',
  storage: AsyncStorage,
  whitelist: ['currentSessionId', 'messages'], // Only keep relevant data
};



const rootReducer = combineReducers({
  loginData: loginReducer,
  // chat: chatReducer,
//    ai: aiReducer,
//      queries: queriesReducer,
    ai: persistReducer(aiPersistConfig, aiReducer),
   properties: persistReducer(propertiesPersistConfig, propertiesReducer),
    maintenance: maintenanceReducer,
   
    
    
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
