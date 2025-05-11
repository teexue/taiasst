import { useState } from "react";
import { Select, SelectItem, Input, Button } from "@heroui/react";
import { ConfigOptions, PluginMetadata } from "@/types/plugin";

function PluginConfigForm({ plugin }: { plugin: PluginMetadata }) {
  const initialConfig = plugin.config_options?.reduce(
    (acc: Record<string, any>, opt: ConfigOptions) => {
      acc[opt.name] = opt.default_value || "";
      return acc;
    },
    {} as Record<string, any>,
  );

  const [configValues, setConfigValues] = useState(initialConfig || {});

  const handleValueChange = (name: string, value: any) => {
    setConfigValues((prev: Record<string, any>) => ({
      ...prev,
      [name]: value,
    }));
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
              <>
                <Select
                  aria-label={option.name}
                  placeholder={`请选择 ${option.name}`}
                  selectedKeys={selectedKeysSet}
                  onSelectionChange={(keys) =>
                    handleValueChange(option.name, Array.from(keys)[0])
                  }
                  disallowEmptySelection={option.required}
                  variant="bordered"
                  radius="md"
                  classNames={{
                    trigger:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 h-10 min-h-10",
                    value: "text-sm",
                  }}
                >
                  {option.options.map((opt: string) => (
                    <SelectItem key={opt}>{opt}</SelectItem>
                  ))}
                </Select>
                {option.description && (
                  <p className="text-xs text-foreground/60 mt-1">
                    {option.description}
                  </p>
                )}
              </>
            ) : (
              <>
                <Input
                  aria-label={option.name}
                  placeholder={`请输入 ${option.name}`}
                  value={configValues[option.name]}
                  onValueChange={(value) =>
                    handleValueChange(option.name, value)
                  }
                  isRequired={option.required}
                  variant="bordered"
                  radius="md"
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                    errorMessage: "text-xs text-danger",
                  }}
                />
                {option.description && (
                  <p className="text-xs text-foreground/60 mt-1">
                    {option.description}
                  </p>
                )}
              </>
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

export default PluginConfigForm;
