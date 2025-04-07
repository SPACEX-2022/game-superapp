import { SHA256 } from "crypto-js"

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

// 检查是否已登录
export const checkIsLoggedIn = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY)
  return !!token
}

// 获取保存的服务器URL
export const getServerUrl = (): string => {
  return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL
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

// 登录方法
export const login = async (
  serverUrl: string,
  params: LoginParams
): Promise<LoginResponse> => {
  const url = `${serverUrl}/mgr_api/login`
  
  // 使用SHA256加密密码
  const encryptedPassword = SHA256(params.password).toString()
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      param: {
        username: params.username,
        password: encryptedPassword
      }
    })
  })
  
  if (!response.ok) {
    throw new Error(`登录失败: ${response.statusText}`)
  }
  
  return await response.json()
} 