import {defaultValueCtx, Editor, editorState, editorViewCtx, editorViewOptionsCtx, rootCtx} from '@milkdown/core';

import {Milkdown, useEditor} from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import {katexOptionsCtx, math} from '@milkdown/plugin-math';

import '@milkdown/theme-nord/style.css';
import 'katex/dist/katex.min.css';
import './MarkdownBasic.module.css'

import {prism, prismConfig} from "@milkdown/plugin-prism";
import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'
import {listener, listenerCtx} from "@milkdown/plugin-listener";
import {history} from "@milkdown/plugin-history";
import {useEffect} from "react";
import {Ctx} from "@milkdown/ctx";
import {editableInputTypes} from "@testing-library/user-event/dist/utils";

export const MilkdownEditor = (props:{
    md: string,
    onChange:(cur: string, prev: string)=>any,
    editable: boolean,
    command?: (ctx: Ctx)=>any,
    // 父组件可以通过使用一个state并修改state来告知milkdown editor需要执行command命令了
    trigger?: any }) => {
    let useEditorReturn = useEditor((root) => {
        return  Editor
            .make()
            .config(ctx => {
                ctx.set(rootCtx, root)
                ctx.set(defaultValueCtx, props.md)
                // 设置只读与否
                ctx.update(editorViewOptionsCtx, (prev) => ({
                    ...prev,
                    editable: ()=>props.editable,
                }))
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
    }, []);

    let editor = useEditorReturn.get()


    useEffect(()=>{
        editor && editor.action(props.command!)
    },[props.trigger])

    return <Milkdown/>
}