import React, { useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AppStateManager = ({ children }) => {
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (!['Login', 'Register'].includes(navigation.getCurrentRoute().name)) {
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          timeoutRef.current = setTimeout(() => {
            Alert.alert(
              'Sesión Cerrada',
              'Tu sesión se ha cerrado automáticamente debido a la inactividad.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('Login');
                  },
                },
              ],
              { cancelable: false }
            );
          }, 5000);
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return children;
};

export default AppStateManager;
