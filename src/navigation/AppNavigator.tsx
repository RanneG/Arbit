import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import CardGalleryScreen from '../screens/CardGalleryScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import CollectionScreen from '../screens/CollectionScreen';
import HelpScreen from '../screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const GalleryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Gallery" component={CardGalleryScreen} />
    <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
  </Stack.Navigator>
);

const CollectionStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Collection" component={CollectionScreen} />
    <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a0f',
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            height: 70 + Math.max(insets.bottom - 8, 0),
            position: 'absolute',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color }]}>🏠</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="GalleryTab"
          component={GalleryStack}
          options={{
            tabBarLabel: 'Gallery',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color }]}>🃏</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="CollectionTab"
          component={CollectionStack}
          options={{
            tabBarLabel: 'Collection',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color }]}>📚</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="HelpTab"
          component={HelpScreen}
          options={{
            tabBarLabel: 'Help',
            tabBarIcon: ({ color }) => (
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color }]}>❓</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});

export default AppNavigator;
