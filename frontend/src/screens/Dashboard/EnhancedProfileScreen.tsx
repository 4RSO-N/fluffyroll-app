import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { QuickActionPanel } from '../../components/Activity/QuickActionPanel';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';

export default function EnhancedProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.displayName || '');

  // Mock user stats since useActivity doesn't exist
  const displayStats = {
    workoutsCompleted: 48,
    daysStreak: 7,
    achievementsUnlocked: 12,
    goalsCompleted: 25,
  };

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
      Alert.alert('Success', 'Profile updated successfully!');
    }
    setIsEditing(!isEditing);
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please enable camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        // Here you would typically upload the image to your server
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const renderStats = () => {
    const stats = [
      { icon: 'fitness', label: 'Workouts', value: displayStats.workoutsCompleted },
      { icon: 'flame', label: 'Day Streak', value: displayStats.daysStreak },
      { icon: 'trophy', label: 'Achievements', value: displayStats.achievementsUnlocked },
      { icon: 'flag', label: 'Goals Met', value: displayStats.goalsCompleted },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Ionicons name={stat.icon as any} size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSettingsItem = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsLeft}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.borderLight, true: Colors.primaryLight }}
        thumbColor={Platform.OS === 'android' ? Colors.primary : ''}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.textSecondary} />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={16} color={Colors.surface} />
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
            />
          ) : (
            <Text style={styles.name}>{userName || 'Add Name'}</Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Text style={styles.avatarTitle}>Your Wellness Avatar</Text>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color={Colors.textSecondary} />
          </View>
          <TouchableOpacity 
            style={styles.customizeAvatarButton}
            onPress={() => navigation?.navigate('AvatarCustomization')}
          >
            <Ionicons name="color-palette" size={20} color={Colors.surface} />
            <Text style={styles.customizeButtonText}>Customize</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarDescription}>
          Your avatar changes based on your health habits! Stay hydrated, get enough sleep, and exercise regularly to keep your avatar happy.
        </Text>
      </View>

      {/* Quick Actions for Daily Tracking */}
      <QuickActionPanel />

      {renderStats()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {renderSettingsItem(
          'notifications',
          'Push Notifications',
          notificationsEnabled,
          () => setNotificationsEnabled(!notificationsEnabled)
        )}
        {renderSettingsItem(
          'moon',
          'Dark Mode',
          darkMode,
          () => setDarkMode(!darkMode)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <TouchableOpacity style={styles.featureItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="analytics" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Health Analytics</Text>
          </View>
          <View style={styles.featureStatus}>
            <Text style={styles.featureStatusText}>Premium</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="pulse" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Sleep Tracking</Text>
          </View>
          <View style={[styles.featureStatus, { backgroundColor: Colors.success + '20' }]}>
            <Text style={[styles.featureStatusText, { color: Colors.success }]}>Active</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="fitness" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Workout Plans</Text>
          </View>
          <View style={styles.featureStatus}>
            <Text style={styles.featureStatusText}>Premium</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="nutrition" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Nutrition Tracking</Text>
          </View>
          <View style={[styles.featureStatus, { backgroundColor: Colors.success + '20' }]}>
            <Text style={[styles.featureStatusText, { color: Colors.success }]}>Active</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <TouchableOpacity style={styles.privacyItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="lock-closed" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.privacyItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.settingsLabel}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Footer section with sign out */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out of FluffyRoll?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                      logout().catch(console.error);
                    },
                  },
                ],
              );
            }}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out" size={24} color={Colors.error} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.version}>FluffyRoll v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  imageContainer: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameInput: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    padding: Spacing.sm,
    width: '80%',
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  editButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  editButtonText: {
    color: Colors.surface,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  avatarSection: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.textLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  customizeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  customizeButtonText: {
    color: Colors.surface,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    marginLeft: Spacing.xs,
  },
  avatarDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.textLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.textLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginLeft: Spacing.lg,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  featureStatus: {
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  featureStatusText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
  },
  footerContent: {
    paddingHorizontal: Spacing.lg,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  version: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
});