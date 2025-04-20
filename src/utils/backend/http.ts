import { invoke } from "@tauri-apps/api/core";
// HTTP 请求头类型
type HttpHeaders = Record<string, string>;

// HTTP 查询参数类型
type HttpQueryParams = Record<string, string>;

/**
 * HTTP 请求参数接口
 */
export interface HttpRequestParams {
  /** 请求URL */
  url: string;
  /** 请求头 */
  headers?: HttpHeaders;
  /** 查询参数 */
  params?: HttpQueryParams;
  /** 请求体 (POST/PUT) */
  body?: string;
}

/**
 * 下载文件请求参数接口
 */
export interface DownloadFileParams {
  /** 文件URL */
  url: string;
  /** 保存路径 */
  savePath: string;
  /** 请求头 */
  headers?: HttpHeaders;
}

// HTTP GET请求参数
export interface HttpGetParams {
  url: string;
  headers?: HttpHeaders;
  params?: HttpQueryParams;
}

// HTTP POST/PUT请求参数
export interface HttpBodyParams {
  url: string;
  body: string | Record<string, any>;
  headers?: HttpHeaders;
  params?: HttpQueryParams;
}

// HTTP DELETE请求参数
export interface HttpDeleteParams {
  url: string;
  headers?: HttpHeaders;
  params?: HttpQueryParams;
}

// HTTP下载请求参数
export interface HttpDownloadParams {
  url: string;
  savePath: string;
  headers?: HttpHeaders;
}

// HTTP响应类型
export interface HttpResponse<T = any> {
  status: number;
  headers: HttpHeaders;
  data: T;
}

/**
 * 发送 HTTP GET 请求
 * 对应 src-tauri/src/http/client.rs -> http_get
 * @param url 请求 URL
 * @param headers 可选的请求头
 * @param params 可选的查询参数
 * @returns 响应体文本内容
 * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
 */
export async function get(
  url: string,
  headers?: HttpHeaders,
  params?: HttpQueryParams
): Promise<string> {
  return await invoke<string>("http_get", { url, headers, params });
}

/**
 * 发送 HTTP POST 请求
 * 对应 src-tauri/src/http/client.rs -> http_post
 * @param url 请求 URL
 * @param body 请求体 (必须是字符串)
 * @param headers 可选的请求头
 * @param params 可选的查询参数
 * @returns 响应体文本内容
 * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
 */
export async function post(
  url: string,
  body: string,
  headers?: HttpHeaders,
  params?: HttpQueryParams
): Promise<string> {
  return await invoke<string>("http_post", { url, body, headers, params });
}

/**
 * 发送 HTTP PUT 请求
 * 对应 src-tauri/src/http/client.rs -> http_put
 * @param url 请求 URL
 * @param body 请求体 (必须是字符串)
 * @param headers 可选的请求头
 * @param params 可选的查询参数
 * @returns 响应体文本内容
 * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
 */
export async function put(
  url: string,
  body: string,
  headers?: HttpHeaders,
  params?: HttpQueryParams
): Promise<string> {
  return await invoke<string>("http_put", { url, body, headers, params });
}

/**
 * 发送 HTTP DELETE 请求
 * 对应 src-tauri/src/http/client.rs -> http_delete
 * @param url 请求 URL
 * @param headers 可选的请求头
 * @param params 可选的查询参数
 * @returns 响应体文本内容
 * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
 */
export async function delete_(
  url: string,
  headers?: HttpHeaders,
  params?: HttpQueryParams
): Promise<string> {
  return await invoke<string>("http_delete", { url, headers, params });
}

/**
 * 下载文件
 * 对应 src-tauri/src/http/client.rs -> http_download_file
 * @param url 文件 URL
 * @param savePath 保存路径
 * @param headers 可选的请求头
 * @returns 成功时返回包含保存路径的成功信息字符串
 * @throws 如果下载失败、创建文件失败或写入失败，则抛出错误信息字符串
 */
export async function downloadFile(
  url: string,
  savePath: string,
  headers?: HttpHeaders
): Promise<string> {
  return await invoke<string>("http_download_file", {
    url,
    savePath,
    headers,
  });
}
