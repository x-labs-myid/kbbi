import {
  Application,
  Frame,
  Observable,
  ApplicationSettings,
} from "@nativescript/core";
import { Http } from "@klippa/nativescript-http";
import { BannerAdSize } from "@nativescript/google-mobile-ads";
import { loadInterstisialAd } from "~/admob";

import { executeSearchFromExternal } from "~/search/search-page";
import {
  internet,
  showToast,
  __createDirectories,
  decodeHtml,
} from "~/global-helper";
import { SQL__selectRaw, SQL__select } from "~/sqlite-helper";

const context = new Observable();
let page;

export function onNavigatingTo(args) {
  page = args.object;

  __createDirectories();
  _loadDataApps();
  _loadDailyProverb();
  context.set("isWatchInterstitialAd", false);

  page.bindingContext = context;
}

export function searchTap() {
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
export function historyTap() {
  Frame.topmost().navigate({
    moduleName: "history/history-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}

export function bookmarkTap(args) {
  const mainView = args.object;

  const query =
    "SELECT d.word FROM bookmark b LEFT JOIN dictionary d ON b.dictionary_id = d.guid GROUP BY d.word ORDER BY b.id DESC LIMIT 100";
  SQL__selectRaw(query).then((res) => {
    const bsContext = {
      listViewItems: res,
    };
    const fullscreen = true;

    mainView.showBottomSheet({
      view: "~/bottom-sheet-views/bookmark/bookmark-page",
      context: bsContext,
      dismissOnBackButton: true,
      dismissOnBackgroundTap: false,
      dismissOnDraggingDownSheet: false,
      closeCallback: () => {},
      fullscreen,
    });
  });
}

export function aboutTap(args) {
  const mainView = args.object;

  const bsContext = {
    listViewHeight: context.get("listViewHeight"),
    listViewItems: context.get("listViewItems"),
  };
  const fullscreen = true;

  mainView.showBottomSheet({
    view: "~/bottom-sheet-views/about/about-page",
    context: bsContext,
    dismissOnBackButton: true,
    closeCallback: () => {},
    fullscreen,
  });
}

export function watchInterstitialAd() {
  if (internet().connected) {
    context.set("isWatchInterstitialAd", true);
    const randomNumber = Math.floor(Math.random() * 2);
    loadInterstisialAd();
    setTimeout(() => {
      context.set("isWatchInterstitialAd", false);
    }, 5000);
  } else {
    showToast("Tidak ada koneksi internet");
  }
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  // const adSize = new BannerAdSize(350, 70);
  // banner.size = adSize;
  if (!banner.size) {
    // Hanya atur ukuran jika belum diatur
    const adSize = new BannerAdSize(350, 70);
    banner.size = adSize;
  }
  banner.load();
}

export function onTapDailyProverb(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

export function onTapDailyWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

export function onTapWeeklyWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

function _loadDataApps() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString("lastFetchDate", "");
  const cachedData = ApplicationSettings.getString("cachedData", "");

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("listViewHeight", (data.length + 1) * 80);
    context.set("listViewItems", data);
  } else {
    Http.request({
      url: "https://x-labs.my.id/api/apps",
      method: "GET",
    }).then(
      (response) => {
        // console.log(response);
        const res = response.content.toJSON();
        context.set("listViewHeight", (res.data.length + 1) * 80);
        context.set("listViewItems", res.data);
        ApplicationSettings.setString("lastFetchDate", today);
        ApplicationSettings.setString("cachedData", JSON.stringify(res.data));
      },
      (e) => {},
    );
  }
}

function _loadDailyProverb() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString(
    "lastFetchDateDailyProverb",
    "",
  );
  const cachedData = ApplicationSettings.getString(
    "cachedDataDailyProverb",
    "",
  );

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("dailyProverbItems", data);
  } else {
    SQL__select(
      "dictionary",
      "*",
      "WHERE LOWER(arti) LIKE 'peribahasa%' ORDER BY abs(random() + strftime('%j', 'now')) LIMIT 1",
    ).then((res) => {
      const dataX = res.map((entry, idx) => {
        return {
          id: idx + 1,
          word: entry.word,
          arti: decodeHtml(entry.arti),
        };
      });

      context.set("dailyProverbItems", dataX);
      ApplicationSettings.setString("lastFetchDateDailyProverb", today);
      ApplicationSettings.setString(
        "cachedDataDailyProverb",
        JSON.stringify(dataX),
      );
    });
  }
}
