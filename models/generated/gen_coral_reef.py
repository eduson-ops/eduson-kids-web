"""
Generate coral_reef.glb using trimesh.
Blender 5.x-style asset built with pure Python / trimesh.
"""
import numpy as np
import trimesh
from trimesh.transformations import rotation_matrix, translation_matrix, concatenate_matrices

OUT = r"C:\Users\being\Desktop\R&D\src\public\models\generated\coral_reef.glb"

def hex_to_rgba(h, alpha=255):
    h = h.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return [r, g, b, alpha]

def colored_mesh(mesh, color_hex):
    mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh,
        vertex_colors=np.tile(hex_to_rgba(color_hex), (len(mesh.vertices), 1)))
    return mesh

meshes = []

# ── Base disk (cylinder flattened) ──────────────────────────────────────────
base = trimesh.creation.cylinder(radius=1.2, height=0.15, sections=32)
colored_mesh(base, '#cc4422')
meshes.append(base)

# ── 5 coral branches (tapered cones) ────────────────────────────────────────
branch_specs = [
    # (x, y, height, radius_bottom, tilt_deg, tilt_axis, color)
    ( 0.0,  0.5, 0.75, 0.12, 20, [1,0,0], '#ff6644'),
    ( 0.5, -0.1, 0.60, 0.10, 15, [0,1,0], '#ff4499'),
    (-0.5,  0.2, 0.80, 0.13, 25, [1,1,0], '#ffaa22'),
    ( 0.2, -0.5, 0.50, 0.09, 30, [1,0,1], '#cc3388'),
    (-0.3, -0.4, 0.65, 0.11, 18, [0,1,1], '#ff6644'),
]

polyp_positions = []

for x, y, h, r, tilt_deg, tilt_ax, color in branch_specs:
    cone = trimesh.creation.cone(radius=r, height=h, sections=12)
    # cone tip is at +h/2 in trimesh, centre at origin → shift so base sits at z=0
    cone.apply_translation([0, 0, h/2])

    # tilt
    ax = np.array(tilt_ax, dtype=float)
    ax /= np.linalg.norm(ax)
    T_tilt = rotation_matrix(np.radians(tilt_deg), ax)
    cone.apply_transform(T_tilt)

    # place on top of base disk (z=0.075 is top of base)
    cone.apply_translation([x, y, 0.075])
    colored_mesh(cone, color)
    meshes.append(cone)

    # record approximate tip position for polyps
    tip_local = np.array([0, 0, h])
    # rotate tip
    tip_rot = T_tilt[:3,:3] @ tip_local
    polyp_positions.append(np.array([x, y, 0.075]) + tip_rot)

# ── 3 polyp dots (small spheres at branch tips) ──────────────────────────────
for i, pos in enumerate(polyp_positions[:3]):
    sphere = trimesh.creation.icosphere(subdivisions=2, radius=0.08)
    sphere.apply_translation(pos)
    colored_mesh(sphere, '#ff8800')
    meshes.append(sphere)

# ── Combine & export ─────────────────────────────────────────────────────────
scene = trimesh.Scene()
for i, m in enumerate(meshes):
    scene.add_geometry(m, node_name=f'coral_part_{i}')

scene.export(OUT)
print(f"Exported: {OUT}")

import os
print(f"Size: {os.path.getsize(OUT):,} bytes")
