/**
 * FlowGram.ai 基础节点渲染器
 */

import React from "react";
import {
  WorkflowNodeRenderer,
  useNodeRender,
} from "@flowgram.ai/free-layout-editor";

export const BaseNode: React.FC = () => {
  const { form, node } = useNodeRender();

  return (
    <WorkflowNodeRenderer
      className="flowgram-base-node"
      node={node}
      portPrimaryColor="#3b82f6"
      portSecondaryColor="#3b82f699"
      portErrorColor="#ef4444"
      portBackgroundColor="#ffffff"
    >
      {form?.render()}
    </WorkflowNodeRenderer>
  );
};
