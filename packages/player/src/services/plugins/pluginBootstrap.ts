import { mediaEngine } from '../MediaEngine';

class PluginBootstrap {
  async init() {
    console.log('Neurid Native Services initialized successfully.');
    // Direct connector initialization happens via MediaEngine
    return mediaEngine;
  }
}

export const pluginBootstrap = new PluginBootstrap();
