/// 数据库连接URL
pub const DB_URL: &str = "sqlite:taiasst.db";
use tauri_plugin_sql::Migration;

pub fn get_migrations() -> Vec<Migration> {
    let mut migrations = vec![];

    // 添加插件系统迁移
    migrations.extend(crate::db::migrations::get_plugin_system_migrations());

    migrations
}
