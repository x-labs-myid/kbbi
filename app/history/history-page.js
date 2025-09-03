import { Frame, ObservableArray } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/google-mobile-ads";

import { executeSearchFromExternal } from "~/search/search-page";
import { SQL__select } from "~/sqlite-helper";

const context = new ObservableArray();
let page;

export function onNavigatingTo(args) {
  page = args.object;

  context.set("items", []);

  loadHistory();

  page.bindingContext = context;
}

export function goBack() {
  Frame.topmost().navigate({
    moduleName: "home/home-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}

export function onTapHistoryWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
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

function loadHistory() {
  SQL__select("history", "*", "ORDER BY id DESC").then((res) => {
    const _res = res.map((item, index) => {
      return {
        ...item,
        seq: index + 1,
      };
    });
    context.set("items", _res);
  });
}
