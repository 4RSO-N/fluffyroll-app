// Warm Theme Components - Export all reusable warm-themed components
export { default as WarmModal, WarmInput } from './WarmModal';
export { default as WarmPanel } from './WarmPanel';
export { default as WarmButton } from './WarmButton';
export { WarmTheme, getWarmGradient, getWarmColor, WarmComponents } from '../constants/warmTheme';

// Usage Examples:
/*
  
// Using WarmModal
<WarmModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  title="Log Water"
  subtitle="Stay hydrated, stay healthy!"
  icon="water-outline"
  iconColor={WarmTheme.colors.actionButtons.water}
  buttons={[
    { title: 'Cancel', type: 'cancel', onPress: () => setModalVisible(false) },
    { title: 'Log Water', type: 'primary', onPress: handleSubmit }
  ]}
>
  <WarmInput
    label="Number of Glasses"
    value={value}
    onChangeText={setValue}
    placeholder="1"
    keyboardType="numeric"
  />
</WarmModal>

// Using WarmPanel
<WarmPanel 
  title="Wellness Score" 
  delay={500}
>
  <Text style={{ color: WarmTheme.colors.primary }}>
    Content goes here
  </Text>
</WarmPanel>

// Using WarmButton
<WarmButton
  title="Save Changes"
  icon="checkmark-outline"
  type="primary"
  onPress={handleSave}
/>

*/