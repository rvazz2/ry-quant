
import os
import sys
try:
    from PIL import Image
    import rawpy
    import imageio
except ImportError:
    print("Missing dependencies")
    sys.exit(1)

def convert_dng(source, dest):
    print(f"Converting {source} to {dest}...")
    try:
        with rawpy.imread(source) as raw:
            rgb = raw.postprocess()
            imageio.imsave(dest, rgb)
        print("Success")
    except Exception as e:
        print(f"Failed: {e}")

files = [
    "20260205_064732.dng",
    "20260205_064749.dng",
    "20260205_064948.dng",
    "20260205_064954.dng"
]
targets = ["nature-6.jpg", "nature-7.jpg", "nature-8.jpg", "nature-9.jpg"]

for src, dest in zip(files, targets):
    convert_dng(src, dest)
