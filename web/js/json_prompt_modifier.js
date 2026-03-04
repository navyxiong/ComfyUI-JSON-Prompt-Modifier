import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "ComfyUI.JSONPromptModifier",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "JSON-Prompt-Modifier") return;
        
        // 保存原始构造函数
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        
        nodeType.prototype.onNodeCreated = function() {
            const result = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
            
            // 添加自定义UI元素
            this.addCustomWidgets();
            this.setupEventListeners();
            
            return result;
        };
        
        // 添加自定义小部件方法
        nodeType.prototype.addCustomWidgets = function() {
            const self = this;
            
            // 创建文件选择按钮
            const fileWidget = this.addWidget("button", "📁 选择JSON文件", null, () => {
                self.openFilePicker();
            });
            fileWidget.serialize = false;
            
            // 创建导出按钮
            const exportWidget = this.addWidget("button", "💾 导出文件", null, () => {
                self.exportFile();
            });
            exportWidget.serialize = false;
            
            // 添加自定义HTML容器
            this.htmlWidget = this.addDOMWidget("json_editor", "div", {
                serialize: false,
                getValue: () => "",
                setValue: (v) => {},
            });
            
            this.updateEditorUI();
        };
        
        // 设置事件监听
        nodeType.prototype.setupEventListeners = function() {
            const self = this;
            
            api.addEventListener("json_prompt_modifier", (event) => {
                const detail = event.detail;
                if (detail.node_id !== self.id.toString()) return;
                
                switch(detail.type) {
                    case "json_loaded":
                        self.onJSONLoaded(detail.data);
                        break;
                    case "json_saved":
                        self.onJSONSaved(detail.data);
                        break;
                    case "error":
                        self.showError(detail.data);
                        break;
                }
            });
        };
        
        // 文件选择
        nodeType.prototype.openFilePicker = async function() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json,.txt";
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // 读取文件内容
                const text = await file.text();
                
                // 更新file_path输入
                const filePathWidget = this.widgets.find(w => w.name === "file_path");
                if (filePathWidget) {
                    filePathWidget.value = file.name; // 实际使用时需要处理路径
                }
                
                // 更新json_content
                const contentWidget = this.widgets.find(w => w.name === "json_content");
                if (contentWidget) {
                    contentWidget.value = text;
                }
                
                this.updateEditorUI(text);
                this.setDirtyCanvas(true);
            };
            
            input.click();
        };
        
        // JSON加载回调
        nodeType.prototype.onJSONLoaded = function(data) {
            const contentWidget = this.widgets.find(w => w.name === "json_content");
            if (contentWidget) {
                contentWidget.value = data.content;
            }
            this.updateEditorUI(data.content);
            app.ui.dialog.show(`成功加载: ${data.filename}`);
        };
        
        // 导出文件
        nodeType.prototype.exportFile = function() {
            const contentWidget = this.widgets.find(w => w.name === "json_content");
            if (!contentWidget || !contentWidget.value) {
                app.ui.dialog.show("没有可导出的内容");
                return;
            }
            
            // 设置保存操作
            const operationWidget = this.widgets.find(w => w.name === "operation");
            if (operationWidget) {
                operationWidget.value = "save";
            }
            
            this.triggerQueue();
        };
        
        // 保存完成回调
        nodeType.prototype.onJSONSaved = function(data) {
            app.ui.dialog.show(`文件已保存至:\n${data.path}`);
        };
        
        // 显示错误
        nodeType.prototype.showError = function(message) {
            app.ui.dialog.show(`错误: ${message}`);
            console.error("JSON-Prompt-Modifier Error:", message);
        };
        
        // 更新编辑器UI
        nodeType.prototype.updateEditorUI = function(content = "") {
            if (!this.htmlWidget || !this.htmlWidget.element) return;
            
            const el = this.htmlWidget.element;
            el.style.width = "400px";
            el.style.height = "300px";
            el.style.overflow = "auto";
            el.style.background = "#1e1e1e";
            el.style.border = "1px solid #444";
            el.style.borderRadius = "4px";
            el.style.padding = "10px";
            el.style.fontFamily = "monospace";
            el.style.fontSize = "12px";
            el.style.color = "#d4d4d4";
            el.style.whiteSpace = "pre-wrap";
            el.style.wordWrap = "break-word";
            
            // 创建可编辑的文本区域
            if (!el.querySelector("textarea")) {
                el.innerHTML = `
                    <div style="margin-bottom: 8px; color: #888; font-size: 11px;">
                        JSON编辑器 (可直接编辑)
                    </div>
                    <textarea style="
                        width: 100%;
                        height: 250px;
                        background: #252526;
                        color: #d4d4d4;
                        border: 1px solid #3c3c3c;
                        border-radius: 3px;
                        padding: 8px;
                        font-family: 'Consolas', 'Monaco', monospace;
                        font-size: 12px;
                        resize: vertical;
                        box-sizing: border-box;
                    "></textarea>
                `;
                
                const textarea = el.querySelector("textarea");
                textarea.addEventListener("input", (e) => {
                    const contentWidget = this.widgets.find(w => w.name === "json_content");
                    if (contentWidget) {
                        contentWidget.value = e.target.value;
                    }
                });
            }
            
            const textarea = el.querySelector("textarea");
            if (textarea && content) {
                textarea.value = content;
            }
        };
        
        // 触发队列执行
        nodeType.prototype.triggerQueue = function() {
            // 使用ComfyUI的API触发执行
            app.queuePrompt(0, this.id);
        };
        
        // 自定义绘制
        const onDrawForeground = nodeType.prototype.onDrawForeground;
        nodeType.prototype.onDrawForeground = function(ctx) {
            const result = onDrawForeground ? onDrawForeground.apply(this, arguments) : undefined;
            
            // 绘制节点标题装饰
            if (this.flags.collapsed) return result;
            
            ctx.save();
            ctx.fillStyle = "#4a9eff";
            ctx.font = "12px Arial";
            ctx.fillText("📝 JSON编辑器", 10, this.size[1] - 10);
            ctx.restore();
            
            return result;
        };
    },
    
    // 添加自定义节点样式
    async loadedGraphNode(node, app) {
        if (node.type !== "JSON-Prompt-Modifier") return;
        
        // 恢复节点状态时更新UI
        setTimeout(() => {
            const contentWidget = node.widgets.find(w => w.name === "json_content");
            if (contentWidget && contentWidget.value) {
                node.updateEditorUI(contentWidget.value);
            }
        }, 100);
    }
});
