package com.hindivoicebotlegacy;

import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.reeman.nerves.RobotActionProvider;

public class MotionManagerHelper extends ReactContextBaseJavaModule {

    private static final String TAG = "MotionManager3399";
    private final RobotActionProvider robot;

    public MotionManagerHelper(ReactApplicationContext reactContext) {
        super(reactContext);
        robot = RobotActionProvider.getInstance();
        Log.d(TAG, "✅ MotionManagerHelper initialized with Reeman SDK");
    }

    @Override
    public String getName() {
        return "MotionManager3399";
    }

    // Move Forward
    @ReactMethod
    public void moveForward() {
        Log.d(TAG, "🟢 Move Forward called");
        try {
            robot.moveFront(30); // speed parameter (0–100), adjust as needed
        } catch (Exception e) {
            Log.e(TAG, "Error moving forward", e);
        }
    }

    // Stop Movement
    @ReactMethod
    public void stop() {
        Log.d(TAG, "🛑 Stop called");
        try {
            robot.stopMove();
        } catch (Exception e) {
            Log.e(TAG, "Error stopping movement", e);
        }
    }

    // Turn Left
    @ReactMethod
    public void turnLeft() {
        Log.d(TAG, "↩️ Turn Left called");
        try {
            robot.moveLeft(30, 1000); // speed, duration (ms)
        } catch (Exception e) {
            Log.e(TAG, "Error turning left", e);
        }
    }

    // Turn Right
    @ReactMethod
    public void turnRight() {
        Log.d(TAG, "↪️ Turn Right called");
        try {
            robot.moveRight(30, 1000); // speed, duration (ms)
        } catch (Exception e) {
            Log.e(TAG, "Error turning right", e);
        }
    }
}
