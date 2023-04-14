import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import "prismjs"
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-cypher';
import 'prismjs/components/prism-csv';
import 'prismjs/components/prism-cmake';
import 'prismjs/themes/prism-twilight.css';
import rehypePrism from 'rehype-prism';
import "katex/dist/katex.min.css"

// 用于 markdown 预览
const MdPreview = ({...props}) => {
    return (
            <ReactMarkdown
                components={props.components}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw, rehypePrism]}
                children={props.children}/>
    );
};

export default MdPreview;