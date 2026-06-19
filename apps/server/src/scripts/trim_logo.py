from PIL import Image

def remove_white_and_trim(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is near white
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Trim the transparent edges
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path, "PNG")
    print("Successfully processed and trimmed logo!")

remove_white_and_trim('apps/web/public/logo_web.png', 'apps/web/public/logo_web_premium.png')
