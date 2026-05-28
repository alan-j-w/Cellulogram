import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { signInSimulated, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSelection, setRoleSelection] = useState<'actor' | 'director'>('actor');

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please input a valid email address.');
      return;
    }
    
    try {
      const name = roleSelection === 'director' ? 'Paramjeet Dhanjal' : 'Amal Dev';
      await signInSimulated(email, roleSelection, name);
      
      if (roleSelection === 'actor') {
        router.replace('/(actor)/dashboard');
      } else {
        router.replace('/(director)/dashboard');
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Unable to authenticate. Please check your credentials.');
    }
  };

  // Instant login for review workflow
  const handleInstantLogin = async (selectedRole: 'actor' | 'director') => {
    const mockEmail = selectedRole === 'director' ? 'director@cellulogram.com' : 'actor@cellulogram.com';
    const mockName = selectedRole === 'director' ? 'Paramjeet Dhanjal' : 'Amal Dev';
    
    try {
      await signInSimulated(mockEmail, selectedRole, mockName);
      if (selectedRole === 'actor') {
        router.replace('/(actor)/dashboard');
      } else {
        router.replace('/(director)/dashboard');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to authenticate');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        {/* Top bar back option */}
        <TouchableOpacity 
          onPress={() => router.push('/')}
          className="w-10 h-10 rounded-full border border-border items-center justify-center mb-6"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2">
            WELCOME BACK
          </Text>
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            Sign In to{"\n"}Your Studio.
          </Text>
        </View>

        {/* Regular Login Form */}
        <View className="mb-6">
          <Input
            label="Email Address"
            placeholder="enter your registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Role selector inside login */}
          <Text className="text-white text-xs font-semibold mb-3 uppercase tracking-widest opacity-80">
            Sign In As
          </Text>
          
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setRoleSelection('actor')}
              className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                roleSelection === 'actor' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border bg-card'
              }`}
            >
              <Text className={`font-semibold text-sm ${roleSelection === 'actor' ? 'text-accent' : 'text-muted'}`}>
                🎭 Actor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRoleSelection('director')}
              className={`flex-1 py-3 px-4 rounded-xl border items-center ${
                roleSelection === 'director' 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border bg-card'
              }`}
            >
              <Text className={`font-semibold text-sm ${roleSelection === 'director' ? 'text-accent' : 'text-muted'}`}>
                🎬 Director
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            label="SIGN IN"
            variant="primary"
            size="md"
            loading={isLoading}
            onPress={handleLogin}
          />
        </View>

        {/* Instant Review Login Panel */}
        <Card className="bg-[#171717]/50 border-accent/20 p-5 mb-8">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-1">
            ⚡ RAPID EVALUATION PANEL
          </Text>
          <Text className="text-muted text-xs mb-4">
            Bypass typing credentials to evaluate pre-configured casting profiles instantly:
          </Text>

          <View className="flex-row gap-3">
            <Button
              label="DEMO ACTOR"
              variant="secondary"
              size="sm"
              containerClassName="flex-1 border-accent/10"
              onPress={() => handleInstantLogin('actor')}
            />
            <Button
              label="DEMO DIRECTOR"
              variant="secondary"
              size="sm"
              containerClassName="flex-1 border-accent/10"
              onPress={() => handleInstantLogin('director')}
            />
          </View>
        </Card>

        {/* Route to Sign Up page */}
        <View className="flex-row justify-center items-center mt-auto py-4">
          <Text className="text-muted text-sm">New to Cellulogram? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-accent text-sm font-semibold underline">
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
