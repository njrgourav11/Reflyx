"""
Language Configuration for Tree-sitter Parsing
Defines language-specific configurations for code parsing and analysis.
"""

from typing import Dict, List, Any, Optional


# Language configurations for Tree-sitter parsing
LANGUAGE_CONFIGS = {
    "python": {
        "extensions": [".py", ".pyw", ".pyi"],
        "tree_sitter_language": "python",
        "comment_patterns": ["#"],
        "docstring_patterns": ['"""', "'''"],
        "function_keywords": ["def", "async def"],
        "class_keywords": ["class"],
        "import_keywords": ["import", "from"],
        "complexity_keywords": [
            "if", "elif", "else", "for", "while", "try", "except", "finally",
            "with", "match", "case", "break", "continue", "return", "yield",
            "raise", "assert", "lambda"
        ],
        "node_types": {
            "function": ["function_definition", "async_function_definition"],
            "class": ["class_definition"],
            "import": ["import_statement", "import_from_statement"],
            "comment": ["comment", "string"]
        }
    },
    
    "javascript": {
        "extensions": [".js", ".jsx", ".mjs", ".cjs"],
        "tree_sitter_language": "javascript",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"],
        "function_keywords": ["function", "=>"],
        "class_keywords": ["class"],
        "import_keywords": ["import", "require"],
        "complexity_keywords": [
            "if", "else", "for", "while", "do", "switch", "case", "try", "catch",
            "finally", "break", "continue", "return", "throw", "async", "await"
        ],
        "node_types": {
            "function": ["function_declaration", "function_expression", "arrow_function", "method_definition"],
            "class": ["class_declaration"],
            "import": ["import_statement"],
            "comment": ["comment"]
        }
    },
    
    "typescript": {
        "extensions": [".ts", ".tsx", ".d.ts"],
        "tree_sitter_language": "typescript",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"],
        "function_keywords": ["function", "=>"],
        "class_keywords": ["class", "interface", "type"],
        "import_keywords": ["import", "require"],
        "complexity_keywords": [
            "if", "else", "for", "while", "do", "switch", "case", "try", "catch",
            "finally", "break", "continue", "return", "throw", "async", "await"
        ],
        "node_types": {
            "function": ["function_declaration", "function_expression", "arrow_function", "method_definition"],
            "class": ["class_declaration", "interface_declaration", "type_alias_declaration"],
            "import": ["import_statement"],
            "comment": ["comment"]
        }
    },
    
    "java": {
        "extensions": [".java"],
        "tree_sitter_language": "java",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"],
        "function_keywords": ["public", "private", "protected", "static"],
        "class_keywords": ["class", "interface", "enum"],
        "import_keywords": ["import"],
        "complexity_keywords": [
            "if", "else", "for", "while", "do", "switch", "case", "try", "catch",
            "finally", "break", "continue", "return", "throw", "synchronized"
        ],
        "node_types": {
            "function": ["method_declaration", "constructor_declaration"],
            "class": ["class_declaration", "interface_declaration", "enum_declaration"],
            "import": ["import_declaration"],
            "comment": ["comment"]
        }
    },
    
    "cpp": {
        "extensions": [".cpp", ".cc", ".cxx", ".c++", ".c", ".h", ".hpp", ".hxx", ".h++"],
        "tree_sitter_language": "cpp",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["/**"],
        "function_keywords": ["void", "int", "char", "float", "double", "bool"],
        "class_keywords": ["class", "struct", "union", "enum"],
        "import_keywords": ["#include"],
        "complexity_keywords": [
            "if", "else", "for", "while", "do", "switch", "case", "try", "catch",
            "break", "continue", "return", "throw", "goto"
        ],
        "node_types": {
            "function": ["function_definition", "function_declarator"],
            "class": ["class_specifier", "struct_specifier", "union_specifier", "enum_specifier"],
            "import": ["preproc_include"],
            "comment": ["comment"]
        }
    },
    
    "rust": {
        "extensions": [".rs"],
        "tree_sitter_language": "rust",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["///", "/**"],
        "function_keywords": ["fn"],
        "class_keywords": ["struct", "enum", "trait", "impl"],
        "import_keywords": ["use"],
        "complexity_keywords": [
            "if", "else", "for", "while", "loop", "match", "break", "continue",
            "return", "panic!", "unwrap", "expect"
        ],
        "node_types": {
            "function": ["function_item"],
            "class": ["struct_item", "enum_item", "trait_item", "impl_item"],
            "import": ["use_declaration"],
            "comment": ["line_comment", "block_comment"]
        }
    },
    
    "go": {
        "extensions": [".go"],
        "tree_sitter_language": "go",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["//"],
        "function_keywords": ["func"],
        "class_keywords": ["type", "struct", "interface"],
        "import_keywords": ["import"],
        "complexity_keywords": [
            "if", "else", "for", "switch", "case", "select", "break", "continue",
            "return", "goto", "defer", "panic", "recover"
        ],
        "node_types": {
            "function": ["function_declaration", "method_declaration"],
            "class": ["type_declaration"],
            "import": ["import_declaration"],
            "comment": ["comment"]
        }
    },
    
    "php": {
        "extensions": [".php", ".phtml", ".php3", ".php4", ".php5", ".phps"],
        "tree_sitter_language": "php",
        "comment_patterns": ["//", "/*", "#"],
        "docstring_patterns": ["/**"],
        "function_keywords": ["function"],
        "class_keywords": ["class", "interface", "trait"],
        "import_keywords": ["require", "include", "use"],
        "complexity_keywords": [
            "if", "else", "elseif", "for", "foreach", "while", "do", "switch",
            "case", "try", "catch", "finally", "break", "continue", "return", "throw"
        ],
        "node_types": {
            "function": ["function_definition", "method_declaration"],
            "class": ["class_declaration", "interface_declaration", "trait_declaration"],
            "import": ["namespace_use_declaration"],
            "comment": ["comment"]
        }
    },
    
    "ruby": {
        "extensions": [".rb", ".rbw", ".rake", ".gemspec"],
        "tree_sitter_language": "ruby",
        "comment_patterns": ["#"],
        "docstring_patterns": ["=begin"],
        "function_keywords": ["def"],
        "class_keywords": ["class", "module"],
        "import_keywords": ["require", "load", "include"],
        "complexity_keywords": [
            "if", "else", "elsif", "unless", "for", "while", "until", "case",
            "when", "begin", "rescue", "ensure", "break", "next", "return",
            "raise", "yield"
        ],
        "node_types": {
            "function": ["method"],
            "class": ["class", "module"],
            "import": ["call"],  # require/include calls
            "comment": ["comment"]
        }
    },
    
    "csharp": {
        "extensions": [".cs"],
        "tree_sitter_language": "c_sharp",
        "comment_patterns": ["//", "/*"],
        "docstring_patterns": ["///", "/**"],
        "function_keywords": ["public", "private", "protected", "internal", "static"],
        "class_keywords": ["class", "interface", "struct", "enum"],
        "import_keywords": ["using"],
        "complexity_keywords": [
            "if", "else", "for", "foreach", "while", "do", "switch", "case",
            "try", "catch", "finally", "break", "continue", "return", "throw",
            "async", "await"
        ],
        "node_types": {
            "function": ["method_declaration", "constructor_declaration"],
            "class": ["class_declaration", "interface_declaration", "struct_declaration", "enum_declaration"],
            "import": ["using_directive"],
            "comment": ["comment"]
        }
    }
}


def get_language_config(language: str) -> Dict[str, Any]:
    """
    Get configuration for a specific language.
    
    Args:
        language: Programming language name
        
    Returns:
        Language configuration dictionary
    """
    return LANGUAGE_CONFIGS.get(language, {})


def get_supported_languages() -> List[str]:
    """Get list of supported programming languages."""
    return list(LANGUAGE_CONFIGS.keys())


def get_language_by_extension(extension: str) -> Optional[str]:
    """
    Get language name by file extension.
    
    Args:
        extension: File extension (e.g., '.py', '.js')
        
    Returns:
        Language name or None if not supported
    """
    extension = extension.lower()
    for language, config in LANGUAGE_CONFIGS.items():
        if extension in config["extensions"]:
            return language
    return None


def is_supported_file(file_path: str) -> bool:
    """
    Check if a file is supported for parsing.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if file is supported, False otherwise
    """
    from pathlib import Path
    extension = Path(file_path).suffix.lower()
    return get_language_by_extension(extension) is not None


def get_complexity_keywords(language: str) -> List[str]:
    """
    Get complexity keywords for a language.
    
    Args:
        language: Programming language name
        
    Returns:
        List of keywords that contribute to code complexity
    """
    config = get_language_config(language)
    return config.get("complexity_keywords", [])


def get_comment_patterns(language: str) -> List[str]:
    """
    Get comment patterns for a language.
    
    Args:
        language: Programming language name
        
    Returns:
        List of comment patterns
    """
    config = get_language_config(language)
    return config.get("comment_patterns", [])


def get_docstring_patterns(language: str) -> List[str]:
    """
    Get docstring patterns for a language.
    
    Args:
        language: Programming language name
        
    Returns:
        List of docstring patterns
    """
    config = get_language_config(language)
    return config.get("docstring_patterns", [])


def get_node_types(language: str, node_category: str) -> List[str]:
    """
    Get AST node types for a specific category in a language.
    
    Args:
        language: Programming language name
        node_category: Category of nodes (function, class, import, comment)
        
    Returns:
        List of AST node type names
    """
    config = get_language_config(language)
    node_types = config.get("node_types", {})
    return node_types.get(node_category, [])
