// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::AppHandle;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    Manager
};
use tauri_plugin_autostart::MacosLauncher;

mod file;
mod system;

fn show_window(app: &AppHandle) {
    let windows = app.webview_windows();
    windows
        .values()
        .next()
        .expect("Sorry, no window found")
        .set_focus()
        .expect("Can't Bring Window to Focus");
}

fn create_tray_menu(app: &AppHandle) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    let resume = MenuItem::with_id(app, "resume", "恢复", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    Ok(Menu::with_items(app, &[&resume, &quit_i])?)
}

fn handle_tray_click(icon: &TrayIcon) {
    if let Some(window) = icon.app_handle().get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

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

fn create_tray_icon(app: &AppHandle, menu: Menu<tauri::Wry>) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    Ok(TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(move |icon: &TrayIcon, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event {
                handle_tray_click(icon);
            }
        })
        .on_menu_event(move |app, event| handle_menu_event(app, event.id.as_ref()))
        .build(app)?)
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let menu = create_tray_menu(app.handle())?;
    let _tray = create_tray_icon(app.handle(), menu)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_shell::init())
        .setup(setup)
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = show_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            file::create_directory,
            file::delete_file,
            file::rename_file,
            file::copy_file,
            file::get_config_dir,
            file::read_local_tools_config,
            file::write_local_tools_config,
            system::get_system_metrics,
            system::get_cpu_metrics,
            system::get_memory_metrics,
            system::get_disk_metrics,
            system::get_gpu_metrics,
            system::get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
