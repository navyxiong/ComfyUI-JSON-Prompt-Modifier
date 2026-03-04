import json

class JSONPromptModifier:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                # 核心文本框：存储和编辑 JSON 内容
                "json_text": ("STRING", {"multiline": True, "default": "{}"}),
            },
        }

    RETURN_TYPES = ("STRING", "JSON")
    RETURN_NAMES = ("text", "json")
    FUNCTION = "process_json"
    CATEGORY = "JSON工具"

    def process_json(self, json_text):
        # 尝试解析 JSON，如果格式错误则返回空字典，防止工作流崩溃
        try:
            json_object = json.loads(json_text)
        except Exception as e:
            print(f"JSON解析警告: {e}")
            json_object = {}
            
        return (json_text, json_object)

NODE_CLASS_MAPPINGS = {
    "JSON-Prompt-Modifier": JSONPromptModifier
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "JSON-Prompt-Modifier": "JSON Prompt Modifier 🛠️"
}
