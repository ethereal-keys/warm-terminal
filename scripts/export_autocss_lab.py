#!/usr/bin/env python3
"""
Export archival AutoCSS lab assets from the original notebook-style repo.

This script recreates the core 2018 pipeline as a static asset generator:
input -> binarized -> cleanup -> edges -> contours -> scaffold preview

It also emits a generated TypeScript data file consumed by the portfolio UI.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = ROOT / "public" / "images" / "autocss-lab"
GENERATED_TS = ROOT / "src" / "components" / "autocss-lab" / "generatedCases.ts"


STAGE_ORDER = (
    "input",
    "binarized",
    "cleanup",
    "edges",
    "contours",
    "scaffold",
)


@dataclass(frozen=True)
class ExportCase:
    case_id: str
    source_name: str


EXPORT_CASES = (
    ExportCase("lay2", "lay2.jpg"),
    ExportCase("lay4", "lay4.jpg"),
    ExportCase("newlay", "newlay.jpg"),
)


def adaptive_threshold(gray: np.ndarray) -> np.ndarray:
    blurred = cv2.medianBlur(gray, 5)
    return cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        3,
    )


def cleanup_mask(binary: np.ndarray) -> np.ndarray:
    kernel = np.ones((5, 5), np.uint8)
    return cv2.erode(binary, kernel, iterations=2)


def median_canny(channel: np.ndarray, low: float = 0.2, high: float = 0.3) -> np.ndarray:
    median = float(np.median(channel))
    return cv2.Canny(channel, int(low * median), int(high * median))


def detect_edges(cleanup: np.ndarray) -> np.ndarray:
    color = cv2.cvtColor(cleanup, cv2.COLOR_GRAY2BGR)
    blue, green, red = cv2.split(color)
    return median_canny(blue) | median_canny(green) | median_canny(red)


def find_contours(edges: np.ndarray) -> tuple[list[np.ndarray], np.ndarray]:
    found = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if len(found) == 3:
        _, contours, hierarchy = found
    else:
        contours, hierarchy = found
    if hierarchy is None:
        raise RuntimeError("No contour hierarchy returned.")
    return contours, hierarchy[0]


def bbox_from_contour(contour: np.ndarray) -> dict[str, int]:
    x, y, w, h = cv2.boundingRect(contour)
    return {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}


def area(bbox: dict[str, int]) -> int:
    return bbox["w"] * bbox["h"]


def bounds_close(a: dict[str, int], b: dict[str, int]) -> bool:
    dx = abs(a["x"] - b["x"])
    dy = abs(a["y"] - b["y"])
    dw = abs(a["w"] - b["w"])
    dh = abs(a["h"] - b["h"])
    size = max(a["w"], a["h"], b["w"], b["h"], 1)
    return dx <= max(12, size * 0.03) and dy <= max(12, size * 0.03) and dw <= max(12, size * 0.04) and dh <= max(12, size * 0.04)


def collect_children(parent_idx: int, hierarchy: np.ndarray) -> list[int]:
    first_child = int(hierarchy[parent_idx][2])
    if first_child == -1:
        return []

    children: list[int] = []
    current = first_child
    while current != -1:
        children.append(int(current))
        current = int(hierarchy[current][0])
    return children


def build_tree(idx: int, contours: list[np.ndarray], hierarchy: np.ndarray, depth: int = 0) -> dict:
    bbox = bbox_from_contour(contours[idx])
    children = [build_tree(child, contours, hierarchy, depth + 1) for child in collect_children(idx, hierarchy)]
    return {
        "id": str(idx),
        "bbox": bbox,
        "depth": depth,
        "children": children,
    }


def dedupe_tree(node: dict) -> dict:
    children = [dedupe_tree(child) for child in node["children"]]
    deduped = {**node, "children": children}

    if len(children) == 1 and bounds_close(node["bbox"], children[0]["bbox"]):
        return {
            **children[0],
            "depth": node["depth"],
        }

    return deduped


def prune_small_nodes(node: dict, min_area: int = 600) -> dict | None:
    cleaned_children = [prune_small_nodes(child, min_area) for child in node["children"]]
    cleaned_children = [child for child in cleaned_children if child is not None]

    node_area = area(node["bbox"])
    if node_area < min_area and not cleaned_children:
        return None

    return {**node, "children": cleaned_children}


def pretty_tree_lines(node: dict, prefix: str = "", is_last: bool = True) -> list[str]:
    label = f"bbox({node['bbox']['x']}, {node['bbox']['y']}, {node['bbox']['w']}, {node['bbox']['h']})"
    connector = "└─ " if is_last else "├─ "
    lines = [f"{prefix}{connector}{label}"]
    next_prefix = prefix + ("   " if is_last else "│  ")
    for index, child in enumerate(node["children"]):
        lines.extend(pretty_tree_lines(child, next_prefix, index == len(node["children"]) - 1))
    return lines


def dom_lines(node: dict, indent: int = 0) -> list[str]:
    space = "  " * indent
    if not node["children"]:
        return [f"{space}<p>content</p>"]

    lines = [f"{space}<div>"]
    for child in node["children"]:
        lines.extend(dom_lines(child, indent + 1))
    lines.append(f"{space}</div>")
    return lines


def draw_scaffold(root_nodes: Iterable[dict], width: int, height: int) -> np.ndarray:
    canvas = np.full((height, width, 3), 245, dtype=np.uint8)
    cv2.rectangle(canvas, (0, 0), (width - 1, height - 1), (214, 207, 196), 1)

    palette = [
        (191, 77, 40),
        (139, 154, 107),
        (122, 117, 109),
        (82, 90, 98),
    ]

    def draw_node(node: dict, depth: int) -> None:
        bbox = node["bbox"]
        color = palette[depth % len(palette)]
        cv2.rectangle(
            canvas,
            (bbox["x"], bbox["y"]),
            (bbox["x"] + bbox["w"], bbox["y"] + bbox["h"]),
            color,
            2,
        )
        for child in node["children"]:
            draw_node(child, depth + 1)

    for root in root_nodes:
        draw_node(root, 0)

    return canvas


def as_public_path(path: Path) -> str:
    relative = path.relative_to(ROOT / "public")
    return "/" + relative.as_posix()


def write_image(path: Path, image: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), image)


def export_case(source_dir: Path, case: ExportCase) -> dict:
    source_path = source_dir / case.source_name
    gray = cv2.imread(str(source_path), cv2.IMREAD_GRAYSCALE)
    if gray is None:
        raise FileNotFoundError(f"Could not read {source_path}")

    case_dir = PUBLIC_ROOT / case.case_id
    case_dir.mkdir(parents=True, exist_ok=True)

    input_color = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
    binarized = adaptive_threshold(gray)
    cleanup = cleanup_mask(binarized)
    edges = detect_edges(cleanup)
    contours, hierarchy = find_contours(edges)

    contour_overlay = cv2.cvtColor(cleanup, cv2.COLOR_GRAY2BGR)
    cv2.drawContours(contour_overlay, contours, -1, (35, 166, 76), 2)

    root_indices = [idx for idx, item in enumerate(hierarchy) if int(item[3]) == -1]
    raw_tree = [build_tree(idx, contours, hierarchy) for idx in root_indices]
    deduped_tree = [dedupe_tree(node) for node in raw_tree]
    deduped_tree = [prune_small_nodes(node) for node in deduped_tree]
    deduped_tree = [node for node in deduped_tree if node is not None]

    scaffold = draw_scaffold(deduped_tree, gray.shape[1], gray.shape[0])

    stage_images = {
        "input": input_color,
        "binarized": binarized,
        "cleanup": cleanup,
        "edges": edges,
        "contours": contour_overlay,
        "scaffold": scaffold,
    }

    stage_paths: dict[str, str] = {}
    for stage_id in STAGE_ORDER:
        image_path = case_dir / f"{stage_id}.png"
        write_image(image_path, stage_images[stage_id])
        stage_paths[stage_id] = as_public_path(image_path)

    tree_json_path = case_dir / "tree.json"
    tree_text_path = case_dir / "tree.txt"
    dom_text_path = case_dir / "dom.txt"

    tree_json_path.write_text(json.dumps(deduped_tree, indent=2))

    tree_lines: list[str] = []
    for index, node in enumerate(deduped_tree):
        tree_lines.extend(pretty_tree_lines(node, "", index == len(deduped_tree) - 1))

    tree_text_path.write_text("\n".join(tree_lines) + "\n")

    dom_chunks: list[str] = []
    for node in deduped_tree:
        dom_chunks.extend(dom_lines(node, 0))
    dom_text = "\n".join(dom_chunks) + "\n"
    dom_text_path.write_text(dom_text)

    return {
        "id": case.case_id,
        "sourceName": case.source_name,
        "dimensions": {"width": int(gray.shape[1]), "height": int(gray.shape[0])},
        "stages": stage_paths,
        "tree": deduped_tree,
        "treeAsset": as_public_path(tree_json_path),
        "treeLines": tree_lines,
        "domAsset": as_public_path(dom_text_path),
        "domText": dom_text,
        "contourCount": int(len(contours)),
    }


def write_generated_ts(cases: list[dict]) -> None:
    GENERATED_TS.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "// This file is auto-generated by scripts/export_autocss_lab.py\n"
        "// Do not edit by hand.\n\n"
        f"export const GENERATED_AUTO_CSS_CASES = {json.dumps(cases, indent=2)} as const;\n"
    )
    GENERATED_TS.write_text(content)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export AutoCSS lab archival assets.")
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="Path to the original AutoCSS repository clone.",
    )
    args = parser.parse_args()

    source_dir = args.source.resolve()
    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory does not exist: {source_dir}")

    exported = [export_case(source_dir, case) for case in EXPORT_CASES]
    write_generated_ts(exported)

    print(f"Exported {len(exported)} AutoCSS lab cases.")


if __name__ == "__main__":
    main()
