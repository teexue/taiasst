import { Form, Switch } from "antd";

function SystemTab() {
  return (
    <>
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 8 }} layout="horizontal">
        <Form.Item label="最小化到托盘" name="minimizeToTray">
          <Switch />
        </Form.Item>
        <Form.Item label="开机自启动" name="autoStart">
          <Switch />
        </Form.Item>
        <Form.Item label="自动更新" name="autoUpdate">
          <Switch />
        </Form.Item>
      </Form>
    </>
  );
}

export default SystemTab;
