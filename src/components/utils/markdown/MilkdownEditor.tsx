import {defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx} from '@milkdown/core';

import {Milkdown, useEditor} from '@milkdown/react'
import {commonmark} from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { tableBlock } from '@milkdown/kit/component/table-block'
import {
    katexOptionsCtx,
    mathBlockSchema,
    mathInlineSchema,
    remarkMathPlugin
} from '@milkdown/plugin-math';

import 'katex/dist/katex.min.css';
import './MarkdownBasic.module.css'
import 'prism-themes/themes/prism-nord.css'

import 'prism-themes/themes/prism-nord.css'
import {prism, prismConfig} from "@milkdown/plugin-prism";
import html from 'refractor/lang/cshtml'
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
import { upload, uploadConfig, Uploader } from '@milkdown/plugin-upload';
import type { Node } from '@milkdown/prose/model';

export const MilkdownEditor = (props:{
    md: string,
    onChange?:(cur: string, prev: string)=>any,
    editable: boolean,
    command?: (ctx: Ctx)=>any,
    // 父组件可以通过使用一个state并修改state来告知milkdown editor需要执行command命令了
    trigger?: any,
    updateImage?: (image: File)=>Promise<string | undefined>}) => {

    // 支持图片以url方式粘贴
    const uploader: Uploader = async (files, schema) => {
        const images: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!file)
                continue;
            // You can handle whatever the file type you want, we handle image here.
            if (!file.type.includes('image'))
                continue;
            images.push(file);
        }
        const nodes: Node[] = await Promise.all(
            images.map(async (image) => {
                const src = await props.updateImage!(image);
                if(!src) return schema.nodes.image.createAndFill({src: "", alt: ""}) as Node
                const alt = image.name;
                return schema.nodes.image.createAndFill({src, alt}) as Node;
            }),
        );
        return nodes;
    };

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
            .use(commonmark)
            // .use(gfm)
            // .use(tableBlock)

            // LaTeX
            .use(remarkMathPlugin)
            .use(mathInlineSchema)
            .use(mathBlockSchema)
            .use(katexOptionsCtx)

            .config(ctx => ctx.set(katexOptionsCtx.key, {
                throwOnError: false,
            }))

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
                        refractor.register(html)
                    }
                })
            })
            // onChange
            .config(ctx=>{
                ctx.get(listenerCtx).markdownUpdated((ctx, cur, prev)=>{
                    if(!prev) prev = ""
                    if(cur !== prev && props.onChange) props.onChange(cur, prev)
                })

            })
           // 支持图片以url的形式粘贴
            .config((ctx) => {
                ctx.update(uploadConfig.key, (prev) => ({
                    ...prev,
                    uploader,
                }));
            })
            .use(upload)
            .use(listener)
            .use(history)
    }, []);

    let editor = useEditorReturn.get()


    useEffect(()=>{
        editor && editor.action(props.command!)
        // eslint-disable-next-line
    },[props.trigger])

    return <Milkdown/>
}