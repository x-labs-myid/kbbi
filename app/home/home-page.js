import { Frame, Observable } from "@nativescript/core";
import { internet } from "~/global-helper";

const context = new Observable();

export function onNavigatingTo(args) {
  const page = args.object;

  _checkConnectivity();

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
    // transition: {
    //   name: "slideTop",
    // },
    context: {
      originModule: "home/home-page",
      dataForm: null,
    },
  });
}

function _checkConnectivity() {
  context.set("isConnected", internet().connected);
  context.set(
    "isLostConnectionMessage",
    !context.isConnected && !context.loading
  );
}
