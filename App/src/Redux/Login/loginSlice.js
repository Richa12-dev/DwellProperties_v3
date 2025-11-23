import { createSlice } from '@reduxjs/toolkit';
import { HelperService } from '../../commonFunction/HelperService';
import { login, registerUser, confirmSignUp, logout, forgotPassword, confirmForgotPassword  } from './services';

const initialState = {
  loading: false,
  userData: null,
  token: null,
    accessToken: null, // ✅ Added accessToken
     idToken: null,     // ✅ Added idToken
     refreshToken: null,
  is_logged: false,

  // Registration related states
  registrationLoading: false,
  registrationData: null,
  isRegistrationComplete: false,

  // OTP verification states
  otpLoading: false,
  isOtpVerified: false,
  tempUserEmail: '',
  // ✅ Forgot Password states
  forgotPasswordLoading: false,
  resetCodeSent: false,
  
  // ✅ Reset Password states
  resetPasswordLoading: false,
  passwordResetSuccess: false,
};

const loginSlice = createSlice({
  name: 'loginSlice',
  initialState,
  reducers: {
    changeislogged: (state, action) => {
      state.is_logged = action.payload;
    },
    clearLoginData: (state) => {
      Object.assign(state, initialState);
    },
    setTempUserEmail: (state, action) => {
      state.tempUserEmail = action.payload;
    },
    clearRegistrationData: (state) => {
      state.registrationData = null;
      state.isRegistrationComplete = false;
      state.tempUserEmail = '';
    },
    clearOtpData: (state) => {
      state.isOtpVerified = false;
      state.otpLoading = false;
    },
     clearForgotPasswordData: (state) => {
      state.forgotPasswordLoading = false;
      state.resetCodeSent = false;
      state.resetPasswordLoading = false;
      state.passwordResetSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Login flow
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(login.fulfilled, (state, { payload }) => {
  console.log('💡 login.fulfilled payload:', payload);
   state.loading = false;

  if (payload && typeof payload === 'object') {
    state.userData = {
      landlordId: payload.landlordId || null,
      tenantId: payload.tenantId || null,
    contractorId: payload.contractorId || null,
    role: payload.role || 'tenant',
    email: payload.email || '',
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    phoneNumber: payload.phoneNumber || '',
    };

      // ✅ Extract tokens (support both old and new API structure)
             const accessToken =
               payload?.accessToken ||
               payload?.AuthenticationResult?.AccessToken ||
               payload?.token ||
               null;

             const idToken =
               payload?.idToken ||
               payload?.AuthenticationResult?.IdToken ||
               null;

             const refreshToken =
               payload?.refreshToken ||
               payload?.AuthenticationResult?.RefreshToken ||
               null;

             // ✅ Store all tokens
             state.accessToken = accessToken === 'null' ? null : accessToken;
             state.token = accessToken === 'null' ? null : accessToken; // Keep for backwards compatibility
             state.idToken = idToken === 'null' ? null : idToken;
             state.refreshToken = refreshToken === 'null' ? null : refreshToken;
             
             state.is_logged = !!state.accessToken;
           } else {
             console.warn('⚠️ login payload is not valid:', payload);
             state.userData = null;
             state.token = null;
             state.accessToken = null;
             state.idToken = null;
             state.refreshToken = null;
             state.is_logged = false;
           }

           console.log('✔️ Updated login state:', {
             userData: state.userData,
             hasAccessToken: !!state.accessToken,
             hasToken: !!state.token,
             is_logged: state.is_logged,
             landlordId: state.userData?.landlordId,
             role: state.userData?.role,
           });
         });


    builder.addCase(login.rejected, (state) => {
      state.loading = false;
      state.userData = null;
        state.accessToken = null;
             state.idToken = null;
             state.refreshToken = null;
        state.is_logged = false;
    });

    // Register user flow
    builder.addCase(registerUser.pending, (state) => {
      state.registrationLoading = true;
    });

    builder.addCase(registerUser.fulfilled, (state, { payload }) => {
      state.registrationLoading = false;
      state.registrationData = payload || null;
      state.isRegistrationComplete = true;
      state.tempUserEmail = payload?.email || '';
    });

    builder.addCase(registerUser.rejected, (state) => {
      state.registrationLoading = false;
      state.registrationData = null;
      state.isRegistrationComplete = false;
    });

    // Confirm SignUp (OTP) flow
    builder.addCase(confirmSignUp.pending, (state) => {
      state.otpLoading = true;
    });

    builder.addCase(confirmSignUp.fulfilled, (state) => {
      state.otpLoading = false;
      state.isOtpVerified = true;
      state.registrationData = null;
      state.isRegistrationComplete = false;
      state.tempUserEmail = '';
    });

    builder.addCase(confirmSignUp.rejected, (state) => {
      state.otpLoading = false;
      state.isOtpVerified = false;
    });

     // ✅ Forgot Password flow
    builder.addCase(forgotPassword.pending, (state) => {
      state.forgotPasswordLoading = true;
      state.resetCodeSent = false;
    });

    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.forgotPasswordLoading = false;
      state.resetCodeSent = true;
    });

    builder.addCase(forgotPassword.rejected, (state) => {
      state.forgotPasswordLoading = false;
      state.resetCodeSent = false;
    });

    // ✅ Confirm Forgot Password (Reset Password) flow
    builder.addCase(confirmForgotPassword.pending, (state) => {
      state.resetPasswordLoading = true;
      state.passwordResetSuccess = false;
    });

    builder.addCase(confirmForgotPassword.fulfilled, (state) => {
      state.resetPasswordLoading = false;
      state.passwordResetSuccess = true;
    });

    builder.addCase(confirmForgotPassword.rejected, (state) => {
      state.resetPasswordLoading = false;
      state.passwordResetSuccess = false;
    });

    // Logout flow
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(logout.fulfilled, (state) => {
      Object.assign(state, initialState);
    });

    builder.addCase(logout.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const loginReducer = loginSlice.reducer;
export const {
  changeislogged,
  clearLoginData,
  setTempUserEmail,
  clearRegistrationData,
  clearOtpData,
  clearForgotPasswordData,
} = loginSlice.actions;

export const loginDataSelectors = {
  getData: (state) => state.loginData,
  getRegistrationData: (state) => ({
    loading: state.loginData.registrationLoading,
    data: state.loginData.registrationData,
    isComplete: state.loginData.isRegistrationComplete,
  }),
  getOtpData: (state) => ({
    loading: state.loginData.otpLoading,
    isVerified: state.loginData.isOtpVerified,
    tempEmail: state.loginData.tempUserEmail,
  }),
  getLoginStatus: (state) => ({
    loading: state.loginData.loading,
    isLogged: state.loginData.is_logged,
    token: state.loginData.token,
    userData: state.loginData.userData,
  }),
   // ✅ Added missing selector
  getForgotPasswordData: (state) => ({
    loading: state.loginData.forgotPasswordLoading,
    resetCodeSent: state.loginData.resetCodeSent,
  }),
  // ✅ Added reset password selector
  getResetPasswordData: (state) => ({
    loading: state.loginData.resetPasswordLoading,
    success: state.loginData.passwordResetSuccess,
  }),
    
    // ✅ New helper selectors
     getAccessToken: (state) => state.loginData.accessToken || state.loginData.token,
     getLandlordId: (state) => state.loginData.userData?.landlordId || null,
     getTenantId: (state) => state.loginData.userData?.tenantId || null,
     getUserRole: (state) => state.loginData.userData?.role || null,
   
};
