/**
 * @format
 */

import React, { FC, useState, useCallback, useEffect } from 'react'
import { View, StyleSheet, Keyboard } from 'react-native'
import { Text, TextInput, Title, Button, useTheme } from 'react-native-paper'
import auth from '@react-native-firebase/auth'

const styles = StyleSheet.create({
  button: {
    marginTop: 10
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  error: {
    marginTop: 5
  },
  input: {
    marginVertical: 5,
    width: '100%'
  }
})

const Login: FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDisabled(email === '' || password === '' || !/\S+@\S+\.\S+/.test(email))
  }, [email, password])

  const submit = useCallback(async () => {
    Keyboard.dismiss()
    setLoading(true)
    setError('')
    try {
      await auth().signInWithEmailAndPassword(email, password)
    } catch (e) {
      setError(e.message.replace(/\[.*\]/, '').trim())
    }
    setLoading(false)
  }, [email, password])

  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Title>Login</Title>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        label="E-mail"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        label="Password"
        secureTextEntry
        textContentType="password"
        autoCapitalize="none"
      />
      {error !== '' && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      <Button
        style={styles.button}
        disabled={disabled}
        loading={loading}
        onPress={submit}
        mode="contained"
      >
        Submit
      </Button>
    </View>
  )
}

export default Login
