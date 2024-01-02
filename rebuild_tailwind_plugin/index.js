import { Cancel, nullish__none_, run, tup } from 'ctx-core/function'
import { be, memo_ } from 'ctx-core/rmemo'
import { readFile, writeFile } from 'node:fs/promises'
import postcss from 'postcss'
import {
	app_ctx,
	browser__output_,
	build_id_,
	server__output_,
	server__output__relative_path_M_middleware_ctx_
} from 'rebuildjs'
import { relysjs__build_id_, relysjs__ready_ } from 'relysjs'
import tailwind from 'tailwindcss'
export function rebuild_tailwind_plugin_() {
	return { name: 'tailwind', setup: setup_() }
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
						if (!relysjs__ready_(ctx)) return
						nullish__none_(tup(
							build_id_(ctx),
							relysjs__build_id_(ctx),
							server__output__relative_path_M_middleware_ctx_(app_ctx),
						), async (
							build_id,
							relysjs__build_id,
							server__output__relative_path_M_middleware_ctx,
						)=>{
							try {
								for (const middleware_ctx of server__output__relative_path_M_middleware_ctx.values()) {
									await output__process(server__output_(middleware_ctx))
									await output__process(browser__output_(middleware_ctx))
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
								output
							) {
								const cssBundle = output?.cssBundle
								if (!cssBundle) return
								const result = await cmd(postcss[
									tailwind({
										content: output.cssBundle_content
									})
								]).process(
									await cmd(readFile(cssBundle)),
									{
										from: cssBundle,
										to: cssBundle,
									})
								await cmd(writeFile(cssBundle, result.css))
								await cmd(writeFile(cssBundle + '.map', JSON.stringify(result.map)))
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
									|| relysjs__build_id_(ctx) !== relysjs__build_id
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
