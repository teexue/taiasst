import { Progress } from "@heroui/react";

interface StartupScreenProps {
  progress: number;
  currentTask: string;
  isComplete: boolean;
}

export function StartupScreen({
  progress,
  currentTask,
  isComplete,
}: StartupScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-lg">
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* 应用Logo */}
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TaiASST
          </h1>
          <p className="text-lg text-foreground-500 mt-2">AI时代的工具箱</p>
        </div>

        {/* 进度条 */}
        <div className="w-80">
          <Progress
            value={progress}
            size="lg"
            color="primary"
            showValueLabel={true}
            className="w-full"
            classNames={{
              base: "max-w-none",
              track: "drop-shadow-md border border-default",
              indicator: "bg-gradient-to-r from-primary to-secondary",
              label: "tracking-wider font-medium text-default-600",
              value: "text-foreground/60",
            }}
            aria-label={`${progress}%`}
          />
        </div>

        {/* 当前任务 */}
        <div className="text-center min-h-[2rem]">
          <p className="text-sm text-foreground-600 animate-pulse">
            {currentTask}
          </p>
        </div>

        {/* 加载动画 */}
        {!isComplete && (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
