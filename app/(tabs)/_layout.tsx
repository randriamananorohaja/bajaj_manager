import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: Colors.light.primary,
          borderTopWidth: 2,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        sceneStyle: {
          paddingBottom: tabBarHeight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bajaj"
        options={{
          title: 'Bajaj',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="car.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chauffeurs"
        options={{
          title: 'Chauffeurs',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="versements"
        options={{
          title: 'Versements',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="banknote.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="ellipsis" color={color} />,
        }}
      />
    </Tabs>
  );
}
