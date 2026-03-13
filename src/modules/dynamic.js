import {PLUGIN_ERROR_MESSAGE} from "../shared/error.js";

const dynamic = async () => {
  const [, , pluginName] = process.argv;

  if (!pluginName) {
    console.log(PLUGIN_ERROR_MESSAGE);
    process.exitCode = 1;
    return;
  }

  try {
    const pluginModule = await import(`./plugins/${pluginName}.js`);

    if (typeof pluginModule.run !== 'function') {
      console.log(PLUGIN_ERROR_MESSAGE);
      process.exitCode = 1;
      return;
    }

    const result = await pluginModule.run();
    console.log(result);
  } catch {
    console.log(PLUGIN_ERROR_MESSAGE);
    process.exitCode = 1;
  }
};

await dynamic();
