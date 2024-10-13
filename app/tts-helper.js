import { Application } from "@nativescript/core";
import { showToast } from "./global-helper";

const context =
  Application.android.foregroundActivity || Application.android.startActivity;
const TTSClass = com.kangcahya.TextToSpeechClass;

let ttsClass = new TTSClass(context);

export function speak(text) {
  if (text == null || text == undefined || text == "") {
    showToast("Teks tidak boleh kosong");
    return;
  }

  ttsClass.speak(text);
}

export function speakWithSSML(title, text) {
  ttsClass.speakWithSSML(title, text);
}

export function stop() {
  ttsClass.stop();
}

export function shutdown() {
  ttsClass.shutdown();
}
