/// 数据库连接URL
pub const DB_NAME: &str = "taiasst.db";
pub const DB_URL: &str = "sqlite:taiasst.db";
use sqlx::{
    sqlite::{SqlitePoolOptions, SqliteRow},
    SqlitePool,
};
use tauri_plugin_sql::Migration;

pub fn get_migrations() -> Vec<Migration> {
    let mut migrations = vec![];

    // 添加插件系统迁移
    migrations.extend(crate::db::migrations::get_plugin_system_migrations());

    // 添加AI系统迁移
    migrations.extend(crate::db::migrations::get_ai_system_migrations());

    // 添加系统设置迁移
    migrations.extend(crate::db::migrations::get_system_settings_migrations());

    // 添加安全系统迁移
    migrations.extend(crate::db::migrations::get_security_system_migrations());

    // 添加加密存储迁移
    migrations.extend(crate::db::migrations::get_encrypted_storage_migrations());

    // 添加密码管理迁移
    migrations.extend(crate::db::migrations::get_password_management_migrations());

    migrations
}

/// 数据库连接结构体
pub struct DBConnection {
    pub pool: SqlitePool,
}

impl DBConnection {
    /// 创建新的数据库连接并初始化表结构
    pub async fn new(db_url: String) -> Result<Self, String> {
        let pool = get_db_connection(db_url).await?;
        let connection = Self { pool };

        // 初始化数据库表结构
        // connection.initialize_database().await?;

        Ok(connection)
    }

    /// 获取内部连接池的引用
    pub fn get_pool(&self) -> &SqlitePool {
        &self.pool
    }

    /// 初始化数据库表结构
    pub async fn initialize_database(&self) -> Result<(), String> {
        log::info!("开始初始化数据库表结构...");

        // 执行所有迁移脚本
        let migrations = get_migrations();
        for migration in migrations {
            log::debug!("执行迁移: {}", migration.version);
            sqlx::query(&migration.sql)
                .execute(&self.pool)
                .await
                .map_err(|e| format!("迁移执行失败 ({}): {}", migration.version, e))?;
        }

        log::info!("数据库表结构初始化完成");
        Ok(())
    }
}

/// 获取数据库连接
pub async fn get_db_connection(db_url: String) -> Result<SqlitePool, String> {
    // 从 URL 中提取文件路径
    if let Some(file_path) = db_url.strip_prefix("sqlite:") {
        let path = std::path::Path::new(file_path);

        // 确保父目录存在
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("创建数据库目录失败: {}", e))?;
        }

        // 如果数据库文件不存在，先创建一个空文件
        if !path.exists() {
            std::fs::File::create(path).map_err(|e| format!("创建数据库文件失败: {}", e))?;
            log::info!("创建新的数据库文件: {:?}", path);
        }
    }

    SqlitePoolOptions::new()
        .max_connections(5)
        .connect(db_url.as_str())
        .await
        .map_err(|e| format!("数据库连接失败: {}", e))
}

//==============================================================================
// 通用数据库操作方法
//==============================================================================

/// 执行SQL语句（不带参数）
pub async fn execute(db: &DBConnection, sql: &str) -> Result<(), String> {
    sqlx::query(sql)
        .execute(&db.pool)
        .await
        .map_err(|e| format!("执行失败: {}", e))?;
    Ok(())
}

/// 查询数据（不带参数）
pub async fn query(db: &DBConnection, sql: &str) -> Result<Vec<SqliteRow>, String> {
    let result = sqlx::query(sql)
        .fetch_all(&db.pool)
        .await
        .map_err(|e| format!("查询失败: {}", e))?;
    Ok(result)
}

//==============================================================================
// 参数绑定的便利宏
//==============================================================================

/// 执行带参数的SQL语句的宏
#[macro_export]
macro_rules! execute_with_params {
    ($db:expr, $sql:expr, $($param:expr),*) => {{
        let mut query = sqlx::query($sql);
        $(
            query = query.bind($param);
        )*
        query
            .execute($db.get_pool())
            .await
            .map_err(|e| format!("执行失败: {}", e))?;
        Ok::<(), String>(())
    }};
}

/// 查询带参数的SQL语句的宏
#[macro_export]
macro_rules! query_with_params {
    ($db:expr, $sql:expr, $($param:expr),*) => {{
        let mut query = sqlx::query($sql);
        $(
            query = query.bind($param);
        )*
        query
            .fetch_all($db.get_pool())
            .await
            .map_err(|e| format!("查询失败: {}", e))
    }};
}

/// 查询单行带参数的SQL语句的宏
#[macro_export]
macro_rules! query_one_with_params {
    ($db:expr, $sql:expr, $($param:expr),*) => {{
        let mut query = sqlx::query($sql);
        $(
            query = query.bind($param);
        )*
        query
            .fetch_optional($db.get_pool())
            .await
            .map_err(|e| format!("查询失败: {}", e))
    }};
}
