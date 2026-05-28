import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { signUpSimulated, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'actor' | 'director'>('actor');
  
  // Actor additional onboarding details
  const [age, setAge] = useState('24');
  const [location, setLocation] = useState('Kochi, Kerala');
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('Malayalam, Tamil');

  // Director additional onboarding details
  const [companyName, setCompanyName] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all basic registration fields.');
      return;
    }

    try {
      const additionalDetails = role === 'actor' 
        ? { age, location, skills, languages } 
        : { company_name: companyName || 'Independent Production' };

      await signUpSimulated(email, role, name, additionalDetails);

      Alert.alert('Success', `Account created successfully as ${role === 'actor' ? 'Actor' : 'Director'}!`, [
        {
          text: 'Proceed',
          onPress: () => {
            if (role === 'actor') {
              router.replace('/(actor)/dashboard');
            } else {
              router.replace('/(director)/dashboard');
            }
          }
        }
      ]);
    } catch (e) {
      Alert.alert('Sign Up Failed', 'An error occurred during account creation.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <TouchableOpacity 
          onPress={() => router.push('/')}
          className="w-10 h-10 rounded-full border border-border items-center justify-center mb-6"
        >
          <Text className="text-white text-base font-bold">←</Text>
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2">
            CREATOR ONBOARDING
          </Text>
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            Register Your{"\n"}Digital Profile.
          </Text>
        </View>

        {/* Basic Fields */}
        <View className="mb-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email Address"
            placeholder="john@example.com"
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
        </View>

        {/* Role Selection */}
        <Text className="text-white text-xs font-semibold mb-3 uppercase tracking-widest opacity-80">
          Onboard Profile Category
        </Text>
        
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => setRole('actor')}
            className={`flex-1 py-3.5 px-4 rounded-xl border items-center ${
              role === 'actor' 
                ? 'border-accent bg-accent/5' 
                : 'border-border bg-card'
            }`}
          >
            <Text className={`font-semibold text-sm ${role === 'actor' ? 'text-accent' : 'text-muted'}`}>
              🎭 I am an Actor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole('director')}
            className={`flex-1 py-3.5 px-4 rounded-xl border items-center ${
              role === 'director' 
                ? 'border-accent bg-accent/5' 
                : 'border-border bg-card'
            }`}
          >
            <Text className={`font-semibold text-sm ${role === 'director' ? 'text-accent' : 'text-muted'}`}>
              🎬 I am a Director
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Onboarding Fields depending on Role */}
        {role === 'actor' ? (
          <View className="mb-6 bg-card border border-border p-4 rounded-2xl">
            <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              Actor Portfolio Details
            </Text>
            
            <Input
              label="Age"
              placeholder="e.g. 24"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />

            <Input
              label="Primary Location"
              placeholder="e.g. Kochi, Kerala"
              value={location}
              onChangeText={setLocation}
            />

            <Input
              label="Languages (comma separated)"
              placeholder="e.g. Malayalam, Tamil, English"
              value={languages}
              onChangeText={setLanguages}
            />

            <Input
              label="Primary Acting Skills"
              placeholder="e.g. Method Acting, Theatre, Action"
              value={skills}
              onChangeText={setSkills}
            />
          </View>
        ) : (
          <View className="mb-6 bg-card border border-border p-4 rounded-2xl">
            <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-3">
              Director Studio Details
            </Text>
            
            <Input
              label="Production Company / Studio Name"
              placeholder="e.g. A24 Films, Kerala Indie Creators"
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>
        )}

        <View className="mb-8">
          <Button
            label="CREATE WORKSPACE ACCOUNT"
            variant="primary"
            size="md"
            loading={isLoading}
            onPress={handleSignup}
          />
        </View>

        <View className="flex-row justify-center items-center mt-auto py-4">
          <Text className="text-muted text-sm">Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-accent text-sm font-semibold underline">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
