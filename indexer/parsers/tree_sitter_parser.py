"""
Tree-sitter Parser
Advanced code parsing using Tree-sitter for multiple programming languages.
"""

import os
import re
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

import tree_sitter
from tree_sitter import Language, Parser, Node

from indexer.parsers.language_configs import LANGUAGE_CONFIGS, get_language_config


class ChunkType(Enum):
    """Types of code chunks that can be extracted."""
    FUNCTION = "function"
    METHOD = "method"
    CLASS = "class"
    INTERFACE = "interface"
    STRUCT = "struct"
    ENUM = "enum"
    VARIABLE = "variable"
    IMPORT = "import"
    COMMENT = "comment"
    DOCSTRING = "docstring"


@dataclass
class CodeChunk:
    """Represents a parsed code chunk with metadata."""
    
    id: str
    content: str
    chunk_type: ChunkType
    language: str
    file_path: str
    line_start: int
    line_end: int
    function_name: Optional[str] = None
    class_name: Optional[str] = None
    module_name: Optional[str] = None
    docstring: Optional[str] = None
    complexity_score: float = 0.0
    dependencies: List[str] = None
    context: Optional[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


class TreeSitterParser:
    """Advanced Tree-sitter based code parser."""
    
    def __init__(self):
        self.parsers: Dict[str, Parser] = {}
        self.languages: Dict[str, Language] = {}
        self._initialize_languages()
    
    def _initialize_languages(self):
        """Initialize Tree-sitter languages and parsers."""
        try:
            # Build languages from source (in production, use pre-built binaries)
            for lang_name, config in LANGUAGE_CONFIGS.items():
                try:
                    # In a real implementation, you would have pre-built language libraries
                    # For now, we'll simulate the language loading
                    language_lib_path = f"tree-sitter-{lang_name}.so"
                    
                    if os.path.exists(language_lib_path):
                        language = Language(language_lib_path, lang_name)
                        parser = Parser()
                        parser.set_language(language)
                        
                        self.languages[lang_name] = language
                        self.parsers[lang_name] = parser
                        
                except Exception as e:
                    print(f"Warning: Could not load Tree-sitter language for {lang_name}: {e}")
                    
        except Exception as e:
            print(f"Error initializing Tree-sitter languages: {e}")
    
    def parse_file(self, file_path: str, max_chunk_size: int = 500) -> List[CodeChunk]:
        """
        Parse a source code file and extract meaningful chunks.
        
        Args:
            file_path: Path to the source code file
            max_chunk_size: Maximum size of each chunk in tokens
            
        Returns:
            List of CodeChunk objects
        """
        try:
            # Determine language from file extension
            language = self._detect_language(file_path)
            if not language:
                return []
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if not content.strip():
                return []
            
            # Parse with Tree-sitter if available, otherwise use fallback
            if language in self.parsers:
                return self._parse_with_tree_sitter(file_path, content, language, max_chunk_size)
            else:
                return self._parse_with_fallback(file_path, content, language, max_chunk_size)
                
        except Exception as e:
            print(f"Error parsing file {file_path}: {e}")
            return []
    
    def _detect_language(self, file_path: str) -> Optional[str]:
        """Detect programming language from file extension."""
        extension = Path(file_path).suffix.lower()
        
        for lang_name, config in LANGUAGE_CONFIGS.items():
            if extension in config["extensions"]:
                return lang_name
        
        return None
    
    def _parse_with_tree_sitter(self, file_path: str, content: str, language: str, max_chunk_size: int) -> List[CodeChunk]:
        """Parse code using Tree-sitter AST."""
        chunks = []
        parser = self.parsers[language]
        config = get_language_config(language)
        
        try:
            # Parse the code
            tree = parser.parse(bytes(content, 'utf-8'))
            root_node = tree.root_node
            
            # Extract different types of nodes
            chunks.extend(self._extract_functions(root_node, content, file_path, language, config))
            chunks.extend(self._extract_classes(root_node, content, file_path, language, config))
            chunks.extend(self._extract_imports(root_node, content, file_path, language, config))
            chunks.extend(self._extract_comments(root_node, content, file_path, language, config))
            
            # Split large chunks if necessary
            chunks = self._split_large_chunks(chunks, max_chunk_size)
            
            # Add context to chunks
            chunks = self._add_context(chunks, content)
            
        except Exception as e:
            print(f"Tree-sitter parsing error for {file_path}: {e}")
            # Fallback to simple parsing
            chunks = self._parse_with_fallback(file_path, content, language, max_chunk_size)
        
        return chunks
    
    def _parse_with_fallback(self, file_path: str, content: str, language: str, max_chunk_size: int) -> List[CodeChunk]:
        """Fallback parsing using regex patterns when Tree-sitter is not available."""
        chunks = []
        lines = content.split('\n')
        config = get_language_config(language)
        
        try:
            # Extract functions using regex patterns
            chunks.extend(self._extract_functions_regex(content, lines, file_path, language, config))
            
            # Extract classes using regex patterns
            chunks.extend(self._extract_classes_regex(content, lines, file_path, language, config))
            
            # Extract imports
            chunks.extend(self._extract_imports_regex(content, lines, file_path, language, config))
            
            # Split into smaller chunks if needed
            chunks = self._split_large_chunks(chunks, max_chunk_size)
            
        except Exception as e:
            print(f"Fallback parsing error for {file_path}: {e}")
            # Last resort: split by lines
            chunks = self._split_by_lines(content, file_path, language, max_chunk_size)
        
        return chunks
    
    def _extract_functions(self, node: Node, content: str, file_path: str, language: str, config: Dict) -> List[CodeChunk]:
        """Extract function definitions from AST."""
        chunks = []
        
        # Function node types vary by language
        function_types = {
            'python': ['function_definition', 'async_function_definition'],
            'javascript': ['function_declaration', 'function_expression', 'arrow_function'],
            'typescript': ['function_declaration', 'function_expression', 'arrow_function', 'method_definition'],
            'java': ['method_declaration', 'constructor_declaration'],
            'cpp': ['function_definition', 'function_declarator'],
            'rust': ['function_item'],
            'go': ['function_declaration', 'method_declaration']
        }
        
        target_types = function_types.get(language, ['function_definition'])
        
        def extract_recursive(node: Node):
            if node.type in target_types:
                chunk = self._create_function_chunk(node, content, file_path, language)
                if chunk:
                    chunks.append(chunk)
            
            for child in node.children:
                extract_recursive(child)
        
        extract_recursive(node)
        return chunks
    
    def _extract_classes(self, node: Node, content: str, file_path: str, language: str, config: Dict) -> List[CodeChunk]:
        """Extract class definitions from AST."""
        chunks = []
        
        class_types = {
            'python': ['class_definition'],
            'javascript': ['class_declaration'],
            'typescript': ['class_declaration', 'interface_declaration'],
            'java': ['class_declaration', 'interface_declaration'],
            'cpp': ['class_specifier', 'struct_specifier'],
            'rust': ['struct_item', 'enum_item', 'trait_item'],
            'go': ['type_declaration']
        }
        
        target_types = class_types.get(language, ['class_definition'])
        
        def extract_recursive(node: Node):
            if node.type in target_types:
                chunk = self._create_class_chunk(node, content, file_path, language)
                if chunk:
                    chunks.append(chunk)
            
            for child in node.children:
                extract_recursive(child)
        
        extract_recursive(node)
        return chunks
    
    def _extract_imports(self, node: Node, content: str, file_path: str, language: str, config: Dict) -> List[CodeChunk]:
        """Extract import statements from AST."""
        chunks = []
        
        import_types = {
            'python': ['import_statement', 'import_from_statement'],
            'javascript': ['import_statement'],
            'typescript': ['import_statement'],
            'java': ['import_declaration'],
            'cpp': ['preproc_include'],
            'rust': ['use_declaration'],
            'go': ['import_declaration']
        }
        
        target_types = import_types.get(language, ['import_statement'])
        
        def extract_recursive(node: Node):
            if node.type in target_types:
                chunk = self._create_import_chunk(node, content, file_path, language)
                if chunk:
                    chunks.append(chunk)
            
            for child in node.children:
                extract_recursive(child)
        
        extract_recursive(node)
        return chunks
    
    def _extract_comments(self, node: Node, content: str, file_path: str, language: str, config: Dict) -> List[CodeChunk]:
        """Extract comments and docstrings from AST."""
        chunks = []
        
        comment_types = {
            'python': ['comment', 'string'],  # string can be docstring
            'javascript': ['comment'],
            'typescript': ['comment'],
            'java': ['comment'],
            'cpp': ['comment'],
            'rust': ['line_comment', 'block_comment'],
            'go': ['comment']
        }
        
        target_types = comment_types.get(language, ['comment'])
        
        def extract_recursive(node: Node):
            if node.type in target_types:
                chunk = self._create_comment_chunk(node, content, file_path, language)
                if chunk and len(chunk.content.strip()) > 20:  # Only meaningful comments
                    chunks.append(chunk)
            
            for child in node.children:
                extract_recursive(child)
        
        extract_recursive(node)
        return chunks
    
    def _create_function_chunk(self, node: Node, content: str, file_path: str, language: str) -> Optional[CodeChunk]:
        """Create a CodeChunk for a function node."""
        try:
            lines = content.split('\n')
            start_line = node.start_point[0]
            end_line = node.end_point[0]
            
            # Extract function content
            function_content = '\n'.join(lines[start_line:end_line + 1])
            
            # Extract function name (simplified)
            function_name = self._extract_function_name(node, content)
            
            # Generate unique ID
            chunk_id = f"{file_path}:{start_line}:{end_line}:function"
            
            return CodeChunk(
                id=chunk_id,
                content=function_content,
                chunk_type=ChunkType.FUNCTION,
                language=language,
                file_path=file_path,
                line_start=start_line + 1,  # 1-based line numbers
                line_end=end_line + 1,
                function_name=function_name,
                complexity_score=self._calculate_complexity(function_content)
            )
            
        except Exception as e:
            print(f"Error creating function chunk: {e}")
            return None
    
    def _create_class_chunk(self, node: Node, content: str, file_path: str, language: str) -> Optional[CodeChunk]:
        """Create a CodeChunk for a class node."""
        try:
            lines = content.split('\n')
            start_line = node.start_point[0]
            end_line = node.end_point[0]
            
            # Extract class content
            class_content = '\n'.join(lines[start_line:end_line + 1])
            
            # Extract class name (simplified)
            class_name = self._extract_class_name(node, content)
            
            # Generate unique ID
            chunk_id = f"{file_path}:{start_line}:{end_line}:class"
            
            return CodeChunk(
                id=chunk_id,
                content=class_content,
                chunk_type=ChunkType.CLASS,
                language=language,
                file_path=file_path,
                line_start=start_line + 1,
                line_end=end_line + 1,
                class_name=class_name,
                complexity_score=self._calculate_complexity(class_content)
            )
            
        except Exception as e:
            print(f"Error creating class chunk: {e}")
            return None
    
    def _create_import_chunk(self, node: Node, content: str, file_path: str, language: str) -> Optional[CodeChunk]:
        """Create a CodeChunk for an import node."""
        try:
            lines = content.split('\n')
            start_line = node.start_point[0]
            end_line = node.end_point[0]
            
            # Extract import content
            import_content = '\n'.join(lines[start_line:end_line + 1])
            
            # Generate unique ID
            chunk_id = f"{file_path}:{start_line}:{end_line}:import"
            
            return CodeChunk(
                id=chunk_id,
                content=import_content,
                chunk_type=ChunkType.IMPORT,
                language=language,
                file_path=file_path,
                line_start=start_line + 1,
                line_end=end_line + 1,
                complexity_score=0.1  # Imports are simple
            )
            
        except Exception as e:
            print(f"Error creating import chunk: {e}")
            return None
    
    def _create_comment_chunk(self, node: Node, content: str, file_path: str, language: str) -> Optional[CodeChunk]:
        """Create a CodeChunk for a comment node."""
        try:
            lines = content.split('\n')
            start_line = node.start_point[0]
            end_line = node.end_point[0]
            
            # Extract comment content
            comment_content = '\n'.join(lines[start_line:end_line + 1])
            
            # Generate unique ID
            chunk_id = f"{file_path}:{start_line}:{end_line}:comment"
            
            # Determine if it's a docstring
            chunk_type = ChunkType.DOCSTRING if self._is_docstring(comment_content, language) else ChunkType.COMMENT
            
            return CodeChunk(
                id=chunk_id,
                content=comment_content,
                chunk_type=chunk_type,
                language=language,
                file_path=file_path,
                line_start=start_line + 1,
                line_end=end_line + 1,
                complexity_score=0.1  # Comments are simple
            )
            
        except Exception as e:
            print(f"Error creating comment chunk: {e}")
            return None

    def _extract_function_name(self, node: Node, content: str) -> Optional[str]:
        """Extract function name from AST node."""
        try:
            # This is a simplified implementation
            # In practice, you'd need language-specific logic
            for child in node.children:
                if child.type == 'identifier':
                    start_byte = child.start_byte
                    end_byte = child.end_byte
                    return content[start_byte:end_byte]
            return None
        except:
            return None

    def _extract_class_name(self, node: Node, content: str) -> Optional[str]:
        """Extract class name from AST node."""
        try:
            # This is a simplified implementation
            for child in node.children:
                if child.type == 'identifier':
                    start_byte = child.start_byte
                    end_byte = child.end_byte
                    return content[start_byte:end_byte]
            return None
        except:
            return None

    def _is_docstring(self, content: str, language: str) -> bool:
        """Determine if a comment is a docstring."""
        if language == 'python':
            return '"""' in content or "'''" in content
        elif language in ['javascript', 'typescript', 'java']:
            return content.strip().startswith('/**')
        return False

    def _calculate_complexity(self, content: str) -> float:
        """Calculate a simple complexity score for code."""
        try:
            # Simple complexity based on keywords and structure
            complexity_keywords = [
                'if', 'else', 'elif', 'for', 'while', 'try', 'catch', 'except',
                'switch', 'case', 'break', 'continue', 'return', 'yield'
            ]

            score = 1.0  # Base complexity
            lines = content.split('\n')

            for line in lines:
                line = line.strip().lower()
                for keyword in complexity_keywords:
                    if keyword in line:
                        score += 0.5

            # Normalize by number of lines
            return min(score / max(len(lines), 1), 10.0)

        except:
            return 1.0

    def _split_large_chunks(self, chunks: List[CodeChunk], max_size: int) -> List[CodeChunk]:
        """Split chunks that are too large."""
        result = []

        for chunk in chunks:
            if len(chunk.content) <= max_size:
                result.append(chunk)
            else:
                # Split large chunk into smaller pieces
                sub_chunks = self._split_chunk(chunk, max_size)
                result.extend(sub_chunks)

        return result

    def _split_chunk(self, chunk: CodeChunk, max_size: int) -> List[CodeChunk]:
        """Split a single chunk into smaller pieces."""
        sub_chunks = []
        lines = chunk.content.split('\n')

        current_content = []
        current_size = 0
        start_line = chunk.line_start

        for i, line in enumerate(lines):
            line_size = len(line)

            if current_size + line_size > max_size and current_content:
                # Create sub-chunk
                sub_chunk = CodeChunk(
                    id=f"{chunk.id}_part_{len(sub_chunks)}",
                    content='\n'.join(current_content),
                    chunk_type=chunk.chunk_type,
                    language=chunk.language,
                    file_path=chunk.file_path,
                    line_start=start_line,
                    line_end=start_line + len(current_content) - 1,
                    function_name=chunk.function_name,
                    class_name=chunk.class_name,
                    module_name=chunk.module_name,
                    complexity_score=chunk.complexity_score * (len(current_content) / len(lines))
                )
                sub_chunks.append(sub_chunk)

                # Reset for next chunk
                current_content = [line]
                current_size = line_size
                start_line = chunk.line_start + i
            else:
                current_content.append(line)
                current_size += line_size

        # Add remaining content
        if current_content:
            sub_chunk = CodeChunk(
                id=f"{chunk.id}_part_{len(sub_chunks)}",
                content='\n'.join(current_content),
                chunk_type=chunk.chunk_type,
                language=chunk.language,
                file_path=chunk.file_path,
                line_start=start_line,
                line_end=start_line + len(current_content) - 1,
                function_name=chunk.function_name,
                class_name=chunk.class_name,
                module_name=chunk.module_name,
                complexity_score=chunk.complexity_score * (len(current_content) / len(lines))
            )
            sub_chunks.append(sub_chunk)

        return sub_chunks

    def _add_context(self, chunks: List[CodeChunk], content: str) -> List[CodeChunk]:
        """Add surrounding context to chunks."""
        lines = content.split('\n')

        for chunk in chunks:
            try:
                # Add 2 lines before and after as context
                context_start = max(0, chunk.line_start - 3)
                context_end = min(len(lines), chunk.line_end + 2)

                context_lines = lines[context_start:context_start + 2]  # Before
                context_lines.extend(lines[chunk.line_end:context_end])  # After

                if context_lines:
                    chunk.context = '\n'.join(context_lines)

            except Exception as e:
                print(f"Error adding context to chunk {chunk.id}: {e}")

        return chunks
