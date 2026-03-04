# JSON-Prompt-Modifier for ComfyUI

[![ComfyUI](https://img.shields.io/badge/ComfyUI-Custom%20Node-blue)](https://github.com/comfyanonymous/ComfyUI)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

一个简洁的ComfyUI自定义节点，用于加载、编辑和导出JSON格式的提示词文件。

## ✨ 功能特性

- 📂 **加载JSON文件** - 支持上传和解析txt/json格式的提示词文件
- 👁️ **可视化展示** - 在节点内直接展示JSON结构，支持语法高亮
- ✏️ **实时编辑** - 在节点界面直接修改JSON内容
- 💾 **灵活导出** - 支持自定义保存路径，自动命名

## 🚀 安装方法

### 方法一：通过ComfyUI Manager（推荐）
1. 打开ComfyUI Manager
2. 点击 "Install Custom Nodes"
3. 搜索 "JSON-Prompt-Modifier"
4. 点击 Install

### 方法二：手动安装
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/yourusername/ComfyUI-JSON-Prompt-Modifier.git

##  📖 使用指南
基本操作流程
添加节点：在ComfyUI右键菜单中找到 utils/prompt/JSON-Prompt-Modifier 📝
加载文件：
点击 "📁 选择JSON文件" 按钮
或在 file_path 输入框填入绝对路径
将 operation 设为 load
查看与编辑：
JSON内容会显示在节点的可视化编辑器中
直接在文本区域修改内容
导出：
点击 "💾 导出文件" 按钮
自定义保存路径或自动生成 _modified.json
输入参数说明
| 参数名            | 类型     | 说明             |
| -------------- | ------ | -------------- |
| `file_path`    | STRING | JSON文件的绝对路径    |
| `operation`    | COMBO  | 操作类型：load/save |
| `json_content` | STRING | JSON内容文本（可编辑）  |
| `save_path`    | STRING | 自定义保存路径（可选）    |

输出说明
json_string: JSON字符串格式输出
json_object: JSON对象格式输出
success: 操作是否成功（布尔值）
