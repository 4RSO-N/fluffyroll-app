import { registerRootComponent } from 'expo';

import AppLauncher from './AppLauncher';

// Enable app launcher to choose between original FluffyRoll and Samsung Health style
// registerRootComponent calls AppRegistry.registerComponent('main', () => AppLauncher);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppLauncher);
