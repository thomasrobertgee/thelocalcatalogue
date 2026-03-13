import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, Compass, Search, User, Settings } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import FeedScreen from './screens/FeedScreen';
import ExploreScreen from './screens/ExploreScreen';

// Placeholder screen components
const SearchScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Search</Text>
  </View>
);

const Placeholder1Screen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Profile (Placeholder 1)</Text>
  </View>
);

const Placeholder2Screen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Settings (Placeholder 2)</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          tabBarIcon: ({ color, size }) => {
            let IconComponent;

            switch (route.name) {
              case 'My Feed':
                IconComponent = LayoutGrid;
                break;
              case 'Explore':
                IconComponent = Compass;
                break;
              case 'Search':
                IconComponent = Search;
                break;
              case 'Placeholder 1':
                IconComponent = User;
                break;
              case 'Placeholder 2':
                IconComponent = Settings;
                break;
              default:
                IconComponent = LayoutGrid;
            }

            return <IconComponent color={color} size={size} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="My Feed" component={FeedScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Placeholder 1" component={Placeholder1Screen} />
        <Tab.Screen name="Placeholder 2" component={Placeholder2Screen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
