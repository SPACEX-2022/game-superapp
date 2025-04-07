import React, { useState } from "react"
import { Form, Input, Button, message } from "antd"
import {
  login,
  saveToken,
  saveServerUrl,
  DEFAULT_SERVER_URL,
  LoginParams
} from "../api/auth"

interface LoginFormProps {
  onLoginSuccess: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL)

  const handleLogin = async (values: LoginParams) => {
    try {
      setLoading(true)
      // 保存服务器URL
      saveServerUrl(serverUrl)
      
      // 调用登录API
      const response = await login(serverUrl, values)
      
      if (response.code === "0000") {
        // 保存token
        saveToken(response.result.token)
        message.success("登录成功")
        onLoginSuccess()
      } else {
        message.error(`登录失败: ${response.message}`)
      }
    } catch (error) {
      message.error(`登录失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">登录</h2>
      <Form
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        initialValues={{ serverUrl: DEFAULT_SERVER_URL }}>
        <Form.Item
          label="服务器地址"
          name="serverUrl"
          initialValue={serverUrl}
          rules={[{ required: true, message: "请输入服务器地址" }]}>
          <Input 
            onChange={(e) => setServerUrl(e.target.value)} 
            placeholder="请输入服务器地址" 
          />
        </Form.Item>

        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm 