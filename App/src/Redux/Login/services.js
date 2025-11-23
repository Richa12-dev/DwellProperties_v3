import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';
import { Config } from '../../config';
import { navigate, resetRoot } from '../../navigation/RouterServices';

import { clearLoginData } from './loginSlice';
import { Buffer } from 'buffer';

// const navigation = useNavigation();
const base_url = Config.API_URL;

// export const login = createAsyncThunk(
//   'loginSlice/login',
//   async (post, { rejectWithValue }) => {
//     const url = `https://cognito-idp.us-east-1.amazonaws.com/`;

//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-amz-json-1.1',
//           'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
//         },
//         body: JSON.stringify({
//           AuthFlow: 'USER_PASSWORD_AUTH',
//           ClientId: Config.COGNITO_CLIENT_ID, // "4vq7alk8e8uu9ajt3hh4tassk2"
//           AuthParameters: {
//             USERNAME: post?.username || post?.email,
//             PASSWORD: post?.password,
//           },
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data?.AuthenticationResult?.AccessToken) {
//         // resetRoot('BottomFotter');
//         Toast.show('Login successful');
//         // 🔑 Extract custom claims if you decode ID token
//         const idToken = data.AuthenticationResult.IdToken;
//         const payload = JSON.parse(
//           Buffer.from(idToken.split('.')[1], 'base64').toString()
//         );

//         const userData = {
//           token: data.AuthenticationResult.AccessToken,
//           accessToken: data.AuthenticationResult.AccessToken,
//           idToken: data.AuthenticationResult.IdToken,
//           refreshToken: data.AuthenticationResult.RefreshToken,
//           landlordId: payload['custom:landlordId'] || null,
//           tenantId: payload['custom:tenantId'] || null,
//           role: payload['custom:role'] || 'tenant',
//           email: payload['email'],
//         };
//  // Navigate after a small delay to ensure Redux state updates
//         setTimeout(() => {
//           if (payload['custom:tenantId']) {
//             resetRoot('BottomFotter');
//           } else if (payload['custom:landlordId']) {
//             resetRoot('ProfileFooter');
//           } else {
//             resetRoot('BottomFotter'); // default fallback
//           }
//         }, 300); // 300ms delay

      

//         // if (payload['custom:tenantId']) {
//         //   resetRoot('BottomFotter');
//         // } else if (payload['custom:landlordId']) {
//         //   resetRoot('ProfileFooter');
//         // } else {
//         //   resetRoot('BottomFotter'); // default fallback
//         // }
//         // return data;
//         return userData;
//       } else {
//         const errorMessage = data?.message || 'Invalid credentials';
//         Toast.show(errorMessage);
//         return rejectWithValue(errorMessage);
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       Toast.show('Oops, there seems to be an error');
//       return rejectWithValue(err.message || 'Oops, there seems to be an error');
//     }
//   }
// );


// Login with new API



export const login = createAsyncThunk(
  'loginSlice/login',
  async (post, { rejectWithValue }) => {
    const url = `${base_url}/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: post?.email || post?.username,
          password: post?.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.accessToken) {
        Toast.show('Login successfully');

          console.log(data.accessToken, "fsdfghjgf");
        // 🔥 DECODE THE ID TOKEN TO GET USER INFO
        let landlordId = null;
        let tenantId = null;
        let contractorId = null;
        let role = 'tenant';
        let email = '';
        let firstName = '';
        let lastName = '';
        let phoneNumber = '';

        if (data.idToken) {
          try {
            // Decode JWT token (it's base64 encoded)
            const tokenParts = data.idToken.split('.');
            const payload = JSON.parse(
              Buffer.from(tokenParts[1], 'base64').toString()
            );
            
            console.log('🔓 Decoded Token Payload:', payload);

            // Extract user data from token
            email = payload.email || '';
            firstName = payload.given_name || '';
            lastName = payload.family_name || '';
            phoneNumber = payload.phone_number || '';
            role = payload['custom:role'] || 'tenant';
            landlordId = payload['custom:landlordId'] || null;
            tenantId = payload['custom:tenantId'] || null;
            contractorId = payload['custom:contractorId'] || null;

            // If custom attributes don't exist, check cognito:groups
            if (!landlordId && !tenantId && !contractorId) {
              const groups = payload['cognito:groups'] || [];
              console.log('📋 Cognito Groups:', groups);
              
              if (groups.includes('landlord')) {
                // Use the sub (user ID) as landlordId if not explicitly set
                landlordId = payload.sub;
                role = 'landlord';
                console.log('✅ Identified as LANDLORD from groups');
              } else if (groups.includes('tenant')) {
                tenantId = payload.sub;
                role = 'tenant';
                console.log('✅ Identified as TENANT from groups');
              } else if (groups.includes('contractor')) {
                contractorId = payload.sub;
                role = 'contractor';
                console.log('✅ Identified as CONTRACTOR from groups');
              }
            }
          } catch (decodeError) {
            console.error('❌ Error decoding token:', decodeError);
          }
        }

        const userData = {
          accessToken: data.accessToken,
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          landlordId: landlordId,
          tenantId: tenantId,
          contractorId: contractorId,
          role: role,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        };

        console.log('✅ Final userData:', userData);
        console.log('🚀 Navigation Decision:', {
          hasLandlordId: !!landlordId,
          hasTenantId: !!tenantId,
          hasContractorId: !!contractorId,
          role: role,
          navigatingTo: tenantId ? 'BottomFotter (Tenant)' :
                       landlordId ? 'ProfileFooter (Landlord)' :
                       contractorId ? 'ContractorHome (Contractor)' :
                       'BottomFotter (Default)'
        });

        // Navigate based on role/IDs
        setTimeout(() => {
          if (tenantId) {
            console.log('🏠 Navigating to: BottomFotter');
            resetRoot('BottomFotter');
          } else if (landlordId) {
            console.log('🏢 Navigating to: ProfileFooter');
            resetRoot('ProfileFooter');
          } else if (contractorId) {
            console.log('🔧 Navigating to: ContractorHome');
            resetRoot('ContractorHome');
          } else {
            console.log('⚠️ Navigating to: BottomFotter (Default)');
            resetRoot('BottomFotter');
          }
        }, 300);

        return userData;
      } else {
        const errorMessage = data?.message || data?.error || 'Invalid credentials';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      Toast.show('Oops, there seems to be an error');
      return rejectWithValue(err.message || 'Oops, there seems to be an error');
    }
  }
);


//
//export const login = createAsyncThunk(
//  'loginSlice/login',
//  async (post, { rejectWithValue }) => {
//    const url = `${base_url}/login`;
//
//    try {
//      const response = await fetch(url, {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({
//          email: post?.email || post?.username,
//          password: post?.password,
//        }),
//      });
//
//      const data = await response.json();
//        
//        // 🔍 ADD THIS DEBUG LOG
//              console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
//              console.log('👤 User data:', data.user);
//              console.log('🏠 Landlord ID:', data.user?.landlordId);
//              console.log('🏢 Tenant ID:', data.user?.tenantId);
//        
//      if (response.ok && data?.accessToken) {
//        Toast.show('Login successful');
//
//        const userData = {
//          accessToken: data.accessToken,
//          idToken: data.idToken,
//          refreshToken: data.refreshToken,
//          landlordId: data.user?.landlordId || null,
//          tenantId: data.user?.tenantId || null,
//          contractorId: data.user?.contractorId || null,
//          role: data.user?.role || 'tenant',
//          email: data.user?.email || '',
//          firstName: data.user?.firstName || '',
//          lastName: data.user?.lastName || '',
//          phoneNumber: data.user?.phoneNumber || '',
//        };
//          
//          // 🔍 ADD THIS DEBUG LOG TOO
//                  console.log('✅ Navigation Decision:', {
//                    hasLandlordId: !!data.user?.landlordId,
//                    hasTenantId: !!data.user?.tenantId,
//                    hasContractorId: !!data.user?.contractorId,
//                    willNavigateTo: data.user?.tenantId ? 'BottomFotter' :
//                                   data.user?.landlordId ? 'ProfileFooter' :
//                                   data.user?.contractorId ? 'ContractorHome' :
//                                   'BottomFotter (default)'
//                  });
//          
//        // Navigate based on role
//        setTimeout(() => {
//          if (data.user?.tenantId) {
//            resetRoot('BottomFotter');
//          } else if (data.user?.landlordId) {
//            resetRoot('ProfileFooter');
//          } else if (data.user?.contractorId) {
//            resetRoot('ContractorHome'); // Adjust based on your navigation
//          } else {
//            resetRoot('BottomFotter'); // default fallback
//          }
//        }, 300);
//
//        return userData;
//      } else {
//        const errorMessage = data?.message || data?.error || 'Invalid credentials';
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error('Login error:', err);
//      Toast.show('Oops, there seems to be an error');
//      return rejectWithValue(err.message || 'Oops, there seems to be an error');
//    }
//  }
//);

export const registerUser = createAsyncThunk(
  'loginSlice/registerUser',
  async (userData, { rejectWithValue }) => {
    const url = `${base_url}/register`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          role: userData.role || 'tenant',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show('Registration successful! Please check your email for verification code.');
        return {
          ...data,
          email: userData.email,
        };
      } else {
        const errorMessage = data?.message || data?.error || 'Registration failed';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Registration error:', err);
      Toast.show('Oops, there seems to be an error during registration');
      return rejectWithValue(err.message || 'Oops, there seems to be an error');
    }
  }
);

// Confirm OTP/Verification
export const confirmSignUp = createAsyncThunk(
  'loginSlice/confirmSignUp',
  async (otpData, { rejectWithValue }) => {
    const url = `${base_url}/confirm`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: otpData.email,
          code: otpData.otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show('Email verification successful! You can now login.');
        navigate('Login');
        return data;
      } else {
        const errorMessage = data?.message || data?.error || 'OTP verification failed';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      Toast.show('Oops, there seems to be an error during verification');
      return rejectWithValue(err.message || 'Oops, there seems to be an error');
    }
  }
);


// Refresh Token
export const refreshToken = createAsyncThunk(
  'loginSlice/refreshToken',
  async (params, { rejectWithValue }) => {
    const url = `${base_url}/refresh`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.accessToken}`,
        },
        body: JSON.stringify({
          refreshToken: params.refreshToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.accessToken) {
        return {
          accessToken: data.accessToken,
          idToken: data.idToken,
          refreshToken: data.refreshToken,
        };
      } else {
        const errorMessage = data?.message || data?.error || 'Token refresh failed';
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      return rejectWithValue(err.message || 'Token refresh failed');
    }
  }
);

// Forgot Password - Send Reset Code
export const forgotPassword = createAsyncThunk(
  'loginSlice/forgotPassword',
  async (params, { rejectWithValue }) => {
    const url = `${base_url}/forgot-password`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show(data?.message || 'Reset code sent to your email');
        return data;
      } else {
        const errorMessage = data?.message || data?.error || 'Failed to send reset code';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      Toast.show('Oops, there seems to be an error');
      return rejectWithValue(err.message || 'Oops, there seems to be an error');
    }
  }
);

// Confirm Reset Password
export const confirmForgotPassword = createAsyncThunk(
  'loginSlice/confirmForgotPassword',
  async (params, { rejectWithValue }) => {
    const url = `${base_url}/confirm-forgot`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          code: params.code,
          newPassword: params.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show(data?.message || 'Password reset successful');
        navigate('Login');
        return data;
      } else {
        const errorMessage = data?.message || data?.error || 'Failed to reset password';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Confirm forgot password error:', err);
      Toast.show('Oops, there seems to be an error');
      return rejectWithValue(err.message || 'Oops, there seems to be an error');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'loginSlice/logout',
  async (params, { dispatch, rejectWithValue }) => {
    try {
      // Clear all local data
      dispatch(clearLoginData());
      
      // Navigate to login screen
      resetRoot('Login');
      Toast.show('Logged out successfully');
      
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      
      // Even if there's an error, clear local data and navigate
      dispatch(clearLoginData());
      resetRoot('Login');
      Toast.show('Logged out successfully');
      
      return true;
    }
  }
);

// export const registerUser = createAsyncThunk(
//   'loginSlice/registerUser',
//   async (userData, { rejectWithValue }) => {
//     const url = Config.COGNITO_IDP_URL;

//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': Config.HEADERS.CONTENT_TYPE,
//           'X-Amz-Target': Config.ENDPOINTS.SIGN_UP,
//         },
//         body: JSON.stringify({
//           ClientId: Config.COGNITO_CLIENT_ID,
//           Username: userData.email,
//           Password: userData.password,
//           UserAttributes: [
//             { Name: 'email', Value: userData.email },
//             { Name: 'phone_number', Value: userData.phoneNumber },
//             { Name: 'given_name', Value: userData.firstName },
//             { Name: 'family_name', Value: userData.lastName },
//             { Name: 'custom:role', Value: userData.role || 'tenant' },
//             { Name: 'custom:tenantId', Value: userData.tenantId || '' },
//             { Name: 'custom:landlordId', Value: userData.landlordId || '' },
//             // Add contractorId if needed
//             ...(userData.contractorId ? [{ Name: 'custom:contractorId', Value: userData.contractorId }] : [])
//           ],
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Toast.show('Registration successful! Please check your email for verification code.');
//         return {
//           ...data,
//           userSub: data.UserSub,
//           email: userData.email,
//         };
//       } else {
//         const errorMessage = data?.message || 'Registration failed';
//         Toast.show(errorMessage);
//         return rejectWithValue(errorMessage);
//       }
//     } catch (err) {
//       console.error('Registration error:', err);
//       Toast.show('Oops, there seems to be an error during registration');
//       return rejectWithValue(err.message || 'Oops, there seems to be an error');
//     }
//   }
// );

// Confirm OTP API

// export const confirmSignUp = createAsyncThunk(
//   'loginSlice/confirmSignUp',
//   async (otpData, { rejectWithValue }) => {
//     const url = Config.COGNITO_IDP_URL;

//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': Config.HEADERS.CONTENT_TYPE,
//           'X-Amz-Target': Config.ENDPOINTS.CONFIRM_SIGN_UP,
//         },
//         body: JSON.stringify({
//           ClientId: Config.COGNITO_CLIENT_ID,
//           Username: otpData.email,
//           ConfirmationCode: otpData.otpCode,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Toast.show('Email verification successful! You can now login.');
//         // Navigate to login screen or auto-login
//         navigate('LoginScreen'); // Adjust route name as needed
//         return data;
//       } else {
//         const errorMessage = data?.message || 'OTP verification failed';
//         Toast.show(errorMessage);
//         return rejectWithValue(errorMessage);
//       }
//     } catch (err) {
//       console.error('OTP verification error:', err);
//       Toast.show('Oops, there seems to be an error during verification');
//       return rejectWithValue(err.message || 'Oops, there seems to be an error');
//     }
//   }
// );


// export const logout = createAsyncThunk(
//   'loginSlice/logout',
//   async (params, { dispatch, rejectWithValue }) => {
//     const url = `https://cognito-idp.us-east-1.amazonaws.com/`;
    
//     try {
//       // First, try to sign out from Cognito if we have a token
//       if (params?.token) {
//         const cognitoResponse = await fetch(url, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-amz-json-1.1',
//             'X-Amz-Target': 'AWSCognitoIdentityProviderService.GlobalSignOut',
//           },
//           body: JSON.stringify({
//             AccessToken: params.token,
//           }),
//         });

//         // Log the response but don't fail if Cognito logout fails
//         if (!cognitoResponse.ok) {
//           console.warn('Cognito logout failed, but continuing with local logout');
//         }
//       }

//       // Clear all local data regardless of Cognito response
//       dispatch(clearLoginData());
      
//       // Navigate to login screen
//       resetRoot('Login');
//       Toast.show('Logged out successfully');
      
//       return true;
//     } catch (err) {
//       console.error('Logout error:', err);
      
//       // Even if there's an error, clear local data and navigate
//       dispatch(clearLoginData());
//       resetRoot('Login');
//       Toast.show('Logged out successfully');
      
//       return true; // Return success to avoid showing error to user
//     }
//   }
// );


export const associateLogin = createAsyncThunk(
  'loginSlice/associateLogin',
  async (params, { rejectWithValue }, thunkAPI) => {
    let url = base_url + Config.USER_SERVICE.ASSOCIATE_LOGIN;
    url = url.replace('bridge-app/', '');
 
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params?.data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response, 'kkkk-----');
      if (response?.ok == true) {
        const data = await response.json();
        navigate('OtpScreen', { phone: params?.data?.phone, otp: data?.otp });
        Toast.show(data?.message);
        return data;
      } else {
        const data = await response.json();

        Toast.show(data?.message ? data?.message : data?.errorMessage);
      }
    } catch (err) {
      // resetRoot('BottomFotter')

      return rejectWithValue('Opps there seems to be an error');
    }
  },
);




// export const forgotPassword = createAsyncThunk(
//   'loginSlice/forgotPassword',

//   async (params, { rejectWithValue }) => {
//     console.log(params, 'paramsparams');
//     let url = base_url + Config.USER_SERVICE.FORGOT_PASSWORD;
//     url = url.replace('bridge-app/', '');
//     url = url.replace('dealerCode', params?.dealerCode);
//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const data = await response.json();

//       Toast.show(data?.Message, 2000);
//       return data;
//     } catch (err) {
//       console.log(err, 'errerr');
//       return rejectWithValue('Opps there seems to be an error');
//     }
//   },
// );

// export const logout = createAsyncThunk(
//   'loginSlice/logout',

//   async (params, {rejectWithValue}) => {
//     console.log(params, 'paramsparams');
//     let url = base_url + Config.USER_SERVICE.LOG_OUT;
//     url = url.replace('bridge-app/', '');
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         body: JSON.stringify({
//           token: params.token,
//         }),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const data = await response.json();
//       Toast.show('Logout successful');

//       resetRoot('Login');
//       return data;
//     } catch (err) {
//       console.log(err, 'errerr');
//       return rejectWithValue('Opps there seems to be an error');
//     }
//   },
// );

export const otpVerify = createAsyncThunk(
  'loginSlice/otpVerify',
  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.OTP_VERIFY;
    url = url.replace('bridge-app/', '');
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params?.data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response, '----OTP---');
      if (response.ok == true) {
        const data = await response.json();
        console.log(data, data?.data?.associate_data, 'rrrrr');
        if (data?.data?.associate_data?.consentStatus === false) {
          navigate('TermsAndConditions', { userType: 'Associate' });
          return data;
        } else {
          resetRoot('ProfileFooter');
          Toast.show('login successful');
          return data;
        }
      } else if (response.ok == false) {
        Toast.show('invalid credentaial');
      } else {
        const data = await response.json();
        // console.log(data, 'otpp crasheddd');
        Toast.show(data ? data.errorMessage : 'invalid credentaial');
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const dealerProfile = createAsyncThunk(
  'loginSlice/dealerProfile',
  async (params, { rejectWithValue }) => {
    console.log(params, 'paramsparamsparams');
    let url = base_url + Config.USER_SERVICE.DEALER_PROFILE;
    url = url.replace('bridge-app/', '');
    url = url.replace('dealerCode', params.dealerCode);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });

      if (response?.status == 200) {
        const data = await response.json();

        return data;
      } else if (response?.status == 401) {
        resetRoot('Login');
        // clearPayoutData();
        // clearLeadData();
        // clearDisbursalData();
        clearLoginData();
      } else {
        const data = await response.json();

        return null;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);


export const sendDealerOtp = createAsyncThunk(
  'loginSlice/sendDealerOtp',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.SEND_LEAD_FORM_OTP;
    console.log(params, 'hhhh');
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      console.log(response, 'jjjjj');
      if (response.status == 200) {
        const data = await response.json();

        return data;
      } else {
        const data = await response.json();
        console.log(data, 'datadata');
        Toast.show(data?.message ? data?.message : data?.errorMessage);
        return null;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);
export const verifyDealerOtp = createAsyncThunk(
  'loginSlice/verifyDealerOtp',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.VERIFY_LEAD_FORM_OTP;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      const data = await response.json();
      console.log(data, 'datadatadata');
      if (data?.isOtpVerified == true) {
        return data;
      } else {
        Toast.show('Invalid Otp');
        return data;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);




export const raiseQuary = createAsyncThunk(
  'loginSlice/raiseQuary',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.RAISE_QUARY;

    console.log(url, '123456789098765432');
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      const data = await response.json();

      if (response?.status == 200) {
        return data;
      } else {
        return data;
        // Toast.show(data?.errorMessage);
      }
    } catch (err) {
      console.log(err, 'err5555555555555555555555555err');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const raiseQuaryL2 = createAsyncThunk(
  'loginSlice/raiseQuaryL2',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.RAISE_QUARY;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      const data = await response.json();
      console.log(response, data, '------11111111--------22222222--');
      if (response?.status == 200) {
        // navigate('BottomFotter', {screen: 'Menu'});
        return data;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const notificationAPI = createAsyncThunk(
  'loginSlice/notificationAPI',
  async (params, { rejectWithValue }, thunkAPI) => {
    let url = base_url + Config.USER_SERVICE.NOTIFICATION;
    url = url.replace('productcode', params?.data?.productCode);
    url = url.replace('dealercode', params?.data?.dealerCode);
    console.log(url, '-----wertyuiklo;');
    try {
      const response = await fetch(url, {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });

      if (response.status == 200) {
        const data = await response.json();

        console.log(data, 'datadata--------quaryListquaryList');

        return data;
      } else {
        const data = await response.json();
      }
    } catch (err) {
      // resetRoot('BottomFotter')
    }
  },
);

export const termsandcondition = createAsyncThunk(
  'loginSlice/termsandcondition',

  async (params, { getState, rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.TERMANDCONDTION;

    console.log(url, params, 'urlurlurl');
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params?.token}`,
        },
      });

      const data = await response.json();

      if (response?.status == 200) {
        if (
          params &&
          params.userData &&
          params.userData.products &&
          params.userData.products[0]?.name == 'CA'
        ) {
          resetRoot('CollectionHome');
        } else if (params?.userType === 'Associate') {
          resetRoot('ProfileFooter');
        } else if (params?.userType === 'Dealer') {
          resetRoot('BottomFotter');
        }
        return data;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const updatePersonalDetails = createAsyncThunk(
  'loginSlice/updatePersonalDetails',
  async (params, { getState, rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.UPDATE_PERSONAL_DETAILS;
    url = url.replace('dealerCode', params?.dealerCode);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params?.token}`,
        },
      });

      const data = await response.json();

      if (response?.status == 200) {
        navigate('ProfileHome');
        return data;
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const addAllAssociates = createAsyncThunk(
  'loginSlice/addAllAssociates',
  async (params, { getState, rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.ADD_ASSOCIATE;
    // url = url.replace('dealerCode', params?.dealerCode);

    try {
      const responseData = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params?.token}`,
        },
      });

      if (!responseData.ok) {
        const errorText = await responseData.json();
        Toast.show('Number Already Exist');
        return;
      }
      const data = await responseData.json();

      if (responseData.ok) {
        navigate(
          'BottomFotter',
          { screen: 'VisitScreen' },
          { newAssociate: responseData },
        );
      }
    } catch (err) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const editAssociate = createAsyncThunk(
  'loginSlice/editAssociate',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.EDIT_ASSOCIATE;
    url = url.replace('staffId', params?.staffId);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      console.log(response, 'datadataline 1045');
      // const response = await response.json();
      const data = await response.json();

      if (response.ok) {
        Toast.show('Update successful');
        navigate('BottomFotter', { screen: 'VisitScreen' });
        onAssociateUpdate(response);
        return data;
      } else {
      }
    } catch (error) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const deleteAssociate = createAsyncThunk(
  'loginSlice/deleteAssociate',

  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.DELETE_ASSOCIATE;
    url = url.replace('staffId', params?.staffId);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.token}`,
        },
      });
      return response;
    } catch (error) {
      console.log(err, 'errerr');
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);

export const getPersonaldeatils = createAsyncThunk(
  'loginSlice/getPersonaldeatils',
  async (params, { rejectWithValue }) => {
    let url = base_url + Config.USER_SERVICE.GET_PERSONAL_DEATAILS;
    url = url.replace('dealerCode', params?.dealerCode);

    try {
      const response = await fetch(url, {
        method: 'GET',
        // body: JSON.stringify(params.data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params?.token}`,
        },
      });

      const data = await response.json();

      return data;
    } catch (err) {
      console.log('GET_ASSOCIATE', err);
      return rejectWithValue('Opps there seems to be an error');
    }
  },
);
