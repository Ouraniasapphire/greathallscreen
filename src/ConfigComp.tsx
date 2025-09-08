import { ConfigPanel } from "./components/ConfigPanel";
import { useConfig } from "./useConfig";

const Config = () => {
  const { config, updateConfig } = useConfig();

  return <ConfigPanel updateConfig={updateConfig} currentConfig={config()} />;
};
export default Config;
