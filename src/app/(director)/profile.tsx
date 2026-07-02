import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function DirectorProfileScreen() {
  const router = useRouter();
  const { user, signOut, isLoading, updateProfileSimulated } = useAuthStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleOpenEditModal = () => {
    setName(user?.name || '');
    setCompanyName(user?.company_name || '');
    setIsEditModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }
    if (!companyName.trim()) {
      Alert.alert('Error', 'Studio/Company Name is required.');
      return;
    }

    updateProfileSimulated({
      name: name.trim(),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=d4af37`,
      company_name: companyName.trim(),
    });

    Alert.alert('Success', 'Your studio profile has been updated successfully!');
    setIsEditModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-[#0B0B0B]">
        <Text className="text-white text-xl font-bold tracking-tight">Studio Profile</Text>
        <Text className="text-red-500 text-xs font-semibold" onPress={handleSignOut}>
          Sign Out 📤
        </Text>
      </View>

      <ScrollView className="flex-grow p-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <Card className="bg-card border-border items-center p-6 mb-6">
          <Image
            source={{ uri: user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Director' }}
            className="w-24 h-24 rounded-full border-2 border-accent mb-4 bg-[#171717]"
          />
          <View className="flex-row items-center gap-1.5 justify-center">
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
            {user?.verified && (
              <Text className="text-sky-400 text-sm">✓</Text>
            )}
          </View>
          <Text className="text-accent text-xs font-semibold uppercase tracking-wider mt-1">
            🎬 Casting Director
          </Text>
          <Text className="text-muted text-xs mt-1.5 mb-3">{user?.email}</Text>

          <Button
            label="EDIT STUDIO DETAILS"
            variant="outline"
            size="sm"
            onPress={handleOpenEditModal}
            containerClassName="py-1 px-4 rounded-xl"
          />
        </Card>

        {/* Studio Engagement / Structural Trust Metrics */}
        <Card className="bg-[#171717]/85 border-accent/20 p-5 mb-6">
          <Text className="text-accent text-[10px] font-bold uppercase tracking-widest mb-3.5">
            CELLULOGRAM STUDIO STATS
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1 border-r border-border/50 py-1">
              <Text className="text-white text-base font-extrabold">100%</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Role Completion</Text>
            </View>

            <View className="items-center flex-1 border-r border-border/50 py-1">
              <Text className="text-white text-base font-extrabold">2.4 Days</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Average Review</Text>
            </View>

            <View className="items-center flex-1 py-1">
              <Text className="text-accent text-base font-extrabold">95%</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Actor Retention</Text>
            </View>
          </View>

          <View className="bg-sky-500/5 border border-sky-500/10 px-3 py-2.5 rounded-xl mt-4 flex-row items-center gap-2">
            <Text className="text-xs">🎬</Text>
            <Text className="text-[10px] text-sky-400 font-semibold leading-relaxed flex-1">
              Your studio holds a verified status which allows you to broadcast role invitations directly to elite actors in Malayalam and Tamil indie circles.
            </Text>
          </View>
        </Card>

        {/* Studio Specifications */}
        <Card className="bg-card border-border p-5 mb-6">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-border/40 pb-2">
            Studio Details
          </Text>

          <View className="gap-y-3.5">
            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Production House</Text>
              <Text className="text-white text-xs font-semibold">{user?.company_name || 'Independent Production'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Verification Tier</Text>
              <Text className="text-sky-400 text-xs font-bold">Verified Level 1</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Casting Region</Text>
              <Text className="text-white text-xs font-semibold">South India (KL / TN)</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Primary Dialects</Text>
              <Text className="text-white text-xs font-semibold">Malayalam, Tamil, English</Text>
            </View>
          </View>
        </Card>

        {/* Sign Out CTA Button */}
        <Button
          label="SIGN OUT FROM STUDIO WORKSPACE"
          variant="secondary"
          size="md"
          loading={isLoading}
          onPress={handleSignOut}
          containerClassName="w-full border-red-500/10 hover:border-red-500/30"
          textClassName="text-red-400"
        />
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-[#0B0B0B]">
            <Text className="text-white text-base font-bold tracking-tight">Edit Studio Profile</Text>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(false)}
              className="px-3 py-1.5 bg-card border border-border rounded-xl"
            >
              <Text className="text-white text-xs font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <ScrollView className="flex-grow p-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Input
              label="Full Name"
              placeholder="e.g. Paramjeet Dhanjal"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Production House / Company"
              placeholder="e.g. Kerala Indie Creators"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Button
              label="SAVE CHANGES"
              variant="primary"
              size="lg"
              onPress={handleSave}
              containerClassName="mt-4"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
