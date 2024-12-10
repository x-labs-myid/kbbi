import {
  Application,
  Frame,
  Observable,
  ApplicationSettings,
} from "@nativescript/core";
import { Http } from "@klippa/nativescript-http";
import { BannerAdSize } from "@nativescript/firebase-admob";
import { loadInterstisialAd } from "~/admob";

import { executeSearchFromExternal } from "~/search/search-page";
import { internet, showToast, __createDirectories } from "~/global-helper";
import { SQL__selectRaw } from "~/sqlite-helper";

const context = new Observable();
let page;

export function onNavigatingTo(args) {
  page = args.object;

  __createDirectories();
  _loadDataApps();
  _loadWeeklyWords();
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
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}

export function onTapWeeklyWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

function _checkConnectivity() {
  context.set("isConnected", internet().connected);
  context.set(
    "isLostConnectionMessage",
    !context.isConnected && !context.loading
  );
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
      (e) => {}
    );
  }
}

function _loadWeeklyWords() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString(
    "lastFetchDateWeeklyWord",
    ""
  );
  const cachedData = ApplicationSettings.getString("cachedDataWeeklyWord", "");

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("dailyWordItems", data);
  } else {
    Http.request({
      url: "https://x-labs.my.id/api/kbbi/top-entries/weekly/all/6",
      method: "GET",
    }).then(
      (response) => {
        const res = response.content.toJSON();
        if (res.data.length === 0) {
          context.set("dailyWordItems", []);
          return;
        }

        const dataX = res.data.map((item, index) => {
          return {
            ...item,
            id: index + 1,
          };
        });
        context.set("dailyWordItems", dataX);
        ApplicationSettings.setString("lastFetchDateWeeklyWord", today);
        ApplicationSettings.setString(
          "cachedDataWeeklyWord",
          JSON.stringify(dataX)
        );
      },
      (e) => {}
    );
  }
}
