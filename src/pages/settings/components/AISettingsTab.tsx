import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Switch,
  Select,
  SelectItem,
  Divider,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  RiRobot2Line,
  RiSettings4Line,
  RiTestTubeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiRefreshLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AIProvider, AIProviderConfig } from "@/services/ai/types";
import { getAIManager } from "@/services/ai/manager";

// 默认模型选择器组件
interface DefaultModelSelectorProps {
  config: AIProviderConfig;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const DefaultModelSelector: React.FC<DefaultModelSelectorProps> = ({
  config,
  selectedModel,
  onModelChange,
}) => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const aiManager = getAIManager();

  // 加载模型列表
  const loadModels = async () => {
    try {
      setLoading(true);
      const modelList = await aiManager.getProviderModels(config.provider);
      setModels(modelList);
    } catch (error) {
      console.error(`获取 ${config.provider} 模型列表失败:`, error);
      setModels(config.models || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.enabled) {
      loadModels();
    }
  }, [config.enabled, config.provider]);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${config.color}/10 flex-shrink-0`}
      >
        <RiRobot2Line className={`w-4 h-4 text-${config.color}`} />
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground block mb-1">
          {config.name} 默认模型
        </label>
        <Select
          selectedKeys={selectedModel ? [selectedModel] : []}
          onSelectionChange={(keys) => {
            const model = Array.from(keys)[0] as string;
            if (model) {
              onModelChange(model);
            }
          }}
          placeholder={loading ? "加载中..." : "选择默认模型"}
          isDisabled={loading || models.length === 0}
          size="sm"
        >
          {models.map((model) => (
            <SelectItem key={model.id}>{model.name}</SelectItem>
          ))}
        </Select>
      </div>
      <Button
        size="sm"
        variant="flat"
        startContent={<RiRefreshLine />}
        onPress={loadModels}
        isLoading={loading}
      >
        刷新
      </Button>
    </div>
  );
};

const AISettingsTab: React.FC = () => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(
    null,
  );
  const [defaultProvider, setDefaultProvider] = useState<AIProvider | null>(
    null,
  );
  const [defaultModels, setDefaultModels] = useState<
    Record<AIProvider, string>
  >({} as any);
  const [showApiKeys, setShowApiKeys] = useState<Record<AIProvider, boolean>>(
    {} as any,
  );

  const {
    isOpen: isConfigModalOpen,
    onOpen: onConfigModalOpen,
    onClose: onConfigModalClose,
  } = useDisclosure();

  const [editingConfig, setEditingConfig] = useState<AIProviderConfig | null>(
    null,
  );
  const [tempConfig, setTempConfig] = useState<Partial<AIProviderConfig>>({});

  const aiManager = getAIManager();

  // 加载配置
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const [allConfigs, defaultProv] = await Promise.all([
        aiManager.getAllProviderConfigs(),
        aiManager.getDefaultProvider(),
      ]);
      setConfigs(allConfigs);
      setDefaultProvider(defaultProv);

      // 加载每个提供商的默认模型
      const models: Record<AIProvider, string> = {} as any;
      for (const config of allConfigs) {
        if (config.enabled) {
          const defaultModel = await aiManager.getDefaultModel(config.provider);
          if (defaultModel) {
            models[config.provider] = defaultModel;
          }
        }
      }
      setDefaultModels(models);
    } catch (error) {
      console.error("加载AI配置失败:", error);
      toast.error("加载AI配置失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // 测试连接
  const handleTestConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    try {
      const success = await aiManager.testProviderConnection(provider);
      if (success) {
        toast.success(`${provider} 连接测试成功`);
      } else {
        toast.error(`${provider} 连接测试失败`);
      }
    } catch (error) {
      console.error("连接测试失败:", error);
      toast.error("连接测试失败");
    } finally {
      setTestingProvider(null);
    }
  };

  // 保存配置
  const handleSaveConfig = async () => {
    if (!editingConfig || !tempConfig) return;

    try {
      const updatedConfig: AIProviderConfig = {
        ...editingConfig,
        ...tempConfig,
      };

      await aiManager.saveProviderConfig(updatedConfig);
      toast.success("配置已保存");
      await loadConfigs();
      onConfigModalClose();
      setEditingConfig(null);
      setTempConfig({});
    } catch (error) {
      console.error("保存配置失败:", error);
      toast.error("保存配置失败");
    }
  };

  // 设置默认提供商
  const handleSetDefaultProvider = async (provider: AIProvider) => {
    try {
      await aiManager.setDefaultProvider(provider);
      setDefaultProvider(provider);
      toast.success(`已设置 ${provider} 为默认提供商`);
    } catch (error) {
      console.error("设置默认提供商失败:", error);
      toast.error("设置默认提供商失败");
    }
  };

  // 设置默认模型
  const handleSetDefaultModel = async (provider: AIProvider, model: string) => {
    try {
      await aiManager.setDefaultModel(provider, model);
      setDefaultModels((prev) => ({
        ...prev,
        [provider]: model,
      }));
      toast.success(`已设置 ${model} 为 ${provider} 的默认模型`);
    } catch (error) {
      console.error("设置默认模型失败:", error);
      toast.error("设置默认模型失败");
    }
  };

  // 打开配置模态框
  const openConfigModal = (config: AIProviderConfig) => {
    setEditingConfig(config);
    setTempConfig({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      enabled: config.enabled,
    });
    onConfigModalOpen();
  };

  // 切换API密钥显示
  const toggleApiKeyVisibility = (provider: AIProvider) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <RiRobot2Line className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">AI助手配置</h2>
          <p className="text-sm text-foreground/60">配置AI提供商和模型设置</p>
        </div>
      </div>

      {/* 默认提供商设置 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">默认设置</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              默认AI提供商
            </label>
            <Select
              selectedKeys={defaultProvider ? [defaultProvider] : []}
              onSelectionChange={(keys) => {
                const provider = Array.from(keys)[0] as AIProvider;
                if (provider) {
                  handleSetDefaultProvider(provider);
                }
              }}
              placeholder="选择默认AI提供商"
            >
              {configs
                .filter((config) => config.enabled)
                .map((config) => (
                  <SelectItem key={config.provider}>{config.name}</SelectItem>
                ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 默认模型设置 */}
      {configs.filter((config) => config.enabled).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">默认模型设置</h3>
            <p className="text-sm text-foreground/60">
              为每个启用的AI提供商设置默认模型
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            {configs
              .filter((config) => config.enabled)
              .map((config) => (
                <DefaultModelSelector
                  key={config.provider}
                  config={config}
                  selectedModel={defaultModels[config.provider] || ""}
                  onModelChange={(model) =>
                    handleSetDefaultModel(config.provider, model)
                  }
                />
              ))}
          </CardBody>
        </Card>
      )}

      {/* AI提供商配置 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">AI提供商配置</h3>

        {configs.map((config, index) => (
          <motion.div
            key={config.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${config.color}/10`}
                    >
                      <RiRobot2Line
                        className={`w-6 h-6 text-${config.color}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-medium">{config.name}</h4>
                        {config.enabled && (
                          <Chip size="sm" color="success" variant="flat">
                            已启用
                          </Chip>
                        )}
                        {defaultProvider === config.provider && (
                          <Chip size="sm" color="primary" variant="flat">
                            默认
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-foreground/60 mt-1">
                        {config.description}
                      </p>
                      {config.apiKey && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-foreground/40">
                            API密钥:
                          </span>
                          <code className="text-xs bg-default-100 px-2 py-1 rounded">
                            {showApiKeys[config.provider]
                              ? config.apiKey
                              : "••••••••••••••••"}
                          </code>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              toggleApiKeyVisibility(config.provider)
                            }
                          >
                            {showApiKeys[config.provider] ? (
                              <RiEyeOffLine className="w-3 h-3" />
                            ) : (
                              <RiEyeLine className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<RiTestTubeLine />}
                      onPress={() => handleTestConnection(config.provider)}
                      isLoading={testingProvider === config.provider}
                      isDisabled={!config.enabled || !config.apiKey}
                    >
                      测试连接
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<RiSettings4Line />}
                      onPress={() => openConfigModal(config)}
                    >
                      配置
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 配置模态框 */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={onConfigModalClose}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <RiSettings4Line className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              配置 {editingConfig?.name}
            </h2>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {/* 启用开关 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">启用此提供商</label>
                <p className="text-xs text-foreground/60">
                  启用后可在AI助手中使用此提供商
                </p>
              </div>
              <Switch
                isSelected={tempConfig.enabled}
                onValueChange={(enabled) =>
                  setTempConfig((prev) => ({ ...prev, enabled }))
                }
              />
            </div>

            <Divider />

            {/* API密钥 */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                API密钥
              </label>
              <Input
                type="password"
                value={tempConfig.apiKey || ""}
                onValueChange={(value) =>
                  setTempConfig((prev) => ({ ...prev, apiKey: value }))
                }
                placeholder="输入API密钥"
              />
            </div>

            {/* 基础URL */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                基础URL
              </label>
              <Input
                value={tempConfig.baseUrl || ""}
                onValueChange={(value) =>
                  setTempConfig((prev) => ({ ...prev, baseUrl: value }))
                }
                placeholder="输入API基础URL"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="flat" onPress={onConfigModalClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleSaveConfig}>
              保存配置
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AISettingsTab;
