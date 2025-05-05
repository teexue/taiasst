import React, { useState } from "react";
import { formatBytes, formatUptime } from "@/utils/formatters";
import { useSystemMonitor } from "@/utils/hooks/useSystemMonitor";
import {
  Button,
  Table as HeroTable,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Progress,
  CircularProgress,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  getKeyValue,
  Image,
  Link,
  Tooltip,
} from "@heroui/react";
import {
  RiComputerLine,
  RiHardDrive2Line,
  RiDatabase2Line,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiInformationLine,
  RiTimeLine,
  RiCpuLine,
  RiCheckboxCircleLine,
  RiChat1Line,
  RiBookOpenLine,
  RiHistoryLine,
  RiMessage2Line,
  RiToolsLine,
  RiTranslate2,
  RiCodeBoxLine,
  RiFileTextLine,
} from "@remixicon/react";
import { motion } from "framer-motion";

const recentChats = [
  {
    id: "1",
    title: "关于 NextUI 的讨论",
    preview: "我们讨论了 NextUI 的特性和迁移策略...",
    timestamp: new Date(Date.now() - 3600 * 1000 * 2),
  },
  {
    id: "2",
    title: "项目重构计划",
    preview: "设计文档已经初步完成，下一步是...",
    timestamp: new Date(Date.now() - 3600 * 1000 * 24),
  },
  {
    id: "3",
    title: "新功能想法",
    preview: "可以考虑增加一个在线文档搜索功能...",
    timestamp: new Date(Date.now() - 3600 * 1000 * 48),
  },
];

const tools = [
  { id: "1", name: "文本翻译", icon: RiTranslate2, path: "/tool/translate" },
  { id: "2", name: "代码生成", icon: RiCodeBoxLine, path: "/tool/codegen" },
  { id: "3", name: "文档总结", icon: RiFileTextLine, path: "/tool/summary" },
];

const formatDate = (date: Date) => {
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString();
};

function Home() {
  const [intervals] = useState<number>(1);
  const { systemUsage, basicInfo, loading, err } = useSystemMonitor(
    intervals * 1000,
  );
  const [showCpuCores, setShowCpuCores] = useState<boolean>(false);

  const MonitorCard: React.FC<{
    children: React.ReactNode;
    className?: string;
  }> = ({ children, className = "" }) => (
    <Card
      className={`glass-light dark:glass-dark hover-elevate h-full overflow-hidden shadow-sm ${className}`}
    >
      {children}
    </Card>
  );

  const renderBasicInfo = () => {
    if (loading && !basicInfo && !err)
      return (
        <div className="p-4">
          <Spinner label="加载系统信息..." />
        </div>
      );
    if (err && !basicInfo)
      return (
        <CardBody>
          <span className="text-danger">加载失败: {err}</span>
        </CardBody>
      );
    if (!basicInfo) return null;

    return (
      <MonitorCard>
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <RiInformationLine className="w-4 h-4" /> 系统信息
          </h4>
        </CardHeader>
        <CardBody className="p-3 md:p-4">
          {err && (
            <span className="text-warning text-xs mb-2 block">
              数据更新失败: {err}
            </span>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-xs">
            <div className="truncate">
              <div className="text-foreground/60 mb-0.5">操作系统</div>
              <Chip color="secondary" size="sm" variant="flat" radius="sm">
                {basicInfo.os_name || "N/A"} {basicInfo.os_version || ""}
              </Chip>
            </div>
            <div className="truncate">
              <div className="text-foreground/60 mb-0.5">CPU架构</div>
              <Chip color="success" size="sm" variant="flat" radius="sm">
                {basicInfo.cpu_arch || "N/A"}
              </Chip>
            </div>
            <div className="truncate">
              <div className="text-foreground/60 mb-0.5">主机名</div>
              <div className="font-medium">{basicInfo.host_name || "N/A"}</div>
            </div>
            <div className="truncate">
              <div className="text-foreground/60 mb-0.5">用户名</div>
              <div className="font-medium">{basicInfo.user_name || "N/A"}</div>
            </div>
            <div className="sm:col-span-2 truncate">
              <div className="text-foreground/60 mb-0.5">运行时间</div>
              <div className="flex items-center gap-1 font-medium">
                <RiTimeLine className="w-4 h-4" />
                {formatUptime(basicInfo.system_uptime)}
              </div>
            </div>
          </div>
        </CardBody>
      </MonitorCard>
    );
  };

  const renderCpuInfo = () => {
    if (loading && !systemUsage && !err)
      return (
        <div className="p-4">
          <Spinner label="加载 CPU..." />
        </div>
      );
    if (err && !systemUsage?.cpu)
      return (
        <CardBody>
          <span className="text-danger">加载失败: {err}</span>
        </CardBody>
      );
    if (!systemUsage?.cpu)
      return (
        <CardBody>
          <span className="text-foreground-500">暂无数据</span>
        </CardBody>
      );

    const { cpu } = systemUsage;

    return (
      <MonitorCard>
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3 flex justify-between items-center">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <RiCpuLine className="w-4 h-4" /> CPU
            <span className="text-foreground/60 ml-1 font-normal truncate hidden sm:inline">
              ({cpu.name || "未知CPU"})
            </span>
          </h4>
          <span className="text-xs text-foreground/60">
            {cpu.cores_count || "?"} 核
          </span>
        </CardHeader>
        <CardBody className="p-3 md:p-4 space-y-3">
          {err && (
            <span className="text-warning text-xs block">更新失败: {err}</span>
          )}
          <Progress
            aria-label="CPU总体使用率"
            size="sm"
            value={cpu.usage_percent ?? 0}
            color={(cpu.usage_percent ?? 0) > 80 ? "danger" : "success"}
            showValueLabel={true}
            formatOptions={{ style: "percent", minimumFractionDigits: 1 }}
            className="w-full"
          />

          <div className="border-t border-divider/30 pt-2">
            <div className="flex justify-between items-center mb-1">
              <h5 className="text-xs font-medium text-foreground/80">各核心</h5>
              <Button
                variant="light"
                size="sm"
                radius="full"
                isIconOnly
                onPress={() => setShowCpuCores(!showCpuCores)}
                aria-label={showCpuCores ? "收起" : "展开"}
                className="w-6 h-6 -mr-1 text-foreground/60"
              >
                {showCpuCores ? (
                  <RiArrowDownSLine size={16} />
                ) : (
                  <RiArrowRightSLine size={16} />
                )}
              </Button>
            </div>
            {showCpuCores && cpu.cores_usage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-2 gap-y-1 mt-1">
                  {cpu.cores_usage.map((usage, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-xs"
                    >
                      <CircularProgress
                        aria-label={`核心 ${index + 1}`}
                        size="sm"
                        value={usage ?? 0}
                        color={(usage ?? 0) > 80 ? "danger" : "success"}
                        showValueLabel={true}
                        strokeWidth={4}
                        classNames={{
                          svg: "w-10 h-10",
                          label: "text-[0.6rem]",
                        }}
                        formatOptions={{
                          style: "percent",
                          maximumFractionDigits: 0,
                        }}
                      />
                      <div className="mt-0.5 text-foreground/70">
                        C{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </CardBody>
      </MonitorCard>
    );
  };

  const renderMemoryInfo = () => {
    if (loading && !systemUsage && !err)
      return (
        <div className="p-4">
          <Spinner label="加载内存..." />
        </div>
      );
    if (err && !systemUsage?.memory)
      return (
        <CardBody>
          <span className="text-danger">加载失败: {err}</span>
        </CardBody>
      );
    if (!systemUsage?.memory)
      return (
        <CardBody>
          <span className="text-foreground-500">暂无数据</span>
        </CardBody>
      );

    const { memory } = systemUsage;

    return (
      <MonitorCard>
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3 flex justify-between items-center">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <RiDatabase2Line className="w-4 h-4" /> 内存
          </h4>
          <span className="text-xs text-foreground/60">
            总计: {formatBytes(memory.total)}
          </span>
        </CardHeader>
        <CardBody className="p-3 md:p-4 space-y-3">
          {err && (
            <span className="text-warning text-xs block">更新失败: {err}</span>
          )}
          <Progress
            aria-label="内存使用率"
            size="sm"
            value={memory.usage_percent ?? 0}
            color={(memory.usage_percent ?? 0) > 80 ? "danger" : "success"}
            showValueLabel={true}
            formatOptions={{ style: "percent", minimumFractionDigits: 1 }}
            className="w-full"
            label={
              <span className="text-xs text-foreground/70">
                已用: {formatBytes(memory.used)} / 可用:{" "}
                {formatBytes(memory.free)}
              </span>
            }
            classNames={{ labelWrapper: "mt-1" }}
          />
        </CardBody>
      </MonitorCard>
    );
  };

  const renderDiskInfo = () => {
    if (loading && !systemUsage && !err)
      return (
        <div className="p-4">
          <Spinner label="加载磁盘..." />
        </div>
      );
    if (err && !systemUsage?.disks)
      return (
        <CardBody>
          <span className="text-danger">加载失败: {err}</span>
        </CardBody>
      );
    if (!systemUsage?.disks || systemUsage.disks.length === 0)
      return (
        <CardBody>
          <span className="text-foreground-500">暂无磁盘信息</span>
        </CardBody>
      );

    const columns = [
      { key: "mount_point", label: "挂载点" },
      { key: "name", label: "名称" },
      { key: "total_space", label: "总空间" },
      { key: "used_space", label: "已用" },
      { key: "usage_percent", label: "使用率" },
    ];

    return (
      <MonitorCard className="lg:col-span-2">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <RiHardDrive2Line className="w-4 h-4" /> 磁盘
          </h4>
        </CardHeader>
        <CardBody className="p-0">
          {err && (
            <span className="text-warning text-xs block px-3 pt-2">
              更新失败: {err}
            </span>
          )}
          <HeroTable
            aria-label="磁盘信息表"
            removeWrapper
            isCompact
            className="text-xs"
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  className="bg-transparent font-medium text-foreground/70"
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={systemUsage.disks.map((disk, index) => ({
                ...disk,
                id: disk.mount_point || `disk-${index}`,
              }))}
              isLoading={loading}
              emptyContent={loading ? " " : "无磁盘"}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => {
                    const value = getKeyValue(item, columnKey);
                    if (
                      ["total_space", "used_space"].includes(String(columnKey))
                    ) {
                      return <TableCell>{formatBytes(value)}</TableCell>;
                    } else if (columnKey === "usage_percent") {
                      const percent = Math.round(value ?? 0);
                      const color =
                        percent > 90
                          ? "danger"
                          : percent > 70
                            ? "warning"
                            : "success";
                      return (
                        <TableCell>
                          <Progress
                            aria-label="磁盘使用率"
                            value={percent}
                            color={color}
                            size="sm"
                            showValueLabel
                            className="max-w-[80px]"
                            classNames={{ value: "text-[0.65rem]" }}
                          />
                        </TableCell>
                      );
                    } else if (columnKey === "name") {
                      return (
                        <TableCell className="truncate max-w-[150px]">
                          {value || "-"}
                        </TableCell>
                      );
                    } else if (columnKey === "mount_point") {
                      return (
                        <TableCell className="font-medium">
                          {value || "-"}
                        </TableCell>
                      );
                    }
                    return <TableCell>{value ?? "-"}</TableCell>;
                  }}
                </TableRow>
              )}
            </TableBody>
          </HeroTable>
        </CardBody>
      </MonitorCard>
    );
  };

  const renderGpuInfo = () => {
    if (loading && !systemUsage && !err)
      return (
        <div className="p-4">
          <Spinner label="加载 GPU..." />
        </div>
      );
    if (err && !systemUsage?.gpus)
      return (
        <CardBody>
          <span className="text-danger">加载失败: {err}</span>
        </CardBody>
      );
    if (!systemUsage?.gpus || systemUsage.gpus.length === 0) {
      return null;
    }

    return (
      <MonitorCard className="lg:col-span-2">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <RiComputerLine className="w-4 h-4" /> GPU
          </h4>
        </CardHeader>
        <CardBody className="p-3 md:p-4 space-y-4">
          {err && (
            <span className="text-warning text-xs block">更新失败: {err}</span>
          )}
          {systemUsage.gpus.map((gpu, index) => (
            <div
              key={gpu.name || index}
              className="border-b border-divider/30 pb-3 last:border-b-0 last:pb-0"
            >
              <h5 className="text-xs font-semibold mb-2 truncate">
                {gpu.name || `GPU ${index + 1}`}
              </h5>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {gpu.utilization !== null && (
                  <div>
                    <div className="text-foreground/60 mb-0.5">利用率</div>
                    <Chip
                      radius="sm"
                      size="sm"
                      variant="flat"
                      color={(gpu.utilization ?? 0) > 80 ? "danger" : "default"}
                    >
                      {gpu.utilization}%
                    </Chip>
                  </div>
                )}
                {gpu.temperature !== null && (
                  <div>
                    <div className="text-foreground/60 mb-0.5">温度</div>
                    <Chip
                      radius="sm"
                      size="sm"
                      variant="flat"
                      color={(gpu.temperature ?? 0) > 80 ? "danger" : "default"}
                    >
                      {gpu.temperature}°C
                    </Chip>
                  </div>
                )}
              </div>
              {gpu.memory_total !== null && gpu.memory_used !== null && (
                <div className="mt-2">
                  <div className="text-xs text-foreground/60 mb-0.5">显存</div>
                  <Progress
                    aria-label="显存使用率"
                    size="sm"
                    value={
                      ((gpu.memory_used ?? 0) / (gpu.memory_total || 1)) * 100
                    }
                    color={
                      ((gpu.memory_used ?? 0) / (gpu.memory_total || 1)) * 100 >
                      80
                        ? "danger"
                        : "success"
                    }
                    showValueLabel={true}
                    label={
                      <span className="text-[0.7rem] text-foreground/70">{`${formatBytes(gpu.memory_used)} / ${formatBytes(gpu.memory_total)}`}</span>
                    }
                    formatOptions={{
                      style: "percent",
                      minimumFractionDigits: 0,
                    }}
                    className="w-full"
                    classNames={{ labelWrapper: "mt-0.5" }}
                  />
                </div>
              )}
              {gpu.utilization === null &&
                gpu.temperature === null &&
                gpu.memory_total === null && (
                  <span className="text-foreground/50 text-xs mt-1 block">
                    无详细信息
                  </span>
                )}
            </div>
          ))}
        </CardBody>
      </MonitorCard>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass-light dark:glass-dark w-full overflow-hidden shadow-sm">
        <CardBody className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 mb-4 md:mb-0 md:mr-6">
              <motion.h1
                className="text-xl md:text-2xl font-semibold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                欢迎使用 {import.meta.env.VITE_APP_NAME}
              </motion.h1>
              <motion.p
                className="text-sm text-foreground/70 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                您的AI助手已准备就绪，可以：
              </motion.p>
              <motion.ul
                className="space-y-1.5 mb-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                <motion.li
                  className="flex items-center"
                  variants={{
                    animate: { opacity: 1, x: 0 },
                    initial: { opacity: 0, x: -15 },
                  }}
                >
                  <RiCheckboxCircleLine className="text-primary w-4 h-4 mr-2 flex-shrink-0" />
                  <span>回答问题和提供建议</span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={{
                    animate: { opacity: 1, x: 0 },
                    initial: { opacity: 0, x: -15 },
                  }}
                >
                  <RiCheckboxCircleLine className="text-primary w-4 h-4 mr-2 flex-shrink-0" />
                  <span>协助文档编写和翻译</span>
                </motion.li>
                <motion.li
                  className="flex items-center"
                  variants={{
                    animate: { opacity: 1, x: 0 },
                    initial: { opacity: 0, x: -15 },
                  }}
                >
                  <RiCheckboxCircleLine className="text-primary w-4 h-4 mr-2 flex-shrink-0" />
                  <span>支持多种语言交流</span>
                </motion.li>
              </motion.ul>
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  startContent={<RiChat1Line size={16} />}
                  className="click-scale hover-float shadow-sm hover:shadow-primary/30"
                >
                  开始对话
                </Button>
                <Button
                  variant="bordered"
                  radius="full"
                  size="sm"
                  startContent={<RiBookOpenLine size={16} />}
                  className="click-scale hover-float border-default-300/70 hover:bg-default-100/50"
                >
                  查看教程
                </Button>
              </motion.div>
            </div>
            <motion.div
              className="w-full md:w-1/3 lg:w-1/4 flex justify-center md:justify-end mt-4 md:mt-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 100,
              }}
            >
              <Image
                src="/assets/assistant_illustration.svg"
                alt="AI助手插画"
                className="object-contain max-w-[200px] md:max-w-[250px]"
                removeWrapper
              />
            </motion.div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-light dark:glass-dark hover-elevate overflow-hidden shadow-sm">
          <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3">
            <div className="flex items-center gap-1.5">
              <RiHistoryLine className="text-primary w-4 h-4" />
              <h2 className="text-sm font-medium">近期对话</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-divider/30">
              {recentChats.slice(0, 3).map((chat) => (
                <motion.li
                  key={chat.id}
                  className="hover:bg-default-100/40 dark:hover:bg-default-50/30 transition-colors duration-150"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link className="p-3 flex items-center text-foreground">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <RiMessage2Line className="text-primary w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-foreground/60 truncate">
                        {chat.preview}
                      </p>
                    </div>
                    <div className="text-tiny text-foreground/50 ml-2 flex-shrink-0">
                      {formatDate(chat.timestamp)}
                    </div>
                  </Link>
                </motion.li>
              ))}
              {recentChats.length === 0 && (
                <li className="p-4 text-center text-sm text-foreground/50">
                  暂无对话记录
                </li>
              )}
            </ul>
          </CardBody>
          {recentChats.length > 3 && (
            <CardFooter className="justify-center border-t border-divider/30 p-2">
              <Button
                variant="light"
                color="primary"
                size="sm"
                endContent={<RiArrowRightSLine size={16} />}
                className="hover:underline text-xs font-medium"
              >
                查看全部对话
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="glass-light dark:glass-dark hover-elevate overflow-hidden shadow-sm">
          <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-3">
            <div className="flex items-center gap-1.5">
              <RiToolsLine className="text-primary w-4 h-4" />
              <h2 className="text-sm font-medium">常用工具</h2>
            </div>
          </CardHeader>
          <CardBody className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Tooltip
                  key={tool.id}
                  content={tool.name}
                  placement="top"
                  delay={0}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link className="flex flex-col items-center p-3 rounded-lg hover:bg-default-100/50 dark:hover:bg-default-50/30 transition-all text-foreground">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
                        <tool.icon className="text-primary w-5 h-5" />
                      </div>
                      <span className="text-center text-xs font-medium truncate w-full">
                        {tool.name}
                      </span>
                    </Link>
                  </motion.div>
                </Tooltip>
              ))}
              {tools.length === 0 && (
                <div className="col-span-3 p-4 text-center text-sm text-foreground/50">
                  暂无可用工具
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {basicInfo && (
          <>
            <div className="md:col-span-2">{renderBasicInfo()}</div>
            {renderCpuInfo()}
            {renderMemoryInfo()}
            {renderDiskInfo()}
            {renderGpuInfo()}
          </>
        )}
        {loading && !basicInfo && (
          <div className="md:col-span-2 flex items-center justify-center p-10">
            <Spinner size="lg" label="加载系统监控..." />
          </div>
        )}
        {err && !basicInfo && (
          <Card className="md:col-span-2 glass-danger">
            <CardBody className="text-center p-5">
              <p className="font-medium mb-1">系统监控加载失败</p>
              <p className="text-xs">错误: {err}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Home;
