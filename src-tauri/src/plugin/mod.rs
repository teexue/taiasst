/**
 * 插件系统模块
 *
 * 该模块提供插件系统的核心功能：
 * - types: 插件系统类型和常量定义
 * - core: 插件核心类型和基础功能
 * - manager: 插件管理器实现
 * - api: 面向前端的API接口
 * - utils: 辅助功能函数
 */
pub mod api;
mod core;
mod manager;
mod types;
pub mod utils;

// 重新导出
pub use api::*;
pub use utils::*;
