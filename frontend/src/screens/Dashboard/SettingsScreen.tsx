import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { WarmTheme } from '../../constants/warmTheme';
import CustomAlert from '../../components/CustomAlert';
import PasswordInputModal from '../../components/PasswordInputModal';

export default function SettingsScreen({ navigation }: any) {
  const { updateOnboardingStatus, logout, user, enableBiometric, disableBiometric, isBiometricEnabled, isBiometricAvailable } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { alertConfig, isVisible, hideAlert, showAlert, showError, showSuccess, showConfirmation, showInfo } = useCustomAlert();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailyCheckupsEnabled, setDailyCheckupsEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const checkupsStored = await AsyncStorage.getItem('dailyCheckupsEnabled');
        if (checkupsStored !== null) {
          setDailyCheckupsEnabled(checkupsStored === 'true');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleResetData = () => {
    showConfirmation(
      'Reset All Data',
      'This will permanently delete ALL your data including profile, fitness tracking, habits, and activity logs. This action cannot be undone!',
      async () => {
        try {
          // Get all stored keys
          const allKeys = await AsyncStorage.getAllKeys();
          
          // Filter out authentication keys to keep user logged in
          const keysToRemove = allKeys.filter(key => 
            !['token', 'savedEmail', 'savedPassword', 'rememberMe'].includes(key)
          );
          
          // Remove all data except auth
          await AsyncStorage.multiRemove(keysToRemove);
          
          showSuccess(
            'Data Reset Complete', 
            'All your personal data has been deleted. You can start fresh by completing the onboarding process again.',
            async () => {
              // Reset onboarding status to force user through setup again
              await updateOnboardingStatus(false);
            }
          );
        } catch (error) {
          console.error('Reset error:', error);
          showError('Error', 'Failed to reset data. Please try again.');
        }
      },
      undefined,
      'Reset All Data',
      'Cancel'
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out FluffyRoll - your complete wellness companion! Download it now to track your fitness, habits, and health goals.',
        title: 'FluffyRoll - Wellness App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleBiometricToggle = async () => {
    try {
      if (isBiometricEnabled) {
        // Disable biometric authentication
        await disableBiometric();
        showSuccess('Success', 'Biometric authentication disabled.');
      } else {
        // Enable biometric authentication
        if (!user?.email) {
          showError('Error', 'User email not found. Please log out and log back in.');
          return;
        }
        
        // Prompt user to enter their current password for security
        showConfirmation(
          'Enable Biometric Authentication',
          'To enable biometric login, please confirm your current password for security.',
          () => promptForPassword(),
          undefined,
          'Enter Password',
          'Cancel'
        );
      }
    } catch (error: any) {
      console.error('Biometric error:', error);
      showError('Error', error.message || 'Failed to set up biometric authentication.');
    }
  };

  const promptForPassword = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      if (!user?.email) {
        showError('Error', 'User email not found. Please log out and log back in.');
        return;
      }

      await enableBiometric(user.email, password);
      showSuccess('Success', 'Biometric authentication enabled!');
    } catch (error: any) {
      showError('Error', error.message || 'Failed to enable biometric authentication.');
    }
  };

  const handleDailyCheckupsToggle = async () => {
    try {
      const newValue = !dailyCheckupsEnabled;
      setDailyCheckupsEnabled(newValue);
      await AsyncStorage.setItem('dailyCheckupsEnabled', newValue.toString());
      
      if (newValue) {
        // Schedule multiple check-up notifications throughout the day
        scheduleMultipleCheckups();
        showSuccess(
          'Daily Check-ups Enabled',
          'You\'ll receive gentle wellness check-up notifications throughout the day to help you stay on track with your goals.'
        );
      } else {
        // Disable check-ups
        await AsyncStorage.removeItem('scheduledCheckups');
        showInfo(
          'Daily Check-ups Disabled',
          'You won\'t receive wellness check-up notifications anymore.'
        );
      }
    } catch (error) {
      console.error('Error toggling daily check-ups:', error);
      showError('Error', 'Failed to update daily check-ups setting.');
    }
  };

  const scheduleMultipleCheckups = async () => {
    try {
      // Default check-up times throughout the day
      const checkupTimes = [
        { time: '09:00', message: 'Good morning! How are you feeling today? 🌅' },
        { time: '12:00', message: 'Midday check-in! Don\'t forget to stay hydrated 💧' },
        { time: '15:00', message: 'Afternoon boost! Take a moment to stretch 🧘‍♀️' },
        { time: '18:00', message: 'Evening reflection! How did your day go? 🌙' },
        { time: '21:00', message: 'Wind down time! Ready for a peaceful night? 😴' }
      ];
      
      // Save check-up schedule to storage
      await AsyncStorage.setItem('scheduledCheckups', JSON.stringify(checkupTimes));
      
      // In a real implementation, you would use expo-notifications to schedule these
      const checkupsList = checkupTimes.map(c => `• ${c.time} - ${c.message}`).join('\n\n');
      const scheduleMessage = `Your wellness check-ups are scheduled for:\n\n${checkupsList}\n\nYou can customize these times anytime!`;
      
      showConfirmation(
        'Check-ups Scheduled',
        scheduleMessage,
        () => customizeCheckupTimes(),
        undefined,
        'Edit',
        'Perfect!'
      );
    } catch (error) {
      console.error('Error scheduling check-ups:', error);
      showError('Error', 'Failed to schedule check-ups. Please try again.');
    }
  };

  const customizeCheckupTimes = () => {
    showAlert({
      title: 'Customize Check-up Times',
      message: 'Choose your preferred check-up frequency:',
      type: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Light (2-3 times)',
          onPress: () => {
            setCustomCheckups([
              { time: '10:00', message: 'Morning wellness check! How are you feeling? 🌸' },
              { time: '16:00', message: 'Afternoon check-in! Take care of yourself 💚' },
              { time: '20:00', message: 'Evening reflection! Wind down peacefully 🌙' }
            ]);
          }
        },
        {
          text: 'Regular (5 times)',
          onPress: () => {
            scheduleMultipleCheckups().catch(console.error);
          }
        },
        {
          text: 'Frequent (7-8 times)',
          onPress: () => {
            setCustomCheckups([
              { time: '08:00', message: 'Rise and shine! Ready for a great day? ☀️' },
              { time: '10:30', message: 'Mid-morning check! Stay focused and hydrated 💧' },
              { time: '12:30', message: 'Lunch time wellness! Fuel your body right 🥗' },
              { time: '15:00', message: 'Afternoon energy boost! Take a breather 🧘‍♀️' },
              { time: '17:30', message: 'End of day reflection! How did you do? ⭐' },
              { time: '19:30', message: 'Evening wind-down! Prepare for rest 🌅' },
              { time: '21:30', message: 'Bedtime prep! Sweet dreams ahead 😴' },
              { time: '23:00', message: 'Final check! Time to rest and recharge 🌙' }
            ]);
          }
        }
      ]
    });
  };

  const setCustomCheckups = async (checkups: Array<{time: string, message: string}>) => {
    try {
      await AsyncStorage.setItem('scheduledCheckups', JSON.stringify(checkups));
      const timesList = checkups.map(c => `• ${c.time}`).join('\n');
      const customMessage = `Your wellness check-ups have been customized!\n\n${timesList}`;
      
      showSuccess(
        'Check-ups Updated',
        customMessage
      );
    } catch (error) {
      console.error('Error saving custom check-ups:', error);
    }
  };

  const showTermsOfService = () => {
    const termsContent = `TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By downloading, installing, or using FluffyRoll, you agree to be bound by these Terms of Service.

2. DESCRIPTION OF SERVICE
FluffyRoll is a personal wellness application that helps you track fitness activities, health metrics, habits, and personal goals.

3. USER ACCOUNTS
- You are responsible for maintaining the confidentiality of your account
- You agree to provide accurate and complete information
- You must notify us immediately of any unauthorized use

4. PRIVACY AND DATA
- Your personal data is protected according to our Privacy Policy
- We collect only necessary information to provide our services
- Data is stored locally on your device with optional cloud backup

5. ACCEPTABLE USE
You agree NOT to:
- Use the app for illegal purposes
- Share false or misleading health information
- Attempt to access other users' data
- Reverse engineer or modify the application

6. HEALTH DISCLAIMER
- FluffyRoll is for informational purposes only
- Not a substitute for professional medical advice
- Consult healthcare providers for medical decisions
- We are not liable for health-related decisions

7. INTELLECTUAL PROPERTY
- All content and features are owned by FluffyRoll
- You retain rights to your personal data
- Limited license granted for personal use only

8. LIMITATION OF LIABILITY
FluffyRoll is provided "as is" without warranties. We are not liable for any damages arising from use of the application.

9. MODIFICATIONS
We reserve the right to modify these terms. Continued use constitutes acceptance of changes.

10. TERMINATION
- You may delete your account at any time
- We may terminate accounts for violation of terms
- Data deletion follows our data retention policy

11. GOVERNING LAW
These terms are governed by applicable local laws.

12. CONTACT
For questions about these terms, contact us through the app's support section.

By using FluffyRoll, you acknowledge that you have read, understood, and agree to these Terms of Service.`;

    showInfo(
      'Terms of Service',
      termsContent
    );
  };

  const showHelpAndFAQ = () => {
    const helpContent = `HELP & FAQ

GETTING STARTED
Q: How do I set up my profile?
A: Go to the Profile tab and tap "Edit Profile" to add your personal information, fitness goals, and health metrics.

Q: How do I track my daily activities?
A: Use the Dashboard to log workouts, meals, water intake, and other wellness activities. Data is saved automatically.

DASHBOARD & TRACKING
Q: What does the Health Score represent?
A: Your Health Score is calculated based on activity levels, sleep quality, nutrition, and habit consistency. Higher scores indicate better overall wellness.

Q: How do I add custom goals?
A: In the Profile section, tap "Health Goals" to add or modify your personal wellness objectives.

Q: Can I track multiple habits?
A: Yes! Go to the Habits tab to create, track, and manage unlimited custom habits with different categories.

NOTIFICATIONS & REMINDERS
Q: How do Daily Check-ups work?
A: When enabled, you'll receive gentle wellness reminders throughout the day. You can customize frequency and timing in Settings.

Q: Can I disable notifications?
A: Yes, go to Settings > Notifications to control push notifications, sounds, and vibrations.

PRIVACY & SECURITY
Q: Is my data secure?
A: Yes! Your data is stored locally on your device with optional encrypted cloud backup. We never share personal information without consent.

Q: How do I enable biometric authentication?
A: Go to Settings > Privacy & Security > Biometric Authentication. Your device must support fingerprint or face recognition.

DATA MANAGEMENT
Q: How do I backup my data?
A: Data is automatically saved locally. For cloud backup, ensure you're signed in and your data will sync securely.

Q: Can I export my data?
A: Yes, use Settings > Data & Storage > Export Data to download your information in a portable format.

Q: What happens if I reset my data?
A: This permanently deletes all your profile, activity, and tracking data. This action cannot be undone.

TROUBLESHOOTING
Q: App is running slowly
A: Try closing other apps, restart FluffyRoll, or restart your device. Clear app cache if issues persist.

Q: Notifications not working
A: Check Settings > Notifications and ensure permissions are granted in your device settings.

Q: Data not syncing
A: Ensure you have internet connection and are signed in. Check Settings > Data & Storage for sync status.

Q: Biometric authentication failed
A: Verify your device has biometric sensors enabled and enrolled. Try re-enabling the feature in Settings.

FEATURES & USAGE
Q: How do I track water intake?
A: Use the quick actions on the Dashboard or go to Health tracking to log water consumption.

Q: Can I set custom workout routines?
A: Yes! In the Fitness tab, create personalized workout plans and track your progress over time.

Q: How do I view my progress history?
A: All your tracking data and progress charts are available in each respective section (Fitness, Habits, Health).

ACCOUNT & SUBSCRIPTION
Q: How do I change my password?
A: Go to Profile > Settings > Privacy & Security (feature coming in next update).

Q: Is FluffyRoll free to use?
A: Yes! FluffyRoll offers comprehensive wellness tracking completely free with optional premium features.

CONTACT & SUPPORT
Q: How do I report a bug?
A: Use Settings > Support > Contact Support or email us at support@fluffyroll.app

Q: Can I suggest new features?
A: Absolutely! We love user feedback. Contact us through the app or email feedback@fluffyroll.app

Q: Where can I find updates?
A: App updates are available through your device's app store. Check Settings > About for current version info.

Need more help? Contact our support team - we typically respond within 24 hours!`;

    showInfo(
      'Help & FAQ',
      helpContent
    );
  };

  const showPrivacyPolicy = () => {
    const privacyContent = `PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INFORMATION COLLECTION
We collect information you provide directly:
- Profile information (name, age, height, weight)
- Health and fitness data you input
- Goal and habit tracking data
- App usage analytics

2. HOW WE USE YOUR INFORMATION
Your data is used to:
- Provide personalized wellness recommendations
- Track your progress and achievements
- Improve app functionality and user experience
- Send optional notifications and reminders

3. DATA STORAGE AND SECURITY
- Data is primarily stored locally on your device
- Optional cloud backup uses encrypted transmission
- We implement industry-standard security measures
- No data is shared with third parties without consent

4. DATA SHARING
We DO NOT sell or rent your personal information.
Limited sharing may occur for:
- Legal compliance when required
- Protection of our rights and users' safety
- Service providers bound by confidentiality agreements

5. YOUR PRIVACY RIGHTS
You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Export your data in a portable format
- Opt-out of optional data collection

6. COOKIES AND TRACKING
- We use minimal analytics for app improvement
- No advertising cookies or tracking
- Location data only used if explicitly enabled
- Can disable analytics in settings

7. CHILDREN'S PRIVACY
- App is not intended for users under 13
- We do not knowingly collect children's data
- Parents may contact us to remove child's information

8. HEALTH DATA SPECIAL PROTECTIONS
- Health information receives extra security
- Encrypted storage and transmission
- Limited to necessary app functionality
- User controls data retention periods

9. DATA RETENTION
- Profile data: Until account deletion
- Activity logs: 3 years or user-specified
- Analytics: Anonymized after 1 year
- Deleted data is permanently removed within 30 days

10. INTERNATIONAL TRANSFERS
- Data processed in your region when possible
- International transfers use adequate safeguards
- Compliance with local data protection laws

11. POLICY UPDATES
- Material changes will be prominently notified
- Continued use implies acceptance
- Previous versions available upon request

12. CONTACT INFORMATION
For privacy concerns or data requests:
- Email: privacy@fluffyroll.app
- In-app support section
- Response within 30 days guaranteed

13. YOUR CONSENT
By using FluffyRoll, you consent to this Privacy Policy and our data practices.

We are committed to protecting your privacy and giving you control over your personal information.`;

    showInfo(
      'Privacy Policy',
      privacyContent
    );
  };

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: 'white', borderWidth: 0 }]}>
      <Text style={[styles.sectionTitle, { color: WarmTheme.colors.primary }]}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingsItem = (
    icon: string,
    label: string,
    value?: boolean,
    onToggle?: () => void,
    onPress?: () => void,
    hasArrow?: boolean,
    rightText?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: WarmTheme.colors.light + '40' }]}
      onPress={onPress || onToggle}
      disabled={!onPress && !onToggle}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: WarmTheme.colors.primary + '15' }]}>
          <Ionicons name={icon as any} size={20} color={WarmTheme.colors.primary} />
        </View>
        <Text style={[styles.settingsLabel, { color: WarmTheme.colors.primary }]}>{label}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {rightText && <Text style={[styles.rightText, { color: WarmTheme.colors.secondary }]}>{rightText}</Text>}
        {value !== undefined && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: WarmTheme.colors.primary, true: WarmTheme.colors.light }}
            thumbColor={Platform.OS === 'android' ? WarmTheme.colors.panelBackground.primary : ''}
          />
        )}
        {hasArrow && (
          <Ionicons name="chevron-forward" size={20} color={WarmTheme.colors.secondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Beige Background Gradient */}
      <LinearGradient
        colors={WarmTheme.gradients.pageBackground as [string, string, string]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: 'transparent', borderBottomWidth: 0 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={WarmTheme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: WarmTheme.colors.primary }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={[styles.content, { backgroundColor: 'transparent' }]}>
        {/* General */}
        {renderSettingsSection(
          'General',
          <>
            {renderSettingsItem(
              'moon',
              'Dark Mode',
              isDarkMode,
              toggleDarkMode
            )}
            {renderSettingsItem(
              'share',
              'Share App',
              undefined,
              undefined,
              handleShareApp,
              true
            )}
          </>
        )}

        {/* Notifications */}
        {renderSettingsSection(
          'Notifications',
          <>
            {renderSettingsItem(
              'notifications',
              'Push Notifications',
              notificationsEnabled,
              () => setNotificationsEnabled(!notificationsEnabled)
            )}
            {renderSettingsItem(
              'volume-high',
              'Sound',
              soundEnabled,
              () => setSoundEnabled(!soundEnabled)
            )}
            {renderSettingsItem(
              'phone-portrait',
              'Vibration',
              vibrationEnabled,
              () => setVibrationEnabled(!vibrationEnabled)
            )}
            {renderSettingsItem(
              'notifications-outline',
              'Daily Check-ups',
              dailyCheckupsEnabled,
              handleDailyCheckupsToggle
            )}
          </>
        )}

        {/* Privacy & Security */}
        {renderSettingsSection(
          'Privacy & Security',
          <>
            {isBiometricAvailable && renderSettingsItem(
              'finger-print',
              'Biometric Authentication',
              isBiometricEnabled,
              handleBiometricToggle
            )}
            {renderSettingsItem(
              'shield-checkmark',
              'Privacy Policy',
              undefined,
              undefined,
              showPrivacyPolicy,
              true
            )}
            {renderSettingsItem(
              'document-text',
              'Terms of Service',
              undefined,
              undefined,
              showTermsOfService,
              true
            )}
          </>
        )}

        {/* Data & Storage */}
        {renderSettingsSection(
          'Data & Storage',
          <>
            {renderSettingsItem(
              'download',
              'Export Data',
              undefined,
              undefined,
              () => showInfo('Export', 'Data export feature coming soon!'),
              true
            )}
            {renderSettingsItem(
              'trash',
              'Reset All Data',
              undefined,
              undefined,
              handleResetData,
              true
            )}
          </>
        )}

        {/* Support */}
        {renderSettingsSection(
          'Support',
          <>
            {renderSettingsItem(
              'help-circle',
              'Help & FAQ',
              undefined,
              undefined,
              showHelpAndFAQ,
              true
            )}
            {renderSettingsItem(
              'mail',
              'Contact Support',
              undefined,
              undefined,
              () => showInfo('Contact', 'Email: support@fluffyroll.app'),
              true
            )}
            {renderSettingsItem(
              'information-circle',
              'About',
              undefined,
              undefined,
              () => showInfo('About FluffyRoll', 'Version 1.0.0\nYour complete wellness companion'),
              true
            )}
          </>
        )}

        {/* Account */}
        {renderSettingsSection(
          'Account',
          <>
            {renderSettingsItem(
              'log-out',
              'Sign Out',
              undefined,
              undefined,
              () => {
                showConfirmation(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  logout
                );
              },
              true
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={[styles.version, { color: WarmTheme.colors.secondary }]}>Version 1.0.0</Text>
        </View>
      </View>

      <CustomAlert 
        visible={isVisible}
        onClose={hideAlert}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
      />

      <PasswordInputModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onSubmit={handlePasswordSubmit}
        title="Enable Biometric Authentication"
        message="Please enter your current password to securely enable biometric login:"
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingsLabel: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    flex: 1,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    fontSize: FontSizes.sm,
    marginRight: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingBottom: 100, // Extra padding to avoid tab overlap
  },
  version: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.lg,
  },
});