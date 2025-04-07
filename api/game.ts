import { getServerUrl } from "./auth"
import { get, post } from "./httpClient"
import type { ApiResponse } from "./httpClient"

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

// 游戏详情接口
export interface GameDetailInfo extends Omit<GameInfo, 'appSecret'> {
  gameId: string        // 游戏ID
  gameStatus: number    // 游戏状态：1-下架，2-上架
  initialOnShelfTime: string // 首次上架时间
  playerQty: number     // 玩家人数
  totalConsumedBudget: number // 累计消耗预算
  totalDeliveredScore: number // 累计发放金币
}

// 游戏列表响应接口
export interface GameListResponse {
  currentPage: number
  list: GameDetailInfo[]
  pageCount: number
  totalCount: number
}

// 宿主应用信息接口
export interface HostAppInfo {
  createBy: string      // 创建人
  createTime: string    // 创建时间
  hostAppCode: string   // 宿主应用代码
  iconUrl: string       // 应用图标url
  name: string          // 应用名
  updateBy: string      // 修改人
  updateTime: string    // 更新时间
}

// 添加游戏到服务器
export const addGame = async (gameInfo: GameInfo): Promise<ApiResponse<any>> => {
  return await post(
    "/mgr_api/game_mgr/create_game",
    { param: gameInfo }
  )
}

// 获取宿主应用列表
export const getHostAppList = async (): Promise<ApiResponse<HostAppInfo[]>> => {
  return await post("/mgr_api/host_app_mgr/list_all_app", {})
}

// 从服务器获取游戏列表
export const getGameList = async (): Promise<ApiResponse<GameInfo[]>> => {
  return await get("/mgr_api/game/list")
}

// 根据appId查询游戏信息
export const getGameByAppId = async (appId: string): Promise<ApiResponse<GameListResponse>> => {
  return await post(
    "/mgr_api/game_mgr/list_game_with_stats",
    { param: { appId, pageNum: 1, pageSize: 1 } }
  )
} 