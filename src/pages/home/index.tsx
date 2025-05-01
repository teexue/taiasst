import { useState } from "react";
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
  InputNumber,
} from "antd";
import {
  DashboardOutlined,
  DesktopOutlined,
  HddOutlined,
  DatabaseOutlined,
  DownOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { formatBytes, formatUptime } from "@/utils/formatters";
import { useSystemMonitor } from "@/utils/hooks/useSystemMonitor";

const { Title, Text } = Typography;

function Home() {
  const [intervals, setIntervals] = useState<number>(5);
  const { systemUsage, basicInfo, loading, lastUpdateTime, err } =
    useSystemMonitor(intervals * 1000);
  const [showCpuCores, setShowCpuCores] = useState<boolean>(false);

  const renderBasicInfo = () => {
    if (loading && !basicInfo && !err) return <Spin />;
    if (err && !basicInfo)
      return (
        <Card title="系统基本信息">
          <Text type="danger">加载失败: {err}</Text>
        </Card>
      );
    if (!basicInfo) return null;

    return (
      <Card
        title={
          <>
            <InfoCircleOutlined /> 系统基本信息
          </>
        }
      >
        {err && (
          <Text type="warning" className="mb-2 block">
            数据更新失败: {err}
          </Text>
        )}
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">操作系统</div>
              <div>
                <Space>
                  <Tag color="purple">
                    {basicInfo.os_name || "N/A"} {basicInfo.os_version || ""}
                  </Tag>
                </Space>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">CPU架构</div>
              <div>
                <Tag color="green">{basicInfo.cpu_arch || "N/A"}</Tag>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">主机名</div>
              <div>{basicInfo.host_name || "N/A"}</div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="py-2">
              <div className="text-gray-500 text-sm mb-1">用户名</div>
              <div>{basicInfo.user_name || "N/A"}</div>
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

  const renderCpuInfo = () => {
    if (loading && !systemUsage && !err) return <Spin />;
    if (err && !systemUsage?.cpu)
      return <Text type="danger">加载CPU信息失败: {err}</Text>;
    if (!systemUsage?.cpu)
      return (
        <Card title="CPU使用情况" className="h-full">
          <Text type="secondary">暂无数据</Text>
        </Card>
      );

    const { cpu } = systemUsage;

    return (
      <Card
        title={
          <>
            <DashboardOutlined /> CPU使用情况
          </>
        }
        className="h-full"
      >
        {err && (
          <Text type="warning" className="mb-2 block">
            数据更新失败: {err}
          </Text>
        )}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>{cpu.name || "未知CPU"}</Title>
            <Text type="secondary">
              {cpu.cores_count || "?"} 核心{" "}
              {cpu.frequency ? `/ ${cpu.frequency} MHz` : ""}
            </Text>
          </Col>

          <Col span={24}>
            <Progress
              percent={Math.round(cpu.usage_percent ?? 0)}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%": (cpu.usage_percent ?? 0) > 80 ? "#f5222d" : "#87d068",
              }}
            />
            <Text>总体使用率: {(cpu.usage_percent ?? 0).toFixed(1)}%</Text>
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

            {showCpuCores && cpu.cores_usage && (
              <Row gutter={[8, 8]}>
                {cpu.cores_usage.map((usage, index) => (
                  <Col key={index} span={6}>
                    <Progress
                      type="dashboard"
                      percent={Math.round(usage ?? 0)}
                      width={80}
                      strokeColor={{
                        "0%": "#108ee9",
                        "100%": (usage ?? 0) > 80 ? "#f5222d" : "#87d068",
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

  const renderMemoryInfo = () => {
    if (loading && !systemUsage && !err) return <Spin />;
    if (err && !systemUsage?.memory)
      return <Text type="danger">加载内存信息失败: {err}</Text>;
    if (!systemUsage?.memory)
      return (
        <Card title="内存使用情况" className="h-full">
          <Text type="secondary">暂无数据</Text>
        </Card>
      );

    const { memory } = systemUsage;

    return (
      <Card
        title={
          <>
            <DatabaseOutlined /> 内存使用情况
          </>
        }
        className="h-full"
      >
        {err && (
          <Text type="warning" className="mb-2 block">
            数据更新失败: {err}
          </Text>
        )}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Progress
              percent={Math.round(memory.usage_percent ?? 0)}
              status="active"
              strokeColor={{
                "0%": "#108ee9",
                "100%":
                  (memory.usage_percent ?? 0) > 80 ? "#f5222d" : "#87d068",
              }}
            />
            <Text>使用率: {(memory.usage_percent ?? 0).toFixed(1)}%</Text>
          </Col>

          <Col span={8}>
            <Statistic title="总内存" value={formatBytes(memory.total)} />
          </Col>
          <Col span={8}>
            <Statistic
              title="已使用"
              value={formatBytes(memory.used)}
              valueStyle={{
                color: (memory.usage_percent ?? 0) > 80 ? "#cf1322" : undefined,
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

  const renderDiskInfo = () => {
    if (loading && !systemUsage && !err) return <Spin />;
    if (err && !systemUsage?.disks)
      return <Text type="danger">加载磁盘信息失败: {err}</Text>;
    if (!systemUsage?.disks || systemUsage.disks.length === 0)
      return (
        <Card title="磁盘使用情况" className="h-full">
          <Text type="secondary">暂无数据</Text>
        </Card>
      );

    const columns = [
      // {
      //   title: "驱动器",
      //   dataIndex: "name",
      //   key: "name",
      //   render: (text: string) => text || "未知驱动器",
      // },
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
            percent={Math.round(text ?? 0)}
            size="small"
            status={(text ?? 0) > 90 ? "exception" : "normal"}
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
        {err && (
          <Text type="warning" className="mb-2 block">
            数据更新失败: {err}
          </Text>
        )}
        <Table
          dataSource={systemUsage.disks.map((disk, index) => ({
            ...disk,
            key: disk.mount_point || index,
          }))}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record.key}
        />
      </Card>
    );
  };

  const renderGpuInfo = () => {
    if (loading && !systemUsage && !err) return <Spin />;
    if (err && !systemUsage?.gpus)
      return <Text type="danger">加载GPU信息失败: {err}</Text>;
    if (!systemUsage?.gpus || systemUsage.gpus.length === 0) {
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
        {err && (
          <Text type="warning" className="mb-2 block">
            数据更新失败: {err}
          </Text>
        )}
        <Row gutter={[16, 16]}>
          {systemUsage.gpus.map((gpu, index) => (
            <Col span={24} key={gpu.name || index}>
              <Card type="inner" title={gpu.name || `GPU ${index + 1}`}>
                <Row gutter={[16, 16]}>
                  {gpu.utilization !== null && (
                    <Col span={12}>
                      <Statistic
                        title="利用率"
                        value={gpu.utilization}
                        suffix="%"
                        valueStyle={{
                          color:
                            (gpu.utilization ?? 0) > 80 ? "#cf1322" : undefined,
                        }}
                      />
                    </Col>
                  )}

                  {gpu.temperature !== null && (
                    <Col span={12}>
                      <Statistic
                        title="温度"
                        value={gpu.temperature}
                        suffix="°C"
                        valueStyle={{
                          color:
                            (gpu.temperature ?? 0) > 80 ? "#cf1322" : undefined,
                        }}
                      />
                    </Col>
                  )}

                  {gpu.memory_total !== null && gpu.memory_used !== null && (
                    <Col span={24}>
                      <Title level={5}>显存使用情况</Title>
                      <Progress
                        percent={Math.round(
                          ((gpu.memory_used ?? 0) / (gpu.memory_total || 1)) *
                            100,
                        )}
                        status="active"
                      />
                      <Text>
                        {formatBytes(gpu.memory_used)} /{" "}
                        {formatBytes(gpu.memory_total)}
                      </Text>
                    </Col>
                  )}
                  {gpu.utilization === null &&
                    gpu.temperature === null &&
                    gpu.memory_total === null && (
                      <Col span={24}>
                        <Text type="secondary">无法获取此GPU的详细信息。</Text>
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
          <Text type="secondary">上次更新: {lastUpdateTime || "-"}</Text>
          <Text type="secondary" className="ml-4">
            自动每
            <InputNumber
              size="small"
              value={intervals}
              onChange={(value) => setIntervals(value ?? 5)}
              min={1}
              max={60}
              step={1}
              style={{ width: 45 }}
              variant="borderless"
            />
            秒刷新
          </Text>
        </div>
      </div>

      {loading && !systemUsage && !basicInfo && !err && (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      )}

      {err && !systemUsage && !basicInfo && (
        <Card title="错误" className="mb-4">
          <Text type="danger">加载系统信息时出错: {err}</Text>
        </Card>
      )}

      {(!loading || systemUsage || basicInfo) &&
        !(err && !systemUsage && !basicInfo) && (
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
