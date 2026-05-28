import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';

export default function ActorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // React Query fetching active casting calls
  const { data: roles, isLoading, refetch } = useQuery({
    queryKey: ['casting_calls'],
    queryFn: () => databaseService.getRoles(),
  });

  const categories = ['All', 'Malayalam Feature Film', 'Tamil Indie Short Film', 'YouTube Comedy Series'];

  // Filter logic
  const filteredRoles = roles?.filter((role) => {
    const matchesSearch = 
      role.project_title.toLowerCase().includes(search.toLowerCase()) ||
      role.role_title.toLowerCase().includes(search.toLowerCase()) ||
      role.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = 
      activeCategory === 'All' || 
      role.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Greeting Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-[#0B0B0B]">
        <View>
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            CASTING BOARD
          </Text>
          <Text className="text-white text-xl font-bold mt-0.5">
            Hey, {user?.name || 'Talent'}!
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="items-end">
            <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
              TRUST SCORE
            </Text>
            <Text className="text-white text-xs font-bold">{user?.trust_score || 90}%</Text>
          </View>
          <Image
            source={{ uri: user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Talent' }}
            className="w-10 h-10 rounded-full border border-accent/30 bg-card"
          />
        </View>
      </View>

      {/* Main Container */}
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="mt-6 bg-card border border-border rounded-xl px-4 py-3 flex-row items-center">
          <Text className="text-muted mr-2.5">🔍</Text>
          <TextInput
            placeholder="Search projects, roles, locations..."
            placeholderTextColor="#555555"
            className="flex-1 text-white text-sm"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Chip horizontal scroll */}
        <View className="mt-5 mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-full border mr-2 ${
                  activeCategory === cat 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border bg-card'
                }`}
              >
                <Text 
                  className={`text-xs font-semibold ${
                    activeCategory === cat ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {cat === 'All' ? 'All Roles' : cat.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Casting Calls List Header */}
        <View className="flex-row justify-between items-center mt-6 mb-4">
          <Text className="text-white font-extrabold text-base tracking-wide">
            Active Auditions
          </Text>
          <Text className="text-accent text-xs font-medium" onPress={() => refetch()}>
            Refresh 🔄
          </Text>
        </View>

        {/* Loading Skeletons */}
        {isLoading ? (
          <View className="gap-4">
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
          </View>
        ) : filteredRoles && filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <Card key={role.id} className="mb-4 bg-card border-border">
              {/* Top Row: Category and Badge */}
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-accent text-[10px] font-bold uppercase tracking-wider bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-md">
                  {role.category}
                </Text>
                {role.director_verified && (
                  <Text className="text-sky-400 text-[10px] font-bold uppercase tracking-wider bg-sky-500/5 px-2 py-0.5 rounded-md">
                    ✓ Verified Agency
                  </Text>
                )}
              </View>

              {/* Title & Role */}
              <Text className="text-white text-lg font-extrabold tracking-tight">
                {role.project_title}
              </Text>
              <Text className="text-muted text-sm font-semibold mb-3">
                Role: <Text className="text-white">{role.role_title}</Text>
              </Text>

              {/* Tag Details Row */}
              <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-4 border-t border-border/40 pt-3">
                <View className="flex-row items-center">
                  <Text className="text-xs mr-1">📍</Text>
                  <Text className="text-muted text-xs">{role.location}</Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-xs mr-1">👥</Text>
                  <Text className="text-muted text-xs">{role.gender} • {role.age_range} yrs</Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-xs mr-1">🗣️</Text>
                  <Text className="text-muted text-xs">{role.language}</Text>
                </View>
              </View>

              {/* Bottom CTA action button */}
              <Button
                label="VIEW OPPORTUNITY DETAILS"
                variant="secondary"
                size="sm"
                containerClassName="w-full bg-[#202020] border-[#2d2d2d]"
                onPress={() => router.push(`/(actor)/role/${role.id}`)}
              />
            </Card>
          ))
        ) : (
          /* Empty State */
          <Card className="bg-[#171717]/40 border-dashed border-border py-12 items-center justify-center">
            <Text className="text-4xl mb-3">🎭</Text>
            <Text className="text-white font-bold text-base">No Roles Match Filters</Text>
            <Text className="text-muted text-xs mt-1 text-center px-6">
              Try adjusting your search criteria or checking back later for brand new casting calls.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
