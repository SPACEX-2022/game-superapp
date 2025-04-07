import { getServerUrl, getToken } from "./auth"
import type { ApiResponse } from "./httpClient"
import { handleApiResponse } from "./httpClient"

// 上传文件响应接口
export interface UploadResponse {
  accessUrl: string
}

/**
 * 上传公共访问文件
 * @param file 要上传的文件
 * @returns 包含文件访问URL的响应
 */
export const uploadPublicFile = async (file: File): Promise<ApiResponse<UploadResponse>> => {
  const serverUrl = getServerUrl()
  const url = `${serverUrl}/mgr_api/upload_public_access_file`
  
  // 获取token
  const token = getToken()
  if (!token) {
    throw new Error("未登录，无法上传文件")
  }
  
  // 创建FormData对象
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`上传文件失败: ${response.statusText}`)
    }
    
    const result = await response.json()
    return handleApiResponse(result)
  } catch (error) {
    console.error("上传文件错误:", error)
    throw error
  }
} 