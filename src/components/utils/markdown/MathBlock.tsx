import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useInstance} from "@milkdown/react";
import {useNodeViewContext} from "@prosemirror-adapter/react";
import katex from 'katex';
import {katexOptionsCtx} from "@milkdown/plugin-math";

const MathBlock = () => {


    const { node, setAttrs, selected } = useNodeViewContext();
    const code = useMemo(() => node.attrs.value, [node.attrs.value]);
    const codePanel = useRef<HTMLDivElement>(null);
    const codeInput = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("preview");
    const [loading, getEditor] = useInstance();

    useEffect(() => {
        requestAnimationFrame(() => {
            if (!codePanel.current || value !== "preview" || loading) return;
            try {
                katex.render(
                    code,
                    codePanel.current,
                    getEditor().ctx.get(katexOptionsCtx.key)
                );
            } catch {}
        });
    }, [code, getEditor, loading, value]);

    return (
        <div>
            Hello LaTeX
        </div>
    );
};

export default MathBlock;