package com.kangcahya

import android.content.Context
import android.widget.Toast

class ToastClass {
    companion object {
        @JvmStatic
        fun showToast(context: Context, message: String, duration: String = "short") {
            val toastDuration = if (duration.equals("short", ignoreCase = true)) {
                Toast.LENGTH_SHORT
            } else {
                Toast.LENGTH_LONG
            }
            Toast.makeText(context, message, toastDuration).show()
        }
    }
}
