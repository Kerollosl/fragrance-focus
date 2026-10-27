"""Rasterize the simple typographic app mark. No third-party image assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

destination = Path(__file__).resolve().parent.parent / 'icons'
destination.mkdir(exist_ok=True)
for size in (16, 32, 48, 128):
    scale = 4
    image = Image.new('RGBA', (size * scale, size * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, size * scale - 1, size * scale - 1), radius=size * scale * .22, fill='#53634b')
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Italic.ttf', round(size * scale * .83))
    draw.text((size * scale * .18, -size * scale * .06), 'f.', font=font, fill='#fffefa')
    image.resize((size, size), Image.Resampling.LANCZOS).save(destination / f'icon-{size}.png')
