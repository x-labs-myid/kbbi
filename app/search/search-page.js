import { Frame, Observable, ObservableArray } from "@nativescript/core";
import { dictionary__find } from "~/dictionary";
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
const pageSize = 10; // Number of items to load at once

export function onNavigatingTo(args) {
  const page = args.object;
  context.set("searchText", "");

  context.set("recentSearches", []);
  context.set("autoComplete", []);
  context.set("loadingLoadMore", false);

  SQL__select("words").then((res) => {
    console.log("words data >>> ", res);
  });

  // SQL__select("history").then((res) => {
  //   console.log("history data >>> ", res);
  // });

  loadRecentSearches();

  page.bindingContext = context;
}

export function goBack() {
  Frame.topmost().goBack();
}

export function onTextChangeSearch(args) {
  // console.log("onTextChangeSearch >>> ", args.value);
  if (args.value) {
    loadAutoComplete(args.value);
  } else {
    loadRecentSearches();
  }
}

export function onSubmitSearch(args) {
  const obj = args.object;
  console.log("onSearch text >>> ", obj.text);
  context.set("searchText", obj.text);

  myHttpClient(`?search=${obj.text}`).then((res) => {
    console.log("res >>> ", res);
    if (res && res.data.length) {
      saveToDB(res.data);
    } else {
    }
  });
}

export function onClearSearch() {
  context.set("searchText", "");
  SQL__truncate("words");
  SQL__truncate("history");
  loadRecentSearches();
}

export function onTapAutoComplete(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  console.log("Tapped index >> ", itemIndex);
  console.log("Tapped item >> ", itemTapData);

  saveToDB(itemTapData, "LOCAL");
}

function loadRecentSearches() {
  const query =
    "SELECT w.word, w.type FROM history h LEFT JOIN words w ON h.words_guid = w.guid GROUP BY w.word, w.type ORDER BY h.updated_at DESC LIMIT 10";
  SQL__selectRaw(query).then((res) => {
    context.set("recentSearches", res);
    context.set("autoComplete", []);
  });
}

function loadAutoComplete(keyword) {
  dictionary = [];
  if (keyword) {
    const dictionaryFiltered = dictionary__find(keyword);
    dictionary.push(...dictionaryFiltered.slice(0, pageSize));
  }

  context.set("autoComplete", dictionary);
  context.set("recentSearches", []);
}

function saveToDB(_data, _type = "SERVER") {
  initTables();
  if (_type == "SERVER") {
    _data.forEach((item) => {
      SQL__select("words", "word", "WHERE word='" + item.word + "'").then(
        (res) => {
          if (res && res.length) {
            SQL__update(
              "history",
              [{ field: "updated_at", value: getCurrentTime() }],
              null,
              "WHERE words_guid='" + res.guid + "'"
            );
          } else {
            const guid = generateUUID();

            SQL__insert("words", [
              { field: "guid", value: guid },
              { field: "word", value: item.word },
              { field: "lema", value: item.lema },
              { field: "arti", value: JSON.stringify(item.arti) },
              { field: "tesaurusLink", value: item.tesaurusLink },
              { field: "type", value: item.type },
              { field: "created_at", value: getCurrentTime() },
            ]);
            SQL__insert("history", [
              { field: "words_guid", value: guid },
              { field: "created_at", value: getCurrentTime() },
              { field: "updated_at", value: getCurrentTime() },
            ]);
          }
        }
      );
    });
  } else {
    SQL__select("words", "word", "WHERE word='" + _data.word + "'").then(
      (res) => {
        if (res && res.length) {
          SQL__update(
            "history",
            [{ field: "updated_at", value: getCurrentTime() }],
            null,
            "WHERE words_guid='" + res.guid + "'"
          );
        } else {
          const guid = generateUUID();

          SQL__insert("words", [
            { field: "guid", value: guid },
            { field: "word", value: _data.word },
            { field: "lema", value: "x00000" },
            { field: "arti", value: decodeHtml(_data.arti) },
            { field: "tesaurusLink", value: "x00000" },
            { field: "type", value: "word" },
            { field: "created_at", value: getCurrentTime() },
          ]);

          SQL__insert("history", [
            { field: "words_guid", value: guid },
            { field: "created_at", value: getCurrentTime() },
            { field: "updated_at", value: getCurrentTime() },
          ]);
        }
      }
    );
  }
}
