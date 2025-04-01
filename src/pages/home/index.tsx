import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  Spin,
  Button,
  Tag,
  Space,
} from "antd";
import {
  ReloadOutlined,
  DashboardOutlined,
  DesktopOutlined,
  HddOutlined,
  DatabaseOutlined,
  DownOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface CpuUsage {
  usage_percent: number;
  cores_usage: number[];
  name: string;
  frequency: number;
  cores_count: number;
}

interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  usage_percent: number;
}

interface DiskUsage {
  name: string;
  total: number;
  used: number;
  free: number;
  usage_percent: number;
  mount_point: string;
  file_system: string;
}

interface GpuUsage {
  name: string;
  utilization?: number;
  memory_total?: number;
  memory_used?: number;
  temperature?: number;
}

interface SystemUsage {
  cpu: CpuUsage;
  memory: MemoryUsage;
  disks: DiskUsage[];
  gpus: GpuUsage[];
}

interface SystemInfo {
  os_name: string;
  os_version: string;
  kernel_version: string;
  host_name: string;
  cpu_arch: string;
  system_uptime: number;
  user_name: string;
  system_name: string;
}

// 转换字节为可读的大小
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 字节";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["字节", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// 格式化系统运行时间
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  }
  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

function Home() {
  const [systemInfo, setSystemInfo] = useState<SystemUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [showCpuCores, setShowCpuCores] = useState<boolean>(false);
  const [basicInfo, setBasicInfo] = useState<SystemInfo | null>(null);

  const fetchSystemInfo = async () => {
    try {
      const data = await invoke("get_system_metrics");
      setSystemInfo(data as SystemUsage);
      setLastUpdateTime(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("获取系统信息失败:", error);
      setLoading(false);
    }
  };

  const fetchBasicInfo = async () => {
    try {
      const data = await invoke("get_system_info");
      setBasicInfo(data as SystemInfo);
    } catch (error) {
      console.error("获取基础系统信息失败:", error);
    }
  };

  useEffect(() => {
    // 初始加载
    fetchSystemInfo();
    fetchBasicInfo();

    // 每5秒刷新一次
    const interval = setInterval(fetchSystemInfo, 5000);

    // 组件卸载时清除定时器
    return () => clearInterval(interval);
  }, []);

  // 系统基本信息展示
  const renderBasicInfo = () => {
    if (!basicInfo) return <Spin />;

    return (
      <Card
        title={
          <>
            <InfoCircleOutlined /> 系统基本信息
          </>
        }
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">操作系统</div>
              <div>
                <Space>
                  <Tag color="purple">
                    {basicInfo.os_name}
                    {basicInfo.os_version}
                  </Tag>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">内核版本</div>
              <div>{basicInfo.kernel_version}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">CPU架构</div>
              <div>
                <Tag color="green">{basicInfo.cpu_arch}</Tag>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">主机名</div>
              <div>{basicInfo.host_name}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">用户名</div>
              <div>{basicInfo.user_name}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">运行时间</div>
              <div>
                <Space>
                  <ClockCircleOutlined />
                  {formatUptime(basicInfo.system_uptime)}
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // CPU使用情况展示
  const renderCpuInfo = () => {
    if (!systemInfo?.cpu) return <Spin />;

    const { cpu } = systemInfo;

    return (
      <Card
        title={
          <>
            <DashboardOutlined /> CPU使用情况
          </>
        }
        className="h-full"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>{cpu.name}</Title>
            <Text type="secondary">
              {cpu.cores_count} 核心 / {cpu.frequency} MHz
            </Text>
          </Col>

          <Col span={24}>
            <Progress
              percent={Math.round(cpu.usage_percent)}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": cpu.usage_percent > 80 ? "#f5222d" : "#87d068",
              }}
            />
            <Text>总体使用率: {cpu.usage_percent.toFixed(1)}%</Text>
          </Col>

          <Col span={24}>
            <div className="flex justify-between items-center mb-2">
              <Title level={5} className="m-0">
                各核心使用率
              </Title>
              <Button
                type="link"
                onClick={() => setShowCpuCores(!showCpuCores)}
                icon={showCpuCores ? <DownOutlined /> : <RightOutlined />}
              >
                {showCpuCores ? "收起" : "展开"}
              </Button>
            </div>

            {showCpuCores && (
              <Row gutter={[8, 8]}>
                {cpu.cores_usage.map((usage, index) => (
                  <Col key={index} span={6}>
                    <Progress
                      type="dashboard"
                      percent={Math.round(usage)}
                      width={80}
                      strokeColor={{
                        "0%": "#108ee9",
                        "100%": usage > 80 ? "#f5222d" : "#87d068",
                      }}
                      format={(percent) => `${percent}%`}
                    />
                    <div className="text-center">核心 {index + 1}</div>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Card>
    );
  };

  // 内存使用情况展示
  const renderMemoryInfo = () => {
    if (!systemInfo?.memory) return <Spin />;

    const { memory } = systemInfo;

    return (
      <Card
        title={
          <>
            <DatabaseOutlined /> 内存使用情况
          </>
        }
        className="h-full"
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Progress
              percent={Math.round(memory.usage_percent)}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": memory.usage_percent > 80 ? "#f5222d" : "#87d068",
              }}
            />
            <Text>使用率: {memory.usage_percent.toFixed(1)}%</Text>
          </Col>

          <Col span={8}>
            <Statistic title="总内存" value={formatBytes(memory.total)} />
          </Col>
          <Col span={8}>
            <Statistic
              title="已使用"
              value={formatBytes(memory.used)}
              valueStyle={{
                color: memory.usage_percent > 80 ? "#cf1322" : undefined,
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="可用内存"
              value={formatBytes(memory.free)}
              valueStyle={{ color: "#3f8600" }}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  // 磁盘使用情况展示
  const renderDiskInfo = () => {
    if (!systemInfo?.disks) return <Spin />;

    const columns = [
      {
        title: "驱动器",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "挂载点",
        dataIndex: "mount_point",
        key: "mount_point",
      },
      {
        title: "文件系统",
        dataIndex: "file_system",
        key: "file_system",
      },
      {
        title: "总容量",
        dataIndex: "total",
        key: "total",
        render: (text: number) => formatBytes(text),
      },
      {
        title: "已使用",
        dataIndex: "used",
        key: "used",
        render: (text: number) => formatBytes(text),
      },
      {
        title: "可用空间",
        dataIndex: "free",
        key: "free",
        render: (text: number) => formatBytes(text),
      },
      {
        title: "使用率",
        dataIndex: "usage_percent",
        key: "usage_percent",
        render: (text: number) => (
          <Progress
            percent={Math.round(text)}
            size="small"
            status={text > 90 ? "exception" : "normal"}
          />
        ),
      },
    ];

    return (
      <Card
        title={
          <>
            <HddOutlined /> 磁盘使用情况
          </>
        }
        className="h-full"
      >
        <Table
          dataSource={systemInfo.disks.map((disk, index) => ({
            ...disk,
            key: index,
          }))}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
        />
      </Card>
    );
  };

  // GPU使用情况展示
  const renderGpuInfo = () => {
    if (!systemInfo?.gpus || systemInfo.gpus.length === 0) {
      return (
        <Card
          title={
            <>
              <DesktopOutlined /> GPU信息
            </>
          }
          className="h-full"
        >
          <div className="text-center p-5">
            <Text type="secondary">未检测到GPU或无法获取GPU信息</Text>
          </div>
        </Card>
      );
    }

    return (
      <Card
        title={
          <>
            <DesktopOutlined /> GPU信息
          </>
        }
        className="h-full"
      >
        <Row gutter={[16, 16]}>
          {systemInfo.gpus.map((gpu, index) => (
            <Col span={24} key={index}>
              <Card type="inner" title={gpu.name}>
                <Row gutter={[16, 16]}>
                  {gpu.utilization !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="利用率"
                        value={gpu.utilization}
                        suffix="%"
                        valueStyle={{
                          color: gpu.utilization > 80 ? "#cf1322" : undefined,
                        }}
                      />
                    </Col>
                  )}

                  {gpu.temperature !== undefined && (
                    <Col span={12}>
                      <Statistic
                        title="温度"
                        value={gpu.temperature}
                        suffix="°C"
                        valueStyle={{
                          color: gpu.temperature > 80 ? "#cf1322" : undefined,
                        }}
                      />
                    </Col>
                  )}

                  {gpu.memory_total !== undefined &&
                    gpu.memory_used !== undefined && (
                      <Col span={24}>
                        <Title level={5}>显存使用情况</Title>
                        <Progress
                          percent={Math.round(
                            (gpu.memory_used / gpu.memory_total) * 100
                          )}
                          status="active"
                        />
                        <Text>
                          {formatBytes(gpu.memory_used)} /{" "}
                          {formatBytes(gpu.memory_total)}
                        </Text>
                      </Col>
                    )}
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>系统监控</Title>
        <div>
          <Text type="secondary">上次更新: {lastUpdateTime}</Text>
          <Text type="secondary" className="ml-4">
            自动每5秒刷新
          </Text>
          <ReloadOutlined
            className="ml-4 cursor-pointer"
            onClick={() => {
              fetchSystemInfo();
              fetchBasicInfo();
            }}
            spin={loading}
          />
        </div>
      </div>

      {loading && !systemInfo ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24}>{renderBasicInfo()}</Col>
            <Col xs={24} lg={12}>
              {renderCpuInfo()}
            </Col>
            <Col xs={24} lg={12}>
              {renderMemoryInfo()}
            </Col>
            <Col xs={24}>{renderDiskInfo()}</Col>
            <Col xs={24}>{renderGpuInfo()}</Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default Home;
