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
import { useThemeColors } from '@/hooks/useThemeColors';
import { Search, MapPin, Users, Languages, RefreshCw, Clapperboard, BadgeCheck } from 'lucide-react-native';

export default function ActorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: roles, isLoading, refetch } = useQuery({
    queryKey: ['casting_calls'],
    queryFn: () => databaseService.getRoles(),
  });

  const categories = ['All', 'Malayalam Feature Film', 'Tamil Indie Short Film', 'YouTube Comedy Series'];

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
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-card">
        <View>
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            CASTING BOARD
          </Text>
          <Text className="text-textPrimary text-xl font-bold mt-0.5">
            Hey, {user?.name || 'Talent'}!
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="items-end">
            <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
              TRUST SCORE
            </Text>
            <Text className="text-textPrimary text-xs font-bold">{user?.trust_score || 90}%</Text>
          </View>
          <Image
            source={{ uri: user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Talent' }}
            className="w-10 h-10 rounded-full border border-accent/30 bg-background"
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 bg-card border border-border rounded-xl px-4 py-3 flex-row items-center">
          <Search size={16} color={colors.muted} className="mr-2.5" />
          <TextInput
            placeholder="Search projects, roles, locations..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-textPrimary text-sm"
            value={search}
            onChangeText={setSearch}
          />
        </View>

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

        <View className="flex-row justify-between items-center mt-6 mb-4">
          <Text className="text-textPrimary font-extrabold text-base tracking-wide">
            Active Auditions
          </Text>
          <TouchableOpacity onPress={() => refetch()} className="flex-row items-center gap-1">
            <Text className="text-accent text-xs font-semibold">Refresh</Text>
            <RefreshCw size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="gap-4">
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
          </View>
        ) : filteredRoles && filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <Card key={role.id} className="mb-4 bg-card border-border">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-accent text-[10px] font-bold uppercase tracking-wider bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-md">
                  {role.category}
                </Text>
                {role.director_verified && (
                  <View className="bg-sky-500/5 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                    <BadgeCheck size={10} color="#38bdf8" />
                    <Text className="text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                      Verified Agency
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-textPrimary text-lg font-extrabold tracking-tight">
                {role.project_title}
              </Text>
              <Text className="text-muted text-sm font-semibold mb-3">
                Role: <Text className="text-textPrimary">{role.role_title}</Text>
              </Text>

              <View className="flex-row flex-wrap gap-x-4 gap-y-2 mb-4 border-t border-border/40 pt-3">
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} color={colors.muted} />
                  <Text className="text-muted text-xs">{role.location}</Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <Users size={12} color={colors.muted} />
                  <Text className="text-muted text-xs">{role.gender} • {role.age_range} yrs</Text>
                </View>

                <View className="flex-row items-center gap-1">
                  <Languages size={12} color={colors.muted} />
                  <Text className="text-muted text-xs">{role.language}</Text>
                </View>
              </View>

              <Button
                label="VIEW OPPORTUNITY DETAILS"
                variant="secondary"
                size="sm"
                containerClassName="w-full bg-background border-border"
                onPress={() => router.push(`/(actor)/role/${role.id}`)}
              />
            </Card>
          ))
        ) : (
          <Card className="bg-background border-dashed border-border py-12 items-center justify-center">
            <Clapperboard size={40} color={colors.muted} className="mb-3" />
            <Text className="text-textPrimary font-bold text-base">No Roles Match Filters</Text>
            <Text className="text-muted text-xs mt-1 text-center px-6">
              Try adjusting your search criteria or checking back later for brand new casting calls.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
