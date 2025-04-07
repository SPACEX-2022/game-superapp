import { getServerUrl, getToken, handleTokenExpired } from "./auth"
import { message } from "antd"

export interface ApiResponse<T> {
  code: string
  message: string
  requestId: string
  result: T
  version: string
}

// Token过期错误码
export const TOKEN_EXPIRED_CODE = "SYS_1202"

/**
 * 处理API响应
 * @param response API响应对象
 * @returns 处理后的响应结果
 */
export const handleApiResponse = <T>(response: ApiResponse<T>): ApiResponse<T> => {
  // 检查是否token过期
  if (response.code === TOKEN_EXPIRED_CODE) {
    message.error("登录已过期，请重新登录")
    handleTokenExpired()
  }
  
  return response
}

/**
 * 发送GET请求
 * @param endpoint API端点
 * @param requireAuth 是否需要认证
 * @returns 响应结果
 */
export const get = async <T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> => {
  const serverUrl = getServerUrl()
  const url = `${serverUrl}${endpoint}`
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }
  
  if (requireAuth) {
    const token = getToken()
    if (!token) {
      throw new Error("未登录，无法访问API")
    }
    headers["x-mgr-token"] = `${token}`
  }
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers
    })
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.statusText}`)
    }
    
    const data = await response.json()
    return handleApiResponse(data)
  } catch (error) {
    console.error(`GET ${endpoint} 错误:`, error)
    throw error
  }
}

/**
 * 发送POST请求
 * @param endpoint API端点
 * @param body 请求体
 * @param requireAuth 是否需要认证
 * @returns 响应结果
 */
export const post = async <T>(
  endpoint: string, 
  body: any,
  requireAuth = true
): Promise<ApiResponse<T>> => {
  const serverUrl = getServerUrl()
  const url = `${serverUrl}${endpoint}`
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }
  
  if (requireAuth) {
    const token = getToken()
    if (!token) {
      throw new Error("未登录，无法访问API")
    }
    headers["x-mgr-token"] = `${token}`
  }
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.statusText}`)
    }
    
    const data = await response.json()
    return handleApiResponse(data)
  } catch (error) {
    console.error(`POST ${endpoint} 错误:`, error)
    throw error
  }
} 