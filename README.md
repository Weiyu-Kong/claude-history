# Claude History Viewer

一款用于浏览本地 Claude Code 对话历史的桌面应用。

## 功能特性

- **三栏布局**：项目列表 → 对话列表 → 消息详情
- **优雅的对话展示**：支持 Markdown 渲染、代码高亮、工具调用展示
- **主题切换**：支持简约白/深邃黑/暖色调/Monokai 四种主题
- **会话恢复**：一键在终端中恢复历史会话，继续之前的对话
- **特殊工具优化**：
  - TaskCreate：任务创建卡片式展示
  - Edit/Write：文件修改对比展示
  - Read：文件读取路径清晰展示
  - Bash：命令与描述分开展示
  - Thinking：思维过程折叠展示
- **智能标题清理**：自动移除命令标签噪音
- **中文界面**：完整的本地化支持
- **删除确认**：数据安全保护

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
│   │   ├── ChatBubble.vue       # 聊天气泡
│   │   ├── ConversationList.vue  # 对话列表
│   │   ├── MessageThread.vue    # 消息线程
│   │   ├── ProjectList.vue      # 项目列表
│   │   ├── ThemeSelector.vue    # 主题选择
│   │   └── *ToolBlock.vue       # 各类工具展示组件
│   ├── stores/        # Pinia 状态管理
│   └── utils/         # 工具函数
└── build/             # 应用图标
```

## 数据来源

应用读取 `~/.claude/projects/` 目录下的对话记录文件（`.jsonl` 格式）。

## 截图预览

### 主界面 - 三栏布局
![主界面](./preview/image01.png)

### 会话恢复功能
![会话恢复](./preview/image02.png)

### 更多对话示例
![对话示例](./preview/image03.png)

### 命令展示 - CommandBlock 优化
![命令展示](./preview/image04.png)

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` (Windows) / `Cmd+K` (Mac) | 打开/关闭开发者工具 |

## 使用技巧

### 会话恢复
1. 在右侧消息详情中，点击「恢复会话」按钮
2. 应用会自动打开终端，切换到对应项目目录并执行 `claude --resume`
3. 也可以点击命令区域一键复制恢复命令

### 展开/折叠
- 点击消息气泡可单独展开/折叠
- 使用标题栏的「展开全部」/「收起全部」按钮批量操作

### 搜索对话
- 在中间对话列表顶部使用搜索框
- 支持按标题关键词过滤

### 调整面板宽度
- 拖拽面板之间的分隔线可调整各栏宽度

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
