import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import GeneratorScreen from '../screens/GeneratorScreen';
import InterviewPracticeScreen from '../screens/InterviewPracticeScreen';
import CodingPracticeScreen from '../screens/CodingPracticeScreen';
import NotesUploadScreen from '../screens/NotesUploadScreen';
import NotesListScreen from '../screens/NotesListScreen';
import ChatScreen from '../screens/ChatScreen';
import CompilerScreen from '../screens/CompilerScreen';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Generator" component={GeneratorScreen} />
    <Stack.Screen name="InterviewPractice" component={InterviewPracticeScreen} />
    <Stack.Screen name="CodingPractice" component={CodingPracticeScreen} />
    <Stack.Screen name="NotesUpload" component={NotesUploadScreen} options={{ title: 'Upload Notes' }} />
    <Stack.Screen name="NotesList" component={NotesListScreen} options={{ title: 'My Notes' }} />
    <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'AI Tutor' }} />
    <Stack.Screen name="Compiler" component={CompilerScreen} options={{ title: 'Code Editor' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  }
});

export default AppNavigator;
