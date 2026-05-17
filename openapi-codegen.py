#!/usr/bin/env python3
"""
HookSniff OpenAPI Codegen — SDK Type/Model Üretici
Kullanım: python3 openapi-codegen.py [dil] [--validate]

Diller: node, python, go, rust, ruby, java, kotlin, php, csharp, all
--validate: Sadece doğrula, üretme

OpenAPI spec: docs/openapi.yaml
Çıktı: sdks/<dil>/src/generated/ veya sdks/<dil>/hooksniff/models/
"""

import sys
import os
import re
import json
import yaml
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).parent
SPEC_PATH = SCRIPT_DIR / "docs" / "openapi.yaml"
SDK_DIR = SCRIPT_DIR / "sdks"

def load_spec() -> dict:
    """OpenAPI spec'i yükle."""
    with open(SPEC_PATH) as f:
        return yaml.safe_load(f)

def get_schemas(spec: dict) -> dict:
    """Component schema'larını al."""
    return spec.get("components", {}).get("schemas", {})

def pascal_case(s: str) -> str:
    """snake_case → PascalCase"""
    return "".join(w.capitalize() for w in s.replace("-", "_").split("_"))

def snake_case(s: str) -> str:
    """camelCase → snake_case"""
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1_\2', s)
    s = re.sub(r'([a-z\d])([A-Z])', r'\1_\2', s)
    return s.lower()

def camel_case(s: str) -> str:
    """snake_case → camelCase"""
    parts = s.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])

def resolve_ref(ref: str, spec: dict) -> dict:
    """$ref çöz."""
    parts = ref.lstrip("#/").split("/")
    obj = spec
    for p in parts:
        obj = obj.get(p, {})
    return obj

def get_type_name(ref: str) -> str:
    """$ref'den type adı al."""
    return ref.split("/")[-1]

# ── TypeScript (Node.js) ──────────────────────────────────

def generate_typescript_type(name: str, schema: dict, spec: dict) -> str:
    """Tek bir TypeScript interface üret."""
    lines = []
    desc = schema.get("description", "")
    if desc:
        lines.append(f"/** {desc} */")
    lines.append(f"export interface {pascal_case(name)} {{")

    props = schema.get("properties", {})
    required = schema.get("required", [])

    for pname, pschema in props.items():
        ts_type = typescript_type(pschema, spec)
        optional = "?" if pname not in required else ""
        pdesc = pschema.get("description", "")
        if pdesc:
            lines.append(f"  /** {pdesc} */")
        lines.append(f"  {pname}{optional}: {ts_type};")

    lines.append("}")
    return "\n".join(lines)

def typescript_type(schema: dict, spec: dict) -> str:
    """OpenAPI type → TypeScript type."""
    if "$ref" in schema:
        return pascal_case(get_type_name(schema["$ref"]))
    t = schema.get("type", "any")
    if t == "string":
        if schema.get("enum"):
            return " | ".join(f"'{v}'" for v in schema["enum"])
        return "string"
    elif t == "integer" or t == "number":
        return "number"
    elif t == "boolean":
        return "boolean"
    elif t == "array":
        items = schema.get("items", {})
        return f"{typescript_type(items, spec)}[]"
    elif t == "object":
        additional = schema.get("additionalProperties")
        if additional:
            return f"Record<string, {typescript_type(additional, spec)}>"
        return "Record<string, unknown>"
    return "unknown"

def generate_typescript(spec: dict, out_dir: Path):
    """Tüm TypeScript types üret."""
    schemas = get_schemas(spec)
    out_dir.mkdir(parents=True, exist_ok=True)

    lines = [
        "// ═══════════════════════════════════════════════════════════",
        "// HookSniff SDK — Auto-generated from OpenAPI spec",
        "// DO NOT EDIT — regenerate with: python3 openapi-codegen.py node",
        f"// Source: docs/openapi.yaml ({len(schemas)} schemas)",
        "// ═══════════════════════════════════════════════════════════",
        "",
    ]

    for name, schema in sorted(schemas.items()):
        if schema.get("type") == "object" or "properties" in schema:
            lines.append(generate_typescript_type(name, schema, spec))
            lines.append("")

    # Enum'lar
    for name, schema in sorted(schemas.items()):
        if "enum" in schema and schema.get("type") == "string":
            desc = schema.get("description", "")
            if desc:
                lines.append(f"/** {desc} */")
            vals = " | ".join(f"'{v}'" for v in schema["enum"])
            lines.append(f"export type {pascal_case(name)} = {vals};")
            lines.append("")

    out_file = out_dir / "types.ts"
    out_file.write_text("\n".join(lines))
    print(f"  ✅ {out_file} ({len(schemas)} schemas)")

# ── Python ────────────────────────────────────────────────

def python_type(schema: dict, spec: dict) -> str:
    """OpenAPI type → Python type."""
    if "$ref" in schema:
        return pascal_case(get_type_name(schema["$ref"]))
    t = schema.get("type", "Any")
    if t == "string":
        return "str"
    elif t == "integer":
        return "int"
    elif t == "number":
        return "float"
    elif t == "boolean":
        return "bool"
    elif t == "array":
        items = schema.get("items", {})
        return f"list[{python_type(items, spec)}]"
    elif t == "object":
        additional = schema.get("additionalProperties")
        if additional:
            return f"dict[str, {python_type(additional, spec)}]"
        return "dict[str, Any]"
    return "Any"

def generate_python_type(name: str, schema: dict, spec: dict) -> str:
    """Tek bir Python dataclass üret."""
    lines = []
    desc = schema.get("description", "")
    if desc:
        lines.append(f'    """{desc}"""')

    props = schema.get("properties", {})
    required = schema.get("required", [])

    for pname, pschema in props.items():
        py_type = python_type(pschema, spec)
        if pname not in required:
            py_type = f"Optional[{py_type}]"
            default = "None"
            lines.append(f"    {pname}: {py_type} = {default}")
        else:
            lines.append(f"    {pname}: {py_type}")

    return "\n".join(lines)

def generate_python(spec: dict, out_dir: Path):
    """Tüm Python dataclass'lar üret."""
    schemas = get_schemas(spec)
    out_dir.mkdir(parents=True, exist_ok=True)

    lines = [
        '"""',
        "HookSniff SDK — Auto-generated from OpenAPI spec",
        "DO NOT EDIT — regenerate with: python3 openapi-codegen.py python",
        f"Source: docs/openapi.yaml ({len(schemas)} schemas)",
        '"""',
        "",
        "from __future__ import annotations",
        "from dataclasses import dataclass, field",
        "from typing import Any, Optional",
        "",
    ]

    for name, schema in sorted(schemas.items()):
        if schema.get("type") == "object" or "properties" in schema:
            lines.append(f"@dataclass")
            lines.append(f"class {pascal_case(name)}:")
            body = generate_python_type(name, schema, spec)
            if body:
                lines.append(body)
            else:
                lines.append("    pass")
            lines.append("")

    out_file = out_dir / "generated_models.py"
    out_file.write_text("\n".join(lines))
    print(f"  ✅ {out_file} ({len(schemas)} schemas)")

# ── Go ────────────────────────────────────────────────────

def go_type(schema: dict, spec: dict) -> str:
    """OpenAPI type → Go type."""
    if "$ref" in schema:
        return pascal_case(get_type_name(schema["$ref"]))
    t = schema.get("type", "interface{}")
    if t == "string":
        return "string"
    elif t == "integer":
        return "int64"
    elif t == "number":
        return "float64"
    elif t == "boolean":
        return "bool"
    elif t == "array":
        items = schema.get("items", {})
        return f"[]{go_type(items, spec)}"
    elif t == "object":
        additional = schema.get("additionalProperties")
        if additional:
            return f"map[string]{go_type(additional, spec)}"
        return "map[string]interface{}"
    return "interface{}"

def go_json_tag(pname: str, required: bool) -> str:
    """Go JSON tag."""
    omitempty = ",omitempty" if not required else ""
    return f'`json:"{pname}{omitempty}"`'

def generate_go_type(name: str, schema: dict, spec: dict) -> str:
    """Tek bir Go struct üret."""
    lines = []
    desc = schema.get("description", "")
    if desc:
        lines.append(f"// {pascal_case(name)} {desc}")

    lines.append(f"type {pascal_case(name)} struct {{")
    props = schema.get("properties", {})
    required = schema.get("required", [])

    for pname, pschema in props.items():
        go_t = go_type(pschema, spec)
        tag = go_json_tag(pname, pname in required)
        field_name = pascal_case(pname)
        lines.append(f"\t{field_name} {go_t} {tag}")

    lines.append("}")
    return "\n".join(lines)

def generate_go(spec: dict, out_dir: Path):
    """Tüm Go struct'lar üret."""
    schemas = get_schemas(spec)
    out_dir.mkdir(parents=True, exist_ok=True)

    lines = [
        "// Code generated by openapi-codegen; DO NOT EDIT.",
        f"// Source: docs/openapi.yaml ({len(schemas)} schemas)",
        "",
        "package hooksniff",
        "",
        'import "time"',
        "",
    ]

    for name, schema in sorted(schemas.items()):
        if schema.get("type") == "object" or "properties" in schema:
            lines.append(generate_go_type(name, schema, spec))
            lines.append("")

    out_file = out_dir / "generated_models.go"
    out_file.write_text("\n".join(lines))
    print(f"  ✅ {out_file} ({len(schemas)} schemas)")

# ── Validation ────────────────────────────────────────────

def validate_spec(spec: dict) -> list[str]:
    """OpenAPI spec'i doğrula."""
    issues = []

    # Paths kontrol
    paths = spec.get("paths", {})
    if not paths:
        issues.append("❌ Hiçbir endpoint tanımlanmamış")

    # Schema kontrol
    schemas = get_schemas(spec)
    if not schemas:
        issues.append("❌ Hiçbir schema tanımlanmamış")

    # Required field kontrol
    for name, schema in schemas.items():
        props = schema.get("properties", {})
        required = schema.get("required", [])
        for r in required:
            if r not in props:
                issues.append(f"⚠️  {name}: required field '{r}' properties'de yok")

    # $ref kontrol
    for path, methods in paths.items():
        for method, details in methods.items() if isinstance(methods, dict) else []:
            if not isinstance(details, dict):
                continue
            req_body = details.get("requestBody", {})
            if "$ref" in req_body:
                ref_name = get_type_name(req_body["$ref"])
                if ref_name not in schemas:
                    issues.append(f"⚠️  {method.upper()} {path}: $ref '{ref_name}' bulunamadı")

    # Duplicate schema isimleri (case-insensitive)
    names_lower = {}
    for name in schemas:
        lower = name.lower()
        if lower in names_lower:
            issues.append(f"⚠️  Duplicate schema (case): '{name}' ve '{names_lower[lower]}'")
        names_lower[lower] = name

    if not issues:
        issues.append("✅ OpenAPI spec doğrulandı — sorun bulunamadı")

    return issues

# ── Ana Akış ──────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Kullanım: python3 openapi-codegen.py [node|python|go|rust|ruby|java|kotlin|php|csharp|all] [--validate]")
        sys.exit(1)

    lang = sys.argv[1]
    validate_only = "--validate" in sys.argv

    print(f"📋 OpenAPI spec yükleniyor: {SPEC_PATH}")
    spec = load_spec()
    schemas = get_schemas(spec)
    paths = spec.get("paths", {})
    print(f"   {len(schemas)} schema, {len(paths)} endpoint")
    print()

    if validate_only or lang == "validate":
        print("🔍 Doğrulanıyor...")
        issues = validate_spec(spec)
        for issue in issues:
            print(f"  {issue}")
        return

    generators = {
        "node": ("TypeScript", generate_typescript, SDK_DIR / "node" / "src" / "generated"),
        "python": ("Python", generate_python, SDK_DIR / "python" / "hooksniff" / "models" / "generated"),
        "go": ("Go", generate_go, SDK_DIR / "go" / "generated"),
    }

    if lang == "all":
        targets = generators.items()
    elif lang in generators:
        targets = [(lang, generators[lang])]
    else:
        print(f"❌ Desteklenmeyen dil: {lang}")
        print(f"   Desteklenen: {', '.join(generators.keys())}, all, validate")
        sys.exit(1)

    for name, (label, gen_func, out_dir) in targets:
        print(f"🔧 {label} üretiliyor...")
        gen_func(spec, out_dir)

    print()
    print("✅ Tamamlandı!")

if __name__ == "__main__":
    main()
