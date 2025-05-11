use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_plugin_system_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Create plugin metadata table",
            sql: "CREATE TABLE IF NOT EXISTS plugin_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plugin_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                version TEXT NOT NULL,
                origin TEXT,
                plugin_type TEXT,
                description TEXT,
                author TEXT,
                has_backend INTEGER NOT NULL,
                backend_lib TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "Create plugin dependency table",
            sql: "CREATE TABLE IF NOT EXISTS plugin_dependency (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plugin_id TEXT NOT NULL,
                dependency_id TEXT NOT NULL,
                dependency_version TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (plugin_id) REFERENCES plugin_metadata (plugin_id) ON DELETE CASCADE,
                UNIQUE (plugin_id, dependency_id)
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "Create plugin menu options table",
            sql: "CREATE TABLE IF NOT EXISTS plugin_menu_options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plugin_id TEXT NOT NULL UNIQUE,
                show_in_menu INTEGER NOT NULL,
                menu_icon TEXT,
                menu_title TEXT,
                menu_order INTEGER,
                menu_group TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (plugin_id) REFERENCES plugin_metadata (plugin_id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "Create plugin config options table",
            sql: "CREATE TABLE IF NOT EXISTS plugin_config_options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plugin_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                default_value TEXT,
                options TEXT,
                required INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (plugin_id) REFERENCES plugin_metadata (plugin_id) ON DELETE CASCADE,
                UNIQUE (plugin_id, name)
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "Create plugin config data table",
            sql: "CREATE TABLE IF NOT EXISTS plugin_config_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plugin_id TEXT NOT NULL UNIQUE,
                config_data TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (plugin_id) REFERENCES plugin_metadata (plugin_id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn get_ai_system_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 6,
            description: "Create AI provider config table",
            sql: "CREATE TABLE IF NOT EXISTS ai_provider_config (
                provider TEXT PRIMARY KEY NOT NULL,
                api_key TEXT,
                base_url TEXT,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "Create AI model config table",
            sql: "CREATE TABLE IF NOT EXISTS ai_model_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL,
                model_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                enabled INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (provider) REFERENCES ai_provider_config (provider) ON DELETE CASCADE,
                UNIQUE (provider, model_id)
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "Create AI prompt templates table",
            sql: "CREATE TABLE IF NOT EXISTS ai_prompt_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT,
                tags TEXT,
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "Create AI chat histories table",
            sql: "CREATE TABLE IF NOT EXISTS ai_chat_histories (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                provider TEXT,
                model TEXT,
                messages TEXT NOT NULL,
                summary TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn get_system_settings_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 10,
        description: "Create system settings table",
        sql: "CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT,
                updated_at INTEGER NOT NULL
            );",
        kind: MigrationKind::Up,
    }]
}
