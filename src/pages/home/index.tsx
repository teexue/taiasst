import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Skeleton,
  Progress,
  Avatar,
} from "@heroui/react";
import {
  RiDashboard3Line,
  RiLockLine,
  RiFlowChart,
  RiRobot2Line,
  RiPuzzle2Line,
  RiShieldLine,
  RiSettings4Line,
  RiComputerLine,
  RiTimeLine,
  RiArrowRightLine,
  RiAddLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useSystemMonitor } from "@/utils/hooks/useSystemMonitor";
import {
  getDashboardStats,
  getRecentActivities,
  DashboardStats,
  RecentActivity,
} from "@/services/dashboard/stats";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";

function Home() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const {
    systemUsage,
    basicInfo,
    loading: systemLoading,
  } = useSystemMonitor(10000); // 10秒刷新

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(false);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 加载统计数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(),
          getRecentActivities(8),
        ]);
        setStats(statsData);
        setActivities(activitiesData);

        // 检查是否有实际数据，如果没有则显示欢迎页面
        const hasData =
          statsData.passwords.total > 0 ||
          statsData.workflows.total > 0 ||
          statsData.ai.totalConversations > 0 ||
          statsData.plugins.total > 0;
        setShowWelcome(!hasData);
      } catch (error) {
        console.error("加载首页数据失败:", error);
        setShowWelcome(true); // 加载失败时显示欢迎页面
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiDashboard3Line className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}，欢迎使用 TaiASST
            </h1>
            <p className="text-foreground/70 text-sm mt-1">
              {formatDate(currentTime)} · {formatTime(currentTime)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 rounded mb-2" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
            <RiDashboard3Line className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}，欢迎使用 TaiASST
            </h1>
            <p className="text-foreground/70 text-sm mt-1">
              {formatDate(currentTime)} · {formatTime(currentTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Chip
            color={authState.hasPassword ? "success" : "warning"}
            variant="flat"
            startContent={<RiShieldLine className="w-3 h-3" />}
          >
            {authState.hasPassword ? "已保护" : "未设置密码"}
          </Chip>
          <Button
            color="primary"
            variant="flat"
            startContent={<RiSettings4Line className="w-4 h-4" />}
            onPress={() => navigate("/settings")}
          >
            设置
          </Button>
        </div>
      </motion.div>

      {/* 显示欢迎卡片或快速操作 */}
      {showWelcome ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <WelcomeCard />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200"
            isPressable
            onPress={() => navigate("/passwords")}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RiLockLine className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">密码管理</h3>
                  <p className="text-xs text-gray-600">
                    {stats?.passwords.total || 0} 个密码
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200"
            isPressable
            onPress={() => navigate("/workflow")}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <RiFlowChart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">工作流</h3>
                  <p className="text-xs text-gray-600">
                    {stats?.workflows.total || 0} 个流程
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-purple-200"
            isPressable
            onPress={() => navigate("/ai")}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <RiRobot2Line className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI助手</h3>
                  <p className="text-xs text-gray-600">
                    {stats?.ai.totalConversations || 0} 个对话
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-orange-200"
            isPressable
            onPress={() => navigate("/plugins")}
          >
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <RiPuzzle2Line className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">插件</h3>
                  <p className="text-xs text-gray-600">
                    {stats?.plugins.total || 0} 个插件
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* 主要内容区域 - 只在非欢迎模式下显示 */}
      {!showWelcome && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：系统状态和统计 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 系统监控 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <RiComputerLine className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold">系统状态</h3>
                  </div>
                  <Chip size="sm" color="success" variant="flat">
                    运行中
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-2">
                {systemLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          CPU 使用率
                        </span>
                        <span className="text-sm font-medium">
                          {systemUsage?.cpu.usage_percent.toFixed(1) || "0.0"}%
                        </span>
                      </div>
                      <Progress
                        value={systemUsage?.cpu.usage_percent || 0}
                        color={
                          (systemUsage?.cpu.usage_percent || 0) > 80
                            ? "danger"
                            : (systemUsage?.cpu.usage_percent || 0) > 60
                              ? "warning"
                              : "success"
                        }
                        size="sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          内存使用率
                        </span>
                        <span className="text-sm font-medium">
                          {systemUsage
                            ? (
                                (systemUsage.memory.used /
                                  systemUsage.memory.total) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          systemUsage
                            ? (systemUsage.memory.used /
                                systemUsage.memory.total) *
                              100
                            : 0
                        }
                        color={
                          systemUsage &&
                          (systemUsage.memory.used / systemUsage.memory.total) *
                            100 >
                            80
                            ? "danger"
                            : systemUsage &&
                                (systemUsage.memory.used /
                                  systemUsage.memory.total) *
                                  100 >
                                  60
                              ? "warning"
                              : "success"
                        }
                        size="sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">系统信息</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          操作系统: {basicInfo?.os_name || "Unknown"}{" "}
                          {basicInfo?.os_version || ""}
                        </p>
                        <p>处理器: {systemUsage?.cpu.name || "Unknown"}</p>
                        <p>
                          内存:{" "}
                          {systemUsage
                            ? `${(systemUsage.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / ${(systemUsage.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 功能统计 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RiDashboard3Line className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">功能统计</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-2">
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="text-center">
                        <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                        <Skeleton className="h-4 w-16 rounded mx-auto mb-1" />
                        <Skeleton className="h-3 w-12 rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RiLockLine className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {stats?.passwords.total || 0}
                      </p>
                      <p className="text-xs text-gray-600">密码条目</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RiFlowChart className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {stats?.workflows.total || 0}
                      </p>
                      <p className="text-xs text-gray-600">工作流</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RiRobot2Line className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {stats?.ai.totalConversations || 0}
                      </p>
                      <p className="text-xs text-gray-600">AI对话</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RiPuzzle2Line className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="text-lg font-bold text-orange-600">
                        {stats?.plugins.total || 0}
                      </p>
                      <p className="text-xs text-gray-600">插件</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* 右侧：最近活动和安全状态 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            {/* 安全状态 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RiShieldLine className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">安全状态</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-2">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">应用密码</span>
                      <Chip
                        size="sm"
                        color={
                          stats?.security.hasPassword ? "success" : "warning"
                        }
                        variant="flat"
                      >
                        {stats?.security.hasPassword ? "已设置" : "未设置"}
                      </Chip>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">自动锁定</span>
                      <Chip
                        size="sm"
                        color={
                          stats?.security.autoLockEnabled
                            ? "success"
                            : "default"
                        }
                        variant="flat"
                      >
                        {stats?.security.autoLockEnabled ? "已启用" : "已禁用"}
                      </Chip>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">失败尝试</span>
                      <Chip
                        size="sm"
                        color={
                          stats?.security.failedAttempts === 0
                            ? "success"
                            : "warning"
                        }
                        variant="flat"
                      >
                        {stats?.security.failedAttempts || 0} 次
                      </Chip>
                    </div>

                    {stats?.security.lastAuthTime && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          上次认证:{" "}
                          {new Date(stats.security.lastAuthTime).toLocaleString(
                            "zh-CN",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <RiTimeLine className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold">最近活动</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    endContent={<RiArrowRightLine className="w-3 h-3" />}
                  >
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-2">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-3/4 rounded mb-1" />
                          <Skeleton className="h-2 w-1/2 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          size="sm"
                          className={`bg-${activity.color}-100`}
                          fallback={
                            <div className={`text-${activity.color}-600`}>
                              {activity.type === "password" && (
                                <RiLockLine className="w-3 h-3" />
                              )}
                              {activity.type === "workflow" && (
                                <RiFlowChart className="w-3 h-3" />
                              )}
                              {activity.type === "ai" && (
                                <RiRobot2Line className="w-3 h-3" />
                              )}
                              {activity.type === "plugin" && (
                                <RiPuzzle2Line className="w-3 h-3" />
                              )}
                              {activity.type === "security" && (
                                <RiShieldLine className="w-3 h-3" />
                              )}
                              {activity.type === "system" && (
                                <RiComputerLine className="w-3 h-3" />
                              )}
                            </div>
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString(
                              "zh-CN",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <RiTimeLine className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">暂无最近活动</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 快速创建 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <RiAddLine className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">快速创建</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-2">
                <div className="space-y-2">
                  <Button
                    variant="flat"
                    color="primary"
                    className="w-full justify-start"
                    startContent={<RiLockLine className="w-4 h-4" />}
                    onPress={() => navigate("/passwords")}
                  >
                    新建密码
                  </Button>
                  <Button
                    variant="flat"
                    color="success"
                    className="w-full justify-start"
                    startContent={<RiFlowChart className="w-4 h-4" />}
                    onPress={() => navigate("/workflow")}
                  >
                    新建工作流
                  </Button>
                  <Button
                    variant="flat"
                    color="secondary"
                    className="w-full justify-start"
                    startContent={<RiRobot2Line className="w-4 h-4" />}
                    onPress={() => navigate("/ai")}
                  >
                    新建对话
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Home;
