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
        Migration {
            version: 22,
            description: "Create AI provider configs table (new schema)",
            sql: "CREATE TABLE IF NOT EXISTS ai_provider_configs (
                provider TEXT PRIMARY KEY NOT NULL,
                api_key TEXT,
                base_url TEXT,
                enabled INTEGER NOT NULL DEFAULT 0,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 23,
            description: "Create AI settings table",
            sql: "CREATE TABLE IF NOT EXISTS ai_settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 24,
            description: "Create AI chat sessions table",
            sql: "CREATE TABLE IF NOT EXISTS ai_chat_sessions (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                messages TEXT NOT NULL DEFAULT '[]',
                provider TEXT NOT NULL,
                model TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 25,
            description: "Create AI chat sessions indexes",
            sql: "CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_updated
                  ON ai_chat_sessions(updated_at);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 26,
            description: "Create AI chat sessions provider index",
            sql: "CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_provider
                  ON ai_chat_sessions(provider);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 27,
            description: "Create workflow definitions table",
            sql: "CREATE TABLE IF NOT EXISTS workflow_definitions (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                version TEXT NOT NULL DEFAULT '1.0.0',
                status TEXT NOT NULL DEFAULT 'draft',
                definition TEXT NOT NULL,
                variables TEXT NOT NULL DEFAULT '{}',
                settings TEXT NOT NULL DEFAULT '{}',
                tags TEXT NOT NULL DEFAULT '[]',
                category TEXT NOT NULL DEFAULT 'general',
                is_template INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                created_by TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 28,
            description: "Create workflow executions table",
            sql: "CREATE TABLE IF NOT EXISTS workflow_executions (
                id TEXT PRIMARY KEY NOT NULL,
                workflow_id TEXT NOT NULL,
                workflow_version TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                start_time INTEGER NOT NULL,
                end_time INTEGER,
                duration INTEGER,
                input_data TEXT,
                output_data TEXT,
                error_message TEXT,
                triggered_by TEXT NOT NULL DEFAULT 'manual',
                logs TEXT NOT NULL DEFAULT '[]',
                created_at INTEGER NOT NULL,
                FOREIGN KEY (workflow_id) REFERENCES workflow_definitions(id) ON DELETE CASCADE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 29,
            description: "Create workflow templates table",
            sql: "CREATE TABLE IF NOT EXISTS workflow_templates (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                icon TEXT NOT NULL,
                thumbnail TEXT,
                definition TEXT NOT NULL,
                usage_stats TEXT NOT NULL DEFAULT '{}',
                author_info TEXT NOT NULL DEFAULT '{}',
                version TEXT NOT NULL DEFAULT '1.0.0',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 30,
            description: "Create workflow categories table",
            sql: "CREATE TABLE IF NOT EXISTS workflow_categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                parent_id TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (parent_id) REFERENCES workflow_categories(id) ON DELETE SET NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 31,
            description: "Create workflow indexes",
            sql: "CREATE INDEX IF NOT EXISTS idx_workflow_definitions_status
                  ON workflow_definitions(status);
                  CREATE INDEX IF NOT EXISTS idx_workflow_definitions_category
                  ON workflow_definitions(category);
                  CREATE INDEX IF NOT EXISTS idx_workflow_definitions_created_at
                  ON workflow_definitions(created_at);
                  CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id
                  ON workflow_executions(workflow_id);
                  CREATE INDEX IF NOT EXISTS idx_workflow_executions_status
                  ON workflow_executions(status);
                  CREATE INDEX IF NOT EXISTS idx_workflow_executions_start_time
                  ON workflow_executions(start_time);",
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

pub fn get_security_system_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 11,
            description: "Create security config table",
            sql: "CREATE TABLE IF NOT EXISTS security_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                password_hash TEXT,
                salt TEXT,
                created_at INTEGER,
                last_login INTEGER,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until INTEGER,
                password_strength TEXT,
                password_protection_enabled INTEGER NOT NULL DEFAULT 0,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "Create security audit log table",
            sql: "CREATE TABLE IF NOT EXISTS security_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                event_severity TEXT NOT NULL,
                description TEXT NOT NULL,
                user_agent TEXT,
                ip_address TEXT,
                session_id TEXT,
                additional_data TEXT,
                created_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "Create security sessions table",
            sql: "CREATE TABLE IF NOT EXISTS security_sessions (
                session_id TEXT PRIMARY KEY NOT NULL,
                created_at INTEGER NOT NULL,
                last_activity INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 32,
            description: "Create auth settings table",
            sql: "CREATE TABLE IF NOT EXISTS auth_settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
            );",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn get_encrypted_storage_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 14,
            description: "Create encrypted storage table",
            sql: "CREATE TABLE IF NOT EXISTS encrypted_storage (
                id TEXT PRIMARY KEY NOT NULL,
                encryption_level TEXT NOT NULL,
                encrypted_content TEXT NOT NULL,
                metadata TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "Create encrypted storage index",
            sql: "CREATE INDEX IF NOT EXISTS idx_encrypted_storage_level 
                  ON encrypted_storage(encryption_level);",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn get_password_management_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 16,
            description: "Create password entries table",
            sql: "CREATE TABLE IF NOT EXISTS password_entries (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                url TEXT,
                notes TEXT,
                category TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                is_favorite INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                last_used INTEGER
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "Create password categories table",
            sql: "CREATE TABLE IF NOT EXISTS password_categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "Create password entries indexes",
            sql: "CREATE INDEX IF NOT EXISTS idx_password_entries_category
                  ON password_entries(category);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "Create password entries favorite index",
            sql: "CREATE INDEX IF NOT EXISTS idx_password_entries_favorite
                  ON password_entries(is_favorite);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "Create password entries updated index",
            sql: "CREATE INDEX IF NOT EXISTS idx_password_entries_updated
                  ON password_entries(updated_at);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "Insert default password categories",
            sql: "INSERT OR IGNORE INTO password_categories (id, name, icon, color) VALUES
                  ('social', '社交媒体', 'RiUserLine', 'blue'),
                  ('work', '工作', 'RiBriefcaseLine', 'green'),
                  ('finance', '金融', 'RiBankLine', 'yellow'),
                  ('shopping', '购物', 'RiShoppingCartLine', 'orange'),
                  ('entertainment', '娱乐', 'RiGamepadLine', 'purple'),
                  ('other', '其他', 'RiFolderLine', 'gray');",
            kind: MigrationKind::Up,
        },
    ]
}


