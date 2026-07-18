// Metro config for the pnpm monorepo (TDD Part 1 §4). Watches the workspace root
// so packages/* resolve, and lets Metro follow symlinked workspace packages.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Hierarchical lookup MUST stay enabled under pnpm. pnpm nests each package's own
// dependencies under node_modules/.pnpm/<pkg>/node_modules/ rather than hoisting them,
// so Metro has to walk up from a module's real path to resolve them. Disabling it (a
// safe optimization on npm/yarn's flat layout) breaks expo-router, whose dependencies
// @expo/metro-runtime and expo-splash-screen are only reachable that way.
config.resolver.disableHierarchicalLookup = false;

// Workspace packages are consumed as TypeScript source (packages/*/package.json point
// `exports` at src/index.ts), and that source uses NodeNext-style `.js` specifiers
// (`export * from './errors.js'` where the file is errors.ts). tsc and jest resolve those;
// Metro does not remap .js -> .ts. Retry such specifiers without the extension, falling
// back to normal resolution so genuine .js files still resolve.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  if (/^\.{1,2}\//.test(moduleName) && moduleName.endsWith('.js')) {
    try {
      return resolve(context, moduleName.slice(0, -'.js'.length), platform);
    } catch {
      // fall through to the unmodified specifier
    }
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
