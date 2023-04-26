import {EditorState, Transaction} from "@milkdown/prose/lib/state";
import "@milkdown/utils"

// 用于更新milkdown editor中的文本
// 返回的是一个command，使用样例： replaceAllText(displayTxt)(view.state, view.dispatch)
export const replaceAllText = (newText: string) => {
    return (state: EditorState, dispatch: (tr: Transaction) => void) => {
        console.log("replacing txt ... ", state.doc)
        // 创建一个空的文档
        const emptyDoc = state.schema.topNodeType.createAndFill();
        if (emptyDoc === null) {
            throw new Error("Failed to create an empty document.");
        }
        // 获取文档的起始和结束位置
        const from = state.doc.content.findDiffStart(emptyDoc.content);
        const to = state.doc.content.size;
        if (from !== null) {
            // 如果文档非空，先删除现有文档内容
            const deleteStep = state.tr.delete(from, to);
            // 插入新文本
            const insertStep = deleteStep.insertText(newText, from);
            // 更新编辑器状态
            if (dispatch)
                dispatch(insertStep);
        } else {
            // 如果文档为空，直接插入新文本
            const insertStep = state.tr.insertText(newText, 0);
            // 更新编辑器状态
            if (dispatch)
                dispatch(insertStep);
        }
        return true;
    };
}