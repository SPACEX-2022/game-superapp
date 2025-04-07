import React from "react"
import { Button, Typography, Space } from "antd"
import { clearToken } from "../api/auth"

const { Text } = Typography

interface LoggedInStatusProps {
  onLogout: () => void
}

const LoggedInStatus: React.FC<LoggedInStatusProps> = ({ onLogout }) => {
  const handleLogout = () => {
    clearToken()
    onLogout()
  }

  return (
    <div className="p-4">
      <Space direction="vertical" className="w-full">
        <div className="text-center">
          <Text strong className="text-lg">已成功登录</Text>
        </div>
        <Button type="primary" danger onClick={handleLogout} block>
          退出登录
        </Button>
      </Space>
    </div>
  )
}

export default LoggedInStatus 