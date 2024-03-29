import type { Plugin } from 'esbuild'
import type { AcceptedPlugin } from 'postcss'
import type { ctx__be_T, ctx__get_T, ctx__set_T, sig_T } from 'rebuildjs/server'
import type { Config } from 'tailwindcss'
export declare const rebuild_tailwind_plugin__build_id$_:ctx__be_T<sig_T<string|undefined>, 'app'>
export declare const rebuild_tailwind_plugin__build_id_:ctx__get_T<string|undefined, 'app'>
export declare const rebuild_tailwind_plugin__build_id__set:ctx__set_T<string|undefined, 'app'>
export declare const rebuildjs_tailwind__ready$_:ctx__be_T<sig_T<boolean>, 'app'>
export declare const rebuildjs_tailwind__ready_:ctx__get_T<boolean, 'app'>
export declare function rebuildjs_tailwind__ready__wait(timeout?:number):Promise<boolean>
export declare function rebuild_tailwind_plugin_(config?:rebuild_tailwind_plugin__config_T):Plugin
export type rebuild_tailwind_plugin__config_T = {
	postcss_plugin_a1_?:(tailwindcss_plugin:AcceptedPlugin)=>AcceptedPlugin[]
	tailwindcss_config?:Config
}
