import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function ActorLayout() {
  const { user } = useAuthStore();

  // Route security gate: ensure only actors can access
  if (!user || user.role !== 'actor') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0B0B',
          borderTopWidth: 1,
          borderTopColor: '#262626',
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: focused ? 18 : 16 }}>🎭</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: focused ? 18 : 16 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ color, fontSize: focused ? 18 : 16 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
