import struct
import zlib
import math
import os

def create_png(width, height, is_maskable=False):
    # RGBA raw data
    raw_rows = []
    
    # Safe zone for maskable icon: keep graphics inside central 80% circle
    center_x = width / 2.0
    center_y = height / 2.0
    radius = (min(width, height) / 2.0) * (0.75 if is_maskable else 0.88)
    
    for y in range(height):
        row = bytearray(b'\x00') # Filter type 0
        for x in range(width):
            # Coordinates relative to center
            dx = (x - center_x)
            dy = (y - center_y)
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Background deep navy/slate gradient
            norm_y = y / float(height)
            norm_x = x / float(width)
            
            # Base dark theme color (#020617 to #1e1b4b)
            r = int(2 + norm_x * 20)
            g = int(6 + norm_y * 15)
            b = int(23 + norm_y * 45)
            a = 255
            
            # Subtle corner rounding for non-maskable
            if not is_maskable:
                corner_radius = min(width, height) * 0.22
                cx_c = center_x - corner_radius
                cy_c = center_y - corner_radius
                if abs(dx) > cx_c and abs(dy) > cy_c:
                    cdx = abs(dx) - cx_c
                    cdy = abs(dy) - cy_c
                    if math.sqrt(cdx * cdx + cdy * cdy) > corner_radius:
                        a = 0
            
            if a > 0:
                # Radial glow near center
                glow_dist = dist / radius
                if glow_dist < 1.1:
                    glow_intensity = max(0.0, 1.0 - glow_dist)
                    r = min(255, int(r + glow_intensity * 10))
                    g = min(255, int(g + glow_intensity * 60))
                    b = min(255, int(b + glow_intensity * 90))

                # Outer ring
                ring_width = width * 0.025
                if abs(dist - radius * 0.82) < ring_width:
                    r, g, b = 34, 211, 238 # cyan-400
                elif abs(dist - radius * 0.6) < ring_width * 0.8:
                    r, g, b = 56, 189, 248 # sky-400
                elif abs(dist - radius * 0.35) < ring_width * 0.6:
                    r, g, b = 129, 140, 248 # indigo-400

                # Latitude horizontal line
                if abs(dy) < (width * 0.015) and dist < radius * 0.82:
                    r, g, b = 34, 211, 238
                
                # Central node
                if dist < (radius * 0.18):
                    r, g, b = 34, 211, 238
                elif dist < (radius * 0.26):
                    r, g, b = 2, 6, 23
                elif dist < (radius * 0.32):
                    r, g, b = 56, 189, 248

            row.extend([r, g, b, a])
        raw_rows.append(bytes(row))
        
    compressed = zlib.compress(b''.join(raw_rows), 9)
    
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)) + b'IHDR' + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr)))
    
    # IDAT chunk
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed)))
    
    # IEND chunk
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND')))
    
    return bytes(png)

os.makedirs('public', exist_ok=True)

with open('public/pwa-192x192.png', 'wb') as f:
    f.write(create_png(192, 192, is_maskable=False))

with open('public/pwa-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, is_maskable=False))

with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, is_maskable=True))

with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(create_png(180, 180, is_maskable=False))

print("Successfully generated PWA and Android compliant PNG icons.")
