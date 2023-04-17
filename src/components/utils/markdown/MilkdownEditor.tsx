import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';

import {Milkdown, useEditor} from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import {katexOptionsCtx, math} from '@milkdown/plugin-math';

import '@milkdown/theme-nord/style.css';
import 'katex/dist/katex.min.css';

import {prism, prismConfig} from "@milkdown/plugin-prism";
import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'
import {listener, listenerCtx} from "@milkdown/plugin-listener";
import {history} from "@milkdown/plugin-history";

export const MilkdownEditor = (props:{md: string, onChange:(cur: string, prev: string)=>any}) => {
    useEditor((root) => {
        return Editor
            .make()
            .config(ctx => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, props.md)
            })
            .config(nord)
            .use(commonmark)

            // LaTeX
            .config(ctx => ctx.set(katexOptionsCtx.key, {throwOnError: false}))
            .use(math)

            // Prism
            .use(prism)
            .config(ctx=>{
                ctx.set(prismConfig.key, {
                    configureRefractor: (refractor)=>{
                        refractor.register(markdown)
                        refractor.register(css)
                        refractor.register(javascript)
                        refractor.register(typescript)
                        refractor.register(jsx)
                        refractor.register(tsx)
                    }
                })
            })

            // onChange
            .config(ctx=>{
                ctx.get(listenerCtx).markdownUpdated((ctx, cur, prev)=>{
                    if(!prev) prev = ""
                    if(cur !== prev) props.onChange(cur, prev)
                })
            })
            .use(listener)
            .use(history)
    }, [])

    return <Milkdown/>
}