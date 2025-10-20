// src/services/RobotMotionService.js
// Motion Manager mock layer for RK3399 robot (for testing on mobile)

import { NativeModules, Platform } from 'react-native';

const { MotionManager3399 } = NativeModules;

/**
 * Sends a motion command to the RK3399 robot (if available).
 * On mobile, this will simply log and return success for testing.
 * @param {string} command - Hindi command, e.g., "आगे बढ़ो"
 */
export async function sendRobotCommand(command) {
  console.log('🤖 Received motion command:', command);

  try {
    if (Platform.OS !== 'android') {
      console.log('Not running on Android hardware — skipping motion.');
      return 'MOTION_SKIPPED';
    }

    if (!MotionManager3399) {
      console.warn('⚠️ MotionManager3399 not found — running in mock mode');
      return 'MOTION_MOCK_OK';
    }

    // Match Hindi phrases to robot actions
    switch (command.trim()) {
      case 'आगे बढ़ो':
        MotionManager3399.moveForward?.();
        console.log('🟢 Command: Move Forward');
        return 'FORWARD_OK';

      case 'रुको':
        MotionManager3399.stop?.();
        console.log('🛑 Command: Stop');
        return 'STOP_OK';

      case 'बाएँ':
        MotionManager3399.turnLeft?.();
        console.log('↩️ Command: Turn Left');
        return 'LEFT_OK';

      case 'दाएँ':
        MotionManager3399.turnRight?.();
        console.log('↪️ Command: Turn Right');
        return 'RIGHT_OK';

      default:
        console.log('❓ Unknown command:', command);
        return 'UNKNOWN';
    }
  } catch (err) {
    console.error('❌ MotionManager error:', err);
    return 'MOTION_ERROR';
  }
}
