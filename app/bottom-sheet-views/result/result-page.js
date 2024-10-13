import { fromObject, Observable } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

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

// export function xspeak() {
//   console.log("speak >> ", xKeyword);
//   speak(xKeyword);
// }

export function bannerAdLoaded(args) {
  const banner = args.object;
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}
