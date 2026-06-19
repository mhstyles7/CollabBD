from PIL import Image

img = Image.open('apps/web/public/logo_web.png').convert("RGBA")
pixels = img.load()
w, h = img.size

# The background pixels have alpha=0. The content (including white fill areas) has alpha > 0.
# But we want to crop out the empty transparent edges only.
# Find bounds where alpha > 0

top, left, bottom, right = h, w, 0, 0

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if a > 10:  # Non-transparent pixel
            if y < top: top = y
            if y > bottom: bottom = y
            if x < left: left = x
            if x > right: right = x

print(f"Content bounds (alpha>10): top={top}, left={left}, bottom={bottom}, right={right}")
print(f"Image size: {w}x{h}")

# Crop with minimal padding
pad = 5
top = max(0, top - pad)
left = max(0, left - pad)
bottom = min(h, bottom + pad)
right = min(w, right + pad)

cropped = img.crop((left, top, right, bottom))
new_w, new_h = cropped.size
print(f"Cropped to: {new_w}x{new_h}")
cropped.save('apps/web/public/logo_web.png', "PNG")
print("Done - whitespace trimmed!")
