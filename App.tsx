/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { FC, useEffect, useRef, ReactElement } from 'react'
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { NavigationContainer, NavigationContainerRef, StackActions } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import auth from '@react-native-firebase/auth'
import PushNotification from 'react-native-push-notification'

import Login from './components/Login'
import Home from './components/Home'

PushNotification.configure({
  onNotification: notification => {
    console.log('notification', notification)

    notification.finish(PushNotificationIOS.FetchResult.NoData)
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})

const Stack = createStackNavigator()

const App: FC = () => {
  const navigation = useRef<NavigationContainerRef>()

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user =>
      navigation.current?.dispatch(StackActions.replace(user !== null ? 'Home' : 'Login'))
    )
    return subscriber
  }, [])

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer ref={navigation}>
        <Stack.Navigator headerMode="none" initialRouteName="Loading">
          <Stack.Screen name="Loading">
            {(): ReactElement => (
              <View style={styles.container}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </Stack.Screen>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

export default App
