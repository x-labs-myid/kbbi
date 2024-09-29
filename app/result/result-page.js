import {
  Frame,
  ObservableArray,
  isAndroid,
  Application,
} from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

import { findOfDictionary, findStartWithOfDictionary } from "~/dictionary";
import {
  getCurrentTime,
  initTables,
  generateUUID,
  myHttpClient,
  decodeHtml,
} from "~/global-helper";
import {
  SQL__select,
  SQL__insert,
  SQL__truncate,
  SQL__dropTable,
  SQL__selectRaw,
} from "~/sqlite-helper";

const context = new ObservableArray();

let dictionary = [];
let debounceSearchTimeout;

export function onNavigatingTo(args) {
  const page = args.object;

  const navData = page.navigationContext;

  context.set("searchTextResult", navData.keyword);
  if (navData.data) {
    context.set("localResultOfSearch", navData.data);
  } else {
    context.set("localResultOfSearch", []);
  }

  page.bindingContext = context;
}

export function goBack() {
  // Frame.topmost().goBack();
  Frame.topmost().navigate({
    moduleName: "search/search-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}
