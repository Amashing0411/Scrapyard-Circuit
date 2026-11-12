# ATOM 3D production — initial source pass (November 12, 2026)

## What has been built in the production workspace
- Real editable GLB geometry-development model with 93 separately named mechanical mesh nodes and 20,528 triangles. It includes a head, torso, articulated arm/forearm/fist assemblies, hydraulic and bearing details, legs, boots, and a detachable right forearm component.
- The same 3D mesh has been assigned five real, continuous 3D animation clips: ATOM_IDLE, ATOM_FORWARD_MOVE, ATOM_RIGHT_CROSS, ATOM_HEAVY_HEAD_IMPACT, ATOM_RIGHT_FOREARM_DETACH.
- Source clips have 36, 18, 21, 18, 18 time samples at 30 fps, respectively. These are *motion blocking*, not polished production sprite frames.
- Three-quarter camera review GIFs and the importable animated GLB were generated offline for quality inspection, and the GLB passed five structural/timing/joint connectivity unit checks.

## Important quality boundary
This first 3D source is an unapproved, low-detail geometry/articulation study and DOES NOT match the cinematic ATOM visual standard. No artist-quality mesh, finished materials, proper Blender skeletal armature, production-grade destruction effects, or high-resolution sprite atlases are claimed. The source GIFs are previews, not production game sprites.

## Environment / file transfer
The current runtime has 3D geometry/GLB authoring and offscreen rendering support, but *does not have Blender installed* and cannot download it. The full source code, animated GLB, geometry GLB, review GIFs, and test suite are available in a separate conversation download: `IRONFRAME_ATOM_3D_SOURCE_WIP.zip`. The binary assets have **not been added to this GitHub branch**.

## Next art gate
Build/refine the reference-matched ATOM Blender model and rig, approve materials/camera, then use the already isolated pipeline to export authentic 2048x2048 transparent frames and pack atlases. Do not edit `index.html` or fighting simulation until art/preview QA passes.
