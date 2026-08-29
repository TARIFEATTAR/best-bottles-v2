#!/usr/bin/env python3
"""Best Bottles paper-doll compositor.

Takes a QA-passed alpha cutout of a generated bottle plus the body's real mm
dimensions and family context, and produces the shipped master: a 2080x2288
canvas with the programmatic bone gradient, synthesized ambient-contact shadow,
compressed per-family scale, and foot baseline per studio-spec.

The generated image is an intermediate; THIS output is the deliverable. All
determinism (canvas, backdrop, tone, scale) lives here, never in prompting.

Usage:
  composite_master.py composite --cutout CUTOUT.png --height-mm 81 \
      --family-max-mm 120 --out canvas/OUT.png [--label "cyl-28ml clear"]

  composite_master.py lineup --out validation/circle-lineup.png
      Renders the Circle-family gamma-curve validation sheet with placeholder
      rectangles (founder gate before any real composites).

Spec values below marked HANDOFF are quoted from the production handoff and
match studio-spec.md v1. Values marked ASSUMPTION were not stated numerically
in the handoff and MUST be reconciled against studio-spec.md v1 (which lives
in the local pipeline workspace) before this output is treated as final.
Change nothing in SPEC without founder sign-off.
"""

import argparse
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SPEC = {
    # -- HANDOFF (binding, matches studio-spec.md v1) --
    "canvas_w": 2080,
    "canvas_h": 2288,
    "foot_baseline": 0.92,     # bottle foot sits at 0.92 * canvas height
    "fitbox_w_frac": 0.70,     # fit box width  = 70% of canvas width
    "fitbox_h_frac": 0.80,     # fit box height = 80% of canvas height
    "grad_top": "#eedbc4",     # bone gradient, top
    "grad_mid": "#eedac6",     # bone gradient, mid
    "grad_floor": "#e0cdb6",   # bone gradient, floor
    "gamma": 0.6,              # compressed per-family scale exponent
    "scale_floor": 0.55,       # min body height as fraction of fit box height

    # -- ASSUMPTION (verify against studio-spec.md v1) --
    "grad_mid_stop": 0.55,     # vertical position of the mid gradient stop
    # Synthesized ambient-contact shadow. Light from ~2 o'clock (upper right)
    # casts the contact shadow biased down-left of the foot.
    "shadow_w_mult": 1.18,     # ellipse width  = bottle px width * this
    "shadow_h_mult": 0.16,     # ellipse height = ellipse width * this
    "shadow_x_bias": -0.07,    # ellipse center offset, fraction of bottle width
    "shadow_color": (122, 104, 82),
    "shadow_alpha": 92,        # 0-255 peak opacity before blur
    "shadow_blur_frac": 0.035, # gaussian radius as fraction of canvas width
    "shadow_y_overlap": 0.35,  # fraction of ellipse height rising above baseline
}


def hex_rgb(h: str) -> tuple:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def bone_canvas() -> Image.Image:
    """Programmatic bone-studio backdrop: vertical 3-stop gradient."""
    w, h = SPEC["canvas_w"], SPEC["canvas_h"]
    top, mid, floor = (hex_rgb(SPEC[k]) for k in ("grad_top", "grad_mid", "grad_floor"))
    mid_y = SPEC["grad_mid_stop"]
    col = Image.new("RGB", (1, h))
    px = col.load()
    for y in range(h):
        t = y / (h - 1)
        if t <= mid_y:
            f = t / mid_y if mid_y else 0.0
            a, b = top, mid
        else:
            f = (t - mid_y) / (1.0 - mid_y)
            a, b = mid, floor
        px[0, y] = tuple(round(a[i] + (b[i] - a[i]) * f) for i in range(3))
    return col.resize((w, h))


def family_scale(height_mm: float, family_max_mm: float) -> float:
    """Compressed per-family scale: (h/H_max)^gamma, floored at scale_floor.

    The family's tallest body fills the fit box height; smaller bodies shrink
    on the gamma curve so capacity differences read without small bottles
    becoming illegibly tiny.
    """
    if height_mm <= 0 or family_max_mm <= 0:
        raise ValueError("heights must be positive mm")
    rel = min(height_mm / family_max_mm, 1.0)
    return max(rel ** SPEC["gamma"], SPEC["scale_floor"])


def placed_geometry(cut_w: int, cut_h: int, height_mm: float, family_max_mm: float):
    """Pixel size + position for a cutout on the canvas. Returns (w, h, x, y)."""
    cw, ch = SPEC["canvas_w"], SPEC["canvas_h"]
    fit_w = cw * SPEC["fitbox_w_frac"]
    fit_h = ch * SPEC["fitbox_h_frac"]
    target_h = fit_h * family_scale(height_mm, family_max_mm)
    scale = target_h / cut_h
    if cut_w * scale > fit_w:  # never exceed fit box width
        scale = fit_w / cut_w
    w, h = round(cut_w * scale), round(cut_h * scale)
    baseline = round(ch * SPEC["foot_baseline"])
    return w, h, round((cw - w) / 2), baseline - h


def draw_shadow(canvas: Image.Image, bottle_w: int, cx: int, baseline: int) -> None:
    """Soft ambient-contact shadow under the foot, biased down-left (2-o'clock light)."""
    ew = bottle_w * SPEC["shadow_w_mult"]
    eh = ew * SPEC["shadow_h_mult"]
    ecx = cx + bottle_w * SPEC["shadow_x_bias"]
    ecy = baseline + eh * (0.5 - SPEC["shadow_y_overlap"])
    layer = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(layer).ellipse(
        [ecx - ew / 2, ecy - eh / 2, ecx + ew / 2, ecy + eh / 2],
        fill=SPEC["shadow_alpha"],
    )
    layer = layer.filter(ImageFilter.GaussianBlur(SPEC["canvas_w"] * SPEC["shadow_blur_frac"]))
    shade = Image.new("RGB", canvas.size, SPEC["shadow_color"])
    canvas.paste(shade, (0, 0), layer)


def composite(cutout_path: Path, height_mm: float, family_max_mm: float, out_path: Path) -> dict:
    cut = Image.open(cutout_path).convert("RGBA")
    bbox = cut.getbbox()
    if bbox is None:
        raise ValueError(f"{cutout_path}: cutout is fully transparent")
    cut = cut.crop(bbox)

    w, h, x, y = placed_geometry(cut.width, cut.height, height_mm, family_max_mm)
    canvas = bone_canvas()
    baseline = round(SPEC["canvas_h"] * SPEC["foot_baseline"])
    draw_shadow(canvas, w, x + w // 2, baseline)
    scaled = cut.resize((w, h), Image.LANCZOS)
    canvas.paste(scaled, (x, y), scaled)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG")
    return {"px": (w, h), "pos": (x, y), "scale_rel": family_scale(height_mm, family_max_mm)}


# ---------------------------------------------------------------- validation

# Placeholder dims for the gamma-curve lineup ONLY. Not real catalog numbers —
# real dims come from Convex / live product pages into the ledger (task 2).
CIRCLE_PLACEHOLDERS = [  # (label, height_mm, diameter_mm)
    ("Circle 15ml", 62, 33),
    ("Circle 30ml", 78, 42),
    ("Circle 50ml", 92, 49),
    ("Circle 100ml", 116, 61),
]


def placeholder_cutout(height_mm: float, diameter_mm: float, px_per_mm: float = 10.0) -> Image.Image:
    """Flat rectangle stand-in with the body's real aspect ratio."""
    w, h = round(diameter_mm * px_per_mm), round(height_mm * px_per_mm)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], fill=(148, 130, 108, 235), outline=(90, 76, 58, 255), width=6)
    return img


def lineup(out_path: Path) -> None:
    """Circle-family lineup: linear scale vs gamma=0.6 compressed, one sheet."""
    family_max = max(h for _, h, _ in CIRCLE_PLACEHOLDERS)
    thumb_w = 520
    thumb_h = round(thumb_w * SPEC["canvas_h"] / SPEC["canvas_w"])
    pad, header, caption = 24, 88, 64
    cols = len(CIRCLE_PLACEHOLDERS)
    sheet = Image.new(
        "RGB",
        (pad + cols * (thumb_w + pad), pad + 2 * (header + thumb_h + caption) + pad),
        (245, 240, 232),
    )
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 34)
        small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except OSError:
        font = small = ImageFont.load_default()

    def render_row(row: int, mode: str, title: str) -> None:
        y0 = pad + row * (header + thumb_h + caption)
        draw.text((pad, y0 + 20), title, fill=(60, 48, 36), font=font)
        for i, (label, h_mm, d_mm) in enumerate(CIRCLE_PLACEHOLDERS):
            cut = placeholder_cutout(h_mm, d_mm)
            canvas = bone_canvas()
            if mode == "gamma":
                w, h, x, y = placed_geometry(cut.width, cut.height, h_mm, family_max)
                rel = family_scale(h_mm, family_max)
            else:  # true linear scale: tallest fills fit box, rest proportional
                fit_h = SPEC["canvas_h"] * SPEC["fitbox_h_frac"]
                rel = h_mm / family_max
                scale = fit_h * rel / cut.height
                w, h = round(cut.width * scale), round(cut.height * scale)
                x = round((SPEC["canvas_w"] - w) / 2)
                y = round(SPEC["canvas_h"] * SPEC["foot_baseline"]) - h
            baseline = round(SPEC["canvas_h"] * SPEC["foot_baseline"])
            draw_shadow(canvas, w, x + w // 2, baseline)
            scaled = cut.resize((w, h), Image.LANCZOS)
            canvas.paste(scaled, (x, y), scaled)
            tx = pad + i * (thumb_w + pad)
            sheet.paste(canvas.resize((thumb_w, thumb_h), Image.LANCZOS), (tx, y0 + header))
            draw.text(
                (tx + 8, y0 + header + thumb_h + 10),
                f"{label} · {h_mm}mm · {rel:.2f}x fitbox",
                fill=(60, 48, 36),
                font=small,
            )

    render_row(0, "linear", "True linear scale (reference)")
    render_row(
        1,
        "gamma",
        f"Compressed scale  gamma={SPEC['gamma']}, floor {SPEC['scale_floor']}x  (per studio-spec)",
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("composite", help="composite one cutout onto the master canvas")
    c.add_argument("--cutout", required=True, type=Path, help="PNG-32 RGBA alpha cutout")
    c.add_argument("--height-mm", required=True, type=float, help="real bare height in mm (from ledger)")
    c.add_argument("--family-max-mm", required=True, type=float, help="tallest bare height in this family, mm")
    c.add_argument("--out", required=True, type=Path)

    v = sub.add_parser("lineup", help="render the Circle-family gamma validation sheet")
    v.add_argument("--out", required=True, type=Path)

    args = p.parse_args()
    if args.cmd == "composite":
        info = composite(args.cutout, args.height_mm, args.family_max_mm, args.out)
        print(f"wrote {args.out}  px={info['px']}  pos={info['pos']}  scale={info['scale_rel']:.3f}x fitbox")
    else:
        lineup(args.out)
        print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
