// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_GAME_FORM") {
    // 存储表格行数据到本地存储，以便弹出窗口获取
    chrome.storage.local.set({ gameFormData: message.data }, () => {
      // 打开弹出窗口
      chrome.windows.create({
        url: chrome.runtime.getURL("tabs/game-form.html"),
        type: "popup",
        width: 600,
        height: 800
      })
    })
  } else if (message.type === "SHOW_MESSAGE") {
    // 处理显示消息的请求
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // 向当前活动标签页注入消息显示脚本
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "DISPLAY_MESSAGE",
          data: message.data
        })
      }
    })
  }
  
  // 返回true表示将使用sendResponse异步响应
  return true
})

// 可以在此处添加更多后台功能，如数据同步等 