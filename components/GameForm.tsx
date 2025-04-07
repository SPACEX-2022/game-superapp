import React, { useState, useEffect } from "react"
import { Form, Input, Button, Select, InputNumber, message, Spin, Upload } from "antd"
import { getHostAppList } from "../api/game"
import { TOKEN_EXPIRED_EVENT } from "../api/auth"
import { uploadPublicFile } from "../api/upload"
import type { HostAppInfo } from "../api/game"
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface"

interface GameFormProps {
  initialData?: any
  onCancel: () => void
  onSubmit: (values: any) => Promise<void>
}

// 游戏类型选项
const GAME_GENRES = [
  { value: 101, label: "动作" },
  { value: 102, label: "冒险" },
  { value: 103, label: "模拟" },
  { value: 104, label: "角色扮演" },
  { value: 105, label: "休闲" },
  { value: 106, label: "其他" }
]

const GameForm: React.FC<GameFormProps> = ({ 
  initialData = {}, 
  onCancel, 
  onSubmit 
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>(initialData.tags || [])
  const [hostAppList, setHostAppList] = useState<HostAppInfo[]>([])
  const [fetchingApps, setFetchingApps] = useState(false)
  
  // 图标上传相关状态
  const [imageUrl, setImageUrl] = useState<string>(initialData.iconUrl || '')
  const [uploading, setUploading] = useState(false)

  // 监听token过期事件
  useEffect(() => {
    const handleTokenExpired = (event) => {
      // 返回到登录界面的逻辑，可能需要调用onCancel或由父组件处理
      onCancel()
    }

    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)

    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired)
    }
  }, [onCancel])

  // 如果initialData中的iconUrl发生变化，更新imageUrl
  useEffect(() => {
    if (initialData.iconUrl) {
      // 自动下载图片并上传
      fetch(initialData.iconUrl)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'icon.jpg', { type: 'image/jpeg' })
          uploadPublicFile(file).then((response) => {
            if (response.code === "0000") {
              message.success('图标上传成功')
              setImageUrl(response.result.accessUrl)
              form.setFieldsValue({ iconUrl: response.result.accessUrl })
            } else {
              throw new Error(response.message || '上传失败')
            }
          })
        })
        .catch(error => {
          console.error('图片下载失败:', error)
        })
    }
  }, [initialData.iconUrl, form])

  // 加载宿主应用列表
  useEffect(() => {
    const fetchHostApps = async () => {
      try {
        setFetchingApps(true)
        const response = await getHostAppList()
        if (response.code === "0000") {
          setHostAppList(response.result || [])
        } else {
          message.warning(`获取宿主应用列表失败: ${response.message}`)
        }
      } catch (error) {
        message.error(`获取宿主应用列表错误: ${error.message}`)
      } finally {
        setFetchingApps(false)
      }
    }

    fetchHostApps()
  }, [])

  // 上传前检查文件
  const beforeUpload = (file: RcFile) => {
    // 检查文件类型
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件!')
      return false
    }
    
    // 检查文件大小 (小于2MB)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片必须小于2MB!')
      return false
    }
    
    return true
  }

  // 处理自定义上传
  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options
    
    try {
      setUploading(true)
      
      // 显示上传进度
      onProgress({ percent: 50 })
      
      // 调用上传API
      const response = await uploadPublicFile(file)
      
      // 判断上传是否成功
      if (response.code === "0000") {
        const accessUrl = response.result.accessUrl
        setImageUrl(accessUrl)
        
        // 更新表单中的iconUrl字段
        form.setFieldsValue({ iconUrl: accessUrl })
        
        // 上传成功回调
        onSuccess(response, file)
        message.success('图标上传成功')

        return accessUrl
      } else {
        throw new Error(response.message || '上传失败')
      }
    } catch (error) {
      onError(error)
      message.error(`图标上传错误: ${error.message}`)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      await onSubmit(values)
      message.success("游戏添加成功")
    } catch (error) {
      message.error(`添加失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">添加游戏</h2>
      <Form
        form={form}
        layout="vertical"
        initialValues={{...initialData, tags: tags}}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="应用标识(appId)"
          name="appId"
          rules={[{ required: true, message: "请输入应用标识" }]}
        >
          <Input placeholder="请输入应用标识" />
        </Form.Item>

        <Form.Item
          label="应用密钥(appSecret)"
          name="appSecret"
          rules={[{ required: true, message: "请输入应用密钥" }]}
        >
          <Input placeholder="请输入应用密钥" />
        </Form.Item>

        <Form.Item
          label="客户端版本(clientVersion)"
          name="clientVersion"
          rules={[{ required: true, message: "请输入客户端版本" }]}
        >
          <Input placeholder="请输入客户端版本" />
        </Form.Item>

        <Form.Item
          label="游戏中文名称(cnName)"
          name="cnName"
          rules={[{ required: true, message: "请输入游戏中文名称" }]}
        >
          <Input placeholder="请输入游戏中文名称" />
        </Form.Item>

        <Form.Item
          label="游戏厂商(contentProvider)"
          name="contentProvider"
          rules={[{ required: true, message: "请输入游戏厂商" }]}
        >
          <Input placeholder="请输入游戏厂商" />
        </Form.Item>

        <Form.Item
          label="展示权重(displayWeight)"
          name="displayWeight"
          rules={[{ required: true, message: "请输入展示权重" }]}
        >
          <InputNumber min={0} className="w-full" placeholder="请输入展示权重" />
        </Form.Item>

        <Form.Item
          label="游戏类型(genre)"
          name="genre"
          rules={[{ required: true, message: "请选择游戏类型" }]}
        >
          <Select options={GAME_GENRES} placeholder="请选择游戏类型" />
        </Form.Item>

        <Form.Item
          label="宿主应用代码(hostAppCode)"
          name="hostAppCode"
          rules={[{ required: true, message: "请选择宿主应用代码" }]}
        >
          <Select
            placeholder="请选择宿主应用"
            loading={fetchingApps}
            notFoundContent={fetchingApps ? <Spin size="small" /> : null}
            options={hostAppList.map(app => ({
              value: app.hostAppCode,
              label: `${app.name} (${app.hostAppCode})`
            }))}
          />
        </Form.Item>

        <Form.Item
          label="游戏图标"
          name="iconUrl"
          rules={[{ required: true, message: "请上传游戏图标" }]}
          extra="支持 JPG、PNG 格式，大小不超过2MB"
        >
          <div className="flex flex-col">
            <div className="mb-2">
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={false}
                customRequest={handleUpload}
                beforeUpload={beforeUpload}
              >
                {imageUrl ? (
                  <div style={{ width: '102px', height: '102px', overflow: 'hidden' }}>
                    <img 
                      src={imageUrl} 
                      alt="游戏图标" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ) : (
                  <div>
                    {uploading ? '上传中...' : '+ 上传图片'}
                  </div>
                )}
              </Upload>
            </div>
            <Input 
              style={{ marginTop: '10px' }}
              disabled={true}
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="图标URL，可直接输入或通过上传获取"
            />
          </div>
        </Form.Item>

        <Form.Item
          label="游戏本地化名称(localizedName)"
          name="localizedName"
          rules={[{ required: true, message: "请输入游戏本地化名称" }]}
        >
          <Input placeholder="请输入游戏本地化名称" />
        </Form.Item>

        <Form.Item 
          label="标签(tags)" 
          name="tags"
          initialValue={tags}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="请输入标签，回车确认"
            onChange={(value) => setTags(value)}
            tokenSeparators={[',']}
          />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default GameForm 