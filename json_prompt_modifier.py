import json
import os
from typing import Dict, Any, Tuple, Optional
from server import PromptServer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JSONPromptModifier:
    """
    ComfyUI节点：JSON-Prompt-Modifier
    支持上传JSON提示词文件、编辑和导出（无翻译功能）
    """
    
    def __init__(self):
        self.current_data = {}
        self.original_data = {}
        self.file_path = ""
    
    @classmethod
    def INPUT_TYPES(cls) -> Dict[str, Any]:
        return {
            "required": {
                "file_path": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "placeholder": "选择JSON文件路径...",
                    "tooltip": "JSON提示词文件的绝对路径"
                }),
                "operation": (["load", "save"], {
                    "default": "load",
                    "tooltip": "选择操作类型：加载/保存"
                }),
            },
            "optional": {
                "json_content": ("STRING", {
                    "default": "{}",
                    "multiline": True,
                    "placeholder": "JSON内容将显示在这里...",
                    "tooltip": "可编辑的JSON内容"
                }),
                "save_path": ("STRING", {
                    "default": "",
                    "multiline": False,
                    "placeholder": "保存路径（可选）",
                    "tooltip": "留空则使用原文件名_modified.json"
                }),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            }
        }
    
    RETURN_TYPES = ("STRING", "JSON", "BOOLEAN")
    RETURN_NAMES = ("json_string", "json_object", "success")
    FUNCTION = "execute"
    CATEGORY = "utils/prompt"
    OUTPUT_NODE = True
    
    def execute(self, file_path: str, operation: str, 
                json_content: str = "{}", save_path: str = "",
                unique_id: Optional[str] = None, extra_pnginfo: Any = None) -> Tuple[str, Dict, bool]:
        """
        执行节点操作
        """
        try:
            if operation == "load":
                return self._load_json(file_path, unique_id)
            elif operation == "save":
                return self._save_json(json_content, file_path, save_path, unique_id)
            else:
                return ("{}", {}, False)
                
        except Exception as e:
            error_msg = f"操作失败: {str(e)}"
            logger.error(error_msg)
            self._send_message(unique_id, "error", error_msg)
            return ("{}", {}, False)
    
    def _load_json(self, file_path: str, unique_id: Optional[str]) -> Tuple[str, Dict, bool]:
        """加载JSON文件"""
        if not file_path or not os.path.exists(file_path):
            error_msg = f"文件不存在: {file_path}"
            self._send_message(unique_id, "error", error_msg)
            return ("{}", {}, False)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                data = json.loads(content)
            
            self.original_data = data
            self.current_data = data
            self.file_path = file_path
            
            # 发送到前端显示
            pretty_json = json.dumps(data, ensure_ascii=False, indent=2)
            self._send_message(unique_id, "json_loaded", {
                "content": pretty_json,
                "filename": os.path.basename(file_path)
            })
            
            logger.info(f"成功加载JSON文件: {file_path}")
            return (pretty_json, data, True)
            
        except json.JSONDecodeError as e:
            error_msg = f"JSON解析错误: {str(e)}"
            self._send_message(unique_id, "error", error_msg)
            return ("{}", {}, False)
        except Exception as e:
            error_msg = f"读取文件失败: {str(e)}"
            self._send_message(unique_id, "error", error_msg)
            return ("{}", {}, False)
    
    def _save_json(self, json_content: str, original_path: str, 
                   save_path: str, unique_id: Optional[str]) -> Tuple[str, Dict, bool]:
        """保存JSON文件"""
        try:
            data = json.loads(json_content) if json_content else {}
            
            # 确定保存路径
            if not save_path:
                if original_path:
                    base, ext = os.path.splitext(original_path)
                    save_path = f"{base}_modified{ext}"
                else:
                    save_path = "modified_prompt.json"
            
            # 确保目录存在
            dir_path = os.path.dirname(save_path)
            if dir_path:
                os.makedirs(dir_path, exist_ok=True)
            
            with open(save_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            self._send_message(unique_id, "json_saved", {
                "path": save_path
            })
            
            logger.info(f"成功保存JSON文件: {save_path}")
            return (json_content, data, True)
            
        except Exception as e:
            error_msg = f"保存失败: {str(e)}"
            self._send_message(unique_id, "error", error_msg)
            return ("{}", {}, False)
    
    def _send_message(self, unique_id: Optional[str], event_type: str, data: Any):
        """发送消息到前端"""
        if unique_id and PromptServer.instance:
            try:
                PromptServer.instance.send_sync("json_prompt_modifier", {
                    "node_id": unique_id,
                    "type": event_type,
                    "data": data
                })
            except Exception as e:
                logger.error(f"发送消息失败: {e}")


# 注册节点
NODE_CLASS_MAPPINGS = {
    "JSON-Prompt-Modifier": JSONPromptModifier
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "JSON-Prompt-Modifier": "JSON-Prompt-Modifier 📝"
}
