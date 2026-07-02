import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function ActorProfileScreen() {
  const router = useRouter();
  const { user, signOut, isLoading, updateProfileSimulated } = useAuthStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('Male');
  const [languages, setLanguages] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleOpenEditModal = () => {
    setName(user?.name || '');
    setAge(user?.age || '');
    setLocation(user?.location || '');
    setGender(user?.gender || 'Male');
    setLanguages(user?.languages || '');
    setSkills(user?.skills || '');
    setExperience(user?.experience || '');
    setIsEditModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Full Name is required.');
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('Error', 'Please enter a valid age.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Primary Location is required.');
      return;
    }

    updateProfileSimulated({
      name: name.trim(),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=d4af37`,
      age: age.trim(),
      location: location.trim(),
      gender,
      languages: languages.trim(),
      skills: skills.trim(),
      experience: experience.trim(),
    });

    Alert.alert('Success', 'Your portfolio has been updated successfully!');
    setIsEditModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-[#0B0B0B]">
        <Text className="text-white text-xl font-bold tracking-tight">Your Portfolio</Text>
        <Text className="text-red-500 text-xs font-semibold" onPress={handleSignOut}>
          Sign Out 📤
        </Text>
      </View>

      <ScrollView className="flex-grow p-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <Card className="bg-card border-border items-center p-6 mb-6">
          <Image
            source={{ uri: user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=Talent' }}
            className="w-24 h-24 rounded-full border-2 border-accent mb-4 bg-[#171717]"
          />
          <Text className="text-white text-xl font-bold">{user?.name}</Text>
          <Text className="text-accent text-xs font-semibold uppercase tracking-wider mt-1">
            🎭 Professional Actor
          </Text>
          <Text className="text-muted text-xs mt-1.5 mb-3">{user?.email}</Text>
          
          <Button
            label="EDIT PORTFOLIO"
            variant="outline"
            size="sm"
            onPress={handleOpenEditModal}
            containerClassName="py-1 px-4 rounded-xl"
          />
        </Card>

        {/* Long-Term Trust Signals Card */}
        <Card className="bg-[#171717]/85 border-accent/20 p-5 mb-6">
          <Text className="text-accent text-[10px] font-bold uppercase tracking-widest mb-3.5">
            CELLULOGRAM TRUST SIGNALS
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1 border-r border-border/50 py-1">
              <Text className="text-white text-base font-extrabold">100%</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Response Rate</Text>
            </View>

            <View className="items-center flex-1 border-r border-border/50 py-1">
              <Text className="text-white text-base font-extrabold">98%</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Attendance</Text>
            </View>

            <View className="items-center flex-1 py-1">
              <Text className="text-accent text-base font-extrabold">Level 2</Text>
              <Text className="text-[10px] text-muted font-bold uppercase mt-0.5">Verified Badge</Text>
            </View>
          </View>

          <View className="bg-accent/5 border border-accent/15 px-3 py-2.5 rounded-xl mt-4 flex-row items-center gap-2">
            <Text className="text-xs">🏆</Text>
            <Text className="text-[10px] text-accent font-semibold leading-relaxed flex-1">
              High Attendance and rapid reply stats give your self-tapes top query priority on Director review queues automatically.
            </Text>
          </View>
        </Card>

        {/* Actor Info Sheet */}
        <Card className="bg-card border-border p-5 mb-6">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-b border-border/40 pb-2">
            Portfolio Specifications
          </Text>

          <View className="gap-y-3.5">
            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Primary Location</Text>
              <Text className="text-white text-xs font-semibold">{user?.location || 'Kochi, Kerala'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Age Profile</Text>
              <Text className="text-white text-xs font-semibold">{user?.age || '24'} Years</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Gender</Text>
              <Text className="text-white text-xs font-semibold">{user?.gender || 'Male'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Languages</Text>
              <Text className="text-white text-xs font-semibold text-right max-w-[65%]">{user?.languages || 'Malayalam, Tamil'}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted text-xs">Acting Skills</Text>
              <Text className="text-white text-xs font-semibold text-right max-w-[65%]">{user?.skills || 'Method Acting, Accents'}</Text>
            </View>
          </View>
        </Card>

        {/* Experience Summary */}
        <Card className="bg-[#171717]/40 border-border p-5 mb-6">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-2">
            Professional Experience
          </Text>
          <Text className="text-muted text-xs leading-relaxed">
            {user?.experience || '2 Short films, 1 Web series project, theatre background.'}
          </Text>
        </Card>

        {/* Sign Out CTA Button */}
        <Button
          label="SIGN OUT FROM WORKSPACE"
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
            <Text className="text-white text-base font-bold tracking-tight">Edit Portfolio</Text>
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
              placeholder="e.g. Amal Dev"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Age Profile"
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

            {/* Gender constraint */}
            <Text className="text-white text-xs font-semibold mb-2 uppercase tracking-widest opacity-80">
              Gender
            </Text>
            <View className="flex-row gap-2.5 mb-5">
              {['Male', 'Female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    gender === g 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border bg-[#0B0B0B]'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${gender === g ? 'text-accent' : 'text-muted'}`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Languages (comma separated)"
              placeholder="e.g. Malayalam, Tamil, English"
              value={languages}
              onChangeText={setLanguages}
            />

            <Input
              label="Acting Skills"
              placeholder="e.g. Method Acting, Martial Arts, Comedy"
              value={skills}
              onChangeText={setSkills}
            />

            <Input
              label="Professional Experience"
              placeholder="Describe previous acting roles, short films, or theatre experience..."
              value={experience}
              onChangeText={setExperience}
              multiline
              numberOfLines={4}
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
