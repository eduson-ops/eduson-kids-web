"""
Generate anchor.glb using trimesh.
Ship anchor: ring + vertical shaft + crossbar + two curved flukes.
"""
import numpy as np
import trimesh
import os

OUT = r"C:\Users\being\Desktop\R&D\src\public\models\generated\anchor.glb"

def hex_to_rgba(h, alpha=255):
    h = h.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return [r, g, b, alpha]

def colored_mesh(mesh, color_hex):
    mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh,
        vertex_colors=np.tile(hex_to_rgba(color_hex), (len(mesh.vertices), 1)))
    return mesh

meshes = []

# ── Ring (torus) at top ──────────────────────────────────────────────────────
torus = trimesh.creation.torus(major_radius=0.18, minor_radius=0.04)
torus.apply_translation([0, 0, 0.9 + 0.18])  # above shaft top
colored_mesh(torus, '#333344')
meshes.append(torus)

# ── Vertical shaft ───────────────────────────────────────────────────────────
shaft_h = 1.8
shaft = trimesh.creation.cylinder(radius=0.05, height=shaft_h, sections=16)
# Centre shaft so it runs from z=0 to z=shaft_h
shaft.apply_translation([0, 0, shaft_h / 2])
colored_mesh(shaft, '#333344')
meshes.append(shaft)

# ── Crossbar (horizontal cylinder) ──────────────────────────────────────────
crossbar = trimesh.creation.cylinder(radius=0.04, height=1.0, sections=12)
# Rotate 90° around X so it lies horizontal
crossbar.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2, [1,0,0]))
# Position at y=0.7 from bottom of shaft → z = 0.7
crossbar.apply_translation([0, 0, 0.7])
colored_mesh(crossbar, '#333344')
meshes.append(crossbar)

# ── Two flukes at bottom (cylinders rotated 45° outward-and-down) ────────────
# Each fluke: short cylinder, tilted 45° outward from base of shaft
fluke_h = 0.45
fluke_r = 0.045

for side in [1, -1]:
    fluke = trimesh.creation.cylinder(radius=fluke_r, height=fluke_h, sections=10)
    # Rotate 45° around Y axis (outward) + 45° downward (so fluke goes out and down)
    # Combined: rotate ~45° in the XZ plane, pointing outward-down
    T = trimesh.transformations.rotation_matrix(np.radians(45 * side), [0, 1, 0])
    fluke.apply_transform(T)
    # Shift so it attaches at the bottom of the shaft (z=0)
    # After rotation, offset slightly outward
    fluke.apply_translation([side * 0.15, 0, -0.1])
    colored_mesh(fluke, '#333344')
    meshes.append(fluke)

    # Fluke tip cap (small sphere) with rust emission color
    tip_pos = np.array([side * 0.15, 0, -0.1]) + T[:3,:3] @ np.array([0, 0, fluke_h/2])
    sphere = trimesh.creation.icosphere(subdivisions=1, radius=0.07)
    sphere.apply_translation(tip_pos)
    colored_mesh(sphere, '#884422')  # rust orange
    meshes.append(sphere)

# ── Combine & export ─────────────────────────────────────────────────────────
scene = trimesh.Scene()
for i, m in enumerate(meshes):
    scene.add_geometry(m, node_name=f'anchor_part_{i}')

scene.export(OUT)
print(f"Exported: {OUT}")
print(f"Size: {os.path.getsize(OUT):,} bytes")
