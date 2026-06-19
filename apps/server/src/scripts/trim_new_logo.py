from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if the pixel is near white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Trim the transparent edges
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path, "PNG")
    print("Successfully created premium transparent logo!")

process_logo(r'C:\Users\hp\.gemini\antigravity\brain\e202a40b-1c02-4c4e-ba47-5242a6ff0cbc\collabbd_premium_logo_1781869957367.png', 'apps/web/public/logo_web.png')
