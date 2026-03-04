"""
JSON-Prompt-Modifier - ComfyUI Custom Node
A node for loading, editing and exporting JSON format prompts without translation features.
"""

from .json_prompt_modifier import JSONPromptModifier, NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

WEB_DIRECTORY = "./web/js"
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', 'WEB_DIRECTORY']
