// src/services/RobotMotionService.js
// Motion Manager mock layer for RK3399 robot (for testing on mobile)

import { NativeModules, Platform } from 'react-native';

const { MotionManager3399 } = NativeModules;

/**
 * Sends a motion command to the RK3399 robot (if available).
 * On mobile, this will simply log and return success for testing.
 * @param {string} command - spoken command (Hindi or Tamil)
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

    const cmd = command.trim().toLowerCase();

    // Handle Hindi + Tamil
    switch (true) {
      // ===== Hindi =====
      case cmd.includes('आगे') || cmd.includes('बढ़ो'):
        MotionManager3399.moveForward?.();
        console.log('🟢 Command: Move Forward (Hindi)');
        return 'FORWARD_OK';

      case cmd.includes('रुको') || cmd.includes('रोक'):
        MotionManager3399.stop?.();
        console.log('🛑 Command: Stop (Hindi)');
        return 'STOP_OK';

      case cmd.includes('बाएँ') || cmd.includes('बाएं'):
        MotionManager3399.turnLeft?.();
        console.log('↩️ Command: Turn Left (Hindi)');
        return 'LEFT_OK';

      case cmd.includes('दाएँ') || cmd.includes('दाएं'):
        MotionManager3399.turnRight?.();
        console.log('↪️ Command: Turn Right (Hindi)');
        return 'RIGHT_OK';

      // ===== Tamil =====
      case cmd.includes('முன்னே') || cmd.includes('முன்னேறு'):
        MotionManager3399.moveForward?.();
        console.log('🟢 Command: Move Forward (Tamil)');
        return 'FORWARD_OK';

      case cmd.includes('நிறுத்து') || cmd.includes('நிறுத்தி'):
        MotionManager3399.stop?.();
        console.log('🛑 Command: Stop (Tamil)');
        return 'STOP_OK';

      case cmd.includes('இடது') || cmd.includes('இடப்பக்கம்'):
        MotionManager3399.turnLeft?.();
        console.log('↩️ Command: Turn Left (Tamil)');
        return 'LEFT_OK';

      case cmd.includes('வலது') || cmd.includes('வலப்பக்கம்'):
        MotionManager3399.turnRight?.();
        console.log('↪️ Command: Turn Right (Tamil)');
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
