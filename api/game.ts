import { getServerUrl } from "./auth"

// 游戏信息接口
export interface GameInfo {
  appId: string         // 宿主应用下的应用标识
  appSecret: string     // 应用密钥
  clientVersion: string // 客户端版本
  cnName: string        // 游戏中文名称
  contentProvider: string // 游戏厂商
  displayWeight: number // 展示权重
  genre: number         // 游戏类型
  hostAppCode: string   // 宿主应用代码
  iconUrl: string       // icon的url
  localizedName: string // 游戏本地化名称
  tags: string[]        // 标签，JSON数组
}

// 根据不同的API响应格式，可能需要调整这个接口
export interface ApiResponse<T> {
  code: string
  message: string
  requestId: string
  result: T
  version: string
}

// 添加游戏到服务器
export const addGame = async (gameInfo: GameInfo, token: string): Promise<ApiResponse<any>> => {
  const serverUrl = getServerUrl()
  const url = `${serverUrl}/mgr_api/game_mgr/create_game`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        param: gameInfo
      })
    })

    if (!response.ok) {
      throw new Error(`添加游戏失败: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("添加游戏错误:", error)
    throw error
  }
}

// 从服务器获取游戏列表
export const getGameList = async (token: string): Promise<ApiResponse<GameInfo[]>> => {
  const serverUrl = getServerUrl()
  const url = `${serverUrl}/mgr_api/game/list`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`获取游戏列表失败: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("获取游戏列表错误:", error)
    throw error
  }
} 