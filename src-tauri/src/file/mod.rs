/**
 * 文件操作模块
 *
 * 该模块提供文件和目录操作的功能：
 * - types: 文件操作相关类型和常量定义
 * - paths: 路径获取和管理
 * - operations: 文件基本操作实现
 * - config: 配置文件管理
 */
mod config;
mod operations;
pub mod paths;
mod types;

// 导出公开API
pub use config::*;
pub use operations::*;
