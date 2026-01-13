import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import VideoPlayer from '../screens/VideoPlayer';
import ChannelScreen from '../screens/ChannelScreen';
import { TetColors } from '../theme/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: TetColors.background,
          borderBottomWidth: 1,
          borderBottomColor: TetColors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 56,
        },
        headerTintColor: TetColors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: TetColors.background,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'GoldTurf',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 22,
            color: TetColors.gold,
            letterSpacing: 1,
          },
          headerRight: () => (
            <TouchableOpacity
              style={{
                marginRight: 20,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${TetColors.gold}20`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={22} color={TetColors.gold} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
        options={{
          title: 'Video',
          headerShown: true,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            color: TetColors.textPrimary,
            letterSpacing: 0.5,
          },
        }}
      />
      <Stack.Screen
        name="Channel"
        component={ChannelScreen}
        options={{
          title: 'Kênh',
          headerShown: true,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            color: TetColors.textPrimary,
            letterSpacing: 0.5,
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
