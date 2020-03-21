/**
 * @format
 */

import React, { FC, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { View, StyleSheet, AsyncStorage, LayoutChangeEvent, Animated } from 'react-native'
import { Title, Button, Headline, Colors } from 'react-native-paper'
import PushNotification from 'react-native-push-notification'

const styles = StyleSheet.create({
  barFill: {
    backgroundColor: Colors.lightBlue200,
    flex: 1
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  waterBar: {
    borderColor: Colors.grey400,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    marginVertical: 20,
    maxWidth: 300,
    overflow: 'hidden',
    width: '100%'
  }
})

const Home: FC = () => {
  const [glasses, setGlasses] = useState(0)
  const [lastGlass, setLastGlass] = useState(0)
  const [enabled, setEnabled] = useState(false)
  const [width, setWidth] = useState(0)

  const offset = useRef(new Animated.Value(0))

  useEffect(() => {
    const readStorage = async (): Promise<void> => {
      const glasses = await AsyncStorage.getItem('glasses')
      const lastGlass = await AsyncStorage.getItem('last_glass')

      const getDay = (timestamp: number): number =>
        Math.floor((timestamp - new Date().getTimezoneOffset() * 60 * 1000) / (24 * 60 * 60 * 1000))

      if (glasses && lastGlass && getDay(Number(lastGlass)) === getDay(new Date().getTime())) {
        setGlasses(Number(glasses))
        setLastGlass(Number(lastGlass))
      } else {
        setEnabled(true)
      }
    }
    readStorage()
  }, [])

  useEffect(() => {
    if (!glasses || !lastGlass) return
    const date = new Date(lastGlass)
    if (date.getHours() < 22 && glasses < 8) {
      date.setHours(date.getHours() + 2)
      PushNotification.cancelAllLocalNotifications()
      PushNotification.localNotificationSchedule({
        title: 'Time to drink',
        message: 'Drink your glass nr ' + (glasses + 1) + ' today',
        date
      })
      setTimeout(() => setEnabled(true), date.getTime() - new Date().getTime())
    } else {
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      setTimeout(() => {
        setGlasses(0)
        setLastGlass(0)
        setEnabled(true)
      }, midnight.getTime() - new Date().getTime())
    }
  }, [glasses, lastGlass])

  useEffect(() => {
    Animated.timing(offset.current, {
      duration: 1000,
      toValue: (width / 8) * glasses,
      useNativeDriver: true
    }).start()
  }, [glasses, width])

  const measure = useCallback(({ nativeEvent: { layout: { width } } }: LayoutChangeEvent) => {
    setWidth(width)
    offset.current.setOffset(-width)
  }, [])

  const drink = useCallback(async () => {
    const last = new Date().getTime()
    setEnabled(false)
    setGlasses(glasses + 1)
    setLastGlass(last)
  }, [glasses])

  const next = useMemo(() => {
    if (!lastGlass) return
    const last = new Date(lastGlass)
    const hour = (last.getHours() + 2).toFixed().padStart(2, '0')
    const minutes = last
      .getMinutes()
      .toFixed()
      .padStart(2, '0')
    return last.getHours() < 22
      ? glasses < 8
        ? `Next glass at: ${hour}:${minutes}`
        : "Congratulations, you've drank 8 cups today!"
      : `That's all for today!`
  }, [glasses, lastGlass])

  return (
    <View style={styles.container}>
      <Title>Drink 8 cups of water a day</Title>
      <View style={styles.waterBar} onLayout={measure}>
        {width !== 0 && (
          <Animated.View
            style={[styles.barFill, { transform: [{ translateX: offset.current }] }]}
          />
        )}
      </View>
      {enabled ? (
        <Button onPress={drink} mode="contained">
          Drink
        </Button>
      ) : (
        <Headline>{next}</Headline>
      )}
    </View>
  )
}

export default Home
