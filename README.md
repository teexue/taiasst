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
  - 主界面UI设计与实现

- **进行中**：
  - 工具模块加载系统
  - 设置与配置管理
  - 工具集成
- **近期计划**：
  - 完善插件系统
  - 实现更多常用工具
  - 优化用户体验
  - 发布首个测试版本 (v1.0.0-beta)

> 🚧 本项目正在积极开发中，欢迎开发者参与贡献!

## ✨ 特性

- **轻量级**：按需加载工具模块，减少系统资源占用
- **模块化**：独立工具模块设计，灵活组合使用
- **快速启动**：支持全局快捷键和托盘图标快速调用
- **简洁无广告**：专注于功能，无弹窗、无推广打扰
- **可扩展**：支持插件系统，可自定义添加工具
- **美观易用**：现代化UI设计，支持暗色/亮色主题切换

## 🧰 功能模块

## 📦 安装

### 下载安装包

访问 [GitHub Releases](https://github.com/teexue/taiasst/releases) 页面下载最新版本的安装包。

### 支持的平台

- Windows 10/11

## 🚀 快速开始

1. 安装并启动TaiASST
2. 通过主界面选择需要使用的工具

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

- 前端：React + JavaScript
- UI框架：Antd + remixicon
- 桌面框架：Tauri (Rust + JS)
- 数据存储：SQLite

## 📝 贡献指南

我们欢迎所有形式的贡献，无论是新功能、bug修复还是文档改进。

## 📄 许可证

本项目采用 [GPLv3 许可证](./LICENSE)。

## 🔗 相关链接

- [官方网站](https://github.com/teexue/taiasst)
- [问题反馈](https://github.com/teexue/taiasst/issues)
- [更新日志](./CHANGELOG.md)
