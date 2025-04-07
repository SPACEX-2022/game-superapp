import type { PlasmoContentScript } from "plasmo"
import { message } from "antd"
// import "antd/dist/antd.css"
import "../styles/globals.css"
import { createRoot } from "react-dom/client"
import React, { useEffect, useState } from "react"

// 指定匹配的页面
export const config: PlasmoContentScript = {
  matches: ["https://superapp.tcmppapi.com/*"]
}

// 创建消息容器组件
function MessageContainer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // 设置antd的message配置
    message.config({
      top: 60,
      duration: 3,
      maxCount: 3
    })
    
    setInitialized(true)
    
    // 监听来自background的消息
    const messageListener = (msg, sender, sendResponse) => {
      if (msg.type === "DISPLAY_MESSAGE" && initialized) {
        const { content, type = "info" } = msg.data
        
        // 根据类型显示不同的消息
        switch(type) {
          case "success":
            message.success(content)
            break
          case "error":
            message.error(content)
            break
          case "warning":
            message.warning(content)
            break
          case "info":
          default:
            message.info(content)
            break
        }
        
        sendResponse({ success: true })
      }
      
      return true // 表示异步响应
    }
    
    chrome.runtime.onMessage.addListener(messageListener)
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [initialized])
  
  // 返回一个空的div，只用于初始化message
  return <div id="game-superapp-message-container" />
}

// 注入消息容器到页面
const root = document.createElement("div")
root.id = "game-superapp-message-root"
document.body.appendChild(root)
createRoot(root).render(<MessageContainer />) 