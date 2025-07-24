import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Pagination,
} from "@heroui/react";
import {
  RiFlowChart,
  RiAddLine,
  RiSearchLine,
  RiPlayLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiUploadLine,
  RiTimeLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  WorkflowDefinition,
  WorkflowFilter,
  WorkflowSort,
} from "@/services/workflow/types";
import { getWorkflowManager } from "@/services/workflow/manager";
import FlowgramEditor from "@/components/flowgram";

function WorkflowCenter() {
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditorOpen,
    onOpen: onEditorOpen,
    onClose: onEditorClose,
  } = useDisclosure();

  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("workflows");

  // 创建工作流表单
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");
  const [newWorkflowCategory, setNewWorkflowCategory] = useState("general");

  const workflowManager = getWorkflowManager();

  // 加载工作流列表
  const loadWorkflows = async () => {
    try {
      setLoading(true);

      const filter: WorkflowFilter = {};
      if (statusFilter !== "all") {
        filter.status = [statusFilter as any];
      }
      if (categoryFilter !== "all") {
        filter.category = [categoryFilter];
      }

      const sort: WorkflowSort = { by: "updatedAt", order: "desc" };

      const response = await workflowManager.getWorkflows(
        filter,
        sort,
        currentPage,
        12,
      );
      setWorkflows(response.workflows);
      setTotalPages(Math.ceil(response.total / 12));
    } catch (error) {
      console.error("加载工作流失败:", error);
      toast.error("加载工作流失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [currentPage, statusFilter, categoryFilter]);

  // 创建工作流
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error("请输入工作流名称");
      return;
    }

    try {
      const workflow = await workflowManager.createWorkflow(
        newWorkflowName.trim(),
        newWorkflowDescription.trim() || undefined,
        newWorkflowCategory,
      );

      toast.success("工作流创建成功");
      setNewWorkflowName("");
      setNewWorkflowDescription("");
      setNewWorkflowCategory("general");
      onCreateClose();

      // 打开编辑器
      setSelectedWorkflow(workflow);
      onEditorOpen();
    } catch (error) {
      console.error("创建工作流失败:", error);
      toast.error("创建工作流失败");
    }
  };

  // 编辑工作流
  const handleEditWorkflow = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow);
    onEditorOpen();
  };

  // 执行工作流
  const handleExecuteWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      await workflowManager.executeWorkflow(workflow.id);
      toast.success("工作流开始执行");
      // 可以跳转到执行详情页面
    } catch (error) {
      console.error("执行工作流失败:", error);
      toast.error("执行工作流失败");
    }
  };

  // 删除工作流
  const handleDeleteWorkflow = async (workflow: WorkflowDefinition) => {
    if (!confirm(`确定要删除工作流"${workflow.name}"吗？`)) {
      return;
    }

    try {
      await workflowManager.deleteWorkflow(workflow.id);
      toast.success("工作流已删除");
      loadWorkflows();
    } catch (error) {
      console.error("删除工作流失败:", error);
      toast.error("删除工作流失败");
    }
  };

  // 渲染工作流卡片
  const renderWorkflowCard = (workflow: WorkflowDefinition) => (
    <motion.div
      key={workflow.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {workflow.name}
              </h3>
              <p className="text-sm text-foreground/60 line-clamp-2 mt-1">
                {workflow.description || "暂无描述"}
              </p>
            </div>
            <Chip
              size="sm"
              variant="flat"
              color={
                workflow.status === "active"
                  ? "success"
                  : workflow.status === "draft"
                    ? "warning"
                    : workflow.status === "paused"
                      ? "default"
                      : "danger"
              }
            >
              {workflow.status === "active"
                ? "活跃"
                : workflow.status === "draft"
                  ? "草稿"
                  : workflow.status === "paused"
                    ? "暂停"
                    : "错误"}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-foreground/60">
              <span>节点: {workflow.nodes.length}</span>
              <span>连接: {workflow.connections.length}</span>
              <span>版本: {workflow.version}</span>
            </div>

            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat">
                {workflow.category}
              </Chip>
              {workflow.tags.map((tag) => (
                <Chip key={tag} size="sm" variant="flat" color="primary">
                  {tag}
                </Chip>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-foreground/40">
                {new Date(workflow.updatedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => handleEditWorkflow(workflow)}
                >
                  <RiEditLine />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={() => handleExecuteWorkflow(workflow)}
                  isDisabled={workflow.status !== "active"}
                >
                  <RiPlayLine />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={() => handleDeleteWorkflow(workflow)}
                >
                  <RiDeleteBinLine />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );

  if (isEditorOpen && selectedWorkflow) {
    return (
      <div className="flex flex-col h-full">
        {/* 编辑器标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-divider/20 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">工作流编辑器</h2>
            <span className="text-sm text-foreground/60">
              - {selectedWorkflow.name}
            </span>
          </div>
          <Button variant="flat" onPress={onEditorClose} size="sm">
            返回列表
          </Button>
        </div>

        {/* 编辑器内容 */}
        <div className="flex-1 relative">
          <FlowgramEditor />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiFlowChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">工作流中心</h1>
            <p className="text-foreground/70 text-sm mt-1">
              创建和管理自动化工作流程
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="flat" startContent={<RiUploadLine />}>
            导入
          </Button>
          <Button
            color="primary"
            startContent={<RiAddLine />}
            onPress={onCreateOpen}
          >
            新建工作流
          </Button>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
      >
        <Tab key="workflows" title="我的工作流">
          {/* 过滤器 */}
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="搜索工作流..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<RiSearchLine />}
              className="max-w-xs"
              size="sm"
            />

            <Select
              placeholder="状态"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys) =>
                setStatusFilter(Array.from(keys)[0] as string)
              }
              className="max-w-32"
              size="sm"
            >
              <SelectItem key="all">全部</SelectItem>
              <SelectItem key="active">活跃</SelectItem>
              <SelectItem key="draft">草稿</SelectItem>
              <SelectItem key="paused">暂停</SelectItem>
            </Select>

            <Select
              placeholder="分类"
              selectedKeys={categoryFilter ? [categoryFilter] : []}
              onSelectionChange={(keys) =>
                setCategoryFilter(Array.from(keys)[0] as string)
              }
              className="max-w-32"
              size="sm"
            >
              <SelectItem key="all">全部</SelectItem>
              <SelectItem key="general">通用</SelectItem>
              <SelectItem key="automation">自动化</SelectItem>
              <SelectItem key="data">数据处理</SelectItem>
              <SelectItem key="ai">AI处理</SelectItem>
            </Select>
          </div>

          {/* 工作流网格 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-48">
                  <CardBody className="animate-pulse">
                    <div className="space-y-3">
                      <div className="h-4 bg-default-200 rounded w-3/4"></div>
                      <div className="h-3 bg-default-200 rounded w-full"></div>
                      <div className="h-3 bg-default-200 rounded w-2/3"></div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : workflows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {workflows.map(renderWorkflowCard)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <RiFlowChart className="w-16 h-16 mx-auto text-default-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                还没有工作流
              </h3>
              <p className="text-foreground/60 mb-4">
                创建您的第一个工作流来开始自动化任务
              </p>
              <Button
                color="primary"
                startContent={<RiAddLine />}
                onPress={onCreateOpen}
              >
                创建工作流
              </Button>
            </div>
          )}
        </Tab>

        <Tab key="templates" title="模板市场">
          <div className="text-center py-12">
            <RiDownloadLine className="w-16 h-16 mx-auto text-default-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              模板市场
            </h3>
            <p className="text-foreground/60">即将推出预设的工作流模板</p>
          </div>
        </Tab>

        <Tab key="executions" title="执行历史">
          <div className="text-center py-12">
            <RiTimeLine className="w-16 h-16 mx-auto text-default-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              执行历史
            </h3>
            <p className="text-foreground/60">查看工作流的执行记录和结果</p>
          </div>
        </Tab>
      </Tabs>

      {/* 创建工作流模态框 */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>创建新工作流</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="工作流名称"
                placeholder="输入工作流名称"
                value={newWorkflowName}
                onValueChange={setNewWorkflowName}
                isRequired
              />

              <Input
                label="描述"
                placeholder="输入工作流描述（可选）"
                value={newWorkflowDescription}
                onValueChange={setNewWorkflowDescription}
              />

              <Select
                label="分类"
                selectedKeys={[newWorkflowCategory]}
                onSelectionChange={(keys) =>
                  setNewWorkflowCategory(Array.from(keys)[0] as string)
                }
              >
                <SelectItem key="general">通用</SelectItem>
                <SelectItem key="automation">自动化</SelectItem>
                <SelectItem key="data">数据处理</SelectItem>
                <SelectItem key="ai">AI处理</SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCreateClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleCreateWorkflow}>
              创建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default WorkflowCenter;
