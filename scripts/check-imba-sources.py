#!/usr/bin/env python3
"""Compare local course sources with the last successful OS release; no writes by default."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / '.imba-os-sync.json'
EXTENSIONS = {'.pdf', '.ppt', '.pptx', '.docx', '.md', '.txt', '.xlsx', '.jpg', '.png'}
EXCLUDED = {'node_modules', '.git', '.next', 'out', 'dist', 'content', 'restricted-assets', '__pycache__', 'private', '私人笔记'}


def is_learning_source(path, folder):
    parts = path.relative_to(folder).parts
    name = path.name.lower()
    return (path.is_file() and path.suffix.lower() in EXTENSIONS
            and not any(part in EXCLUDED or part.startswith(('.', '~$')) for part in parts)
            and not name.startswith('homework') and '作业' not in path.name)


def snapshot():
    files = []
    for workbook_name in ('00IMBA_Deadlines.xlsx', '01课表.xlsx'):
        workbook = ROOT / workbook_name
        if workbook.exists():
            files.append(workbook)
    for folder in ROOT.iterdir():
        if folder.is_dir() and folder.name[:2] in {f'{i:02}' for i in range(1, 10)}:
            files.extend(path for path in folder.rglob('*') if is_learning_source(path, folder))
    return {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(files)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--record-success', metavar='COMMIT', help='Record this baseline only after the GitHub Pages release is verified')
    args = parser.parse_args()
    current = snapshot()
    previous = json.loads(STATE.read_text()) if STATE.exists() else {'files': {}}
    old = previous['files']
    result = {'new': [name for name in current if name not in old],
              'changed': [name for name in current if name in old and current[name] != old[name]],
              'removed': [name for name in old if name not in current],
              'lastPublishedCommit': previous.get('commit')}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.record_success:
        STATE.write_text(json.dumps({'commit': args.record_success, 'files': current}, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
