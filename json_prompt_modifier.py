import json
from server import PromptServer

class JSONPromptModifier:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "json_text": ("STRING", {"multiline": True, "default": "{}"}),
            },
            "optional": {
                "vqa_input": ("STRING", {"forceInput": True}),
            },
            "hidden": {"unique_id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ("STRING", "JSON")
    RETURN_NAMES = ("text", "json")
    FUNCTION = "process_json"
    CATEGORY = "JSON工具"
    OUTPUT_NODE = True

    def process_json(self, json_text, vqa_input=None, unique_id=None):
        display_text = json_text
        
        # --- 修复逻辑：处理可能的列表输入 ---
        if vqa_input is not None:
            # 如果输入是列表 ['prompt text']，则取第一项
            if isinstance(vqa_input, list):
                if len(vqa_input) > 0:
                    vqa_input = str(vqa_input[0])
                else:
                    vqa_input = ""
            
            # 确保是字符串后再进行 strip
            vqa_input = str(vqa_input).strip()
            
            if vqa_input != "":
                # 发送给前端显示
                PromptServer.instance.send_sync("json_modifier_update_text", {
                    "node_id": unique_id,
                    "text": vqa_input
                })
                # 如果此时对话框是空的或是默认值，后端直接采用输入值
                if json_text == "{}" or json_text.strip() == "":
                    display_text = vqa_input

        # 尝试解析 JSON 输出
        try:
            # 这里的解析对象使用 display_text，确保后端输出与前端显示同步
            json_object = json.loads(display_text)
        except Exception:
            json_object = {}
            
        return (display_text, json_object)

NODE_CLASS_MAPPINGS = {"JSON-Prompt-Modifier": JSONPromptModifier}
NODE_DISPLAY_NAME_MAPPINGS = {"JSON-Prompt-Modifier": "JSON Prompt Modifier 🛠️"}
