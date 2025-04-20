/**
 * HTTP模块
 *
 * 该模块提供了HTTP请求相关的功能：
 * - client: HTTP客户端和基础请求方法
 * - handlers: 面向前端的API处理函数
 */
mod client;
mod handlers;

// 将所有公开API导出
pub use handlers::*;
