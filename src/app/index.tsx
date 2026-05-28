import React from 'react';
import { View, Text, ImageBackground, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

export default function LandingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // If already logged in, route automatically
  React.useEffect(() => {
    if (user) {
      if (user.role === 'actor') {
        router.replace('/(actor)/dashboard');
      } else if (user.role === 'director') {
        router.replace('/(director)/dashboard');
      }
    }
  }, [user]);

  return (
    <View className="flex-1 bg-background">
      {/* Cinematic Backdrop Image Overlay */}
      <ImageBackground
        source={{ 
          uri: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop' 
        }}
        className="flex-1 justify-end"
        resizeMode="cover"
      >
        {/* Shadow Gradient Mask */}
        <View className="absolute inset-0 bg-black/75" />
        <View className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background via-background/90 to-transparent" />

        <SafeAreaView className="flex-1 justify-between p-6">
          {/* Top Logo / Navigation Headers */}
          <View className="flex-row justify-between items-center mt-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full border border-accent items-center justify-center bg-black">
                <Text className="text-accent font-bold text-base">C</Text>
              </View>
              <Text className="text-white font-extrabold text-lg tracking-wider">
                CELLULO<Text className="text-accent">GRAM</Text>
              </Text>
            </View>

            {/* NativeWind Verification Badge */}
            <View className="bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
              <Text className="text-accent text-[10px] uppercase font-bold tracking-widest">
                Tailwind V4 Active
              </Text>
            </View>
          </View>

          {/* Hero Branding Content */}
          <View className="mb-12">
            <Text className="text-accent text-xs font-bold uppercase tracking-[0.25em] mb-3">
              THE WORKFLOW OPERATING SYSTEM
            </Text>
            
            <Text className="text-white text-4xl font-extrabold tracking-tight leading-[1.15] mb-4">
              Find Your Next Role.{"\n"}
              Discover New Talent.
            </Text>
            
            <Text className="text-muted text-sm leading-relaxed mb-8 max-w-[90%]">
              Cellulogram is a premium, high-speed casting workspace eliminating WhatsApp + Drive clutter. Engineered exclusively for actors, independent filmmakers, and regional directors.
            </Text>

            {/* Glassmorphic Callouts */}
            <Card className="bg-[#171717]/85 border-[#262626] p-5 mb-8">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
                  <Text className="text-accent text-lg">🎬</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">
                    Supply-Side First Workflows
                  </Text>
                  <Text className="text-muted text-xs mt-0.5">
                    Fast swipe-shortlisting interfaces built to empower director selection instantly.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View className="flex-col gap-3">
              <Button
                label="GET STARTED"
                variant="primary"
                size="lg"
                onPress={() => router.push('/(auth)/signup')}
              />
              
              <Button
                label="SIGN IN TO PORTAL"
                variant="secondary"
                size="lg"
                onPress={() => router.push('/(auth)/login')}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
