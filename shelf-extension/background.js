chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "save-to-shelf",
    title: "📦 保存到 Shelf",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId === "save-to-shelf") {
    var text = info.selectionText || "";
    var source = tab ? (tab.url || "") : "";
    var srctitle = tab ? (tab.title || "") : "";

    var result = await chrome.storage.sync.get("shelfUrl");
    var baseUrl = result.shelfUrl || "https://being221.github.io/shelf";

    var content = text;
    if (source) {
      content += "\n\n> 来源：[" + (srctitle || source) + "](" + source + ")";
    }

    var title = text.replace(/\s+/g, " ").trim().slice(0, 50);
    if (!title) title = "未命名笔记";

    var url = baseUrl + "/notes/new"
      + "?title=" + encodeURIComponent(title)
      + "&text=" + encodeURIComponent(content)
      + "&source=" + encodeURIComponent(source);

    chrome.tabs.create({ url: url });
  }
});
