import { file_exists_, file_exists__waitfor } from 'ctx-core/fs'
import {
	be,
	be_memo_pair_,
	be_sig_triple_,
	Cancel,
	memo_,
	nullish__none_,
	promise__cancel__throw,
	rmemo__wait,
	run,
	sleep,
	tup
} from 'ctx-core/rmemo'
import { readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import postcss from 'postcss'
import {
	app_ctx,
	browser__metafile_,
	browser__metafile__update,
	browser__output_,
	browser__output__relative_path_,
	browser__relative_path_,
	build_id_,
	cssBundle__annotate,
	cwd_,
	rebuildjs__build_id_,
	rebuildjs__ready__add,
	rebuildjs_core__ready_,
	server__metafile_,
	server__metafile__update,
	server__output_,
	server__output__relative_path_,
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
	rebuildjs_tailwind__ready$_,
	rebuildjs_tailwind__ready_,
] = be_memo_pair_(ctx=>
	!!(
		build_id_(ctx)
			&& rebuildjs_core__ready_(ctx)
			&& build_id_(ctx) === rebuild_tailwind_plugin__build_id_(ctx)),
{ id: 'rebuildjs_tailwind__ready', ns: 'app' })
export function rebuildjs_tailwind__ready__wait(timeout) {
	return rmemo__wait(
		rebuildjs_tailwind__ready$_(app_ctx),
		ready=>ready,
		timeout ?? 10_000)
}
/**
 * @param {rebuild_tailwind_plugin__config_T}[config]
 * @returns {{name: string, setup: setup}}
 * @private
 */
export function rebuild_tailwind_plugin_(config) {
	return { name: 'rebuild_tailwind_plugin', setup: setup_() }
	function setup_() {
		rebuildjs__ready__add(rebuildjs_tailwind__ready_)
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
			return be(app_ctx, app_ctx=>
				run(memo_(tailwind__build$=>{
					r()
					return tailwind__build$
					function r() {
						if (!rebuildjs_core__ready_(app_ctx)) return
						nullish__none_(tup(
							build_id_(app_ctx),
							rebuildjs__build_id_(app_ctx),
							server__output__relative_path_M_middleware_ctx_(app_ctx),
						), async (
							build_id,
							rebuildjs__build_id,
							server__output__relative_path_M_middleware_ctx,
						)=>{
							let promise_a1 = []
							try {
								let server__metafile_updated
								let browser_metafile_updated
								for (const middleware_ctx of server__output__relative_path_M_middleware_ctx.values()) {
									server__metafile_updated = await output__process(
										server__metafile_(middleware_ctx),
										server__output__relative_path_(middleware_ctx),
										server__output_(middleware_ctx))
									browser_metafile_updated = await output__process(
										browser__metafile_(middleware_ctx),
										browser__output__relative_path_(middleware_ctx),
										browser__output_(middleware_ctx))
								}
								if (server__metafile_updated) {
									await cmd(server__metafile__update(server__metafile_(app_ctx)))
								}
								if (browser_metafile_updated) {
									await cmd(browser__metafile__update(browser__metafile_(app_ctx)))
								}
								await Promise.all(promise_a1)
								if (!server__metafile_updated && !browser_metafile_updated) {
									rebuild_tailwind_plugin__build_id__set(app_ctx, build_id)
								}
							} catch (err) {
								if (err instanceof Cancel) return
								throw err
							}
							/**
							 * @param {rebuildjs_metafile_T['outputs'][string]}output
							 * @returns {Promise<void>}
							 */
							async function output__process(
								metafile,
								output__relative_path,
								output,
							) {
								let metafile_updated = false
								const cssBundle = output?.cssBundle
								if (!cssBundle) return metafile_updated
								const esbuild_cssBundle = output.esbuild_cssBundle ?? cssBundle
								const esbuild_cssBundle_path = join(cwd_(app_ctx), esbuild_cssBundle)
								await cmd(file_exists__waitfor(
									esbuild_cssBundle_path,
									1000,
									()=>cmd(sleep(0))))
								const esbuild_cssBundle_map_path = esbuild_cssBundle_path + '.map'
								const esbuild_cssBundle_map_exists = await cmd(file_exists_(esbuild_cssBundle_map_path))
								const output_hash =
									basename(output__relative_path, '.js')
										.split('-')
										.slice(-1)[0]
								metafile_updated = !cssBundle.includes('_' + output_hash)
								const annotated_cssBundle =
									metafile_updated
										? cssBundle__annotate(cssBundle, '_' + output_hash)
										: cssBundle
								output.cssBundle = annotated_cssBundle
								if (metafile_updated) {
									metafile.outputs[annotated_cssBundle] = metafile.outputs[cssBundle]
								}
								const annotated_cssBundle_path = join(cwd_(app_ctx), annotated_cssBundle)
								const tailwind_instance = tailwind({
									...config?.tailwindcss_config,
									content: [
										...output.cssBundle_content.map(content__relative_path=>
											join(cwd_(app_ctx), content__relative_path)),
										...(config?.content ?? [])
									]
								})
								const result = await cmd(
									postcss(
										config?.postcss_plugin_a1_?.(tailwind_instance)
										?? [tailwind_instance]
									).process(
										await cmd(readFile(esbuild_cssBundle_path)),
										{
											from: esbuild_cssBundle_path,
											to: join(cwd_(app_ctx), cssBundle),
											map: esbuild_cssBundle_map_exists
												? {
													prev: JSON.parse(await cmd(readFile(esbuild_cssBundle_path + '.map')))
												}
												: false,
										}))
								await cmd(writeFile(annotated_cssBundle_path, result.css))
								if (result.map) {
									const map_json = JSON.stringify(result.map)
									await cmd(writeFile(annotated_cssBundle_path + '.map', map_json))
									await cmd(file_exists__waitfor(()=>
										readFile(annotated_cssBundle_path + '.map')
											.then(buf=>'' + buf === map_json),
									5_000))
								}
								await cmd(file_exists__waitfor(()=>
									readFile(annotated_cssBundle_path)
										.then(buf=>'' + buf === result.css),
								5_000))
								promise_a1.push(file_exists__waitfor(
									join(cwd_(app_ctx), browser__relative_path_(app_ctx), basename(annotated_cssBundle_path))
								))
								return metafile_updated
							}
							async function cmd(promise) {
								if (cancel_()) promise__cancel__throw(promise)
								const rv = await promise
								if (cancel_()) promise__cancel__throw(promise)
								return rv
							}
							function cancel_() {
								return (
									build_id_(app_ctx) !== build_id
									|| rebuildjs__build_id_(app_ctx) !== rebuildjs__build_id
									|| server__output__relative_path_M_middleware_ctx_(
										app_ctx) !== server__output__relative_path_M_middleware_ctx
								)
							}
						})
					}
				})), { id: 'tailwind__build$', ns: 'app' })
		}
	}
}
