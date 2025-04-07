import { SHA256 } from "crypto-js"
import { post, handleApiResponse } from "./httpClient"
import type { ApiResponse } from "./httpClient"

// 默认服务器地址
export const DEFAULT_SERVER_URL = "https://minigame.jravity.com/game_operate"

// 存储token和服务器URL的键名
export const TOKEN_KEY = "game_superapp_token"
export const SERVER_URL_KEY = "game_superapp_server_url"

// 登录接口响应类型
export interface LoginResponse {
  code: string
  message: string
  requestId: string
  result: {
    token: string
  }
  version: string
}

// 登录参数类型
export interface LoginParams {
  username: string
  password: string
}

// token过期事件
export const TOKEN_EXPIRED_EVENT = "token_expired"

// 检查是否已登录
export const checkIsLoggedIn = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY)
  return !!token
}

// 获取保存的服务器URL
export const getServerUrl = (): string => {
  return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL
}

// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

// 保存服务器URL
export const saveServerUrl = (url: string): void => {
  localStorage.setItem(SERVER_URL_KEY, url)
}

// 保存token
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

// 清除token
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

// 处理token过期
export const handleTokenExpired = (): void => {
  clearToken()
  // 触发自定义事件，通知应用中的其他组件token已过期
  const event = new CustomEvent(TOKEN_EXPIRED_EVENT, { detail: "Token已过期，请重新登录" })
  window.dispatchEvent(event)
}

// 登录方法
export const login = async (
  serverUrl: string,
  params: LoginParams
): Promise<LoginResponse> => {
  // 保存服务器URL
  saveServerUrl(serverUrl)
  
  // 使用SHA256加密密码
  const encryptedPassword = SHA256(params.password).toString()
  
  // 构建请求体
  const requestBody = {
    param: {
      username: params.username,
      password: encryptedPassword
    }
  }
  
  try {
    // 使用自定义fetch方法，但不需要传递token
    const response = await fetch(`${serverUrl}/mgr_api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      throw new Error(`登录失败: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // 检查响应
    return handleApiResponse(data)
  } catch (error) {
    console.error("登录错误:", error)
    throw error
  }
} 