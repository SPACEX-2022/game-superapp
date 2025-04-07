import { useEffect, useState } from "react"
import { render } from "react-dom"
import "../styles/globals.css" 
import { ConfigProvider, Modal, Button, Typography, Space, Row, Col, Card, Descriptions, Tag, Spin } from "antd"
import zhCN from "antd/lib/locale/zh_CN"
import GameForm from "../components/GameForm"
import { addGame, getGameByAppId } from "../api/game"
import type { GameInfo, GameDetailInfo } from "../api/game"
import { checkIsLoggedIn, TOKEN_EXPIRED_EVENT, getServerUrl, clearToken } from "../api/auth"
import LoginForm from "../components/LoginForm"

const { Text, Title } = Typography

function GameFormPage() {
  const [initialData, setInitialData] = useState<any>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serverUrl, setServerUrl] = useState("")
  const [existingGame, setExistingGame] = useState<GameDetailInfo | null>(null)
  const [checkingGame, setCheckingGame] = useState(false)

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

  // 检查游戏是否已存在
  const checkGameExists = async (appId: string) => {
    
    try {
      setCheckingGame(true)
      const response = await getGameByAppId(appId)
      
      if (response.code === "0000" && response.result.list.length > 0) {
        setExistingGame(response.result.list[0])
        return true
      }
      return false
    } catch (error) {
      console.error("检查游戏失败:", error)
      return false
    } finally {
      setCheckingGame(false)
    }
  }

  // 当页面加载时，获取存储的表格行数据
  useEffect(() => {
    // 检查是否已登录
    const loggedIn = checkIsLoggedIn()
    setIsLoggedIn(loggedIn)
    
    // 获取服务器地址
    setServerUrl(getServerUrl())
    
    // 获取传递过来的游戏数据
    chrome.storage.local.get("gameFormData", async (result) => {
      if (result.gameFormData) {
        setInitialData(result.gameFormData)
        
        // console.log("result.gameFormData", loggedIn, result.gameFormData) 
        // // 如果已登录且有appId，检查游戏是否已存在
        // if (loggedIn && result.gameFormData.appId) {
        //   await checkGameExists(result.gameFormData.appId)
        // }
      }
      setLoading(false)
    })
  }, [])

  const handleCancel = () => {
    window.close()
  }

  const handleLoginSuccess = async () => {
    setIsLoggedIn(true)
    setServerUrl(getServerUrl())
    
    // 登录成功后，如果有appId则检查游戏是否已存在
    // if (initialData.appId) {
    //   await checkGameExists(initialData.appId)
    // }
  }

  const handleLogout = () => {
    clearToken()
    setIsLoggedIn(false)
    setExistingGame(null)
  }

  const handleSubmit = async (values: GameInfo) => {
    if (!isLoggedIn) {
      throw new Error("未登录，请先登录")
    }

    // // 再次检查游戏是否已存在
    // const exists = await checkGameExists(values.appId)
    // if (exists) {
    //   throw new Error(`游戏 ${values.appId} 已存在，不能重复添加`)
    // }

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

  // 渲染游戏详情
  const renderGameDetails = () => {
    if (!existingGame) return null
    
    const genreMap = {
      101: '动作',
      102: '冒险',
      103: '模拟',
      104: '角色扮演',
      105: '休闲',
      106: '其他'
    }
    
    const statusMap = {
      1: '下架',
      2: '上架'
    }
    
    return (
      <Card className="mb-4" title="已存在的游戏信息">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="appId">{existingGame.appId}</Descriptions.Item>
          <Descriptions.Item label="游戏ID">{existingGame.gameId}</Descriptions.Item>
          <Descriptions.Item label="中文名称">{existingGame.cnName}</Descriptions.Item>
          <Descriptions.Item label="本地化名称">{existingGame.localizedName}</Descriptions.Item>
          <Descriptions.Item label="游戏厂商">{existingGame.contentProvider}</Descriptions.Item>
          <Descriptions.Item label="客户端版本">{existingGame.clientVersion}</Descriptions.Item>
          <Descriptions.Item label="宿主应用代码">{existingGame.hostAppCode}</Descriptions.Item>
          <Descriptions.Item label="游戏类型">{genreMap[existingGame.genre as keyof typeof genreMap] || '未知'}</Descriptions.Item>
          <Descriptions.Item label="游戏状态">{statusMap[existingGame.gameStatus as keyof typeof statusMap] || '未知'}</Descriptions.Item>
          <Descriptions.Item label="展示权重">{existingGame.displayWeight}</Descriptions.Item>
          <Descriptions.Item label="首次上架时间">{existingGame.initialOnShelfTime || '未上架'}</Descriptions.Item>
          <Descriptions.Item label="玩家人数">{existingGame.playerQty}</Descriptions.Item>
          <Descriptions.Item label="累计发放金币">{existingGame.totalDeliveredScore}</Descriptions.Item>
          <Descriptions.Item label="累计消耗预算">{existingGame.totalConsumedBudget}</Descriptions.Item>
          <Descriptions.Item label="标签" span={2}>
            {existingGame.tags?.map(tag => <Tag key={tag}>{tag}</Tag>) || '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  if (loading || checkingGame) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="min-h-screen bg-gray-50 p-4">
        {isLoggedIn ? (
          <>
            <div className="mb-4 rounded bg-white p-4 shadow-sm">
              <Row justify="space-between" align="middle" className="w-full">
                <Col flex="1 1 auto">
                  <Text strong>当前服务器: </Text>
                  <Text>{serverUrl}</Text>
                </Col>
                <Col flex="0 0 auto">
                  <Button type="primary" danger onClick={handleLogout}>
                    退出登录
                  </Button>
                </Col>
              </Row>
            </div>
            
            {existingGame ? (
              <>
                {renderGameDetails()}
                <div className="text-center">
                  <Title level={4} className="text-red-500 mb-4">该游戏已存在，不能重复添加</Title>
                  <Button type="primary" onClick={handleCancel}>关闭</Button>
                </div>
              </>
            ) : (
              <GameForm
                initialData={initialData}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            )}
          </>
        ) : (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ConfigProvider>
  )
}

render(<GameFormPage />, document.getElementById("root")) 