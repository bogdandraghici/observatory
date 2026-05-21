#!/usr/bin/env python3
"""Auto-fix ESLint issues for Angular/TypeScript project."""
import json, re, sys, os, subprocess
from collections import defaultdict

WEB_DIR = os.path.dirname(os.path.abspath(__file__))

def get_issues():
    result = subprocess.run(
        [f'{WEB_DIR}/node_modules/.bin/eslint', 'src/**/*.ts', '-f', 'json'],
        capture_output=True, text=True, cwd=WEB_DIR
    )
    data = json.loads(result.stdout)
    issues_by_file = defaultdict(list)
    for fe in data:
        fp = fe['filePath']
        for msg in fe.get('messages', []):
            rule = msg.get('ruleId')
            if rule:
                issues_by_file[fp].append({
                    'rule': rule,
                    'line': msg['line'],
                    'column': msg['column'],
                    'message': msg.get('message', ''),
                })
    return issues_by_file

def scan_body_return(lines, start):
    bc = 0
    fo = False
    has_ret = False
    for i in range(start, len(lines)):
        s = lines[i].strip()
        # Check for return BEFORE processing braces (so return { ... } is caught at bc==1)
        if fo and bc == 1 and re.match(r'return\s+\S', s):
            has_ret = True
        for ch in lines[i]:
            if ch == '{':
                bc += 1
                fo = True
            elif ch == '}':
                bc -= 1
                if fo and bc == 0:
                    return has_ret
    return has_ret

def fix_param_types(content, issues):
    """Add : any to untyped parameters reported by explicit-module-boundary-types."""
    param_issues = []
    for iss in issues:
        if iss['rule'] == '@typescript-eslint/explicit-module-boundary-types' and 'should be typed' in iss.get('message', ''):
            m = re.match(r"Argument '(\w+)' should be typed", iss['message'])
            if m:
                param_issues.append((iss['line'] - 1, iss['column'] - 1, m.group(1)))

    if not param_issues:
        return content

    lines = content.split('\n')
    # Process in reverse order to preserve column positions
    for line_idx, col, param_name in sorted(param_issues, key=lambda x: (-x[0], -x[1])):
        if line_idx >= len(lines):
            continue
        line = lines[line_idx]
        # Find the param at the reported column
        # The param name starts at col
        end_col = col + len(param_name)
        if end_col <= len(line) and line[col:end_col] == param_name:
            # Check what follows the param name
            rest = line[end_col:]
            # If already typed (has : after optional whitespace), skip
            if re.match(r'\s*:', rest):
                continue
            # If followed by , or ) or = (default value), insert : any
            if re.match(r'\s*[,)=?]', rest) or rest.strip() == '':
                lines[line_idx] = line[:end_col] + ': any' + line[end_col:]
        else:
            # Column mismatch - search for the param name near the column
            # Look in a wider range
            pattern = rf'\b{re.escape(param_name)}\b'
            for m in re.finditer(pattern, line):
                pos = m.start()
                end = m.end()
                rest_after = line[end:]
                if re.match(r'\s*:', rest_after):
                    continue  # already typed
                if re.match(r'\s*[,)=?]', rest_after) or rest_after.strip() == '':
                    # Check we're inside parens (a function signature)
                    before = line[:pos]
                    paren_depth = sum(1 for c in before if c == '(') - sum(1 for c in before if c == ')')
                    if paren_depth > 0:
                        lines[line_idx] = line[:end] + ': any' + line[end:]
                        break

    return '\n'.join(lines)


def find_method_close_paren(lines, start_line):
    """Find the closing paren of a method/function signature starting from start_line.
    Only considers the FIRST ( on the start_line as the beginning of params."""
    line = lines[start_line]
    # Find the first ( on this line
    first_open = -1
    for ci, ch in enumerate(line):
        if ch == '(':
            first_open = ci
            break
    if first_open < 0:
        return -1, -1

    pc = 0
    for i in range(start_line, min(start_line + 20, len(lines))):
        start_ci = first_open if i == start_line else 0
        for ci in range(start_ci, len(lines[i])):
            ch = lines[i][ci]
            if ch == '(':
                pc += 1
            elif ch == ')':
                pc -= 1
                if pc == 0:
                    return i, ci
    return -1, -1

def fix_return_types(content, issues):
    lines = content.split('\n')
    rt_lines = set()
    for iss in issues:
        if iss['rule'] in ('@typescript-eslint/explicit-module-boundary-types', '@typescript-eslint/explicit-function-return-type'):
            rt_lines.add(iss['line'] - 1)
    if not rt_lines:
        return content
    lm = {'ngOnInit','ngOnDestroy','ngOnChanges','ngAfterViewInit','ngAfterContentInit','ngAfterViewChecked','ngAfterContentChecked','ngDoCheck'}
    for li in sorted(rt_lines):
        if li >= len(lines):
            continue
        line = lines[li]
        # Verify this line looks like a method/function definition
        stripped = line.strip()
        is_method_def = bool(re.match(r'(async\s+)?(public\s+|private\s+|protected\s+)?(static\s+)?(get\s+|set\s+)?(\w+)\s*\(', stripped))
        is_arrow = '=>' in line or (li + 1 < len(lines) and '=>' in lines[li + 1])
        is_function = 'function ' in line or 'function(' in line
        if not is_method_def and not is_arrow and not is_function:
            # Check for standalone function like: export function foo(
            if not re.match(r'\s*(export\s+)?(async\s+)?function\s+', stripped):
                continue

        cl, cc = find_method_close_paren(lines, li)
        if cl < 0:
            continue
        rest = lines[cl][cc+1:]
        if re.match(r'\s*:', rest):
            continue
        is_lc = any(re.search(rf'\b{m}\s*\(', lines[li]) for m in lm)
        if is_lc:
            rt = 'void'
        elif stripped.startswith('get ') and not stripped.startswith('get('):
            rt = 'any'
        elif 'async ' in lines[li]:
            rt = 'Promise<any>'
        else:
            has_ret = scan_body_return(lines, li)
            rt = 'any' if has_ret else 'void'
        cline = lines[cl]
        lines[cl] = cline[:cc+1] + ': ' + rt + cline[cc+1:]
    return '\n'.join(lines)

def fix_empty_lifecycle(content, issues):
    li_issues = [i for i in issues if i['rule'] == '@angular-eslint/no-empty-lifecycle-method']
    if not li_issues:
        return content
    lines = content.split('\n')
    to_rm = set()
    for iss in sorted(li_issues, key=lambda x: -x['line']):
        idx = iss['line'] - 1
        bc = 0
        fo = False
        end = idx
        for i in range(idx, min(idx+5, len(lines))):
            for ch in lines[i]:
                if ch == '{':
                    bc += 1
                    fo = True
                elif ch == '}':
                    bc -= 1
                    if fo and bc == 0:
                        end = i
                        break
            if fo and bc == 0:
                break
        for i in range(idx, end+1):
            to_rm.add(i)
        if end+1 < len(lines) and lines[end+1].strip() == '':
            to_rm.add(end+1)
    return '\n'.join(l for i, l in enumerate(lines) if i not in to_rm)

def is_in_import_block(lines, idx):
    """Check if a line is inside a multi-line import { ... } from '...' block."""
    # Look backwards for 'import {'
    for i in range(idx, max(-1, idx - 20), -1):
        if 'import' in lines[i] and '{' in lines[i]:
            return True
        if 'from' in lines[i] and "'" in lines[i]:
            # We passed the end of an import, check if we're inside
            break
    return False

def remove_from_multiline_import(lines, idx, vn):
    """Remove an unused import from a multi-line import statement."""
    line = lines[idx].strip()
    # The line is just the variable name (possibly with comma and whitespace)
    # Check if the line is just the variable name
    if re.match(rf'^\s*{re.escape(vn)}\s*,?\s*$', lines[idx]):
        lines[idx] = ''
        return True
    # If the line has the variable among others on same line (shouldn't happen in multiline but just in case)
    if re.search(rf'\b{re.escape(vn)}\b', lines[idx]):
        lines[idx] = re.sub(rf'\s*{re.escape(vn)}\s*,?\s*', '', lines[idx])
        if lines[idx].strip() == '' or lines[idx].strip() == ',':
            lines[idx] = ''
        return True
    return False

def fix_unused_vars(content, issues):
    uv = [i for i in issues if i['rule'] == '@typescript-eslint/no-unused-vars']
    if not uv:
        return content
    lines = content.split('\n')
    for iss in sorted(uv, key=lambda x: -x['line']):
        idx = iss['line'] - 1
        if idx >= len(lines):
            continue
        col = iss['column'] - 1
        msg = iss['message']
        m = re.match(r"'(\w+)' is (?:defined|declared|assigned|assigned a value) but never used", msg)
        if not m:
            continue
        vn = m.group(1)
        line = lines[idx]

        # Handle single-line imports
        if 'import' in line and '{' in line:
            im = re.search(r'import\s*\{([^}]+)\}\s*from', line)
            if im:
                imps = [i.strip() for i in im.group(1).split(',')]
                ni = [i for i in imps if (i.split(' as ')[-1].strip() if ' as ' in i else i.strip()) != vn]
                if not ni:
                    lines[idx] = ''
                else:
                    nis = ', '.join(ni)
                    lines[idx] = line[:im.start(1)] + ' ' + nis + ' ' + line[im.end(1):]
                continue

        # Handle multi-line imports - check if this line is inside import { }
        if is_in_import_block(lines, idx):
            remove_from_multiline_import(lines, idx, vn)
            continue
        before = line[:col]
        pd = sum(1 for c in before if c == '(') - sum(1 for c in before if c == ')')
        if pd > 0:
            lines[idx] = line[:col] + '_' + line[col:]
            continue
        if re.search(rf'catch\s*\(\s*{re.escape(vn)}\s*\)', line):
            lines[idx] = re.sub(rf'catch\s*\(\s*{re.escape(vn)}\s*\)', f'catch (_{vn})', line)
            continue
        if re.search(rf'\b(const|let|var)\s+{re.escape(vn)}\b', line):
            lines[idx] = re.sub(rf'\b(const|let|var)\s+{re.escape(vn)}\b', rf'\1 _{vn}', line)
            continue
    return '\n'.join(lines)

def fix_prefer_const(content, issues):
    ci = [i for i in issues if i['rule'] == 'prefer-const']
    if not ci:
        return content
    lines = content.split('\n')
    for iss in ci:
        idx = iss['line'] - 1
        if idx < len(lines):
            lines[idx] = re.sub(r'\blet\b', 'const', lines[idx], count=1)
    return '\n'.join(lines)

def fix_eqeqeq(content, issues):
    eq = [i for i in issues if i['rule'] == 'eqeqeq']
    if not eq:
        return content
    lines = content.split('\n')
    for iss in sorted(eq, key=lambda x: (-x['line'], -x['column'])):
        idx = iss['line'] - 1
        col = iss['column'] - 1
        line = lines[idx]
        if col+1 < len(line):
            if line[col:col+2] == '==' and (col+2 >= len(line) or line[col+2] != '='):
                lines[idx] = line[:col] + '===' + line[col+2:]
            elif line[col:col+2] == '!=' and (col+2 >= len(line) or line[col+2] != '='):
                lines[idx] = line[:col] + '!==' + line[col+2:]
    return '\n'.join(lines)

def fix_no_console(content, issues):
    ci = [i for i in issues if i['rule'] == 'no-console']
    if not ci:
        return content
    lines = content.split('\n')
    to_rm = set()
    for iss in ci:
        idx = iss['line'] - 1
        if idx < len(lines) and 'console.log' in lines[idx]:
            to_rm.add(idx)
    return '\n'.join(l for i, l in enumerate(lines) if i not in to_rm)

def fix_no_debugger(content, issues):
    di = [i for i in issues if i['rule'] == 'no-debugger']
    if not di:
        return content
    lines = content.split('\n')
    to_rm = set()
    for iss in di:
        idx = iss['line'] - 1
        if idx < len(lines) and 'debugger' in lines[idx]:
            to_rm.add(idx)
    return '\n'.join(l for i, l in enumerate(lines) if i not in to_rm)

def fix_ban_types(content, issues):
    bi = [i for i in issues if i['rule'] == '@typescript-eslint/ban-types']
    if not bi:
        return content
    lines = content.split('\n')
    for iss in bi:
        idx = iss['line'] - 1
        col = iss['column'] - 1
        line = lines[idx]
        if '`Object`' in iss['message'] and line[col:col+6] == 'Object':
            lines[idx] = line[:col] + 'object' + line[col+6:]
    return '\n'.join(lines)

def fix_mixed_spaces_tabs(content, issues):
    mi = [i for i in issues if i['rule'] == 'no-mixed-spaces-and-tabs']
    if not mi:
        return content
    lines = content.split('\n')
    for iss in mi:
        idx = iss['line'] - 1
        if idx < len(lines):
            lines[idx] = lines[idx].replace('\t', '  ')
    return '\n'.join(lines)

def fix_non_null_assertion(content, issues):
    ni = [i for i in issues if i['rule'] == '@typescript-eslint/no-non-null-assertion']
    if not ni:
        return content
    lines = content.split('\n')
    for iss in sorted(ni, key=lambda x: (-x['line'], -x['column'])):
        idx = iss['line'] - 1
        col = iss['column'] - 1
        line = lines[idx]
        for ci in range(max(0, col-2), min(len(line), col+10)):
            if ci < len(line) and line[ci] == '!':
                if ci+1 < len(line) and line[ci+1] == '=':
                    continue
                if ci+1 < len(line) and line[ci+1] == '.':
                    lines[idx] = line[:ci] + '?' + line[ci+1:]
                elif ci+1 < len(line) and line[ci+1] == '[':
                    lines[idx] = line[:ci] + '?.' + line[ci+1:]
                else:
                    lines[idx] = line[:ci] + line[ci+1:]
                break
    return '\n'.join(lines)

def fix_file(filepath, issues):
    with open(filepath) as f:
        content = f.read()
    original = content
    # Parameter types and return types FIRST (before any line-removing transforms)
    content = fix_param_types(content, issues)
    content = fix_return_types(content, issues)
    # Non-line-removing fixes
    content = fix_prefer_const(content, issues)
    content = fix_eqeqeq(content, issues)
    content = fix_ban_types(content, issues)
    content = fix_mixed_spaces_tabs(content, issues)
    content = fix_non_null_assertion(content, issues)
    # Line-removing fixes LAST
    content = fix_no_debugger(content, issues)
    content = fix_no_console(content, issues)
    content = fix_empty_lifecycle(content, issues)
    content = fix_unused_vars(content, issues)
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    issues_by_file = get_issues()
    fixed = 0
    for fp, issues in sorted(issues_by_file.items()):
        if fix_file(fp, issues):
            fixed += 1
            print(f'Fixed: {os.path.basename(fp)}')
    print(f'\nModified {fixed} files')

if __name__ == '__main__':
    main()
