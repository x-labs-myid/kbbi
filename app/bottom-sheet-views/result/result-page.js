import { fromObject, Observable } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

import { speak, speakWithSSML } from "~/tts-helper";

export function onLoaded(args) {
  const page = args.object;

  page.on("shownInBottomSheet", (args) => {
    setupContext(args.context);

    page.bindingContext = bindingContext;
  });
}

let bindingContext;
function setupContext(openContext) {
  bindingContext = fromObject({
    ...openContext,

    // other properties and method
  });
}

export function close(args) {
  const button = args.object;
  button.closeBottomSheet({ action: "close" });
}

export function onItemTap(args) {
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;
  console.log("speak >> ", itemTapData);

  // itemTapData.isPlayTTS = !itemTapData.isPlayTTS
  // if(itemTapData.isPlayTTS){
  // }
  speakWithSSML(itemTapData.word, itemTapData.arti);
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}
