use std::collections::HashMap;
use tauri_plugin_http::reqwest;

/**
 * 获取HTTP客户端实例
 *
 * @return reqwest::Client HTTP客户端实例
 */
pub fn get_http_client() -> reqwest::Client {
    reqwest::Client::new()
}

/**
 * 处理HTTP响应的通用函数
 *
 * @param response HTTP响应结果
 * @return Result<String, String> 响应文本内容或错误信息
 */
pub async fn handle_response(
    response: Result<reqwest::Response, reqwest::Error>,
) -> Result<String, String> {
    match response {
        Ok(resp) => match resp.text().await {
            Ok(body) => Ok(body),
            Err(e) => Err(format!("读取响应内容失败: {}", e)),
        },
        Err(e) => Err(format!("请求失败: {}", e)),
    }
}

/**
 * 为请求添加请求头和URL参数
 *
 * @param request_builder 请求构建器
 * @param headers 可选的请求头
 * @param params 可选的URL参数
 * @return 配置后的请求构建器
 */
pub fn apply_headers_and_params(
    mut request_builder: reqwest::RequestBuilder,
    headers: Option<HashMap<String, String>>,
    params: Option<HashMap<String, String>>,
) -> reqwest::RequestBuilder {
    // 添加请求头
    if let Some(headers_map) = headers {
        for (key, value) in headers_map {
            request_builder = request_builder.header(key, value);
        }
    }

    // 添加URL参数
    if let Some(params_map) = params {
        request_builder = request_builder.query(&params_map);
    }

    request_builder
}
