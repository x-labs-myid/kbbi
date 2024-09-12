import { Application, Color } from "@nativescript/core";

if (Application.android) {
  Application.android.on(Application.android.activityStartedEvent, function () {
    const window = Application.android.startActivity.getWindow();
    window.setStatusBarColor(new Color("#3B82F6").android);
  });
}

Application.run({ moduleName: "app-root" });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
