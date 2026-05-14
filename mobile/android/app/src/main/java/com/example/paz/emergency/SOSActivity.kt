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

/**
 * SOSActivity implements a prominent SOS emergency feature.
 * Requirements:
 * 1. Prominent SOS button.
 * 2. Fetch GPS location using FusedLocationProviderClient.
 * 3. Generate Google Maps link.
 * 4. Send SMS to predefined contact.
 * 5. Initiate phone call.
 * 6. Handle runtime permissions (Android 6.0+).
 */
class SOSActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val emergencyContact = "+15550123456" // Predefined emergency contact
    private val REQUEST_CODE_PERMISSIONS = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sos)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val btnSos = findViewById<Button>(R.id.btnSos)
        btnSos.setOnClickListener {
            showSosConfirmationDialog()
        }
    }

    private fun showSosConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Confirm SOS Alert")
            .setMessage("Are you sure you want to trigger an emergency alert? This will send your location to your trusted contact.")
            .setPositiveButton("YES, TRIGGER SOS") { _, _ ->
                checkPermissionsAndProceed()
            }
            .setNegativeButton("CANCEL", null)
            .show()
    }

    private fun checkPermissionsAndProceed() {
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
            executeSosProtocol()
        }
    }

    private fun executeSosProtocol() {
        getLocation { locationData ->
            sendSOSMessage(locationData)
            makeEmergencyCall()
        }
    }

    private fun getLocation(callback: (String?) -> Unit) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            callback(null)
            return
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
            if (location != null) {
                val mapsLink = "https://www.google.com/maps?q=${location.latitude},${location.longitude}"
                callback(mapsLink)
            } else {
                callback(null)
            }
        }.addOnFailureListener {
            callback(null)
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
            Toast.makeText(this, "SOS SMS Sent to $emergencyContact", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to send SMS: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun makeEmergencyCall() {
        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$emergencyContact")
        
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            startActivity(intent)
        } else {
            Toast.makeText(this, "Call permission denied", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                executeSosProtocol()
            } else {
                Toast.makeText(this, "Required permissions denied. SOS cannot be triggered.", Toast.LENGTH_LONG).show()
            }
        }
    }
}
