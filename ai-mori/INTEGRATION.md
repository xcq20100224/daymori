# AI Mori 接入文档（Daymori）

## 1. 环境变量配置

在 `ai-mori` 目录创建 `.env.local`:

```bash
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_API_KEY=YOUR_API_KEY
VITE_OPENAI_MODEL=gpt-4o-mini
```

## 2. 独立运行方式

```bash
cd ai-mori
npm install
npm run dev
```

默认本地地址由 Vite 输出（通常是 `http://localhost:5173`）。

## 3. 嵌入现有 Daymori 页面

`src/integration.ts` 暴露了 `mountMoriToContainer`:

```ts
import { mountMoriToContainer } from './integration';

const container = document.getElementById('mori-container');
if (container) {
  const unmount = mountMoriToContainer(container);
  // 在页面销毁时调用 unmount()
}
```

可将该容器放入 Daymori 侧边快捷设置栏。

## 4. 与现有系统对接点

- 习惯/打卡联动: 在 `useMoriChat.ts` 中根据 Daymori 打卡事件主动注入 system message。
- 番茄钟联动: 在专注结束时调用 `sendMessage('我完成了一个番茄钟')` 触发正向反馈。
- 目标同步: 在 `TargetBreakdownCard` 提交成功后，回调 Daymori 现有计划系统 API。

## 5. 数据管理与导出

- 数据默认本地加密存储（`localStorage + IndexedDB`）。
- 已内置导出、导入、一键清空；导出结构包含 `messages/goals/memory/preference`。

## 6. 权限说明

模块仅依赖网络请求权限与浏览器本地存储，不申请额外敏感权限。
