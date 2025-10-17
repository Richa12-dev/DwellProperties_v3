import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Linking, 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Colors } from '../../Theme';
import { 
  sendChatMessage, 
  sendChatMessageWithImage, 
  getAISuggestions 
} from '../../Redux/Ai/services';
import {
  setCurrentSessionId,
  clearChatMessages,
  clearChatError,
  setChatLoading,
  chatSelectors,
} from '../../Redux/Ai/aiSlice';
import { loginDataSelectors } from '../../Redux/Login/loginSlice';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Hyperlink from 'react-native-hyperlink';

// Updated MessageItem component with fixed hyperlink handling
const MessageItem = React.memo(({ msg, index }) => {
  const isUser = msg.type === 'user';
  const isError = msg.isError || false;
  const messageContent = msg.message || msg.text || msg.content || 'No message content';

  const handleLinkPress = useCallback((url, text) => {
    console.log('Link pressed:', url);
    
    // Clean up the URL if it's malformed
    let cleanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      cleanUrl = `https://${url}`;
    }
    
    Linking.canOpenURL(cleanUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(cleanUrl);
        } else {
          console.log('Cannot open URL:', cleanUrl);
          Alert.alert('Error', 'Cannot open this link');
        }
      })
      .catch((err) => {
        console.error('Failed to open URL:', err);
        Alert.alert('Error', 'Could not open the link');
      });
  }, []);

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.botMessage,
        isError ? styles.errorMessage : {},
      ]}>
      
      {!isUser && msg.source && (
        <Text style={styles.sourceIndicator}>
          {msg.source === 'gemini' ? '🤖 Gemini AI' : '🚀 Primary AI'}
        </Text>
      )}

      {msg.hasImage && msg.imageUri && (
        <View style={styles.messageImageContainer}>
          <Image 
            source={{ uri: msg.imageUri }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        </View>
      )}

      <Hyperlink
        linkDefault={true}
        linkStyle={{ 
          color: Colors.primary, 
          textDecorationLine: 'underline',
          fontWeight: '500'
        }}
        onPress={handleLinkPress}
        linkText={(url) => {
          // Clean up display text for Amazon links
          if (url.includes('amazon.com')) {
            if (url.includes('/dp/')) {
              return 'Amazon Link';
            } else if (url.includes('/s?k=')) {
              return 'Search on Amazon';
            }
          }
          return url;
        }}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isUser ? Colors.white : (isError ? '#d32f2f' : Colors.black)
            },
          ]}
        >
          {messageContent}
        </Text>
      </Hyperlink>

      <Text
        style={[
          styles.timestamp,
          {
            color: isUser
              ? 'rgba(255,255,255,0.8)'
              : (isError ? '#d32f2f' : Colors.gray)
          },
        ]}>
        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Now'}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.msg.id === nextProps.msg.id && 
         prevProps.index === nextProps.index;
});

// Enhanced function to properly format links in AI responses
const formatLinksInResponse = (text) => {
  if (!text) return '';
  
  // Fix malformed Amazon URLs and other common issues
  return text
    // Fix Amazon product URLs
    .replace(/https:\/\/www\.amazon\.com\/dp\/([A-Z0-9]+)([^\s]*)/g, 'https://www.amazon.com/dp/$1')
    // Fix Amazon search URLs
    .replace(/https:\/\/www\.amazon\.com\/s\?k=([^→\s]+)/g, 'https://www.amazon.com/s?k=$1')
    // Remove arrow symbols that might break URLs
    .replace(/\s*→\s*/g, ' ')
    // Clean up any double spaces
    .replace(/\s+/g, ' ')
    .trim();
};

const ChatScreen = ({ navigation }) => {
  const [messageText, setMessageText] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef();
  const lastMessageRef = useRef('');
  const typingTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastScrollTime = useRef(0);

  const dispatch = useDispatch();

  // Optimized selectors
  const chatData = useSelector(chatSelectors.getChatData, (prev, next) => {
    return prev.loading === next.loading && 
           prev.messages?.length === next.messages?.length &&
           prev.error === next.error;
  });
  const { loading, messages, currentSessionId, error } = chatData;

  const loginData = useSelector(loginDataSelectors.getLoginStatus);
  const { isLogged, token, userData } = loginData;

  const rawLoginState = useSelector((state) => state.loginData);

  // Memoized token getter
  const getAvailableToken = useCallback(() => {
    return token ||
      rawLoginState?.token ||
      rawLoginState?.accessToken ||
      rawLoginState?.userData?.token ||
      rawLoginState?.userData?.accessToken;
  }, [token, rawLoginState]);

  // Initialize component
  useEffect(() => {
    setIsComponentMounted(true);
    isMountedRef.current = true;
    dispatch(clearChatError());

    if (!currentSessionId && isLogged) {
      const sessionId = `session-${Date.now()}`;
      dispatch(setCurrentSessionId(sessionId));
    }

    loadSuggestions('getting started');

    return () => {
      setIsComponentMounted(false);
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [dispatch, currentSessionId, isLogged]);

  // Throttled auto scroll for better performance
  useEffect(() => {
    if (messages.length > 0 && isComponentMounted) {
      const now = Date.now();
      if (now - lastScrollTime.current > 100) { // Throttle to max 10fps
        lastScrollTime.current = now;
        requestAnimationFrame(() => {
          if (isMountedRef.current && scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        });
      }
    }
  }, [messages.length, isComponentMounted]);

  // Reduced loading timeout for better UX
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('⚠️ Loading timeout - forcing stop');
          dispatch(setChatLoading(false));
          Alert.alert(
            'Request Timeout',
            'The request is taking longer than expected. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }, 45000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading, dispatch]);

  // Debounced suggestions loader
  const loadSuggestions = useCallback(async (context) => {
    if (!isMountedRef.current) return;
    
    try {
      const result = await dispatch(getAISuggestions({ 
        context, 
        sessionId: currentSessionId 
      })).unwrap();
      
      if (isMountedRef.current) {
        setSuggestions(result.suggestions?.slice(0, 3) || []);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setSuggestions([
          "What can you help me with?",
          "Tell me about your capabilities",
          "How do I get started?"
        ]);
      }
    }
  }, [dispatch, currentSessionId]);

  // Optimized typing handler
  const handleTyping = useCallback((text) => {
    setMessageText(text);
    setIsTyping(text.length > 0);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsTyping(false);
      }
    }, 1000);
  }, []);

  // Enhanced image picker with better compression
  const handleImagePicker = useCallback(() => {
    Alert.alert(
      'Select Image',
      'Choose an image source',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => launchCamera(
            { 
              mediaType: 'photo', 
              quality: 0.3,
              maxWidth: 600,
              maxHeight: 600,
              includeBase64: true,
              storageOptions: {
                skipBackup: true,
                path: 'images',
              },
            }, 
            handleImageResponse
          )
        },
        { 
          text: 'Gallery', 
          onPress: () => launchImageLibrary(
            { 
              mediaType: 'photo', 
              quality: 0.3,
              maxWidth: 600,
              maxHeight: 600,
              includeBase64: true,
              storageOptions: {
                skipBackup: true,
                path: 'images',
              },
            }, 
            handleImageResponse
          )
        },
      ]
    );
  }, []);

  const handleImageResponse = useCallback((response) => {
    if (response.didCancel || response.error) return;
    
    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setSelectedImage({
        uri: asset.uri,
        base64: asset.base64,
        type: asset.type,
        fileName: asset.fileName,
      });
    }
  }, []);

  const removeSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // Fixed send message handler - clears image preview immediately
  const handleSendMessage = useCallback(async (messageOverride = null, isImageMessage = false) => {
    const trimmedMessage = (messageOverride || messageText).trim();

    if (!trimmedMessage && !selectedImage) {
      Alert.alert('Empty Message', 'Please enter a message or select an image.');
      return;
    }

    if (trimmedMessage === lastMessageRef.current && !selectedImage) {
      console.log('⚠️ Duplicate message prevented');
      return;
    }

    if (!isLogged) {
      Alert.alert('Login Required', 'Please login to use the chat feature.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    const availableToken = getAvailableToken();
    if (!availableToken) {
      Alert.alert(
        'Authentication Error',
        'No authentication token found. Please logout and login again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (!currentSessionId) {
      Alert.alert('Session Error', 'Please restart the app and try again.');
      return;
    }

    if (loading) return;

    // Store current image state before clearing
    const currentImage = selectedImage;

    // Clear inputs IMMEDIATELY for better UX and to prevent double display
    if (!messageOverride) {
      setMessageText('');
    }
    setSelectedImage(null); // Clear image preview immediately
    
    lastMessageRef.current = trimmedMessage;
    setShowSuggestions(false);

    try {
      const messageParams = {
        message: trimmedMessage,
        sessionId: currentSessionId,
        token: availableToken,
      };

      if (currentImage) {
        if (!currentImage.base64 || !currentImage.type) {
          Alert.alert('Invalid Image', 'Failed to retrieve image data. Please try selecting the image again.');
          // Restore image if validation fails
          setSelectedImage(currentImage);
          return;
        }

        messageParams.image = currentImage.base64;
        messageParams.imageMimeType = currentImage.type;
        messageParams.imageUri = currentImage.uri;
      }

      const action = currentImage ? sendChatMessageWithImage : sendChatMessage;
      const result = await dispatch(action(messageParams)).unwrap();

      // Apply link formatting BEFORE setting suggestions or storing the message
      const formattedResponse = formatLinksInResponse(result.response);

      if (formattedResponse && isMountedRef.current) {
        setTimeout(() => {
          loadSuggestions(formattedResponse.substring(0, 100));
        }, 100);
      }

      // Clear last message reference after delay
      setTimeout(() => {
        lastMessageRef.current = '';
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to send message:', error);

      // Restore inputs on error
      if (!messageOverride) {
        setMessageText(trimmedMessage);
      }
      if (currentImage) {
        setSelectedImage(currentImage);
      }
      lastMessageRef.current = '';

      Alert.alert(
        'Message Failed',
        typeof error === 'string' ? error : 'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [messageText, selectedImage, isLogged, currentSessionId, loading, getAvailableToken, dispatch, navigation, loadSuggestions]);

  const handleSuggestionPress = useCallback((suggestion) => {
    handleSendMessage(suggestion, false);
  }, [handleSendMessage]);

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(clearChatMessages());
            lastMessageRef.current = '';
            setShowSuggestions(true);
            setSelectedImage(null); // Clear any selected image
            setTimeout(() => loadSuggestions('getting started'), 0);
          }
        }
      ]
    );
  }, [dispatch, loadSuggestions]);

  // Memoized render functions for better performance
  const renderMessage = useCallback((msg, index) => (
    <MessageItem key={msg.id || `msg-${index}`} msg={msg} index={index} />
  ), []);

  // Fixed suggestions rendering with proper hyperlink handling
  const renderSuggestions = useMemo(() => {
    if (!showSuggestions || suggestions.length === 0 || messages.length > 0) {
      return null;
    }

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>💡 Suggestions:</Text>
        {suggestions.map((suggestion, index) => {
          // Check if suggestion contains links
          const hasLinks = /https?:\/\/[^\s]+/.test(suggestion);
          
          if (hasLinks) {
            return (
              <View key={`suggestion-${index}`} style={styles.suggestionButton}>
                <Hyperlink
                  linkDefault={true}
                  linkStyle={{ 
                    color: Colors.primary, 
                    textDecorationLine: 'underline',
                    fontWeight: '600'
                  }}
                  onPress={(url, text) => {
                    console.log('Suggestion link pressed:', url);
                    let cleanUrl = url;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                      cleanUrl = `https://${url}`;
                    }
                    Linking.openURL(cleanUrl).catch(err => {
                      console.error('Failed to open suggestion URL:', err);
                      Alert.alert('Error', 'Could not open the link');
                    });
                  }}
                >
                  <Text style={styles.suggestionText}>
                    {suggestion}
                  </Text>
                </Hyperlink>
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  }, [showSuggestions, suggestions, messages.length, handleSuggestionPress]);

  // Memoized status text
  const statusText = useMemo(() => {
    if (loading) return '🤖 AI is thinking...';
    if (isTyping) return '✏️ You are typing...';
    return `💬 ${messages.length} messages`;
  }, [loading, isTyping, messages.length]);

  // Memoized input placeholder
  const inputPlaceholder = useMemo(() => {
    return selectedImage ? "Describe what you see..." : "Type your message...";
  }, [selectedImage]);

  return (
    <>
      <RNStatusBar
        backgroundColor={Colors.black || Colors.red || "#FF0000"}
        barStyle="light-content"
        translucent={false}
      />
      <CollectionNavBar />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleClearChat}>
            <Icon name="clear-all" size={hp(2.5)} color={Colors.primary} />
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
          
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: hp(8), // Approximate item height
            offset: hp(8) * index,
            index,
          })}>

          {messages.length === 0 && !loading && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                🤖 Hello! I'm your enhanced AI assistant.{'\n'}
                I can help with text questions and analyze images!
              </Text>
              {!isLogged && (
                <Text style={styles.loginPrompt}>
                  Please login to start chatting.
                </Text>
              )}
            </View>
          )}

          {messages.map(renderMessage)}

          {loading && (
            <View style={[styles.messageContainer, styles.botMessage, styles.typingContainer]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          )}

          {renderSuggestions}

        </ScrollView>

        {/* {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => dispatch(clearChatError())}>
              <Text style={styles.dismissText">✕</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Only show image preview if image is selected */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.imagePreview} 
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removeSelectedImage}>
              <Icon name="close" size={hp(2)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.textInputWithIcon}>
              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={handleTyping}
                placeholder={inputPlaceholder}
                placeholderTextColor={Colors.gray}
                multiline
                maxLength={1000}
                editable={!loading}
                returnKeyType="send"
                onSubmitEditing={() => handleSendMessage()}
                blurOnSubmit={false}
              />

              <TouchableOpacity
                style={styles.imageIcon}
                onPress={handleImagePicker}
                disabled={loading}>
                <Icon 
                  name="image" 
                  size={hp(3)} 
                  color={loading ? Colors.gray : Colors.primary} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: (messageText.trim() || selectedImage) && !loading
                    ? Colors.primary
                    : '#ccc',
                },
              ]}
              onPress={() => handleSendMessage()}
              disabled={loading || (!messageText.trim() && !selectedImage)}>
              <Icon
                name="send"
                size={hp(2.5)}
                color={Colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  actionBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: wp(1),
    color: Colors.primary,
    fontSize: hp(1.8),
  },
  statusText: {
    fontSize: hp(1.6),
    color: Colors.gray,
    fontStyle: 'italic',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  welcomeText: {
    fontSize: hp(2.2),
    color: Colors.black,
    textAlign: 'center',
    lineHeight: hp(3),
    marginBottom: hp(2),
  },
  loginPrompt: {
    fontSize: hp(1.8),
    color: '#ff6b6b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: hp(1),
    padding: wp(3),
    borderRadius: wp(4),
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#eee',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  sourceIndicator: {
    fontSize: hp(1.4),
    color: Colors.gray,
    marginBottom: hp(0.5),
    fontWeight: '600',
  },
  messageText: {
    fontSize: hp(2),
    lineHeight: hp(2.5),
  },
  timestamp: {
    fontSize: hp(1.5),
    marginTop: hp(0.5),
    opacity: 0.7,
  },
  messageImageContainer: {
    marginBottom: hp(1),
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  messageImage: {
    width: wp(40),
    height: wp(30),
    borderRadius: wp(2),
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  typingText: {
    fontSize: hp(2),
    color: Colors.gray,
    fontStyle: 'italic',
    marginLeft: wp(2),
  },
  suggestionsContainer: {
    marginTop: hp(2),
    paddingHorizontal: wp(2),
  },
  suggestionsTitle: {
    fontSize: hp(1.8),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: hp(1),
  },
  suggestionButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: wp(6),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    marginVertical: hp(0.5),
  },
  suggestionText: {
    color: Colors.primary,
    fontSize: hp(1.8),
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: wp(3),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },
  dismissText: {
    color: '#c62828',
    fontWeight: 'bold',
    fontSize: hp(2),
  },
  imagePreviewContainer: {
    margin: wp(4),
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -hp(1),
    right: -wp(2),
    backgroundColor: '#ff4444',
    borderRadius: hp(1.5),
    width: hp(3),
    height: hp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    padding: wp(4),
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(6),
    paddingHorizontal: wp(2),
    backgroundColor: Colors.white,
  },
  textInput: {
    flex: 1,
    paddingVertical: hp(1.5),
    fontSize: hp(2),
    color: '#333',
  },
  imageIcon: {
    padding: hp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    marginLeft: wp(2),
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;