# TaiASST 工具助手

<p align="center">
  <img src="./public/logo.png" width="120" alt="TaiASST Logo">
</p>

<p align="center">
  <a href="https://github.com/teexue/taiasst/releases">
    <img src="https://img.shields.io/github/v/release/teexue/taiasst" alt="Release">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/teexue/taiasst" alt="License">
  </a>
</p>

<p align="center">一站式轻量级桌面工具集合，提升您的工作效率</p>

## 📖 简介

TaiASST（TAI Assistant）是一个轻量级、模块化的桌面应用工具箱。它旨在为用户提供高效便捷的工具集合，帮助用户提高工作效率，简化日常操作。

## 🛠️ 当前进度

- **开发阶段**：项目处于早期开发阶段
- **已完成**：

  - 项目基础框架搭建（Tauri + React）
  - 主界面 UI 设计与实现
  - 9种基础主题（浅色和深色模式）及主题切换功能
  - 插件系统基础架构及加载器
  - 插件加载错误处理（Error Boundary）
  - 工具分类框架和基础目录结构

- **进行中**：

  - 统一组件设计风格
  - 优化主题切换时的过渡动画效果
  - 优化插件异步加载性能
  - 实现插件热重载功能
  - 开发插件权限管理系统

- **近期计划（v0.3.0）**：
  - 对接OpenAI API服务
  - 添加API密钥管理功能
  - 设计并实现聊天记录数据库结构
  - 实现模型切换功能
  - 开发插件间通信机制
  - 实现工具分类导航界面
  - 实现密码管理器等核心工具

> 🚧 本项目正在积极开发中，欢迎开发者参与贡献!

## ✨ 特性

- **轻量级**：按需加载工具模块，减少系统资源占用
- **模块化**：独立工具模块设计，灵活组合使用
- **快速启动**：支持全局快捷键和托盘图标快速调用
- **AI驱动**：集成AI助手，提供智能化工作流程
- **插件系统**：支持丰富的插件扩展，可自定义工具功能
- **多主题**：提供9种精美主题，支持亮色/深色模式切换
- **毛玻璃效果**：现代UI设计，支持各种视觉效果
- **简洁无广告**：专注于功能，无弹窗、无推广打扰

## 🧰 功能模块

TaiASST包含以下主要功能模块：

1. **AI助手**：智能对话、多模态交互、内容创作辅助
2. **工具集合**：按类别组织的实用工具库
   - 待开发的核心工具：密码管理器、Markdown协作编辑器、AI去水印工具等
3. **插件系统**：可扩展的插件生态，支持用户自定义开发
4. **用户界面**：美观易用的界面系统，支持主题切换和毛玻璃效果

## 📦 安装

### 下载安装包

访问 [GitHub Releases](https://github.com/teexue/taiasst/releases) 页面下载最新版本的安装包。

### 支持的平台

- Windows 10/11
- macOS（计划支持）
- Linux（计划支持）

## 🚀 快速开始

1. 安装并启动 TaiASST
2. 通过主界面选择需要使用的工具
3. 使用侧边栏导航不同功能模块
4. 根据需要调整主题和设置

## 🔧 开发指南

### 环境要求

- Node.js 18+
- Rust 1.70+
- pnpm

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/teexue/taiasst.git
cd taiasst

# 安装依赖
pnpm install

# 启动开发服务器
pnpm tauri dev

# 构建应用
pnpm tauri build
```

### 技术栈

- 前端：React + TypeScript
- UI 框架：HeroUI + Remixicon
- 桌面框架：Tauri (Rust + JS)
- 数据存储：SQLite

## 📝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、bug 修复还是文档改进。

## 📄 许可证

本项目采用 [GPLv3 许可证](./LICENSE)。

## 🔗 相关链接

- [官方网站](https://github.com/teexue/taiasst)
- [问题反馈](https://github.com/teexue/taiasst/issues)
- [更新日志](./CHANGELOG.md)
