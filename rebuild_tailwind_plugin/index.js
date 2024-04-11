import { file_exists_, file_exists__waitfor } from 'ctx-core/fs'
import {
	calling,
	Cancel,
	memo_,
	ns_id_be,
	ns_id_be_memo_pair_,
	ns_id_be_sig_triple_,
	nullish__none_,
	promise__cancel__throw,
	rmemo__wait,
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
	build_id_,
	cssBundle__annotate,
	cwd_,
	rebuildjs__esbuild__build_id_,
	rebuildjs__esbuild__done_,
	rebuildjs__esbuild__done__wait,
	rebuildjs__ready__add,
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
] = ns_id_be_sig_triple_(
	'app',
	'rebuild_tailwind_plugin__build_id',
	()=>undefined)
export const [
	rebuildjs_tailwind__ready$_,
	rebuildjs_tailwind__ready_,
] = ns_id_be_memo_pair_(
	'app',
	'rebuildjs_tailwind__ready',
	ctx=>
		!!(
			build_id_(ctx)
			&& rebuildjs__esbuild__done_(ctx)
			&& build_id_(ctx) === rebuild_tailwind_plugin__build_id_(ctx)))
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
		rebuildjs__ready__add(rebuildjs_tailwind__ready$_)
		/**
		 * @param {import('esbuild').PluginBuild}build
		 */
		const setup = (build)=>{
			build.onEnd(result=>{
				if (result.errors.length) {
					throw Error('Build errors: ' + result.errors.length + ' errors')
				}
			})
		}
		setup.tailwind__build$ = tailwind__build$_()
		return setup
		function tailwind__build$_() {
			return ns_id_be(
				app_ctx,
				'app',
				'tailwind__build$',
				app_ctx=>{
					return calling(memo_(()=>{
						if (!rebuildjs__esbuild__done_(app_ctx)) return
						nullish__none_(tup(
							build_id_(app_ctx),
							rebuildjs__esbuild__build_id_(app_ctx),
							server__output__relative_path_M_middleware_ctx_(app_ctx),
						), async (
							build_id,
							rebuildjs__build_id,
							server__output__relative_path_M_middleware_ctx,
						)=>{
							try {
								await cmd(rebuildjs__esbuild__done__wait())
								const _server__metafile = server__metafile_(app_ctx)
								const _browser__metafile = browser__metafile_(app_ctx)
								const server_output__process_promise_a1 = []
								const browser_output__process_promise_a1 = []
								for (const middleware_ctx of server__output__relative_path_M_middleware_ctx.values()) {
									server_output__process_promise_a1.push(
										output__process(
											_server__metafile,
											server__output__relative_path_(middleware_ctx),
											server__output_(middleware_ctx)))
									browser_output__process_promise_a1.push(
										output__process(
											_browser__metafile,
											browser__output__relative_path_(middleware_ctx),
											browser__output_(middleware_ctx)))
								}
								const [
									server__metafile_updated_a1,
									browser__metafile_updated_a1,
								] = await Promise.all([
									Promise.all(server_output__process_promise_a1),
									Promise.all(browser_output__process_promise_a1)
								])
								const update_promise_a1 = []
								if (server__metafile_updated_a1.some($=>$)) {
									update_promise_a1.push(server__metafile__update(_server__metafile))
								}
								if (browser__metafile_updated_a1.some($=>$)) {
									update_promise_a1.push(browser__metafile__update(_browser__metafile))
								}
								if (update_promise_a1.length) {
									await cmd(Promise.all(update_promise_a1))
								}
								rebuild_tailwind_plugin__build_id__set(app_ctx, build_id)
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
									30_000,
									()=>cmd(sleep(0))))
								const esbuild_cssBundle_map_path = esbuild_cssBundle_path + '.map'
								const esbuild_cssBundle_map_exists = await cmd(file_exists_(esbuild_cssBundle_map_path))
								const output_hash =
									basename(output__relative_path, '.js')
										.split('-')
										.slice(-1)[0]
								const tailwind_instance = tailwind({
									...config?.tailwindcss_config,
									content: [
										...output.cssBundle_content.map(content__relative_path=>
											join(cwd_(app_ctx), content__relative_path)),
										...(config?.content ?? [])
									]
								})
								const result = await file_exists__waitfor(
									async ()=>cmd(
										postcss(
											config?.postcss_plugin_a1_?.(tailwind_instance)
											?? [tailwind_instance]
										).process(
											await readFile(esbuild_cssBundle_path),
											{
												from: esbuild_cssBundle_path,
												to: join(cwd_(app_ctx), cssBundle),
												map: esbuild_cssBundle_map_exists
													? {
														prev: await file_json__parse__wait(esbuild_cssBundle_map_path)
													}
													: false,
											})),
									30_000)
								metafile_updated = !cssBundle.includes('_' + output_hash)
								const annotated_cssBundle =
									metafile_updated
										? cssBundle__annotate(cssBundle, '_' + output_hash)
										: cssBundle
								const annotated_cssBundle_path = join(cwd_(app_ctx), annotated_cssBundle)
								const annotated_cssBundle_map_path = join(cwd_(app_ctx), annotated_cssBundle) + '.map'
								await cmd(writeFile(annotated_cssBundle_path, result.css))
								const map_json = result.map ? JSON.stringify(result.map) : null
								if (map_json) {
									await cmd(writeFile(annotated_cssBundle_map_path, map_json))
									await file_exists__waitfor(()=>
										cmd(readFile(annotated_cssBundle_map_path))
											.then(buf=>'' + buf === map_json),
									5_000)
								}
								await file_exists__waitfor(()=>
									cmd(readFile(annotated_cssBundle_path))
										.then(buf=>'' + buf === result.css),
								5_000)
								output.cssBundle = annotated_cssBundle
								if (metafile_updated) {
									metafile.outputs[annotated_cssBundle] = metafile.outputs[cssBundle]
									metafile.outputs[annotated_cssBundle + '.map'] = metafile.outputs[cssBundle + '.map']
								}
								return metafile_updated
							}
							async function file_json__parse__wait(path) {
								// eslint-disable-next-line no-constant-condition
								while (1) {
									try {
										return JSON.parse(
											await file_exists__waitfor(()=>
												cmd(readFile(path))))
									} catch (err) {
										if (err.name === 'SyntaxError') continue
										throw err
									}
								}
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
									|| rebuildjs__esbuild__build_id_(app_ctx) !== rebuildjs__build_id
									|| server__output__relative_path_M_middleware_ctx_(
										app_ctx) !== server__output__relative_path_M_middleware_ctx
								)
							}
						})
					}))
				})
		}
	}
}
