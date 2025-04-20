import { PluginMetadata } from "@/types/plugin";
import { getAllPluginConfig } from "@/utils/plugin/operations";
import { Tabs, Form, Input, Select } from "antd";
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

  const items = pluginConfig.map((item) => ({
    label: item.name,
    key: item.id,
    children: (
      <Form
        initialValues={item.config_options?.reduce(
          (acc, opt) => ({
            ...acc,
            [opt.name]: opt.default_value,
          }),
          {}
        )}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        {item.config_options?.map((option) => (
          <Form.Item
            key={option.name}
            label={<span className="truncate block">{option.name}</span>}
            name={option.name}
            tooltip={{
              title: option.name,
              placement: "topLeft",
            }}
            style={{ marginBottom: 16 }}
            rules={[
              {
                required: option.required,
                message: `请输入${option.name}`,
              },
            ]}
          >
            {option.options ? (
              <Select
                placeholder={`请选择${option.name}`}
                allowClear={!option.required}
              >
                {option.options.map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder={`请输入${option.name}`}
                allowClear={!option.required}
              />
            )}
          </Form.Item>
        ))}
      </Form>
    ),
  }));

  return (
    <>
      <Tabs tabPosition="left" items={items} />
    </>
  );
}

export default PluginTab;
