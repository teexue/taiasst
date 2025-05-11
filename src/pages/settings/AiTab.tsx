import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Tabs,
  Tab,
  Switch,
  Textarea,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  RiSaveLine,
  RiInformationLine,
  RiCheckLine,
  RiAddCircleLine,
  RiDeleteBin6Line,
  RiRobot2Line,
  RiKey2Line,
  RiGlobalLine,
  RiBookOpenLine,
  RiListSettingsLine,
  RiRefreshLine,
  RiEditLine,
  RiDownload2Line,
} from "@remixicon/react";
import {
  saveAiProviderConfig,
  getAiProviderConfig,
  AiProviderConfig,
  getAllAiProviders,
  saveModelConfig,
  getModelsByProvider,
  AiModelConfig,
  getAllPromptTemplates,
  savePromptTemplate,
  deletePromptTemplate,
  AiPromptTemplate,
  deleteAiProviderConfig,
  deleteModelConfig,
} from "../../services/db/ai";
import {
  DEFAULT_PROVIDERS,
  DEFAULT_PROMPT_TEMPLATES,
  getDefaultModelsForProvider,
  SUPPORTED_PROVIDERS,
} from "../../services/ai/defaultConfigs";

// 重用设置项样式组件
interface SettingItemProps {
  label: string;
  description?: string;
  control: React.ReactNode;
  fullWidth?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  control,
  fullWidth = false,
}) => (
  <div
    className={`p-4 ${fullWidth ? "flex flex-col gap-2" : "flex items-center justify-between"}`}
  >
    <div className={fullWidth ? "w-full" : ""}>
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-xs text-foreground/60">{description}</p>
      )}
    </div>
    <div className={fullWidth ? "w-full" : ""}>{control}</div>
  </div>
);

// 提供商管理组件
const ProviderManager = () => {
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 删除确认对话框状态
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  // 获取已配置的提供商列表
  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const providerList = await getAllAiProviders();
      setProviders(providerList);
      // 默认选择第一个提供商
      if (providerList.length > 0 && !selectedProvider) {
        setSelectedProvider(providerList[0]);
        await loadProviderConfig(providerList[0]);
      }
    } catch (error) {
      console.error("加载AI提供商列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载选定提供商的配置
  const loadProviderConfig = async (provider: string) => {
    setIsLoading(true);
    try {
      const config = await getAiProviderConfig(provider);
      // 如果有API Key，显示掩码，否则清空
      setApiKey(config?.api_key ? "••••••••••••••••••••••••••••••" : "");
      setBaseUrl(config?.base_url || "");
    } catch (error) {
      console.error(`加载${provider}配置失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存提供商配置
  const saveProviderConfig = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      const configToSave: Partial<
        Omit<AiProviderConfig, "provider" | "updated_at">
      > = {};

      // 只在API Key有实际更改时保存(不是掩码)
      if (apiKey && !apiKey.includes("•")) {
        configToSave.api_key = apiKey;
      } else if (apiKey === "") {
        configToSave.api_key = null; // 清除API Key
      }

      // 总是保存Base URL (可以为空)
      configToSave.base_url = baseUrl || null;

      await saveAiProviderConfig(selectedProvider, configToSave);

      // 如果保存了新的API Key，设置为掩码
      if (apiKey && !apiKey.includes("•")) {
        setApiKey("••••••••••••••••••••••••••••••");
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      // 刷新提供商列表
      await loadProviders();
    } catch (error) {
      console.error(`保存${selectedProvider}配置失败:`, error);
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新提供商
  const addNewProvider = async () => {
    // 从默认供应商列表中获取未配置的提供商
    const configuredProviderSet = new Set(providers);
    const availableProviders = DEFAULT_PROVIDERS.filter(
      (p) => p.supported && !configuredProviderSet.has(p.provider),
    ) // 只显示已支持的
      .map((p) => p.provider);

    if (availableProviders.length === 0) {
      // 所有提供商已配置，显示提示
      alert("所有支持的AI提供商已配置。");
      return;
    }

    // 打开添加提供商对话框
    // TODO: 使用对话框让用户选择要添加的提供商
    const newProvider = availableProviders[0]; // 暂时选第一个未配置的

    try {
      // 获取默认BaseURL（如果有）
      const defaultProvider = DEFAULT_PROVIDERS.find(
        (p) => p.provider === newProvider,
      );
      const baseUrl = defaultProvider?.defaultBaseUrl || null;

      // 添加配置
      await saveAiProviderConfig(newProvider, {
        api_key: null,
        base_url: baseUrl,
      });

      // 添加该提供商的默认模型到数据库
      await addDefaultModelsForProvider(newProvider);

      // 刷新列表并选择新添加的提供商
      await loadProviders();
      setSelectedProvider(newProvider);
      await loadProviderConfig(newProvider);
    } catch (error) {
      console.error(`添加提供商 ${newProvider} 失败:`, error);
    }
  };

  // 为提供商添加默认模型
  const addDefaultModelsForProvider = async (providerName: string) => {
    try {
      // 获取该提供商的默认模型
      const defaultModelsForProvider =
        getDefaultModelsForProvider(providerName);

      // 为每个默认模型创建数据库记录
      for (const model of defaultModelsForProvider) {
        await saveModelConfig({
          provider: model.provider,
          model_id: model.model_id,
          name: model.name,
          description: model.description,
          enabled: true, // 默认启用
        });
      }
      console.log(
        `已为提供商 ${providerName} 添加 ${defaultModelsForProvider.length} 个默认模型`,
      );
    } catch (error) {
      console.error(`为提供商 ${providerName} 添加默认模型失败:`, error);
    }
  };

  // 删除提供商
  const deleteProvider = async () => {
    if (!selectedProvider) return;

    openDeleteModal();
  };

  // 确认删除提供商
  const confirmDeleteProvider = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    try {
      // 使用真正的删除函数
      await deleteAiProviderConfig(selectedProvider);

      // 刷新列表
      closeDeleteModal();
      await loadProviders();
      setSelectedProvider(null);
      setApiKey("");
      setBaseUrl("");
    } catch (error) {
      console.error(`删除提供商 ${selectedProvider} 失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadProviders();
  }, []);

  // 当选择的提供商变化时加载配置
  useEffect(() => {
    if (selectedProvider) {
      loadProviderConfig(selectedProvider);
    }
  }, [selectedProvider]);

  return (
    <>
      <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm mb-6">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium flex items-center gap-1.5">
              <RiRobot2Line className="text-primary" /> AI 提供商配置
            </h2>
            <Button
              size="sm"
              color="primary"
              variant="shadow"
              onPress={addNewProvider}
              startContent={<RiAddCircleLine />}
              isDisabled={isLoading}
            >
              添加提供商
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex flex-col gap-4">
            {/* 提供商选择器 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">选择AI提供商</label>
              <Select
                selectedKeys={selectedProvider ? [selectedProvider] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]?.toString();
                  if (selected) setSelectedProvider(selected);
                }}
                isDisabled={isLoading || providers.length === 0}
                placeholder={
                  providers.length === 0 ? "未配置任何提供商" : "选择提供商"
                }
                variant="bordered"
                radius="md"
                classNames={{
                  trigger:
                    "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 h-10 min-h-10",
                  value: "text-sm",
                  base: "max-w-xs",
                }}
              >
                {providers.map((provider) => {
                  const providerInfo = DEFAULT_PROVIDERS.find(
                    (p) => p.provider === provider,
                  );
                  const isSupported = SUPPORTED_PROVIDERS.includes(provider);
                  return (
                    <SelectItem
                      key={provider}
                      textValue={providerInfo?.providerName || provider}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{providerInfo?.providerName || provider}</span>
                        {!isSupported && (
                          <Chip size="sm" color="warning" variant="flat">
                            即将支持
                          </Chip>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>
            </div>

            {/* 已选提供商的配置项 */}
            {selectedProvider && (
              <div className="mt-2 space-y-4">
                {!SUPPORTED_PROVIDERS.includes(selectedProvider) && (
                  <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-100/10 border border-warning-200 dark:border-warning-500/30">
                    <p className="text-warning-700 dark:text-warning-500 text-sm">
                      注意：此提供商的API集成尚未完全实现，目前无法使用。我们正在积极开发中，敬请期待！
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">API 密钥</label>
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`${selectedProvider.toUpperCase()} API 密钥`}
                    startContent={<RiKey2Line className="text-foreground/60" />}
                    endContent={
                      <Button
                        isIconOnly
                        size="sm"
                        variant="shadow"
                        onPress={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? "隐藏" : "显示"}
                      </Button>
                    }
                    variant="bordered"
                    radius="md"
                    classNames={{
                      inputWrapper:
                        "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                      input: "py-2 text-sm",
                    }}
                    isDisabled={!SUPPORTED_PROVIDERS.includes(selectedProvider)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    API 基础 URL (可选)
                  </label>
                  <Input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={`${selectedProvider.toUpperCase()} API 基础 URL (可选)`}
                    startContent={
                      <RiGlobalLine className="text-foreground/60" />
                    }
                    variant="bordered"
                    radius="md"
                    classNames={{
                      inputWrapper:
                        "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                      input: "py-2 text-sm",
                    }}
                    isDisabled={!SUPPORTED_PROVIDERS.includes(selectedProvider)}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    color="danger"
                    variant="shadow"
                    size="sm"
                    onPress={deleteProvider}
                    startContent={<RiDeleteBin6Line />}
                    isDisabled={isLoading}
                  >
                    删除
                  </Button>

                  <Button
                    color="primary"
                    variant="shadow"
                    size="sm"
                    onPress={saveProviderConfig}
                    startContent={isSaved ? <RiCheckLine /> : <RiSaveLine />}
                    isLoading={isLoading}
                    isDisabled={!SUPPORTED_PROVIDERS.includes(selectedProvider)}
                  >
                    {isSaved ? "已保存" : "保存配置"}
                  </Button>
                </div>
              </div>
            )}

            {/* 未选择或无提供商时显示提示 */}
            {!selectedProvider && providers.length > 0 && (
              <div className="text-center p-4">
                <p className="text-foreground/60">请选择一个AI提供商进行配置</p>
              </div>
            )}

            {providers.length === 0 && (
              <div className="text-center p-4">
                <p className="text-foreground/60">尚未配置任何AI提供商</p>
                <Button
                  color="primary"
                  variant="shadow"
                  size="sm"
                  className="mt-2"
                  startContent={<RiAddCircleLine />}
                  onPress={addNewProvider}
                >
                  添加首个提供商
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 删除确认对话框 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>删除确认</ModalHeader>
          <ModalBody>
            <p>确定要删除 {selectedProvider} 提供商配置吗？</p>
            <p className="text-xs text-danger mt-2">
              此操作将移除所有相关配置。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={closeDeleteModal}>
              取消
            </Button>
            <Button
              color="danger"
              variant="shadow"
              size="sm"
              onPress={confirmDeleteProvider}
              isLoading={isLoading}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// 模型管理组件
const ModelManager = () => {
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [models, setModels] = useState<AiModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  // 模态对话框相关状态
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const [editingModel, setEditingModel] = useState<Partial<AiModelConfig>>({
    provider: "",
    model_id: "",
    name: "",
    description: "",
    enabled: true,
  });
  const [modelToDelete, setModelToDelete] = useState<AiModelConfig | null>(
    null,
  );

  // 加载提供商列表
  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const providerList = await getAllAiProviders();
      setProviders(providerList);
      // 默认选择第一个支持的提供商
      if (providerList.length > 0 && !selectedProvider) {
        // 优先选择支持的提供商
        const supportedProvider = providerList.find((p) =>
          SUPPORTED_PROVIDERS.includes(p),
        );
        if (supportedProvider) {
          setSelectedProvider(supportedProvider);
          await loadModels(supportedProvider);
        } else {
          setSelectedProvider(providerList[0]);
          await loadModels(providerList[0]);
        }
      }
    } catch (error) {
      console.error("加载AI提供商列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载选定提供商的模型
  const loadModels = async (provider: string) => {
    setIsLoading(true);
    try {
      const modelList = await getModelsByProvider(provider);
      setModels(modelList);

      // 如果还没检查过默认模型且没有任何模型，则导入默认模型
      if (!checkedOnce && modelList.length === 0) {
        await importDefaultModels(provider, true);
        setCheckedOnce(true);
      }
    } catch (error) {
      console.error(`加载${provider}模型失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换模型启用状态
  const toggleModelEnabled = async (model: AiModelConfig) => {
    setIsLoading(true);
    try {
      // 更新模型启用状态
      await saveModelConfig({
        ...model,
        enabled: !model.enabled,
      });
      // 重新加载模型列表
      await loadModels(model.provider);
    } catch (error) {
      console.error(`更新模型状态失败:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开添加模型对话框
  const openAddModelDialog = () => {
    if (!selectedProvider) return;

    setEditingModel({
      provider: selectedProvider,
      model_id: "",
      name: "",
      description: "",
      enabled: true,
    });
    onOpen();
  };

  // 打开编辑模型对话框
  const openEditModelDialog = (model: AiModelConfig) => {
    setEditingModel({ ...model });
    onOpen();
  };

  // 保存模型
  const saveModel = async () => {
    if (
      !editingModel.name ||
      !editingModel.model_id ||
      !editingModel.provider
    ) {
      alert("请填写必要信息");
      return;
    }

    setIsLoading(true);
    try {
      await saveModelConfig(editingModel as AiModelConfig);
      onClose();
      await loadModels(editingModel.provider as string);
    } catch (error) {
      console.error("保存模型失败:", error);
      alert(`保存模型失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除模型
  const deleteModel = async (model: AiModelConfig) => {
    setModelToDelete(model);
    openDeleteModal();
  };

  // 确认删除模型
  const confirmDeleteModel = async () => {
    if (!modelToDelete || !modelToDelete.id) return;

    setIsLoading(true);
    try {
      // 使用真正的删除功能
      await deleteModelConfig(modelToDelete.id);
      closeDeleteModal();
      await loadModels(modelToDelete.provider);
    } catch (error) {
      console.error("删除模型失败:", error);
      alert(`删除模型失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加导入默认模型的函数
  const importDefaultModels = async (provider?: string, silent = false) => {
    const targetProvider = provider || selectedProvider;
    if (!targetProvider) return;

    if (
      !silent &&
      !confirm(
        `确定要导入 ${targetProvider} 的默认模型配置吗？这不会影响已有的模型配置。`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // 获取该提供商的默认模型
      const defaultModelsForProvider =
        getDefaultModelsForProvider(targetProvider);

      // 获取当前已有的模型ID列表，避免重复添加
      const existingModels = await getModelsByProvider(targetProvider);
      const existingModelIds = new Set(existingModels.map((m) => m.model_id));

      // 只导入不存在的模型
      let importedCount = 0;
      for (const model of defaultModelsForProvider) {
        if (!existingModelIds.has(model.model_id)) {
          await saveModelConfig({
            provider: model.provider,
            model_id: model.model_id,
            name: model.name,
            description: model.description,
            enabled: true, // 默认启用
          });
          importedCount++;
        }
      }

      // 重新加载模型列表
      await loadModels(targetProvider);

      if (!silent) {
        if (importedCount > 0) {
          alert(`成功导入 ${importedCount} 个默认模型`);
        } else {
          alert("没有新的默认模型可导入，所有默认模型已存在");
        }
      }
    } catch (error) {
      console.error(`导入默认模型失败:`, error);
      if (!silent) {
        alert(`导入默认模型失败: ${error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadProviders();
  }, []);

  // 当选择的提供商变化时加载模型
  useEffect(() => {
    if (selectedProvider) {
      setCheckedOnce(false); // 重置检查标志
      loadModels(selectedProvider);
    }
  }, [selectedProvider]);

  return (
    <>
      <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm mb-6">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium flex items-center gap-1.5">
              <RiRobot2Line className="text-primary" /> 模型配置
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="light"
                onPress={openAddModelDialog}
                startContent={<RiAddCircleLine />}
                isDisabled={
                  isLoading ||
                  !selectedProvider ||
                  !SUPPORTED_PROVIDERS.includes(selectedProvider || "")
                }
              >
                添加模型
              </Button>
              <Button
                size="sm"
                color="secondary"
                variant="light"
                onPress={() => importDefaultModels()}
                isDisabled={
                  isLoading ||
                  !selectedProvider ||
                  !SUPPORTED_PROVIDERS.includes(selectedProvider || "")
                }
                startContent={<RiDownload2Line />}
              >
                导入默认模型
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <div className="flex flex-col gap-4">
            {/* 提供商选择器 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">选择AI提供商</label>
              <Select
                selectedKeys={selectedProvider ? [selectedProvider] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0]?.toString();
                  if (selected) setSelectedProvider(selected);
                }}
                isDisabled={isLoading || providers.length === 0}
                placeholder={
                  providers.length === 0 ? "未配置任何提供商" : "选择提供商"
                }
                variant="bordered"
                radius="md"
                classNames={{
                  trigger:
                    "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 h-10 min-h-10",
                  value: "text-sm",
                  base: "max-w-xs",
                }}
              >
                {providers.map((provider) => {
                  const providerInfo = DEFAULT_PROVIDERS.find(
                    (p) => p.provider === provider,
                  );
                  const isSupported = SUPPORTED_PROVIDERS.includes(provider);
                  return (
                    <SelectItem
                      key={provider}
                      textValue={providerInfo?.providerName || provider}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{providerInfo?.providerName || provider}</span>
                        {!isSupported && (
                          <Chip size="sm" color="warning" variant="flat">
                            即将支持
                          </Chip>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>
            </div>

            {/* 模型列表 */}
            {selectedProvider && (
              <div className="mt-2">
                {!SUPPORTED_PROVIDERS.includes(selectedProvider) && (
                  <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-100/10 border border-warning-200 dark:border-warning-500/30 mb-4">
                    <p className="text-warning-700 dark:text-warning-500 text-sm">
                      注意：此提供商的API集成尚未完全实现，目前无法使用。我们正在积极开发中，敬请期待！
                    </p>
                  </div>
                )}

                {models.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-foreground/60">
                      此提供商没有可用模型配置，系统将使用默认配置
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-foreground/80">
                      选择要启用的模型:
                    </p>
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-default-200 dark:border-default-800"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{model.name}</div>
                          {model.description &&
                            !model.description.startsWith("[已删除]") && (
                              <div className="text-xs text-foreground/60 mt-1">
                                {model.description}
                              </div>
                            )}
                          <div className="text-xs text-foreground/40 mt-1">
                            模型ID: {model.model_id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => openEditModelDialog(model)}
                            className="text-foreground/60 hover:text-primary"
                          >
                            <RiEditLine size={16} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="danger"
                            onPress={() => deleteModel(model)}
                            className="hover:text-danger"
                          >
                            <RiDeleteBin6Line size={16} />
                          </Button>
                          <Switch
                            isSelected={model.enabled}
                            onValueChange={() => toggleModelEnabled(model)}
                            size="sm"
                            isDisabled={isLoading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => loadModels(selectedProvider)}
                    isLoading={isLoading}
                    startContent={<RiRefreshLine />}
                  >
                    刷新模型列表
                  </Button>
                </div>
              </div>
            )}

            {/* 未选择或无提供商时显示提示 */}
            {!selectedProvider && providers.length > 0 && (
              <div className="text-center p-4">
                <p className="text-foreground/60">请选择一个AI提供商</p>
              </div>
            )}

            {providers.length === 0 && (
              <div className="text-center p-4">
                <p className="text-foreground/60">
                  请先在AI提供商配置标签页添加并配置提供商
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 添加/编辑模型对话框 */}
      <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
        <ModalContent>
          <ModalHeader>{editingModel.id ? "编辑模型" : "添加模型"}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">模型名称</label>
                <Input
                  value={editingModel.name || ""}
                  onValueChange={(value) =>
                    setEditingModel({ ...editingModel, name: value })
                  }
                  placeholder="输入模型名称，例如: GPT-4"
                  variant="bordered"
                  radius="md"
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">模型ID</label>
                <Input
                  value={editingModel.model_id || ""}
                  onValueChange={(value) =>
                    setEditingModel({ ...editingModel, model_id: value })
                  }
                  placeholder="输入模型ID，例如: gpt-4"
                  variant="bordered"
                  radius="md"
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                  }}
                />
                <p className="text-xs text-foreground/60 mt-1">
                  模型ID是传递给API的标识符，必须与提供商文档一致
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">描述</label>
                <Input
                  value={editingModel.description || ""}
                  onValueChange={(value) =>
                    setEditingModel({ ...editingModel, description: value })
                  }
                  placeholder="输入模型描述（可选）"
                  variant="bordered"
                  radius="md"
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">启用</label>
                <Switch
                  isSelected={editingModel.enabled}
                  onValueChange={(value) =>
                    setEditingModel({ ...editingModel, enabled: value })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              variant="shadow"
              size="sm"
              onPress={saveModel}
              isLoading={isLoading}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 删除确认对话框 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>删除确认</ModalHeader>
          <ModalBody>
            <p>确定要删除模型 {modelToDelete?.name} 吗？</p>
            <p className="text-xs text-danger mt-2">
              此操作将从数据库中永久删除此模型。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={closeDeleteModal}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={confirmDeleteModel}
              isLoading={isLoading}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// 预设提示词管理组件
const PromptManager = () => {
  const [templates, setTemplates] = useState<AiPromptTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<
    Partial<AiPromptTemplate>
  >({
    title: "",
    content: "",
    category: "",
  });

  // 删除确认对话框状态
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  // 加载所有提示词模板
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templateList = await getAllPromptTemplates();
      setTemplates(templateList);

      // 提取所有类别
      const categorySet = new Set<string>(
        templateList.map((t) => t.category || "未分类"),
      );
      setCategories(["全部", ...Array.from(categorySet)]);
    } catch (error) {
      console.error("加载提示词模板失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存提示词模板
  const saveTemplate = async () => {
    if (!currentTemplate.title || !currentTemplate.content) {
      // TODO: 显示表单验证错误
      return;
    }

    setIsLoading(true);
    try {
      await savePromptTemplate({
        ...currentTemplate,
        category: currentTemplate.category || "未分类",
      } as AiPromptTemplate);

      // 重置表单并刷新列表
      setCurrentTemplate({
        title: "",
        content: "",
        category: "",
      });
      setIsEditing(false);
      await loadTemplates();
    } catch (error) {
      console.error("保存提示词模板失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除提示词模板
  const removeTemplate = async (id?: number) => {
    if (!id) return;

    setTemplateToDelete(id);
    openDeleteModal();
  };

  // 确认删除提示词模板
  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setIsLoading(true);
    try {
      await deletePromptTemplate(templateToDelete);
      closeDeleteModal();
      await loadTemplates();
    } catch (error) {
      console.error("删除提示词模板失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑提示词模板
  const editTemplate = (template: AiPromptTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditing(true);
  };

  // 取消编辑
  const cancelEdit = () => {
    setCurrentTemplate({
      title: "",
      content: "",
      category: "",
    });
    setIsEditing(false);
  };

  // 导入默认提示词模板
  const importDefaultTemplates = async () => {
    if (!confirm("确定要导入预设提示词模板吗？这不会影响已有的模板。")) {
      return;
    }

    setIsLoading(true);
    try {
      // 获取所有默认提示词模板
      const defaultTemplates = DEFAULT_PROMPT_TEMPLATES;

      // 获取当前已有的提示词标题列表，避免重复添加
      const existingTemplates = await getAllPromptTemplates();
      const existingTitles = new Set(existingTemplates.map((t) => t.title));

      // 只导入不存在的提示词
      let importedCount = 0;
      for (const template of defaultTemplates) {
        if (!existingTitles.has(template.title)) {
          await savePromptTemplate(template);
          importedCount++;
        }
      }

      // 重新加载提示词列表
      await loadTemplates();

      if (importedCount > 0) {
        alert(`成功导入 ${importedCount} 个预设提示词模板`);
      } else {
        alert("没有新的提示词模板可导入，所有预设模板已存在");
      }
    } catch (error) {
      console.error("导入预设提示词模板失败:", error);
      alert(`导入预设提示词模板失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadTemplates();
  }, []);

  // 筛选当前选中类别的模板
  const filteredTemplates =
    selectedCategory === "全部"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <>
      <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm mb-6">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium flex items-center gap-1.5">
              <RiBookOpenLine className="text-primary" /> 预设提示词
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="light"
                onPress={() => setIsEditing(true)}
                startContent={<RiAddCircleLine />}
                isDisabled={isLoading || isEditing}
              >
                添加提示词
              </Button>
              <Button
                size="sm"
                color="secondary"
                variant="light"
                onPress={importDefaultTemplates}
                startContent={<RiDownload2Line />}
                isDisabled={isLoading || isEditing}
              >
                导入预设提示词
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">标题</label>
                <Input
                  placeholder="输入提示词标题"
                  value={currentTemplate.title}
                  onValueChange={(value) =>
                    setCurrentTemplate((prev) => ({ ...prev, title: value }))
                  }
                  variant="bordered"
                  radius="md"
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">类别</label>
                <Input
                  placeholder="输入类别 (可选)"
                  value={currentTemplate.category || ""}
                  onValueChange={(value) =>
                    setCurrentTemplate((prev) => ({ ...prev, category: value }))
                  }
                  variant="bordered"
                  radius="md"
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
                    input: "py-2 text-sm",
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">内容</label>
                <Textarea
                  placeholder="输入提示词内容"
                  value={currentTemplate.content}
                  onValueChange={(value) =>
                    setCurrentTemplate((prev) => ({ ...prev, content: value }))
                  }
                  variant="bordered"
                  radius="md"
                  minRows={5}
                  maxRows={10}
                  isRequired
                  classNames={{
                    inputWrapper:
                      "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary",
                    input: "py-2 text-sm",
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="shadow" size="sm" onPress={cancelEdit}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={saveTemplate}
                  isLoading={isLoading}
                >
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 类别选择器 */}
              {categories.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      variant={
                        selectedCategory === category ? "solid" : "bordered"
                      }
                      color={
                        selectedCategory === category ? "primary" : "default"
                      }
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Chip>
                  ))}
                </div>
              )}

              {/* 提示词列表 */}
              {filteredTemplates.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-foreground/60">
                    {selectedCategory === "全部"
                      ? "暂无提示词模板"
                      : `${selectedCategory} 类别下暂无提示词模板`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 rounded-lg border border-default-200 dark:border-default-800"
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{template.title}</div>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => editTemplate(template)}
                          >
                            <RiEditLine size={16} />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            size="sm"
                            onPress={() => removeTemplate(template.id)}
                          >
                            <RiDeleteBin6Line size={16} />
                          </Button>
                        </div>
                      </div>
                      {template.category && (
                        <div className="mt-1">
                          <Chip size="sm" variant="flat">
                            {template.category}
                          </Chip>
                        </div>
                      )}
                      <div className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">
                        {template.content?.substring(0, 100)}
                        {(template.content?.length || 0) > 100 ? "..." : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 删除确认对话框 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>删除确认</ModalHeader>
          <ModalBody>
            <p>确定要删除这个提示词模板吗？</p>
            <p className="text-xs text-danger mt-2">此操作无法撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="shadow" size="sm" onPress={closeDeleteModal}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={confirmDeleteTemplate}
              isLoading={isLoading}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// 通用设置组件
const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    saveHistory: true, // 是否保存聊天历史
    temperature: 0.7, // 模型温度 (0.0-1.0)
    maxTokens: 2000, // 最大生成令牌数
    showModelInfo: true, // 是否在对话界面显示模型信息
    streamingResponse: true, // 是否使用流式响应
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 加载设置
  useEffect(() => {
    const loadSavedSettings = () => {
      try {
        const savedSettings = localStorage.getItem("ai_settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("加载AI设置失败:", error);
      }
    };

    loadSavedSettings();
  }, []);

  // 保存设置
  const saveSettings = () => {
    setIsLoading(true);
    try {
      localStorage.setItem("ai_settings", JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("保存AI设置失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 设置值变更处理
  const handleValueChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm mb-6">
      <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium flex items-center gap-1.5">
            <RiListSettingsLine className="text-primary" /> 通用设置
          </h2>
          <Button
            size="sm"
            color="primary"
            onPress={saveSettings}
            isLoading={isLoading}
            startContent={isSaved ? <RiCheckLine /> : <RiSaveLine />}
          >
            {isSaved ? "已保存" : "保存设置"}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <div className="space-y-3">
          <SettingItem
            label="自动保存对话历史"
            description="是否自动保存聊天记录到本地"
            control={
              <Switch
                isSelected={settings.saveHistory}
                onValueChange={(value) =>
                  handleValueChange("saveHistory", value)
                }
                size="sm"
              />
            }
          />

          <SettingItem
            label="使用流式响应"
            description="AI回答时逐字显示而非等待完整回复"
            control={
              <Switch
                isSelected={settings.streamingResponse}
                onValueChange={(value) =>
                  handleValueChange("streamingResponse", value)
                }
                size="sm"
              />
            }
          />

          <SettingItem
            label="显示模型信息"
            description="在对话界面顶部显示当前使用的模型信息"
            control={
              <Switch
                isSelected={settings.showModelInfo}
                onValueChange={(value) =>
                  handleValueChange("showModelInfo", value)
                }
                size="sm"
              />
            }
          />

          <SettingItem
            label="模型温度"
            description="较低的值使输出更确定，较高的值使输出更随机创造 (0.0-1.0)"
            control={
              <div className="w-full max-w-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={settings.temperature}
                    onChange={(e) =>
                      handleValueChange(
                        "temperature",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full"
                  />
                  <span className="text-sm font-medium w-8 text-center">
                    {settings.temperature}
                  </span>
                </div>
              </div>
            }
            fullWidth
          />

          <SettingItem
            label="最大生成令牌数"
            description="限制AI回复的最大长度 (越大消耗的API额度越多)"
            control={
              <div className="w-full max-w-xs">
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min={100}
                    max={8000}
                    step={100}
                    value={settings.maxTokens}
                    onChange={(e) =>
                      handleValueChange("maxTokens", parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-foreground/60">
                    <span>较短</span>
                    <span>{settings.maxTokens} tokens</span>
                    <span>较长</span>
                  </div>
                </div>
              </div>
            }
            fullWidth
          />
        </div>
      </CardBody>
    </Card>
  );
};

function AiTab() {
  // 使用选项卡组织不同配置区域
  return (
    <div className="space-y-6">
      <Tabs>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <RiRobot2Line />
              <span>AI 提供商配置</span>
            </div>
          }
        >
          <ProviderManager />
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <RiRobot2Line />
              <span>模型配置</span>
            </div>
          }
        >
          <ModelManager />
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <RiBookOpenLine />
              <span>预设提示词</span>
            </div>
          }
        >
          <PromptManager />
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <RiListSettingsLine />
              <span>通用设置</span>
            </div>
          }
        >
          <GeneralSettings />
        </Tab>
      </Tabs>

      <div className="flex items-center gap-2 p-3 mt-4 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 rounded-lg border border-secondary-200 dark:border-secondary-800">
        <RiInformationLine size={20} />
        <p className="text-sm">
          API密钥等敏感信息存储在本地SQLite数据库中，模型偏好和参数存储在浏览器本地存储中。
        </p>
      </div>
    </div>
  );
}

export default AiTab;
