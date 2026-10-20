# Trakli UI plugins

Set `TRAKLI_UI_LAYERS` to a comma-separated list of installed Nuxt layer paths before development or build. Paths are relative to the web UI checkout, or absolute.

```bash
TRAKLI_UI_LAYERS=/path/to/plugin/ui npm run dev
TRAKLI_UI_LAYERS=/path/to/plugin/ui npm run build
TRAKLI_UI_LAYERS=/path/to/plugin/ui npm run test:run
TRAKLI_UI_LAYERS=/path/to/plugin/ui npm run check:plugins
```

Without this setting, the app loads no optional plugin layers. A layer supplies its pages, translations and optional components. Keep the matching backend plugin enabled. Installing or removing a layer requires restarting development or rebuilding the app.

Backend integration descriptors insert links into the existing sidebar and settings slots. Links to local routes are hidden when the route is absent. Custom controls can still register through `useExtensionSlots().registerComponent()`.

Layer pages use the host's authentication middleware, layouts, components and API client. Keep provider return URLs on the same browser hostname as the UI to preserve login cookies.

Plugin tests live under the layer's `tests` directory. The host test runner includes tests from the configured layers and supplies its aliases and dependencies.
