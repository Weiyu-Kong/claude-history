export default {
  title: 'Claude History Viewer',
  description: 'Claude Code 对话历史的终极管理工具，支持 Markdown、代码高亮、主题切换和会话恢复',
  srcDir: '.',
  dest: '.vitepress/dist',
  themeConfig: {
    navbar: [
      { text: 'GitHub', link: 'https://github.com/your-username/claude-history-viewer' }
    ],
    sidebar: false  // 单页站点，禁用侧边栏
  }
}