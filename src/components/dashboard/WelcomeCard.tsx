import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { motion } from "framer-motion";
import {
  RiRocketLine,
  RiLockLine,
  RiFlowChart,
  RiRobot2Line,
  RiPuzzle2Line,
  RiArrowRightLine,
} from "react-icons/ri";
import { useNavigate } from "react-router";

interface WelcomeCardProps {
  userName?: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: RiLockLine,
      title: "密码管理",
      description: "安全存储和管理您的密码",
      color: "blue",
      path: "/passwords",
    },
    {
      icon: RiFlowChart,
      title: "工作流自动化",
      description: "创建和管理自动化工作流程",
      color: "green",
      path: "/workflow",
    },
    {
      icon: RiRobot2Line,
      title: "AI助手",
      description: "智能对话和任务处理",
      color: "purple",
      path: "/ai",
    },
    {
      icon: RiPuzzle2Line,
      title: "插件系统",
      description: "扩展应用功能",
      color: "orange",
      path: "/plugins",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-0 shadow-xl">
        <CardBody className="p-8">
          {/* 欢迎标题 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            >
              <RiRocketLine className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-3"
            >
              欢迎使用 TaiASST
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              您的智能助手和自动化平台
            </motion.p>
          </div>

          {/* 功能特性 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200"
                  isPressable
                  onPress={() => navigate(feature.path)}
                >
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-${feature.color}-100 rounded-xl`}>
                        <feature.icon
                          className={`w-6 h-6 text-${feature.color}-600`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <span>开始使用</span>
                          <RiArrowRightLine className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 快速开始 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Chip color="success" variant="flat">
                🔒 安全可靠
              </Chip>
              <Chip color="primary" variant="flat">
                🚀 高效便捷
              </Chip>
              <Chip color="secondary" variant="flat">
                🤖 智能助手
              </Chip>
              <Chip color="warning" variant="flat">
                🔧 可扩展
              </Chip>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                color="primary"
                size="lg"
                startContent={<RiLockLine className="w-5 h-5" />}
                onPress={() => navigate("/passwords")}
                className="font-medium"
              >
                管理密码
              </Button>
              <Button
                color="success"
                variant="bordered"
                size="lg"
                startContent={<RiFlowChart className="w-5 h-5" />}
                onPress={() => navigate("/workflow")}
                className="font-medium"
              >
                创建工作流
              </Button>
              <Button
                color="secondary"
                variant="bordered"
                size="lg"
                startContent={<RiRobot2Line className="w-5 h-5" />}
                onPress={() => navigate("/ai")}
                className="font-medium"
              >
                AI对话
              </Button>
            </div>
          </motion.div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">
                💡 提示：您可以通过左侧菜单访问所有功能
              </p>
              <p className="text-gray-400 text-xs">
                如需帮助，请访问设置页面查看使用指南
              </p>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
};
