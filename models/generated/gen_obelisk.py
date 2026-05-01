"""
Generate obelisk.glb using trimesh.
Ancient Egyptian obelisk: shaft + pyramid cap + hieroglyph lines + base plinth.
"""
import numpy as np
import trimesh
import os

OUT = r"C:\Users\being\Desktop\R&D\src\public\models\generated\obelisk.glb"

def hex_to_rgba(h, alpha=255):
    h = h.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return [r, g, b, alpha]

def colored_box(extents, color_hex):
    m = trimesh.creation.box(extents=extents)
    m.visual = trimesh.visual.ColorVisuals(mesh=m,
        vertex_colors=np.tile(hex_to_rgba(color_hex), (len(m.vertices), 1)))
    return m

def colored_mesh(mesh, color_hex):
    mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh,
        vertex_colors=np.tile(hex_to_rgba(color_hex), (len(mesh.vertices), 1)))
    return mesh

meshes = []

# ── Base plinth  0.7 × 0.7 × 0.15  ──────────────────────────────────────────
plinth = colored_box([0.7, 0.7, 0.15], '#555544')
# sit at z = 0, centre at z=0.075
plinth.apply_translation([0, 0, 0.075])
meshes.append(plinth)

# ── Main shaft  0.4 × 0.4 × 3.5  ────────────────────────────────────────────
# shaft bottom sits on top of plinth → z_bottom = 0.15
shaft_h = 3.5
shaft = colored_box([0.4, 0.4, shaft_h], '#555544')
shaft.apply_translation([0, 0, 0.15 + shaft_h/2])
meshes.append(shaft)

# ── Pyramid cap  (cone with 4 sides = square pyramid) 0.5 wide, 0.5 tall ────
# trimesh.creation.cone creates a circular cone; use a box-based pyramid approach
# Build manually: a square base pyramid using vertices
cap_w = 0.5
cap_h = 0.5
cap_z_bottom = 0.15 + shaft_h   # sits on top of shaft

# 5 vertices: 4 base corners + 1 apex
verts = np.array([
    [-cap_w/2, -cap_w/2, cap_z_bottom],
    [ cap_w/2, -cap_w/2, cap_z_bottom],
    [ cap_w/2,  cap_w/2, cap_z_bottom],
    [-cap_w/2,  cap_w/2, cap_z_bottom],
    [0,         0,        cap_z_bottom + cap_h],
], dtype=float)

faces = np.array([
    [0,1,2], [0,2,3],   # base
    [0,4,1], [1,4,2], [2,4,3], [3,4,0],   # sides
])

cap = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
cap.fix_normals()
colored_mesh(cap, '#ffd644')
meshes.append(cap)

# ── Hieroglyph lines: 6 thin boxes evenly spaced up the shaft ────────────────
# Spaced from z=0.4 to z=3.4 (within shaft)
n_glyphs = 6
z_start = 0.4
z_end = 3.3
for i in range(n_glyphs):
    z = 0.15 + z_start + i * (z_end - z_start) / (n_glyphs - 1)
    glyph = colored_box([0.35, 0.02, 0.05], '#332211')
    glyph.apply_translation([0, 0.19, z])   # sit on +Y face of shaft
    meshes.append(glyph)
    # opposite side
    glyph2 = colored_box([0.35, 0.02, 0.05], '#332211')
    glyph2.apply_translation([0, -0.19, z])
    meshes.append(glyph2)

# ── Combine & export ─────────────────────────────────────────────────────────
scene = trimesh.Scene()
for i, m in enumerate(meshes):
    scene.add_geometry(m, node_name=f'obelisk_part_{i}')

scene.export(OUT)
print(f"Exported: {OUT}")
print(f"Size: {os.path.getsize(OUT):,} bytes")
