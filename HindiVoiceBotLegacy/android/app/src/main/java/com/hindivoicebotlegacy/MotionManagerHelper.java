package com.hindivoicebotlegacy;

import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.reeman.nerves.RobotActionProvider;

public class MotionManagerHelper extends ReactContextBaseJavaModule {
    public MotionManagerHelper(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MotionManager3399";
    }

    @ReactMethod
    public void moveForward() {
        Log.d("MotionManager3399", "Move Forward called");
        RobotActionProvider.getInstance().moveForward();
    }

    @ReactMethod
    public void stop() {
        Log.d("MotionManager3399", "Stop called");
        RobotActionProvider.getInstance().stop();
    }

    @ReactMethod
    public void turnLeft() {
        Log.d("MotionManager3399", "Turn Left called");
        RobotActionProvider.getInstance().turnLeft();
    }

    @ReactMethod
    public void turnRight() {
        Log.d("MotionManager3399", "Turn Right called");
        RobotActionProvider.getInstance().turnRight();
    }
}
