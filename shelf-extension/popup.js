var urlInput = document.getElementById("url");
var saveBtn = document.getElementById("save");

chrome.storage.sync.get("shelfUrl", function(result) {
  urlInput.value = result.shelfUrl || "https://being221.github.io/shelf";
});

saveBtn.addEventListener("click", function() {
  chrome.storage.sync.set({ shelfUrl: urlInput.value.trim() }, function() {
    saveBtn.textContent = "已保存 ✓";
    setTimeout(function() { saveBtn.textContent = "保存"; }, 1500);
  });
});
