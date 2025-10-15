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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { WarmTheme } from '../../constants/warmTheme';
import * as ImagePicker from 'expo-image-picker';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/CustomAlert';

interface UserStats {
  workoutsCompleted: number;
  daysStreak: number;
  achievementsUnlocked: number;
  goalsCompleted: number;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { alertConfig, isVisible, hideAlert, showError, showSuccess } = useCustomAlert();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.displayName || '');

  // Mock user stats
  const [userStats] = useState<UserStats>({
    workoutsCompleted: 48,
    daysStreak: 7,
    achievementsUnlocked: 12,
    goalsCompleted: 25,
  });

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
      showSuccess('Success', 'Profile updated successfully!');
    }
    setIsEditing(!isEditing);
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError('Permission Required', 'Please enable camera roll permissions to change your profile picture.');
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
      showError('Error', 'Failed to pick image. Please try again.');
    }
  };

  const renderStats = () => {
    const stats = [
      { icon: 'fitness', label: 'Workouts', value: userStats.workoutsCompleted },
      { icon: 'flame', label: 'Day Streak', value: userStats.daysStreak },
      { icon: 'trophy', label: 'Achievements', value: userStats.achievementsUnlocked },
      { icon: 'flag', label: 'Goals Met', value: userStats.goalsCompleted },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <Ionicons name={stat.icon as any} size={24} color={stat.icon === 'flame' ? WarmTheme.colors.actionButtons.fitness : WarmTheme.colors.primary} />
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
        <Ionicons name={icon as any} size={24} color={WarmTheme.colors.primary} />
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: WarmTheme.colors.secondary + '30', true: WarmTheme.colors.accent.primary }}
        thumbColor={Platform.OS === 'android' ? WarmTheme.colors.accent.primary : ''}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Warm Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView style={styles.scrollContent} bounces={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={WarmTheme.colors.secondary} />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={16} color={WarmTheme.colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor={WarmTheme.colors.secondary}
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
        <Text style={styles.sectionTitle}>Privacy</Text>
        <TouchableOpacity style={styles.privacyItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="lock-closed" size={24} color={WarmTheme.colors.primary} />
            <Text style={styles.settingsLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={WarmTheme.colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.privacyItem}>
          <View style={styles.settingsLeft}>
            <Ionicons name="document-text" size={24} color={WarmTheme.colors.primary} />
            <Text style={styles.settingsLabel}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={WarmTheme.colors.secondary} />
        </TouchableOpacity>
      </View>

      <CustomAlert 
        visible={isVisible}
        onClose={hideAlert}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    backgroundColor: WarmTheme.colors.accent.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameInput: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    textAlign: 'center',
    padding: Spacing.sm,
    width: '80%',
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.md,
    color: WarmTheme.colors.secondary,
    marginBottom: Spacing.lg,
  },
  editButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: WarmTheme.colors.accent.primary,
    borderRadius: BorderRadius.md,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: WarmTheme.colors.secondary,
    marginTop: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: WarmTheme.colors.primary,
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
    color: WarmTheme.colors.primary,
    marginLeft: Spacing.lg,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
});
