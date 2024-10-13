package com.kangcahya

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.*

class TextToSpeechClass(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    init {
        tts = TextToSpeech(context, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.let {
                // Mengatur locale ke bahasa Indonesia
                val result = it.setLanguage(Locale("id", "ID"))
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.e("TextToSpeech", "Bahasa Indonesia tidak didukung di perangkat ini")
                    promptInstallTTS()
                } else {
                    isInitialized = true
                    // Mengatur pitch dan speech rate untuk suara yang lebih alami
                    it.setSpeechRate(0.5f)  // Sedikit lebih lambat
                    it.setPitch(1.0f)       // Pitch sedikit lebih tinggi
                    // it.setLanguage(Locale("id", "ID"))
                    
                    setVoice(it, "male", Locale("id", "ID"))
                    // Mengaktifkan high-quality network voices jika tersedia
                    enableNetworkSynthesis(it)
                }
            }
        } else {
            Log.e("TextToSpeech", "Inisialisasi TextToSpeech gagal")
        }
    }

    fun speakWithSSML(title: String, text: String) {
        if (isInitialized) {
            val ssmlText = """
                <speak><emphasis level='strong'>${title}</emphasis>, <break time='500ms'/>${text}</speak>
            """.trimIndent()
    
            val params = Bundle()
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "tts1")
            tts?.speak(ssmlText, TextToSpeech.QUEUE_FLUSH, params, "tts1")
        } else {
            Log.e("TextToSpeech", "TextToSpeech belum diinisialisasi")
        }
    }
    

    fun speak(text: String) {
        if (text.isNullOrBlank()) {
            Log.e("TextToSpeech", "Teks yang diberikan kosong.")
            return
        }

        if (isInitialized) {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        } else {
            Log.e("TextToSpeech", "TextToSpeech belum diinisialisasi")
        }
    }

    private fun setVoice(tts: TextToSpeech, genderPreference: String, locale: Locale) {
        val availableVoices = tts.voices
        if (availableVoices != null) {
            for (voice in availableVoices) {
                if (voice.locale == locale) {
                    // Pilih berdasarkan preferensi gender, jika tersedia
                    if (genderPreference == "female" && voice.name.contains("female", true)) {
                        tts.voice = voice
                        Log.d("TextToSpeech", "Suara wanita dipilih")
                        break
                    } else if (genderPreference == "male" && voice.name.contains("male", true)) {
                        tts.voice = voice
                        Log.d("TextToSpeech", "Suara pria dipilih")
                        break
                    }
                }
            }
        }
    }

    private fun promptInstallTTS() {
        val installTTSIntent = Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)
        context.startActivity(installTTSIntent)
    }

    private fun enableNetworkSynthesis(tts: TextToSpeech) {
        val params = Bundle()
        params.putString(TextToSpeech.Engine.KEY_FEATURE_NETWORK_SYNTHESIS, "true")
        tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                Log.d("TextToSpeech", "TTS started")
            }

            override fun onDone(utteranceId: String?) {
                Log.d("TextToSpeech", "TTS done")
            }

            override fun onError(utteranceId: String?) {
                Log.e("TextToSpeech", "TTS error")
            }
        })
    }

    fun stop() {
        tts?.stop()
    }

    fun shutdown() {
        tts?.shutdown()
    }
}
