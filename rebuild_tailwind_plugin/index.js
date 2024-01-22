import { file_exists_, file_exists__waitfor } from 'ctx-core/fs'
import { be, be_memo_pair_, be_sig_triple_, Cancel, memo_, nullish__none_, run, sleep, tup } from 'ctx-core/rmemo'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import postcss from 'postcss'
import {
	app_ctx,
	browser__output_,
	build_id_,
	cwd_,
	rebuildjs__build_id_,
	rebuildjs__ready_,
	server__output_,
	server__output__relative_path_M_middleware_ctx_
} from 'rebuildjs/server'
import tailwind from 'tailwindcss'
export const [
	rebuild_tailwind_plugin__build_id$_,
	rebuild_tailwind_plugin__build_id_,
	rebuild_tailwind_plugin__build_id__set,
] = be_sig_triple_(
	()=>undefined,
	{ id: 'rebuild_tailwind_plugin__build_id', ns: 'app' })
export const [
	rebuild_tailwind_plugin__ready$_,
	rebuild_tailwind_plugin__ready_,
] = be_memo_pair_(ctx=>
	!!(
		build_id_(ctx)
			&& rebuildjs__ready_(ctx)
			&& build_id_(ctx) === rebuild_tailwind_plugin__build_id_(ctx)),
{ id: 'rebuild_tailwind_plugin__ready', ns: 'app' })
export function rebuild_tailwind_plugin_() {
	return { name: 'rebuild_tailwind_plugin', setup: setup_() }
	function setup_() {
		/**
		 * @param {import('esbuild').PluginBuild}build
		 */
		const setup = (build)=>{
			build.onEnd(result=>{
				if (result.errors.length) {
					throw new Error(`Build errors: ${result.errors.length} errors`)
				}
			})
		}
		setup.tailwind__build$ = tailwind__build$_()
		return setup
		function tailwind__build$_() {
			return be(app_ctx, ctx=>
				run(memo_(tailwind__build$=>{
					r()
					return tailwind__build$
					function r() {
						if (!rebuildjs__ready_(ctx)) return
						nullish__none_(tup(
							build_id_(ctx),
							rebuildjs__build_id_(ctx),
							server__output__relative_path_M_middleware_ctx_(app_ctx),
						), async (
							build_id,
							rebuildjs__build_id,
							server__output__relative_path_M_middleware_ctx,
						)=>{
							try {
								for (const middleware_ctx of server__output__relative_path_M_middleware_ctx.values()) {
									await output__process(server__output_(middleware_ctx))
									await output__process(browser__output_(middleware_ctx))
								}
								rebuild_tailwind_plugin__build_id__set(ctx, build_id)
							} catch (err) {
								if (err instanceof Cancel) return
								throw err
							}
							/**
 							 * @param {rebuildjs_metafile_T['outputs'][string]}output
							 * @returns {Promise<void>}
							 */
							async function output__process(
								output
							) {
								const cssBundle = output?.cssBundle
								if (!cssBundle) return
								const cssBundle_path = join(cwd_(ctx), cssBundle)
								const esbuild_cssBundle = output.esbuild_cssBundle ?? cssBundle
								const esbuild_cssBundle_path = join(cwd_(ctx), esbuild_cssBundle)
								await file_exists__waitfor(
									esbuild_cssBundle_path,
									1000,
									()=>cmd(sleep(0)))
								const esbuild_cssBundle_map_path = esbuild_cssBundle_path + '.map'
								const esbuild_cssBundle_map_exists = await cmd(file_exists_(esbuild_cssBundle_map_path))
								const result = await cmd(postcss([
									tailwind({
										content: output.cssBundle_content.map(content__relative_path=>
											join(cwd_(ctx), content__relative_path))
									})
								]).process(
									await cmd(readFile(esbuild_cssBundle_path)),
									{
										from: esbuild_cssBundle_path,
										to: cssBundle_path,
										map: esbuild_cssBundle_map_exists
											? {
												prev: JSON.parse(await cmd(readFile(esbuild_cssBundle_path + '.map')))
											}
											: false,
									}))
								await cmd(writeFile(cssBundle_path, result.css))
								if (result.map) {
									await cmd(writeFile(cssBundle_path + '.map', JSON.stringify(result.map)))
								}
							}
							async function cmd(promise) {
								if (cancel_()) throw new Cancel()
								const rv = await promise
								if (cancel_()) {
									promise.cancel?.()
									throw new Cancel()
								}
								return rv
							}
							function cancel_() {
								return (
									build_id_(ctx) !== build_id
									|| rebuildjs__build_id_(ctx) !== rebuildjs__build_id
									|| server__output__relative_path_M_middleware_ctx_(
										ctx) !== server__output__relative_path_M_middleware_ctx
								)
							}
						})
					}
				})), { id: 'tailwind__build$', ns: 'app' })
		}
	}
}
