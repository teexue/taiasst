/**
 * FlowGram.ai 工具栏组件
 */

import React, { useEffect, useState } from "react";
import {
  usePlaygroundTools,
  useClientContext,
} from "@flowgram.ai/free-layout-editor";
import { Button, ButtonGroup, Tooltip, Divider } from "@heroui/react";
import {
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiSaveLine,
  RiDownloadLine,
  RiUploadLine,
  RiPlayLine,
  RiStopLine,
  RiGridLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";

interface ToolsProps {
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
}

export const Tools: React.FC<ToolsProps> = ({
  onSave,
  onExport,
  onImport,
  onRun,
  onStop,
  showGrid = false,
  onToggleGrid,
  showMinimap = true,
  onToggleMinimap,
}) => {
  const { history } = useClientContext();
  const tools = usePlaygroundTools();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const disposable = history?.undoRedoService?.onChange(() => {
      setCanUndo(history.canUndo());
      setCanRedo(history.canRedo());
    });
    return () => disposable?.dispose();
  }, [history]);

  const handleRun = () => {
    setIsRunning(true);
    onRun?.();
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop?.();
  };

  return (
    <div className="flowgram-tools">
      {/* 文件操作 */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="保存工作流">
          <Button isIconOnly onClick={onSave}>
            <RiSaveLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="导出工作流">
          <Button isIconOnly onClick={onExport}>
            <RiDownloadLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="导入工作流">
          <Button isIconOnly onClick={onImport}>
            <RiUploadLine className="w-4 h-4" />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* 执行控制 */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content={isRunning ? "停止执行" : "运行工作流"}>
          <Button
            isIconOnly
            color={isRunning ? "danger" : "success"}
            onClick={isRunning ? handleStop : handleRun}
          >
            {isRunning ? (
              <RiStopLine className="w-4 h-4" />
            ) : (
              <RiPlayLine className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* 视图控制 */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="放大">
          <Button isIconOnly onClick={() => tools?.zoomin()}>
            <RiZoomInLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="缩小">
          <Button isIconOnly onClick={() => tools?.zoomout()}>
            <RiZoomOutLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="适应画布">
          <Button isIconOnly onClick={() => tools?.fitView()}>
            <RiFullscreenLine className="w-4 h-4" />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* 历史操作 */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="撤销">
          <Button
            isIconOnly
            onClick={() => history?.undo()}
            isDisabled={!canUndo}
          >
            <RiArrowGoBackLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="重做">
          <Button
            isIconOnly
            onClick={() => history?.redo()}
            isDisabled={!canRedo}
          >
            <RiArrowGoForwardLine className="w-4 h-4" />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* 显示选项 */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content={showGrid ? "隐藏网格" : "显示网格"}>
          <Button
            isIconOnly
            color={showGrid ? "primary" : "default"}
            onClick={onToggleGrid}
          >
            <RiGridLine className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content={showMinimap ? "隐藏小地图" : "显示小地图"}>
          <Button
            isIconOnly
            color={showMinimap ? "primary" : "default"}
            onClick={onToggleMinimap}
          >
            {showMinimap ? (
              <RiEyeLine className="w-4 h-4" />
            ) : (
              <RiEyeOffLine className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* 缩放显示 */}
      <div className="px-3 py-1 bg-gray-100 rounded-md">
        <span className="text-sm text-gray-600 font-mono">
          {Math.floor((tools?.zoom || 1) * 100)}%
        </span>
      </div>
    </div>
  );
};
