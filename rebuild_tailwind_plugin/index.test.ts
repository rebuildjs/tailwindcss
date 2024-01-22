import { BuildContext } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
	app_ctx,
	rebuildjs_browser__build,
	browser__metafile_,
	browser__metafile__set,
	build_id__set,
	ctx_,
	cwd_,
	cwd__set,
	rebuildjs__build_id__set,
	rebuildjs__ready_,
	rebuildjs__ready__wait,
	rmemo__wait,
	rebuildjs_server__build,
	server__metafile_,
	server__metafile__set
} from 'rebuildjs/server'
import { test } from 'uvu'
import { equal, throws } from 'uvu/assert'
import { browser__metafile0, server__metafile0 } from '../_fixtures/metafiles.js'
import {
	rebuild_tailwind_plugin_,
	rebuild_tailwind_plugin__build_id$_,
	rebuild_tailwind_plugin__build_id_,
	rebuild_tailwind_plugin__build_id__set,
	rebuild_tailwind_plugin__ready$_,
	rebuild_tailwind_plugin__ready_
} from './index.js'
test.after.each(()=>{
	app_ctx.s.app.clear()
})
test('rebuild_tailwind_plugin__build_id', ()=>{
	equal(rebuild_tailwind_plugin__build_id$_(app_ctx)(), undefined)
	equal(rebuild_tailwind_plugin__build_id_(app_ctx), undefined)
	rebuild_tailwind_plugin__build_id__set(app_ctx, 'test_build_id')
	equal(rebuild_tailwind_plugin__build_id$_(app_ctx)(), 'test_build_id')
	equal(rebuild_tailwind_plugin__build_id_(app_ctx), 'test_build_id')
	// @ts-expect-error TS2345
	throws(()=>rebuild_tailwind_plugin__build_id$_(ctx_()))
	// @ts-expect-error TS2345
	throws(()=>rebuild_tailwind_plugin__build_id_(ctx_()))
})
test('rebuild_tailwind_plugin__ready', ()=>{
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), false)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), false)
	const build_id = server__metafile0.build_id!
	build_id__set(app_ctx, build_id)
	equal(rebuildjs__ready_(app_ctx), false)
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), false)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), false)
	server__metafile__set(app_ctx, server__metafile0)
	equal(rebuildjs__ready_(app_ctx), false)
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), false)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), false)
	browser__metafile__set(app_ctx, browser__metafile0)
	equal(rebuildjs__ready_(app_ctx), false)
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), false)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), false)
	rebuildjs__build_id__set(app_ctx, build_id)
	equal(rebuildjs__ready_(app_ctx), true)
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), false)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), false)
	rebuild_tailwind_plugin__build_id__set(app_ctx, build_id)
	equal(rebuildjs__ready_(app_ctx), true)
	equal(rebuild_tailwind_plugin__ready$_(app_ctx)(), true)
	equal(rebuild_tailwind_plugin__ready_(app_ctx), true)
})
test('rebuild_tailwind_plugin_', async ()=>{
	const test_dir = dirname(new URL(import.meta.url).pathname)
	const cwd = join(test_dir, '../_fixtures')
	cwd__set(app_ctx, cwd)
	await rm(join(cwd, 'dist'), { recursive: true, force: true })
	let server__build_context:BuildContext|undefined = undefined
	let browser__build_context:BuildContext|undefined = undefined
	try {
		const rebuild_tailwind_plugin = rebuild_tailwind_plugin_()
		server__build_context = await rebuildjs_server__build({ plugins: [rebuild_tailwind_plugin] })
		browser__build_context = await rebuildjs_browser__build({ plugins: [rebuild_tailwind_plugin] })
		await rebuildjs__ready__wait()
		const server__metafile = server__metafile_(app_ctx)!
		const server__output__relative_path =
			Object.keys(server__metafile.outputs)
				.find(server__output__relative_path=>
					server__metafile.outputs[server__output__relative_path].entryPoint)!
		const server__entryPoint__output =
			server__metafile.outputs[server__output__relative_path]
		const browser__metafile = browser__metafile_(app_ctx)!
		const browser__output__relative_path =
			Object.keys(browser__metafile.outputs)
				.find(browser__output__relative_path=>
					browser__metafile.outputs[browser__output__relative_path].entryPoint)!
		const browser__entryPoint__output =
			browser__metafile.outputs[browser__output__relative_path]
		equal(typeof server__entryPoint__output.cssBundle, 'string')
		equal(typeof browser__entryPoint__output.cssBundle, 'string')
		equal(typeof server__entryPoint__output.esbuild_cssBundle, 'string')
		equal(typeof browser__entryPoint__output.esbuild_cssBundle, 'string')
		equal(server__entryPoint__output.cssBundle !== server__entryPoint__output.esbuild_cssBundle, true)
		equal(browser__entryPoint__output.cssBundle !== browser__entryPoint__output.esbuild_cssBundle, true)
		await rmemo__wait(rebuild_tailwind_plugin__ready$_(app_ctx), $=>$, 2000)
		const cssBundle_text =
			await readFile(join(cwd_(app_ctx), server__entryPoint__output.cssBundle!))
				.then(buf=>buf + '')
		const esbuild_cssBundle_text =
			await readFile(join(cwd_(app_ctx), server__entryPoint__output.esbuild_cssBundle!))
				.then(buf=>buf + '')
		equal(cssBundle_text.includes('@tailwind base;'), false)
		equal(cssBundle_text.includes('@tailwind components;'), false)
		equal(cssBundle_text.includes('@tailwind utilities;'), false)
		equal(cssBundle_text.includes('.text-green-500'), true)
		equal(cssBundle_text.includes('.font-bold'), true)
		equal(cssBundle_text.includes('.text-red'), false)
		equal(cssBundle_text.includes('.font-light'), false)
		equal(esbuild_cssBundle_text.includes('@tailwind base;'), true)
		equal(esbuild_cssBundle_text.includes('@tailwind components;'), true)
		equal(esbuild_cssBundle_text.includes('@tailwind utilities;'), true)
		equal(esbuild_cssBundle_text.includes('.text-green-500'), false)
		equal(esbuild_cssBundle_text.includes('.font-bold'), false)
		equal(esbuild_cssBundle_text.includes('.text-red'), false)
		equal(esbuild_cssBundle_text.includes('.font-light'), false)
	} finally {
		await rebuildjs__ready__wait()
		server__build_context?.dispose?.()
		browser__build_context?.dispose?.()
	}
})
test.run()
