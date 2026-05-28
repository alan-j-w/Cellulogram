import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function RoleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch the role details via React Query
  const { data: role, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => databaseService.getRoleById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background p-6">
        <Skeleton height={40} className="mb-6" />
        <Skeleton height={200} className="mb-6" />
        <Skeleton height={150} className="mb-6" />
      </SafeAreaView>
    );
  }

  if (!role) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-white text-lg font-bold mb-4">Casting Call Not Found</Text>
        <Button label="BACK TO BOARD" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header Navigation */}
      <View className="px-6 py-4 flex-row items-center border-b border-border bg-[#0B0B0B]">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full border border-border items-center justify-center mr-4"
        >
          <Text className="text-white text-sm font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-base font-bold tracking-tight">Casting Call Details</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header Title */}
        <View className="my-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest bg-accent/5 self-start px-2.5 py-1 border border-accent/20 rounded-md mb-3">
            {role.category}
          </Text>
          <Text className="text-white text-3xl font-extrabold tracking-tight mb-1">
            {role.project_title}
          </Text>
          <Text className="text-muted text-sm">
            Casting Director: <Text className="text-white font-medium">{role.director_name || 'Production House'}</Text>
          </Text>
        </View>

        {/* Dynamic Badges Card */}
        <Card className="bg-card border-border p-5 mb-6">
          <Text className="text-accent text-[11px] font-bold uppercase tracking-widest mb-3">
            ROLE SPECIFICATIONS
          </Text>
          <Text className="text-white text-xl font-bold mb-4">{role.role_title}</Text>

          <View className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-border/50 pt-4">
            <View className="flex-row items-center col-span-1">
              <Text className="text-lg mr-2">📍</Text>
              <View>
                <Text className="text-[10px] text-muted font-bold uppercase">Shoot Location</Text>
                <Text className="text-white text-xs font-semibold">{role.location}</Text>
              </View>
            </View>

            <View className="flex-row items-center col-span-1">
              <Text className="text-lg mr-2">👥</Text>
              <View>
                <Text className="text-[10px] text-muted font-bold uppercase">Required Profile</Text>
                <Text className="text-white text-xs font-semibold">{role.gender} ({role.age_range} yrs)</Text>
              </View>
            </View>

            <View className="flex-row items-center col-span-1 mt-3">
              <Text className="text-lg mr-2">🗣️</Text>
              <View>
                <Text className="text-[10px] text-muted font-bold uppercase">Language Fluent</Text>
                <Text className="text-white text-xs font-semibold">{role.language}</Text>
              </View>
            </View>

            <View className="flex-row items-center col-span-1 mt-3">
              <Text className="text-lg mr-2">📅</Text>
              <View>
                <Text className="text-[10px] text-muted font-bold uppercase">Apply Deadline</Text>
                <Text className="text-red-400 text-xs font-bold">{role.deadline}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Project Description */}
        <Card className="bg-[#171717]/40 border-border p-5 mb-6">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-2">
            Project Description
          </Text>
          <Text className="text-muted text-sm leading-relaxed">
            {role.description}
          </Text>
        </Card>

        {/* Actor Requirements */}
        <Card className="bg-[#171717]/40 border-border p-5 mb-8">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-2">
            Audition Requirements
          </Text>
          <Text className="text-muted text-sm leading-relaxed">
            {role.requirements}
          </Text>
        </Card>

        {/* Bottom Apply CTA */}
        <Button
          label="APPLY WITH SELF-TAPE"
          variant="primary"
          size="lg"
          onPress={() => router.push(`/(actor)/apply/${role.id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
