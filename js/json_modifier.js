import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "JSON.Prompt.Modifier",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "JSON-Prompt-Modifier") {
            // 当节点创建时执行
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                onNodeCreated?.apply(this, arguments);

                const widget = this.widgets.find((w) => w.name === "json_text");

                // --- 1. 创建“加载文件”按钮 ---
                this.addWidget("button", "📂 Load JSON/TXT", null, () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".txt,.json";
                    input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (f) => {
                            widget.value = f.target.result; // 将内容填入文本框
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                });

                // --- 2. 创建“导出文件”按钮 ---
                this.addWidget("button", "💾 Export to Local", null, () => {
                    const text = widget.value;
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "modified_prompt.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                });
            };
        }
    },
});
