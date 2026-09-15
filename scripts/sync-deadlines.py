#!/usr/bin/env python3
"""Read the local IMBA_Deadlines.xlsx and emit privacy-safe public deadlines."""

from datetime import datetime, timedelta
import json
from pathlib import Path
import re
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "IMBA_Deadlines.xlsx"
OUTPUT = ROOT / "content" / "public" / "deadlines.json"
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

COURSES = {
    "01Strategic": ("strategic-management", "战略管理", "Strategic Management"),
    "02Accounting": ("financial-accounting", "财务会计", "Financial Accounting"),
    "03Economics": ("managerial-economics", "管理经济学", "Managerial Economics"),
    "04ESG": ("esg", "环境、社会与治理", "ESG"),
    "05DMD": ("data-models-decisions", "数据、模型与决策", "Data, Models & Decisions"),
    "06马理论": ("chinese-modernization", "中国式现代化的理论与实践", "Theory and Practice of Chinese Modernization"),
    "07English": ("business-english", "商务英语", "Business English"),
}
ITEMS_EN = {
    "课堂反馈": "Class feedback",
    "小组作业": "Group assignment",
    "个人作业": "Individual assignment",
}


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference).group(0)
    value = 0
    for letter in letters:
        value = value * 26 + ord(letter) - 64
    return value - 1


def workbook_rows(path: Path):
    with ZipFile(path) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared = ["".join(node.itertext()) for node in shared_root.findall("x:si", NS)]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.findall(".//x:sheetData/x:row", NS):
            values = [""] * 7
            for cell in row.findall("x:c", NS):
                index = column_index(cell.attrib["r"])
                value_node = cell.find("x:v", NS)
                if value_node is None or index >= len(values):
                    continue
                value = value_node.text or ""
                values[index] = shared[int(value)] if cell.attrib.get("t") == "s" else value
            rows.append((int(row.attrib["r"]), values))
        return rows


def excel_date(value: str):
    try:
        return datetime(1899, 12, 30) + timedelta(days=float(value))
    except ValueError:
        return None


def deadline_datetime(value: str):
    numeric = excel_date(value)
    if numeric:
        return numeric.replace(hour=23, minute=59), False
    match = re.search(r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})", value)
    if not match:
        return None
    year, month, day = map(int, match.groups())
    time_match = re.search(r"(\d{1,2})\s*[点:：]\s*(\d{1,2})?", value)
    hour = int(time_match.group(1)) if time_match else 23
    minute = int(time_match.group(2) or 0) if time_match else 59
    if "下午" in value and hour < 12:
        hour += 12
    return datetime(year, month, day, hour, minute), bool(time_match)


def event_kind(item: str):
    lowered = item.lower()
    if "期中" in item or "midterm" in lowered:
        return "midterm"
    if "期末" in item or "final" in lowered or "考试" in item:
        return "final"
    if "reflection" in lowered or "反馈" in item:
        return "reflection"
    return "homework"


def build_deadlines():
    rows = workbook_rows(SOURCE)
    if not rows or rows[0][1][:4] != ["发布日期", "课程", "事项", "截止日期"]:
        raise SystemExit("Deadline 表头不符合模板，未更新网站数据。")
    events = []
    skipped = []
    for row_number, row in rows[1:]:
        published, course_key, item, due, _submission, location, other = row
        if course_key not in COURSES:
            skipped.append(f"第 {row_number} 行：课程未匹配")
            continue
        parsed = deadline_datetime(due)
        if not parsed:
            skipped.append(f"第 {row_number} 行：没有明确截止日期")
            continue
        due_at, time_confirmed = parsed
        course, course_zh, course_en = COURSES[course_key]
        case = other.split(":", 1)[0].strip() if ":" in other else ""
        suffix = f"（{case}）" if case else ""
        published_at = excel_date(published) or due_at
        safe_id = f"{course}-{due_at:%Y-%m-%d-%H%M}-{row_number}"
        events.append({
            "id": safe_id,
            "title": f"{course_zh} · {item}{suffix}",
            "titleEn": f"{course_en} · {ITEMS_EN.get(item, item)}{f' ({case})' if case else ''}",
            "course": course,
            "kind": event_kind(item),
            "start": due_at.strftime("%Y-%m-%dT%H:%M:00+08:00"),
            "end": (due_at + timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:00+08:00"),
            "created": published_at.strftime("%Y-%m-%dT00:00:00+08:00"),
            "visibility": "public",
            "description": "",
            "location": location,
            "link": "",
            "materialLink": "",
            "reminder": 1440,
            "done": False,
            "timeConfirmed": time_confirmed,
            "source": f"IMBA_Deadlines.xlsx 第 {row_number} 行",
        })
    events.sort(key=lambda event: event["start"])
    return events, skipped


if __name__ == "__main__":
    if not SOURCE.exists():
        raise SystemExit(f"找不到 {SOURCE.name}")
    deadlines, skipped_rows = build_deadlines()
    OUTPUT.write_text(json.dumps(deadlines, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已生成 {len(deadlines)} 条公开 Deadline；提交链接未写入公开文件。")
    for message in skipped_rows:
        print(f"跳过：{message}")
