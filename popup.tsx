import { useEffect, useState } from "react"
import { ConfigProvider } from "antd"
import zhCN from "antd/lib/locale/zh_CN"
// import "antd/dist/antd.css"
import "./styles/globals.css"
import LoginForm from "./components/LoginForm"
import LoggedInStatus from "./components/LoggedInStatus"
import { checkIsLoggedIn } from "./api/auth"

function IndexPopup() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    // 检查是否已登录
    setIsLoggedIn(checkIsLoggedIn())
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ width: 320, padding: 16 }}>
        <h2 className="text-xl font-bold mb-4 text-center">游戏超级应用</h2>
        
        {isLoggedIn ? (
          <LoggedInStatus onLogout={handleLogout} />
        ) : (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ConfigProvider>
  )
}

export default IndexPopup
