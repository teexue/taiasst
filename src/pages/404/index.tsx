import React from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardBody } from "@heroui/react";
import { RiErrorWarningLine, RiHome2Line } from "@remixicon/react";
import { motion } from "framer-motion";

const StatusCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  message: string;
  color?: "danger" | "warning" | "default";
  action?: React.ReactNode;
}> = ({ icon, title, message, color = "default", action }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex justify-center items-center h-full p-4"
  >
    <Card className="glass-light dark:glass-dark max-w-md w-full shadow-md">
      <CardBody className="flex flex-col items-center text-center gap-3 p-6 md:p-8">
        <div className={`text-${color}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: "w-12 h-12",
          })}
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-foreground/70">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardBody>
    </Card>
  </motion.div>
);

function NotFound() {
  const navigate = useNavigate();
  return (
    <StatusCard
      icon={<RiErrorWarningLine />}
      title="404 - 页面未找到"
      message="抱歉，您访问的页面不存在或已被移动。"
      color="warning"
      action={
        <Button
          color="primary"
          variant="shadow"
          size="sm"
          startContent={<RiHome2Line size={16} />}
          onPress={() => navigate("/")}
          className="shadow-sm hover:shadow-primary/30 click-scale"
        >
          返回首页
        </Button>
      }
    />
  );
}

export default NotFound;
