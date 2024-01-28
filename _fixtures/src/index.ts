import { is_entry_file_ } from 'ctx-core/fs'
import { rebuildjs_browser__build, rebuildjs_server__build } from 'rebuildjs/server'
import { rebuild_tailwind_plugin_ } from '../../rebuild_tailwind_plugin/index.js'
if (is_entry_file_(import.meta.url, process.argv[1])) {
	const rebuild_tailwind_plugin = rebuild_tailwind_plugin_()
	await rebuildjs_server__build({ plugins: [rebuild_tailwind_plugin] })
	await rebuildjs_browser__build({ plugins: [rebuild_tailwind_plugin] })
}
