# Claude History Viewer

一款用于浏览本地 Claude Code 对话历史的桌面应用。

## 功能特性

- **三栏可折叠布局**：项目列表 → 对话列表 → 消息详情，左右面板支持一键收起/展开
- **优雅的对话展示**：支持 Markdown 渲染、代码高亮、表格样式、图片点击放大预览
- **主题切换**：支持简约白/深邃黑/暖色调/Monokai 四种主题
- **会话恢复**：一键在终端中恢复历史会话，继续之前的对话
- **专用工具展示组件**：
  - **Agent**：子代理调度卡片，展示 subagent_type、description、可折叠 prompt
  - **AskUserQuestion**：交互式问题卡片，展示选项列表（A/B/C）及描述
  - **TodoWrite**：任务清单列表，状态图标 + 进度统计
  - **TaskCreate / TaskUpdate**：任务创建/更新卡片，状态徽章
  - **TaskOutput**：任务输出卡片，等待状态动画 + 超时时间
  - **Edit / Write**：文件修改 diff 对比展示
  - **Read**：文件读取路径清晰展示
  - **Bash**：命令与描述分开展示
  - **Thinking**：思维过程折叠展示
- **智能标题清理**：自动移除命令标签噪音
- **中文界面**：完整的本地化支持
- **删除确认**：数据安全保护
- **回到顶部**：长对话快速返回

## 截图预览

<p align="center">
  <img src="./preview/demo.gif" alt="完整使用" width="720" />
</p>
<p align="center">完整使用</p>

<p align="center">
  <img src="./preview/1.png" alt="三栏布局" width="720" />
</p>
<p align="center">三栏布局 - 项目列表 / 对话列表 / 消息详情</p>

<p align="center">
  <img src="./preview/3.png" alt="深色主题" width="720" />
</p>
<p align="center">深色主题</p>

<p align="center">
  <img src="./preview/2.png" alt="对话详情" width="720" />
</p>
<p align="center">对话详情 - Markdown 渲染与工具展示</p>

<p align="center">
  <img src="./preview/6.png" alt="命令展示" width="720" />
</p>
<p align="center">命令与工具调用展示</p>

<p align="center">
  <img src="./preview/4.png" alt="删除确认" width="720" />
</p>
<p align="center">删除确认弹窗</p>

<p align="center">
  <img src="./preview/5.png" alt="主题切换" width="720" />
</p>
<p align="center">四种主题切换</p>

## 快速开始

### 1. 安装依赖（推荐使用 cnpm）

```bash
# 全局安装 cnpm（如果没有安装过）
npm install -g cnpm --registry=https://registry.npmmirror.com

# 安装项目依赖
cnpm install

# 如果 Electron 下载慢，使用镜像
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
cnpm install
```

### 2. 开发模式运行

```bash
cnpm run dev
```

### 3. 构建应用

```bash
# 构建 macOS 应用
cnpm run electron:build
```

构建完成后，应用会生成在 `out` 目录下。

## 技术栈

- **前端框架**：Vue 3 + Vite
- **状态管理**：Pinia
- **桌面应用**：Electron
- **数据库**：SQLite (better-sqlite3)
- **Markdown**：marked + DOMPurify

## 项目结构

```
claude-history/
├── electron/           # Electron 主进程
│   ├── index.js          # 入口文件
│   ├── preload.js        # 预加载脚本
│   ├── ipc-handlers.js   # IPC 处理器
│   ├── message-parser.js # 对话解析器
│   ├── file-scanner.js   # 项目扫描器
│   └── store.js          # SQLite 数据库
├── src/               # Vue 渲染进程
│   ├── components/    # Vue 组件
│   │   ├── ChatBubble.vue           # 聊天气泡
│   │   ├── ConversationList.vue     # 对话列表
│   │   ├── MessageThread.vue        # 消息线程
│   │   ├── ProjectList.vue          # 项目列表
│   │   ├── ThemeSelector.vue        # 主题选择
│   │   ├── AgentToolBlock.vue       # Agent 子代理
│   │   ├── AskUserQuestionBlock.vue # 交互问题
│   │   ├── TodoWriteBlock.vue       # 任务清单
│   │   ├── TaskCreateBlock.vue      # 任务创建
│   │   ├── TaskUpdateBlock.vue      # 任务更新
│   │   ├── TaskOutputBlock.vue      # 任务输出
│   │   ├── WriteToolBlock.vue       # 文件写入
│   │   ├── EditToolBlock.vue        # 文件编辑
│   │   ├── ReadToolBlock.vue        # 文件读取
│   │   ├── ToolCall.vue             # 通用工具调用
│   │   ├── ToolResult.vue           # 工具结果
│   │   └── ThinkingBlock.vue        # 思维过程
│   ├── stores/        # Pinia 状态管理
│   └── utils/         # 工具函数
├── preview/           # 应用截图
└── build/             # 应用图标
```

## 数据来源

应用读取 `~/.claude/projects/` 目录下的对话记录文件（`.jsonl` 格式）。

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` (Windows) / `Cmd+K` (Mac) | 打开/关闭开发者工具 |

## 使用技巧

### 面板折叠
- 点击面板分隔线旁的箭头按钮可收起/展开项目列表和对话列表
- 收起后获得更大的对话详情查看空间

### 会话恢复
1. 在右侧消息详情中，点击「恢复会话」按钮
2. 应用会自动打开终端，切换到对应项目目录并执行 `claude --resume`
3. 也可以点击命令区域一键复制恢复命令

### 展开/折叠
- 使用标题栏的「展开全部」/「收起全部」按钮批量操作
- 各工具调用、思维过程、工具结果均支持独立展开/折叠

### 搜索对话
- 在中间对话列表顶部使用搜索框
- 支持按标题关键词过滤

### 调整面板宽度
- 拖拽面板之间的分隔线可调整各栏宽度

### 图片预览
- 点击对话中的图片可全屏放大预览
- 点击遮罩层或按 Escape 关闭预览

## 常见问题

### Electron 下载失败

```bash
# 设置 Electron 镜像
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
cnpm install
```

### macOS 上提示"无法打开"

首次运行需要在"系统偏好设置 → 安全性与隐私"中允许应用运行。

### 构建失败

确保已安装 Xcode Command Line Tools：
```bash
xcode-select --install
```

## License

MIT
