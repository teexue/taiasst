use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;

use super::client::{apply_headers_and_params, get_http_client, handle_response};

/**
 * GET请求处理函数
 *
 * @param url 请求URL
 * @param headers 可选的请求头
 * @param params 可选的URL参数
 * @return 响应内容或错误信息
 */
#[tauri::command]
pub async fn http_get(
    url: String,
    headers: Option<HashMap<String, String>>,
    params: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = get_http_client();
    let request = apply_headers_and_params(client.get(&url), headers, params);
    handle_response(request.send().await).await
}

/**
 * POST请求处理函数
 *
 * @param url 请求URL
 * @param body 请求体
 * @param headers 可选的请求头
 * @param params 可选的URL参数
 * @return 响应内容或错误信息
 */
#[tauri::command]
pub async fn http_post(
    url: String,
    body: String,
    headers: Option<HashMap<String, String>>,
    params: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = get_http_client();
    let request = apply_headers_and_params(client.post(&url).body(body), headers, params);
    handle_response(request.send().await).await
}

/**
 * PUT请求处理函数
 *
 * @param url 请求URL
 * @param body 请求体
 * @param headers 可选的请求头
 * @param params 可选的URL参数
 * @return 响应内容或错误信息
 */
#[tauri::command]
pub async fn http_put(
    url: String,
    body: String,
    headers: Option<HashMap<String, String>>,
    params: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = get_http_client();
    let request = apply_headers_and_params(client.put(&url).body(body), headers, params);
    handle_response(request.send().await).await
}

/**
 * DELETE请求处理函数
 *
 * @param url 请求URL
 * @param headers 可选的请求头
 * @param params 可选的URL参数
 * @return 响应内容或错误信息
 */
#[tauri::command]
pub async fn http_delete(
    url: String,
    headers: Option<HashMap<String, String>>,
    params: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = get_http_client();
    let request = apply_headers_and_params(client.delete(&url), headers, params);
    handle_response(request.send().await).await
}

/**
 * 文件下载处理函数
 *
 * @param url 下载文件的URL
 * @param save_path 保存文件的路径
 * @param headers 可选的请求头
 * @return 下载结果或错误信息
 */
#[tauri::command]
pub async fn http_download_file(
    url: String,
    save_path: String,
    headers: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = get_http_client();
    let request = apply_headers_and_params(client.get(&url), headers, None);

    // 发送请求
    let response = match request.send().await {
        Ok(resp) => resp,
        Err(e) => return Err(format!("请求失败: {}", e)),
    };

    // 检查响应状态
    if !response.status().is_success() {
        return Err(format!("下载失败，HTTP状态码: {}", response.status()));
    }

    // 创建文件
    let path = Path::new(&save_path);
    let mut file = match File::create(&path) {
        Ok(file) => file,
        Err(e) => return Err(format!("创建文件失败: {}", e)),
    };

    // 获取并写入文件内容
    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(e) => return Err(format!("读取响应内容失败: {}", e)),
    };

    match file.write_all(&bytes) {
        Ok(_) => Ok(format!("文件已下载到 {}", save_path)),
        Err(e) => Err(format!("写入文件失败: {}", e)),
    }
}
