from PIL import Image, ImageOps

def make_white_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGB")
    
    # The image is dark logo on white background.
    # Invert the image: white bg -> black bg, dark logo -> white logo
    inverted = ImageOps.invert(img)
    
    # Create an alpha channel based on the inverted image (black = 0 alpha, white = 255 alpha)
    # We convert the inverted image to grayscale to use as alpha
    alpha = inverted.convert("L")
    
    # Create the final RGBA image
    # We want the color to be white (or keep the inverted colors)
    # Let's just keep the inverted colors but add the alpha channel
    inverted.putalpha(alpha)
    
    # Trim empty transparent edges
    bbox = inverted.getbbox()
    if bbox:
        inverted = inverted.crop(bbox)
        
    inverted.save(output_path, "PNG")
    print("Logo processed: inverted colors and made background transparent based on lightness.")

make_white_logo('apps/web/public/logo_web.png', 'apps/web/public/logo_dark_theme.png')

def make_transparent_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Just remove the white background using a threshold, but smoothly
    # Actually, a better way for dark logo on white bg:
    # Alpha = 255 - grayscale(img)
    # This makes white bg transparent (alpha 0) and dark text opaque (alpha 255)
    # Then we keep the original RGB colors!
    gray = img.convert("L")
    alpha = ImageOps.invert(gray)
    
    img.putalpha(alpha)
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print("Logo processed: kept colors, made background transparent based on darkness.")

make_transparent_logo('apps/web/public/logo_web.png', 'apps/web/public/logo_light_theme.png')
