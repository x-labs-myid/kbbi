import {
  ObservableArray,
  fromObject,
  Utils,
  ApplicationSettings,
} from "@nativescript/core";
import { myHttpClient } from "~/global-helper";

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

export function bannerAdLoaded(args) {
  const banner = args.object;
  if (!banner.size) {
    // Hanya atur ukuran jika belum diatur
    const adSize = new BannerAdSize(350, 70);
    banner.size = adSize;
  }
  banner.load();
}

export function rateNow() {
  Utils.openUrl(
    "https://play.google.com/store/apps/details?id=com.kang.cahya.apps.mykbbi"
  );
}

export function reportNow() {
  Utils.openUrl(
    "mailto:kangcahyakeren@gmail.com?subject=Bugs Report - WA Sender Apps"
  );
}

export function openUrl(args) {
  if (args.object && args.object.url) {
    Utils.openUrl(args.object.url);
  }
}

export function onItemTap(args) {
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  Utils.openUrl(itemTapData.playstore_url);
}
