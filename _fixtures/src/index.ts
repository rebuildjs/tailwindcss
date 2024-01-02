import { is_entry_file_ } from 'ctx-core/fs'
import { browser__build, server__build } from 'rebuildjs'
import { rebuild_tailwind_plugin_ } from '../../rebuild_tailwind_plugin/index.js'
is_entry_file_(import.meta.url, process.argv[1])
	.then(async is_entry_file=>{
		if (is_entry_file) {
			const rebuild_tailwind_plugin = rebuild_tailwind_plugin_()
			await server__build({ plugins: [rebuild_tailwind_plugin] })
			await browser__build({ plugins: [rebuild_tailwind_plugin] })
		}
	})
