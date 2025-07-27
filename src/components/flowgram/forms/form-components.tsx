/**
 * FlowGram.ai 表单组件库
 */

import React from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Button,
} from "@heroui/react";

// 基础输入组件
export const FormInput: React.FC<{
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  type?: "text" | "email" | "password" | "number";
}> = ({
  label,
  placeholder,
  value = "",
  onChange,
  required = false,
  error,
  type = "text",
}) => {
  return (
    <div className="form-field">
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        isRequired={required}
        isInvalid={!!error}
        errorMessage={error}
        type={type}
        variant="bordered"
        size="sm"
      />
    </div>
  );
};

// 文本域组件
export const FormTextarea: React.FC<{
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
}> = ({
  label,
  placeholder,
  value = "",
  onChange,
  required = false,
  error,
  rows = 3,
}) => {
  return (
    <div className="form-field">
      <Textarea
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        isRequired={required}
        isInvalid={!!error}
        errorMessage={error}
        variant="bordered"
        size="sm"
        minRows={rows}
      />
    </div>
  );
};

// 选择器组件
export const FormSelect: React.FC<{
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
}> = ({
  label,
  placeholder,
  value = "",
  onChange,
  options,
  required = false,
  error,
}) => {
  return (
    <div className="form-field">
      <Select
        label={label}
        placeholder={placeholder}
        selectedKeys={value ? [value] : []}
        onSelectionChange={(keys) => {
          const selectedValue = Array.from(keys)[0] as string;
          onChange?.(selectedValue);
        }}
        isRequired={required}
        isInvalid={!!error}
        errorMessage={error}
        variant="bordered"
        size="sm"
      >
        {options.map((option) => (
          <SelectItem key={option.value}>{option.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
};

// 开关组件
export const FormSwitch: React.FC<{
  label?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  description?: string;
}> = ({ label, value = false, onChange, description }) => {
  return (
    <div className="form-field">
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Switch isSelected={value} onValueChange={onChange} size="sm" />
      </div>
    </div>
  );
};

// 数字输入组件
export const FormNumber: React.FC<{
  label?: string;
  placeholder?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
}> = ({
  label,
  placeholder,
  value,
  onChange,
  min,
  max,
  step = 1,
  required = false,
  error,
}) => {
  return (
    <div className="form-field">
      <Input
        label={label}
        placeholder={placeholder}
        value={value?.toString() || ""}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) {
            onChange?.(num);
          }
        }}
        isRequired={required}
        isInvalid={!!error}
        errorMessage={error}
        type="number"
        variant="bordered"
        size="sm"
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

// 键值对编辑器
export const FormKeyValue: React.FC<{
  label?: string;
  value?: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
}> = ({ label, value = {}, onChange }) => {
  const entries = Object.entries(value);

  const addEntry = () => {
    const newValue = { ...value, "": "" };
    onChange?.(newValue);
  };

  const updateEntry = (index: number, key: string, val: string) => {
    const newEntries = [...entries];
    const oldKey = newEntries[index][0];

    // 删除旧键
    const newValue = { ...value };
    delete newValue[oldKey];

    // 添加新键
    newValue[key] = val;
    onChange?.(newValue);
  };

  const removeEntry = (index: number) => {
    const newValue = { ...value };
    delete newValue[entries[index][0]];
    onChange?.(newValue);
  };

  return (
    <div className="form-field">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {entries.map(([key, val], index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="键"
              value={key}
              onChange={(e) => updateEntry(index, e.target.value, val)}
              variant="bordered"
              size="sm"
              className="flex-1"
            />
            <Input
              placeholder="值"
              value={val}
              onChange={(e) => updateEntry(index, key, e.target.value)}
              variant="bordered"
              size="sm"
              className="flex-1"
            />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onClick={() => removeEntry(index)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="bordered"
          onClick={addEntry}
          className="w-full"
        >
          + 添加
        </Button>
      </div>
    </div>
  );
};

// 条件编辑器
export const FormConditions: React.FC<{
  label?: string;
  value?: Array<{ field: string; operator: string; value: any }>;
  onChange?: (
    value: Array<{ field: string; operator: string; value: any }>,
  ) => void;
}> = ({ label, value = [], onChange }) => {
  const operators = [
    { value: "equals", label: "等于" },
    { value: "not_equals", label: "不等于" },
    { value: "contains", label: "包含" },
    { value: "not_contains", label: "不包含" },
    { value: "greater_than", label: "大于" },
    { value: "less_than", label: "小于" },
  ];

  const addCondition = () => {
    const newValue = [...value, { field: "", operator: "equals", value: "" }];
    onChange?.(newValue);
  };

  const updateCondition = (
    index: number,
    updates: Partial<{ field: string; operator: string; value: any }>,
  ) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updates };
    onChange?.(newValue);
  };

  const removeCondition = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange?.(newValue);
  };

  return (
    <div className="form-field">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {value.map((condition, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="字段"
              value={condition.field}
              onChange={(e) =>
                updateCondition(index, { field: e.target.value })
              }
              variant="bordered"
              size="sm"
              className="flex-1"
            />
            <Select
              placeholder="操作符"
              selectedKeys={[condition.operator]}
              onSelectionChange={(keys) => {
                const operator = Array.from(keys)[0] as string;
                updateCondition(index, { operator });
              }}
              variant="bordered"
              size="sm"
              className="flex-1"
            >
              {operators.map((op) => (
                <SelectItem key={op.value}>{op.label}</SelectItem>
              ))}
            </Select>
            <Input
              placeholder="值"
              value={condition.value}
              onChange={(e) =>
                updateCondition(index, { value: e.target.value })
              }
              variant="bordered"
              size="sm"
              className="flex-1"
            />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onClick={() => removeCondition(index)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="bordered"
          onClick={addCondition}
          className="w-full"
        >
          + 添加条件
        </Button>
      </div>
    </div>
  );
};
