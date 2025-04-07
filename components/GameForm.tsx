import React, { useState } from "react"
import { Form, Input, Button, Select, InputNumber, message } from "antd"

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
          rules={[{ required: true, message: "请输入宿主应用代码" }]}
        >
          <Input placeholder="请输入宿主应用代码" />
        </Form.Item>

        <Form.Item
          label="图标URL(iconUrl)"
          name="iconUrl"
          rules={[{ required: true, message: "请输入图标URL" }]}
        >
          <Input placeholder="请输入图标URL" />
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