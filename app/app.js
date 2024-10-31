import { Application, Color, Utils } from "@nativescript/core";
import { firebase } from "@nativescript/firebase-core";
import { Admob } from "@nativescript/firebase-admob";

import { setInitialized } from "./admob";

import { install } from "@nativescript-community/ui-material-bottomsheet";
install();

if (Application.android) {
  const WebView = require("@nativescript/core/ui/web-view").WebView;
  WebView.prototype.createNativeView = function () {
    const webView = new Utils.android.webkit.WebView(Utils.android.context);
    webView.setWebContentsDebuggingEnabled(true);
    webView.getSettings().setJavaScriptEnabled(true);
    webView.getSettings().setAllowFileAccess(true);
    webView.getSettings().setDomStorageEnabled(true);
    webView.getSettings().setSupportZoom(true); // Enable zoom support
    webView.getSettings().setUseWideViewPort(true); // Use wide viewport
    webView.getSettings().setLoadWithOverviewMode(true); // Load with overview mode
    return webView;
  };

  Application.android.on(Application.android.activityStartedEvent, function () {
    const window = Application.android.startActivity.getWindow();
    window.setStatusBarColor(new Color("#3B82F6").android);
  });
}

const fb = firebase();
Application.on(Application.launchEvent, function () {
  fb.initializeApp().then(() => {
    Admob.init();
    setInitialized(true);
  });
});

Application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
