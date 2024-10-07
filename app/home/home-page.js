import { Frame, Observable } from "@nativescript/core";
import {
  internet,
  showToast,
  initTables,
  __createDirectories,
} from "~/global-helper";
import { BannerAdSize } from "@nativescript/firebase-admob";
import { loadInterstisialAd, loadRewardedAd } from "~/admob";

const context = new Observable();

export function onNavigatingTo(args) {
  const page = args.object;

  initTables();
  __createDirectories();
  context.set("isWatchInterstitialAd", false);
  // _checkConnectivity();

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

export function bookmarkTap() {
  showToast("Fitur Penanda Buku belum tersedia.");
}

export function aboutTap(args) {
  const mainView = args.object;

  const fullscreen = true;

  mainView.showBottomSheet({
    view: "~/bottom-sheet-views/about/about-page",
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
