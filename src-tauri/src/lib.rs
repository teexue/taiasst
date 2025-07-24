use db::DBConnection;
use std::sync::Arc;
/**
 * TaiASST 应用后端库
 *
 * 这是TaiASST应用的Rust后端主要库文件，包含：
 * - 模块导入和声明
 * - UI界面相关（托盘图标、菜单等）
 * - 插件系统初始化
 * - Tauri命令注册
 * - 应用程序入口
 */
// 导入Tauri相关库
use tauri::AppHandle;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::Mutex;

// 导入模块
mod db;
mod file;
mod http;
mod plugin;
mod system;

// 全局数据库连接
static DB_CONNECTION: std::sync::OnceLock<Arc<Mutex<DBConnection>>> = std::sync::OnceLock::new();

/// 获取全局数据库连接
pub async fn get_db() -> Result<Arc<Mutex<DBConnection>>, String> {
    DB_CONNECTION
        .get()
        .ok_or_else(|| "数据库未初始化".to_string())
        .map(|db| db.clone())
}

/// 初始化数据库连接
async fn init_database(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // 获取应用数据目录
    let app_data_dir = app.path().app_data_dir()?;

    // 确保应用数据目录存在
    std::fs::create_dir_all(&app_data_dir)?;

    // 构建数据库文件路径
    let db_path = app_data_dir.join(db::DB_NAME);
    let db_url = format!("sqlite:{}", db_path.to_string_lossy());

    // 创建数据库连接 (会自动创建文件并初始化表结构)
    let db_connection = DBConnection::new(db_url)
        .await
        .map_err(|e| format!("数据库初始化失败: {}", e))?;

    // 设置全局数据库连接
    DB_CONNECTION
        .set(Arc::new(Mutex::new(db_connection)))
        .map_err(|_| "数据库连接已初始化")?;

    log::info!("数据库初始化成功: {:?}", db_path);
    Ok(())
}

//==============================================================================
// 应用界面相关函数
//==============================================================================

/**
 * 显示主窗口并设置焦点
 */
fn show_window(app: &AppHandle) {
    let windows = app.webview_windows();
    windows
        .values()
        .next()
        .expect("Sorry, no window found")
        .set_focus()
        .expect("Can't Bring Window to Focus");
}

#[tauri::command]
fn show_window_command(window: tauri::Window) -> Result<(), String> {
    window
        .show()
        .map_err(|e| format!("Failed to show window: {}", e))?;
    window
        .set_focus()
        .map_err(|e| format!("Failed to set focus: {}", e))?;
    Ok(())
}

/**
 * 创建托盘菜单
 */
fn create_tray_menu(app: &AppHandle) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    let main_page = MenuItem::with_id(app, "main_page", "主页面", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    Ok(Menu::with_items(app, &[&main_page, &quit_i])?)
}

/**
 * 处理托盘图标点击事件
 */
fn handle_tray_click(icon: &TrayIcon) {
    if let Some(window) = icon.app_handle().get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/**
 * 处理托盘菜单事件
 */
fn handle_menu_event(app: &AppHandle, event_id: &str) {
    match event_id {
        "resume" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => {}
    }
}

/**
 * 创建托盘图标
 */
fn create_tray_icon(
    app: &AppHandle,
    menu: Menu<tauri::Wry>,
) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    Ok(TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("TaiASST")
        .show_menu_on_left_click(false)
        .on_tray_icon_event(move |icon: &TrayIcon, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                handle_tray_click(icon);
            }
        })
        .on_menu_event(move |app, event| handle_menu_event(app, event.id.as_ref()))
        .build(app)?)
}

/**
 * 设置应用界面
 */
fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let menu = create_tray_menu(app.handle())?;
    let _tray = create_tray_icon(app.handle(), menu)?;
    Ok(())
}

//==============================================================================
// 插件和功能初始化函数
//==============================================================================

/**
 * 初始化Tauri插件
 */
fn init_plugins(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(db::DB_URL, db::get_migrations())
                .build(),
        )
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = show_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
}

/**
 * 注册自定义的Tauri命令
 */
fn init_functions(builder: tauri::Builder<tauri::Wry>) -> tauri::Builder<tauri::Wry> {
    builder.invoke_handler(tauri::generate_handler![
        show_window_command,
        // 文件操作相关命令
        file::create_directory,
        file::delete_file,
        file::rename_file,
        file::copy_file,
        file::read_app_config,
        file::write_app_config,
        file::file_exists,
        file::get_file_info,
        // 系统信息相关命令
        system::get_system_metrics,
        system::get_cpu_metrics,
        system::get_memory_metrics,
        system::get_disk_metrics,
        system::get_gpu_metrics,
        system::get_system_info,
        // 插件系统相关命令
        plugin::get_plugin_base_dir,
        plugin::get_plugin_global_config_path,
        plugin::get_plugin_path,
        plugin::get_plugin_metadata,
        plugin::load_plugin,
        plugin::unload_plugin,
        plugin::get_loaded_plugins,
        plugin::call_plugin_function,
        plugin::install_plugin_from_zip,
        plugin::uninstall_plugin,
        plugin::get_plugin_metadata_from_zip,
        // HTTP相关命令
        http::http_download_file,
        http::http_get,
        http::http_post,
        http::http_put,
        http::http_delete,
        // 安全系统相关命令已清理
    ])
}

//==============================================================================
// 应用程序入口
//==============================================================================

/**
 * 应用程序主入口
 */
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    let builder = init_plugins(builder);
    let builder = init_functions(builder);

    builder
        .setup(|app| {
            // 设置界面
            let _ = setup(app);

            // 初始化数据库
            tauri::async_runtime::block_on(async {
                if let Err(e) = init_database(app).await {
                    log::error!("数据库初始化失败: {}", e);
                    return Err(e);
                }
                Ok(())
            })?;

            // 初始化插件管理器
            match plugin::api::init_plugin_system(app.app_handle().clone()) {
                Ok(_) => log::info!("插件管理器初始化成功"),
                Err(e) => log::error!("插件管理器初始化失败: {}", e),
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
