#!/usr/bin/env python3
"""Build the downloadable academic CV from cv.html using ReportLab."""

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, KeepTogether, PageTemplate, Paragraph, Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "cv.html"
OUTPUT = ROOT / "assets" / "Shuai_Shao_CV.pdf"


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)


class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in {"br", "meta", "link", "img", "input", "hr"}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(text)


def normalized(text):
    return (text.replace("\u2013", "-").replace("\u2014", "-")
            .replace("\u2011", "-").replace("\u2212", "-")
            .replace("\u2197", ""))


def plain(node):
    if isinstance(node, str):
        return normalized(node)
    return "".join(plain(child) for child in node.children)


def find(node, predicate):
    if isinstance(node, str):
        return None
    if predicate(node):
        return node
    for child in node.children:
        match = find(child, predicate)
        if match is not None:
            return match
    return None


def inline(node):
    if isinstance(node, str):
        return escape(normalized(node))
    content = "".join(inline(child) for child in node.children)
    if node.tag in {"strong", "b"}:
        return f"<b>{content}</b>"
    if node.tag in {"em", "i"}:
        return f"<i>{content}</i>"
    if node.tag == "br":
        return "<br/>"
    if node.tag == "a":
        href = node.attrs.get("href", "")
        if href.startswith(("https://", "mailto:")):
            return f"<a href={quoteattr(href)} color=\"#111111\"><u>{content}</u></a>"
    return content


def register_fonts():
    directory = Path("/System/Library/Fonts/Supplemental")
    files = {
        "CVTimes": "Times New Roman.ttf",
        "CVTimes-Bold": "Times New Roman Bold.ttf",
        "CVTimes-Italic": "Times New Roman Italic.ttf",
        "CVTimes-BoldItalic": "Times New Roman Bold Italic.ttf",
    }
    if all((directory / name).is_file() for name in files.values()):
        for family, filename in files.items():
            pdfmetrics.registerFont(TTFont(family, str(directory / filename)))
        pdfmetrics.registerFontFamily(
            "CVTimes", normal="CVTimes", bold="CVTimes-Bold",
            italic="CVTimes-Italic", boldItalic="CVTimes-BoldItalic",
        )
        return "CVTimes", "CVTimes-Bold", "CVTimes-Italic"
    return "Times-Roman", "Times-Bold", "Times-Italic"


REGULAR, BOLD, ITALIC = register_fonts()
styles = {
    "body": ParagraphStyle(
        "Body", fontName=REGULAR, fontSize=11, leading=14,
        textColor=colors.HexColor("#111111"), spaceAfter=4,
        alignment=TA_LEFT, allowWidows=0, allowOrphans=0,
    ),
}
styles.update({
    "eyebrow": ParagraphStyle(
        "Eyebrow", parent=styles["body"], fontSize=10, leading=13,
        textColor=colors.HexColor("#444444"), spaceAfter=8,
    ),
    "name": ParagraphStyle(
        "Name", parent=styles["body"], fontName=BOLD, fontSize=28,
        leading=31, spaceAfter=5,
    ),
    "role": ParagraphStyle(
        "Role", parent=styles["body"], fontSize=12, leading=15,
        spaceAfter=4,
    ),
    "contact": ParagraphStyle(
        "Contact", parent=styles["body"], fontSize=10.5, leading=14,
        spaceAfter=5,
    ),
    "section": ParagraphStyle(
        "Section", parent=styles["body"], fontName=BOLD,
        fontSize=11.5, leading=15, spaceBefore=10, spaceAfter=0,
        keepWithNext=True,
    ),
    "entry": ParagraphStyle(
        "Entry", parent=styles["body"], fontName=BOLD,
        fontSize=11.25, leading=14, spaceBefore=3, spaceAfter=3,
        keepWithNext=True,
    ),
    "dates": ParagraphStyle(
        "Dates", parent=styles["body"], fontName=ITALIC,
        fontSize=10.5, leading=13,
        textColor=colors.HexColor("#444444"), spaceAfter=3,
    ),
    "list": ParagraphStyle(
        "List", parent=styles["body"], leftIndent=14,
        firstLineIndent=-14, spaceAfter=5,
    ),
})


def flow(node):
    if isinstance(node, str):
        return []
    classes = node.attrs.get("class", "").split()
    if "cv-footnote" in classes:
        return []
    if node.tag == "h2":
        rule = HRFlowable(
            width="100%", thickness=0.4, color=colors.HexColor("#aaaaaa"),
            spaceBefore=4, spaceAfter=6,
        )
        rule.keepWithNext = True
        return [Paragraph(escape(plain(node).upper()), styles["section"]), rule]
    if node.tag == "h3":
        return [Paragraph(inline(node), styles["entry"])]
    if node.tag == "p":
        key = "dates" if {"cv-dates", "cv-label"}.intersection(classes) else "body"
        return [Paragraph(inline(node), styles[key])]
    if node.tag in {"ol", "ul"}:
        items = [child for child in node.children if isinstance(child, Node) and child.tag == "li"]
        return [
            KeepTogether([Paragraph(
                f"{index}. {inline(item)}" if node.tag == "ol" else f"- {inline(item)}",
                styles["list"],
            )])
            for index, item in enumerate(items, 1)
        ]
    children = [item for child in node.children for item in flow(child)]
    if "cv-entry" in classes:
        return [KeepTogether(children + [Spacer(1, 2)])]
    return children


def decorate(canvas, document):
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.setFont(REGULAR, 9.5)
    if document.page > 1:
        canvas.drawString(54, height - 28, "Shuai Shao | Curriculum Vitae")
    canvas.drawString(54, 28, "Updated October 2026")
    canvas.drawRightString(width - 54, 28, f"Page {document.page}")
    canvas.restoreState()


def main():
    parser = DocumentParser()
    parser.feed(SOURCE.read_text())
    body = find(parser.root, lambda node: node.attrs.get("id") == "main")
    title = find(body, lambda node: "cv-title" in node.attrs.get("class", "").split())
    story = []
    for child in title.children:
        if not isinstance(child, Node):
            continue
        classes = child.attrs.get("class", "").split()
        key = ("name" if child.tag == "h1" else "role" if "cv-role" in classes
               else "contact" if "cv-contact" in classes else "eyebrow")
        story.append(Paragraph(inline(child), styles[key]))
    story.append(Spacer(1, 5))
    for child in body.children:
        if isinstance(child, Node) and child.tag == "section":
            story.extend(flow(child))
    OUTPUT.parent.mkdir(exist_ok=True)
    document = BaseDocTemplate(
        str(OUTPUT), pagesize=letter, leftMargin=54, rightMargin=54,
        topMargin=48, bottomMargin=48, title="Shuai Shao - Academic Curriculum Vitae",
        author="Shuai Shao", subject="Academic research, publications, teaching, and service",
        pageCompression=1,
    )
    frame = Frame(
        document.leftMargin, document.bottomMargin, document.width, document.height,
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    document.addPageTemplates([PageTemplate(id="CV", frames=[frame], onPage=decorate)])
    document.build(story)
    print(f"Created {OUTPUT}")


if __name__ == "__main__":
    main()
