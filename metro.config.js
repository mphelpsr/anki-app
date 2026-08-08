const { getDefaultConfig } = require('expo/metro-config');

// expo-sqlite usa um worker + WebAssembly (wa-sqlite) na plataforma web;
// isso exige registrar `.wasm` como asset e habilitar isolamento de
// origem cross-origin (COOP/COEP) para o worker funcionar no navegador.
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    return middleware(req, res, next);
  };
};

module.exports = config;
