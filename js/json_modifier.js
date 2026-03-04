import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

app.registerExtension({
    name: "Comfy.JSONPromptModifier",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "JSON-Prompt-Modifier") {
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                onNodeCreated?.apply(this, arguments);
                const jsonWidget = this.widgets.find(w => w.name === "json_text");

                // 加载本地文件
                this.addWidget("button", "📂 加载本地提示词", null, () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (f) => { jsonWidget.value = f.target.result; };
                        reader.readAsText(file);
                    };
                    input.click();
                });

                // 导出到本地
                this.addWidget("button", "💾 导出修改后的文本", null, () => {
                    const blob = new Blob([jsonWidget.value], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "modified_prompt.txt";
                    a.click();
                });

                this.setSize([400, 480]);
            };

            // 监听后端发来的自动更新消息
            api.addEventListener("json_modifier_update_text", (event) => {
                const { node_id, text } = event.detail;
                const node = app.graph.getNodeById(node_id);
                if (node) {
                    const widget = node.widgets.find(w => w.name === "json_text");
                    if (widget && widget.value !== text) {
                        widget.value = text;
                    }
                }
            });
        }
    }
});
