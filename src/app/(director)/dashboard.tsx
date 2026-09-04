import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Plus, BadgeCheck, Film, Users, Star, RefreshCw, AlertCircle, MapPin, Video, MonitorPlay } from 'lucide-react-native';

export default function DirectorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const { data: roles, isLoading, refetch } = useQuery({
    queryKey: ['director_roles'],
    queryFn: () => databaseService.getRoles(),
  });

  const { data: allApps } = useQuery({
    queryKey: ['director_applications'],
    queryFn: async () => {
      const activeRoles = await databaseService.getRoles();
      const allPromises = activeRoles.map((r) => databaseService.getApplicationsForRole(r.id));
      const results = await Promise.all(allPromises);
      return results.flat();
    }
  });

  const activeRolesCount = roles?.length || 0;
  const totalApplicantsCount = allApps?.length || 0;
  const shortlistedCount = allApps?.filter(app => app.shortlisted).length || 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-card">
        <View>
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            DIRECTOR DESK
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-textPrimary text-xl font-bold">{user?.name}</Text>
            {user?.verified && (
              <View className="flex-row items-center gap-1">
                <BadgeCheck size={14} color="#38bdf8" />
                <Text className="text-sky-400 text-xs">Verified</Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-xs mt-0.5">{user?.company_name || 'Kerala Indie House'}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/(director)/post-role')}
          className="bg-accent px-4 py-2 rounded-xl flex-row items-center gap-1"
        >
          <Plus size={14} color={colors.background} strokeWidth={3} />
          <Text className="text-background font-bold text-xs">NEW CALL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 45 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row gap-3 mt-6 mb-8">
          <Card className="flex-1 bg-card border-border p-4.5 items-center justify-center">
            <Film size={24} color={colors.textPrimary} className="mb-2" />
            <Text className="text-textPrimary text-lg font-extrabold">{activeRolesCount}</Text>
            <Text className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">Active Roles</Text>
          </Card>

          <Card className="flex-1 bg-card border-border p-4.5 items-center justify-center">
            <Users size={24} color={colors.textPrimary} className="mb-2" />
            <Text className="text-textPrimary text-lg font-extrabold">{totalApplicantsCount}</Text>
            <Text className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">Applicants</Text>
          </Card>

          <Card className="flex-1 bg-accent/5 border-accent/25 p-4.5 items-center justify-center">
            <Star size={24} color={colors.accent} className="mb-2" />
            <Text className="text-accent text-lg font-extrabold">{shortlistedCount}</Text>
            <Text className="text-[10px] text-accent font-bold uppercase tracking-wider mt-0.5">Shortlisted</Text>
          </Card>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-textPrimary font-extrabold text-base tracking-wide">
            Your Active Casting Calls
          </Text>
          <TouchableOpacity onPress={() => refetch()} className="flex-row items-center gap-1">
            <Text className="text-accent text-xs font-semibold">Refresh</Text>
            <RefreshCw size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="gap-4">
            <Skeleton height={130} />
            <Skeleton height={130} />
          </View>
        ) : roles && roles.length > 0 ? (
          roles.map((role) => {
            const roleApps = allApps?.filter(app => app.role_id === role.id) || [];
            const roleAppsCount = roleApps.length;
            const roleUnread = roleApps.filter(app => !app.viewed).length;

            return (
              <Card key={role.id} className="mb-4 bg-card border-border">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-accent text-[10px] font-bold uppercase tracking-wider bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-md">
                    {role.category}
                  </Text>
                  
                  {roleUnread > 0 ? (
                    <View className="bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-md flex-row items-center gap-1">
                      <AlertCircle size={10} color="#fbbf24" />
                      <Text className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        {roleUnread} New Video
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-muted text-[10px] font-bold uppercase tracking-wider bg-muted/15 px-2 py-0.5 rounded-md">
                      Fully Reviewed
                    </Text>
                  )}
                </View>

                <Text className="text-textPrimary text-lg font-bold tracking-tight">
                  {role.project_title}
                </Text>
                <Text className="text-muted text-xs mb-3">
                  Casting Role: <Text className="text-textPrimary font-medium">{role.role_title}</Text>
                </Text>

                <View className="flex-row items-center border-t border-border/40 pt-3 mb-4.5 justify-between">
                  <View className="flex-row gap-4">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color={colors.muted} />
                      <Text className="text-muted text-xs">{role.location}</Text>
                    </View>
                    
                    <View className="flex-row items-center gap-1">
                      <Video size={12} color={colors.textPrimary} />
                      <Text className="text-textPrimary text-xs font-semibold">{roleAppsCount} applicants</Text>
                    </View>
                  </View>

                  <Text className="text-muted text-[10px]">Deadline: {role.deadline}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push(`/(director)/applicants/${role.id}`)}
                  className="bg-background border border-border py-3 rounded-xl items-center justify-center flex-row gap-1"
                >
                  <Text className="text-textPrimary text-xs font-bold uppercase tracking-widest">
                    REVIEW AUDITION APPLICATIONS
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })
        ) : (
          <Card className="bg-background border-dashed border-border py-12 items-center justify-center">
            <MonitorPlay size={40} color={colors.muted} className="mb-3" />
            <Text className="text-textPrimary font-bold text-base">No Casting Calls Posted</Text>
            <Text className="text-muted text-xs mt-1 text-center px-6 leading-relaxed">
              {"You haven't listed any casting roles yet. Click \"NEW CALL\" in the top bar to publish your first audition sheet."}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
