import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SplashScreen from "./src/screens/SplashScreen";
import ModeSelectionScreen from "./src/screens/ModeSelectionScreen";
import AskMeScreen from "./src/screens/AskMeScreen";
import TelephonyScreen from "./src/screens/TelephonyScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
        <Stack.Screen name="AskMe" component={AskMeScreen} />
        <Stack.Screen name="Telephony" component={TelephonyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
