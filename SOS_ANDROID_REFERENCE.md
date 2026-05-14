# Android SOS Emergency Feature Reference (Kotlin)

This document provides the Android implementation for the SOS emergency feature as requested.

## 1. AndroidManifest.xml Permissions
Add these permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 2. Activity Layout (activity_sos.xml)
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp"
    android:background="#F8FAFC">

    <Button
        android:id="@+id/btnSos"
        android:layout_width="250dp"
        android:layout_height="250dp"
        android:layout_centerInParent="true"
        android:background="@drawable/sos_button_background"
        android:text="SOS"
        android:textColor="#FFFFFF"
        android:textSize="48sp"
        android:textStyle="bold"
        android:elevation="12dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@id/btnSos"
        android:layout_centerHorizontal="true"
        android:layout_marginTop="24dp"
        android:text="Press for Emergency Assistance"
        android:textColor="#636E72"
        android:textSize="18sp" />

</RelativeLayout>
```

## 3. SOSActivity.kt
```kotlin
package com.example.paz.emergency

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.net.Uri
import android.os.Bundle
import android.telephony.SmsManager
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class SOSActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val emergencyContact = "+15550123456" // Predefined contact
    private val REQUEST_CODE_PERMISSIONS = 123

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sos)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        findViewById<Button>(R.id.btnSos).setOnClickListener {
            showConfirmationDialog()
        }
    }

    private fun showConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Confirm SOS")
            .setMessage("Are you sure you want to trigger an SOS alert?")
            .setPositiveButton("YES") { _, _ -> checkPermissionsAndTrigger() }
            .setNegativeButton("NO", null)
            .show()
    }

    private fun checkPermissionsAndTrigger() {
        val permissions = arrayOf(
            Manifest.permission.SEND_SMS,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.ACCESS_FINE_LOCATION
        )

        val missingPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missingPermissions.toTypedArray(), REQUEST_CODE_PERMISSIONS)
        } else {
            getLocationAndSendSOS()
        }
    }

    private fun getLocationAndSendSOS() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
            val mapsLink = location?.let {
                "https://www.google.com/maps?q=${it.latitude},${it.longitude}"
            }
            sendSOSMessage(mapsLink)
            makeEmergencyCall()
        }.addOnFailureListener {
            sendSOSMessage(null)
            makeEmergencyCall()
        }
    }

    private fun sendSOSMessage(locationLink: String?) {
        val message = if (locationLink != null) {
            "SOS! I need help. My location: $locationLink"
        } else {
            "SOS! I need help. (Location unavailable)"
        }

        try {
            val smsManager = SmsManager.getDefault()
            smsManager.sendTextMessage(emergencyContact, null, message, null, null)
            Toast.makeText(this, "SOS Message Sent", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to send SMS: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun makeEmergencyCall() {
        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$emergencyContact")
        startActivity(intent)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                getLocationAndSendSOS()
            } else {
                Toast.makeText(this, "Permissions denied. SOS cannot be fully triggered.", Toast.LENGTH_LONG).show()
            }
        }
    }
}
```

## 4. Key Best Practices Followed
- **FusedLocationProviderClient**: Used for efficient location fetching.
- **Runtime Permissions**: Handled for Android 6.0+ compatibility.
- **Modular Functions**: Logic separated into `getLocation`, `sendSOSMessage`, and `makeEmergencyCall`.
- **Error Handling**: Fallback for null location and permission denial.
- **Modern Components**: Uses `AppCompatActivity` and `FusedLocationProviderClient`.
