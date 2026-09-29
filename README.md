# 外资律所并购与资本市场入门学习手册 · 章节精读与笔记工作台

> 本项目已完整拆分为 14 个独立章节 Markdown 文件，并构建了一套**即插即用、零编译依赖、支持 GitHub Pages 一键部署**的现代化沉浸式阅读与随堂笔记系统。

---

## 🌟 核心特色功能

1. **分章节沉浸精读**：
   - 完整拆分为 14 个模块（从交易结构、新公司法出资、外资准入，到跨境借款担保、A股质押、SPA起草与顶级外所技术面试真题）。
   - 内置阅读进度追踪，支持章节勾选“标记完成”，学习进度百分比持久化保存。

2. **随堂交互笔记系统**：
   - **分课独立存储**：每一课拥有独立的随堂笔记面板，采用浏览器 `localStorage` 实时自动静默保存，无需担心数据丢失。
   - **一键划词摘录**：阅读手册正文时，鼠标选中任意文本，点击浮动的「📌 摘录到本课笔记」即可一键带引用引用到右侧笔记中。
   - **快捷速记模板**：一键插入 `+ 考点速记`、`+ 待查法规`、`+ 英文句式`、`+ 面试答题卡`。
   - **一键导出全套笔记**：点击侧边栏或笔记栏底部的「📥 导出笔记」，可将全部 14 课的随堂笔记汇总打包导出一份独立的 Markdown 文件（可以直接导入 Obsidian、Notion 或 Typora）。
   - **数据备份与恢复**：支持全量笔记数据的 JSON 格式导出与导入。

3. **视觉与交互体验**：
   - **三大阅读主题**：📜 经典羊皮纸（护眼米黄，法学阅读首选）、☀️ 现代纯白、🌙 深邃极简暗夜。
   - **字号自适应**：支持小号、标准、大号、超大号自由切换。
   - **Mermaid 图表实时渲染**：课文中的交易结构图、思维导图、审批决策流程图原生清晰渲染。
   - **全局快捷搜索（⌘K / Ctrl+K）**：毫秒级全文检索 14 门课程核心考点、法条与题眼，高亮匹配并快速跳转。
   - **全平台响应式**：完美兼容 PC 大屏双栏对比、iPad 平板与手机端阅读。

---

## 📂 目录结构说明

```text
ma-handbook-pages/
├── index.html                    # 核心单页阅读与笔记应用（纯静态，零配置运行）
├── .nojekyll                     # 禁用 GitHub Pages Jekyll 处理（保证静态资源正确加载）
├── README.md                     # 本项目部署与使用指南
├── assets/
│   ├── app.js                    # 阅读器核心交互、笔记保存、导出与全文检索逻辑
│   ├── chapters.js               # 14 门课程结构化数据包（支持本地离线直接双击秒开）
│   └── style.css                 # 经典法学排版样式、多主题配色与打印格式
├── docs/                         # 分章节纯 Markdown 原文（方便 Git 维护或本地 Markdown 阅读器导入）
│   ├── 00-course-overview.md     # 导言、使用指南与全课程路线图
│   ├── 01-lesson1.md             # 第一课：先看懂交易，再选择结构
│   ├── 02-lesson2.md             # 第二课：认缴资本与股东责任如何改变并购估值
│   ├── 03-lesson3.md             # 第三课：外商投资准入与并购监管怎么排查
│   ├── 04-lesson4.md             # 第四课：跨境借款、外债和担保怎样连起来
│   ├── 05-lesson5.md             # 第五课：A 股股票质押怎样设立、执行和回款
│   ├── 06-lesson6.md             # 第六课：SPA 从签约到交割怎样工作
│   ├── 07-lesson7.md             # 第七课：R&W、Specific Indemnity、Escrow、MAE 等起草
│   ├── 08-lesson8.md             # 第八课：ECM 与 DCM 入门（股票和债券交易）
│   ├── 09-lesson9.md             # 第九课：英文笔试两小时高分策略
│   ├── 10-lesson10.md            # 第十课：五道顶级外所技术面试情境题
│   ├── 11-lesson11.md            # 第十一课：非诉术语与法规记忆卡
│   ├── 12-lesson12.md            # 第十二课：14 天每日一题实战训练营
│   └── 13-lesson13.md            # 第十三课：中英文法规核心表达卡与结语
└── .github/
    └── workflows/
        └── deploy.yml            # 预置的 GitHub Actions 自动部署工作流
```

---

## 🚀 部署到 GitHub Pages（3 步快速上线）

你可以非常轻松地将本项目发布到属于你自己的 `https://<你的用户名>.github.io/<仓库名>`：

### 第一步：在 GitHub 上新建仓库
1. 登录 GitHub，点击右上角 **「+」→「New repository」**。
2. 填写仓库名，例如 `ma-handbook`（如果是个人主页可命名为 `<你的用户名>.github.io`）。
3. 权限选择 **Public**，不要勾选添加 README，点击 **「Create repository」**。

### 第二步：将本地文件推送到该仓库
在电脑终端打开本目录执行以下命令（将 `YOUR-USERNAME` 替换为你的 GitHub 用户名）：

```bash
cd "/Users/kansang/Downloads/claude 使用专用/ma-handbook-pages"

# 初始化 Git 仓库并提交
git init
git add .
git commit -m "feat: initial commit of M&A handbook github pages site"

# 设置主分支并关联远程仓库
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ma-handbook.git

# 推送代码
git push -u origin main
```

### 第三步：开启 GitHub Pages
1. 打开该 GitHub 仓库页面，点击顶部的 **「Settings」**（设置）。
2. 在左侧菜单点击 **「Pages」**。
3. 在 **「Build and deployment」** 下：
   - **Source** 选择：`Deploy from a branch`。
   - **Branch** 选择：`main`，目录选择 `/ (root)`。
   - 点击 **「Save」** 保存。
4. 等待 1~2 分钟，页面上方会显示绿色提示：
   > *Your site is live at https://YOUR-USERNAME.github.io/ma-handbook/*

点击该网址即可直接在浏览器或手机、平板上打开精读并记笔记！

---

## 💻 本地无网/离线查看方法

- **方法 1（最直接）**：在本地文件管理器中直接双击 `index.html`，用任意浏览器（Chrome / Safari / Edge）打开即可，所有章节数据与随堂笔记均已做离线支持。
- **方法 2（本地服务）**：
  ```bash
  cd "/Users/kansang/Downloads/claude 使用专用/ma-handbook-pages"
  python3 -m http.server 8000
  ```
  在浏览器访问 `http://localhost:8000` 即可。

---

## 📝 笔记同步小建议

- 随堂笔记保存在当前浏览器的本地缓存中。
- 建议每次学完一个阶段，点击笔记抽屉底部的 **「备份 JSON」** 或 **「📥 导出笔记」**，将笔记文件随代码一同 commit 进 Git 仓库，实现云端长效沉淀！
