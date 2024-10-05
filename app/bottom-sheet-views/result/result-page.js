import { fromObject } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

export function onNavigatingTo(args) {
  const page = args.object;

  page.on("shownInBottomSheet", (args) => {
    console.log("shownInBottomSheet", args.context.keyword);
    setupContext(args.context);

    page.bindingContext = bindingContext;
  });

  context.set("searchTextResult", context.keyword);
  if (context.data) {
    context.set("localResultOfSearch", context.data);
  } else {
    context.set("localResultOfSearch", []);
  }

  page.bindingContext = context;
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
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}
