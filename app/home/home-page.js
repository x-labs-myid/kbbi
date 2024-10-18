import {
  Application,
  Frame,
  Observable,
  ApplicationSettings,
} from "@nativescript/core";
import { Http } from "@klippa/nativescript-http";
import { BannerAdSize } from "@nativescript/firebase-admob";
import { loadInterstisialAd, loadRewardedAd } from "~/admob";

import {
  internet,
  showToast,
  initTables,
  __createDirectories,
} from "~/global-helper";
import { SQL__selectRaw } from "~/sqlite-helper";
import { speak } from "~/tts-helper";
// import { data } from "~/dictionary-json";
// import { SyncManager } from "~/sync-manager";

const context = new Observable();

export function onNavigatingTo(args) {
  const page = args.object;

  initTables();
  __createDirectories();
  _loadDataApps();
  context.set("isWatchInterstitialAd", false);

  // context.set("syncronize", data.length);
  // startSyncronize();

  // const progressBar = page.getViewById("progressBar");
  // const progressLabel = page.getViewById("progressLabel");

  // Application.on(Application.resumeEvent, () => {
  //   console.log("Aplikasi kembali ke foreground");
  //   SyncManager.startSync();

  //   // Update UI setiap kali ada progres baru
  //   setInterval(() => {
  //     const progress = SyncManager.getSyncProgress();
  //     progressBar.value = progress;
  //     progressLabel.text = `Progres: ${progress}%`;
  //   }, 500); // Update UI setiap 1 detik
  // });

  // Application.on(Application.suspendEvent, () => {
  //   console.log("Aplikasi masuk ke background");
  //   SyncManager.stopSync(); // Hentikan sinkronisasi jika aplikasi masuk background
  // });

  // _checkConnectivity();

  page.bindingContext = context;
}

export function searchTap() {
  // speakWithSSML();
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
  // speak("Fitur Penanda Buku belum tersedia");
  // showToast("Fitur Penanda Buku belum tersedia.");

  const mainView = args.object;

  initTables();

  const query =
    "SELECT w.word, w.type FROM bookmark b LEFT JOIN words w ON b.words_guid = w.guid GROUP BY w.word, w.type ORDER BY b.id DESC LIMIT 100";
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
    // if (randomNumber % 2 == 0) {
    //   loadInterstisialAd();
    // } else {
    //   loadRewardedAd();
    // }
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

// function startSyncronize() {
//   const intervalId = setInterval(() => {
//     if (context.get("syncronize") > 0) {
//       context.set("syncronize", context.get("syncronize") - 1);
//     } else {
//       clearInterval(intervalId); // Stop the syncronize when it reaches 0
//       console.log("syncronize finished!");
//     }
//   }, 1000); // Update every 1 second
// }
