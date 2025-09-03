import { InterstitialAd, RewardedAd } from "@nativescript/google-mobile-ads";

let initialized = false;
export function setInitialized(_initialized) {
  initialized = _initialized;
}
const interstitial = InterstitialAd.createForAdRequest(
  "ca-app-pub-1640120316722376/8805453750",
);

const rewarded = RewardedAd.createForAdRequest(
  "ca-app-pub-1640120316722376/6529109352",
);

export function loadInterstisialAd(_immersiveModeEnabled = true) {
  // console.log('initialized:', initialized)
  interstitial.onAdEvent((event, error, data) => {
    // if (event === AdEventType.LOADED) {
    //   console.log("rewarded", "loaded");
    // } else if (event === AdEventType.FAILED_TO_LOAD_EVENT) {
    //   console.error("loading error", error);
    // }
    interstitial.show({
      immersiveModeEnabled: _immersiveModeEnabled,
    });
  });

  interstitial.load();
}

export function loadRewardedAd(_immersiveModeEnabled = true) {
  // console.log('initialized:', initialized)
  rewarded.onAdEvent((event, error, data) => {
    // if (event === AdEventType.LOADED) {
    //   console.log("rewarded", "loaded");
    // } else if (event === AdEventType.FAILED_TO_LOAD_EVENT) {
    //   console.error("loading error", error);
    // }
    rewarded.show({
      immersiveModeEnabled: _immersiveModeEnabled,
    });
  });

  rewarded.load();
}
