import { PluginMetadata, ConfigOptions } from "@/types/plugin";
import { getAllPluginConfig } from "@/utils/plugin/operations";
import { Tabs, Tab, Input, Select, SelectItem, Button } from "@heroui/react";
import { useEffect, useState } from "react";

const testPluginConfigs: PluginMetadata[] = [
  {
    id: "test-plugin",
    name: "通义灵码",
    version: "1.0.0",
    has_backend: true,
    config_options: [
      {
        name: "通义灵码通义灵码",
        description: "通义灵码的api_key",
        default_value: "",
        required: true,
      },
      {
        name: "api_secret",
        description: "通义灵码的api_secret",
        default_value: "",
        required: true,
      },
      {
        name: "model",
        description: "通义灵码的模型",
        default_value: "qwen2.5-coder",
        options: ["qwen2.5-coder", "qwen2.5-coder-32k"],
        required: false,
      },
    ],
  },
  {
    id: "test-plugin2",
    name: "文心一言",
    version: "1.0.0",
    has_backend: true,
    config_options: [
      {
        name: "api_key",
        description: "文心一言的api_key",
        default_value: "",
        required: true,
      },
      {
        name: "api_secret",
        description: "文心一言的api_secret",
        default_value: "",
        required: true,
      },
    ],
  },
  {
    id: "test-plugin3",
    name: "Claude",
    version: "1.0.0",
    has_backend: true,
    config_options: [
      {
        name: "api_key",
        description: "Claude的api_key",
        default_value: "",
        required: true,
      },
      {
        name: "api_secret",
        description: "Claude的api_secret",
        default_value: "",
        required: true,
      },
    ],
  },
  {
    id: "test-plugin4",
    name: "DeepSeek",
    version: "1.0.0",
    has_backend: true,
    config_options: [
      {
        name: "api_key",
        description: "DeepSeek的api_key",
        default_value: "",
        required: true,
      },
      {
        name: "api_secret",
        description: "DeepSeek的api_secret",
        default_value: "",
        required: true,
      },
    ],
  },
  {
    id: "test-plugin5",
    name: "计算器",
    version: "1.0.0",
    has_backend: true,
    config_options: [
      {
        name: "api_key",
        description: "计算器的api_key",
        default_value: "",
        required: true,
      },
      {
        name: "api_secret",
        description: "计算器的api_secret",
        default_value: "",
        required: true,
      },
      {
        name: "model",
        description: "计算器的模型",
        default_value: "qwen2.5-coder",
        options: ["qwen2.5-coder", "qwen2.5-coder-32k"],
        required: false,
      },
    ],
  },
];

function PluginConfigForm({ plugin }: { plugin: PluginMetadata }) {
  const initialConfig = plugin.config_options?.reduce(
    (acc, opt: ConfigOptions) => {
      acc[opt.name] = opt.default_value || "";
      return acc;
    },
    {} as Record<string, any>,
  );

  const [configValues, setConfigValues] = useState(initialConfig || {});

  const handleValueChange = (name: string, value: any) => {
    setConfigValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("保存配置:", plugin.id, configValues);
  };

  return (
    <div className="flex flex-col gap-4">
      {plugin.config_options?.map((option: ConfigOptions) => {
        const selectedKeysSet = new Set<string>();
        if (configValues[option.name]) {
          selectedKeysSet.add(String(configValues[option.name]));
        }

        return (
          <div key={option.name} className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {option.name}
              {option.required && <span className="text-danger ml-1">*</span>}
            </label>
            {option.options ? (
              <Select
                aria-label={option.name}
                placeholder={`请选择 ${option.name}`}
                selectedKeys={selectedKeysSet}
                onSelectionChange={(keys) =>
                  handleValueChange(option.name, Array.from(keys)[0])
                }
                disallowEmptySelection={option.required}
                description={option.description}
              >
                {option.options.map((opt) => (
                  <SelectItem key={opt}>{opt}</SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                aria-label={option.name}
                placeholder={`请输入 ${option.name}`}
                value={configValues[option.name]}
                onValueChange={(value) => handleValueChange(option.name, value)}
                isRequired={option.required}
                description={option.description}
              />
            )}
          </div>
        );
      })}
      {plugin.config_options && plugin.config_options.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button color="primary" onPress={handleSave}>
            保存
          </Button>
        </div>
      )}
    </div>
  );
}

function PluginTab() {
  const [pluginConfig, setPluginConfig] = useState<PluginMetadata[]>([]);
  const getPluginSettings = async () => {
    const config = await getAllPluginConfig();
    config.push(...testPluginConfigs);
    setPluginConfig(config);
  };
  useEffect(() => {
    getPluginSettings();
  }, []);

  return (
    <>
      <Tabs
        aria-label="插件配置"
        items={pluginConfig}
        isVertical={true}
        color="primary"
        variant="underlined"
        className="h-full"
      >
        {(item) => (
          <Tab key={item.id} title={item.name}>
            <div className="p-4 max-w-xl mx-auto">
              <PluginConfigForm plugin={item} />
            </div>
          </Tab>
        )}
      </Tabs>
    </>
  );
}

export default PluginTab;
