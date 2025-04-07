import { useEffect, useState } from "react"
import { render } from "react-dom"
import "../styles/globals.css" 
import { ConfigProvider, Modal } from "antd"
import zhCN from "antd/lib/locale/zh_CN"
import GameForm from "../components/GameForm"
import { addGame } from "../api/game"
import type { GameInfo } from "../api/game"
import { checkIsLoggedIn, TOKEN_EXPIRED_EVENT } from "../api/auth"
import LoginForm from "../components/LoginForm"

function GameFormPage() {
  const [initialData, setInitialData] = useState<any>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // 监听token过期事件
  useEffect(() => {
    const handleTokenExpired = () => {
      setIsLoggedIn(false)
    }

    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)

    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)
    }
  }, [])

  // 当页面加载时，获取存储的表格行数据
  useEffect(() => {
    // 检查是否已登录
    setIsLoggedIn(checkIsLoggedIn())
    
    // 获取传递过来的游戏数据
    chrome.storage.local.get("gameFormData", (result) => {
      if (result.gameFormData) {
        setInitialData(result.gameFormData)
      }
      setLoading(false)
    })
  }, [])

  const handleCancel = () => {
    window.close()
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleSubmit = async (values: GameInfo) => {
    if (!isLoggedIn) {
      throw new Error("未登录，请先登录")
    }

    // 调用API添加游戏
    const response = await addGame(values)
    
    if (response.code === "0000") {
      // 添加成功后显示提示窗口
      Modal.success({
        title: '添加成功',
        content: '游戏已成功添加到游戏库',
        onOk: () => {
          window.close()
        }
      })
    } else {
      throw new Error(response.message || "添加游戏失败")
    }
  }

  if (loading) {
    return <div className="p-4">加载中...</div>
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="min-h-screen bg-gray-50 p-4">
        {isLoggedIn ? (
          <GameForm
            initialData={initialData}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        ) : (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ConfigProvider>
  )
}

render(<GameFormPage />, document.getElementById("root")) 