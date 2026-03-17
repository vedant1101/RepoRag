from tree_sitter_languages import get_parser
from pathlib import Path


# nodes that represent meaningful code blocks across languages
TARGET_NODES = {
    "function_definition",
    "function_declaration",
    "method_definition",
    "class_definition",
    "class_declaration",
    "struct_item",
    "impl_item",
    "interface_declaration",
    "enum_declaration"
}


EXTENSION_LANGUAGE_MAP = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
}


def detect_language(file_path: str):
    ext = Path(file_path).suffix
    return EXTENSION_LANGUAGE_MAP.get(ext)


def extract_name(node, code):

    for child in node.children:
        if child.type in [
            "identifier",
            "type_identifier",
            "property_identifier"
        ]:
            return code[child.start_byte:child.end_byte]

    return "anonymous"


def chunk_code(code: str, file_path: str):

    language = detect_language(file_path)

    if not language:
        return []

    parser = get_parser(language)

    tree = parser.parse(bytes(code, "utf8"))

    root = tree.root_node

    chunks = []

    def walk(node):

        if node.type in TARGET_NODES:

            start = node.start_byte
            end = node.end_byte

            chunk_text = code[start:end]

            name = extract_name(node, code)

            chunks.append({
    "type": node.type,
    "name": name,
    "code": chunk_text,
    "file_path": file_path,  
    "language": language,
    "startLine": node.start_point[0],
    "endLine": node.end_point[0]
})

        for child in node.children:
            walk(child)

    walk(root)

    return chunks