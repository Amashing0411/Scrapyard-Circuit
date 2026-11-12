# ATOM artist handoff — production assets required

The file atom_master.blend must be a real, artist-authored, visually approved model. It is intentionally absent. No procedural geometry or fake sprites are included.

Expected rig: ATOM_RIG, mechanical head, torso, hip, shoulders, upper arms, articulated elbows/forearms, wrists/fists, pistons, thighs, knees, shins, ankles and feet. Shoulder armour and pistons must articulate physically. Artist must set joint limits and contact constraints.

Required actions on the rig:
ATOM_IDLE, ATOM_FORWARD_MOVE, ATOM_RIGHT_CROSS, ATOM_HEAVY_HEAD_IMPACT.

Required fixed cameras: CAM_FACING_LEFT and CAM_FACING_RIGHT. Use locked three-quarter composition, fixed ground, color management and lighting across all frames. Do not merely mirror the atlas.

Required scene objects: SPRITE_ORIGIN, GROUND_ANCHOR and SOCKET_FOREARM_R. Required scene view layers: BODY, FOREARM_R, BODY_DETACHED, DEBRIS_FOREARM_R.

Paint/material direction from specification: weathered blue metal, chipped paint, brown worn fists, brushed mechanical steel, industrial hydraulic cylinders and fasteners. Use the accepted ATOM identity references, not an invented substitute.

Detachment requires a seam-safe right forearm, visible remaining stump, and a separate detached forearm pass with independent motion authored as 3D or rendered debris. The fighting engine is not modified by this preview.

Approval gate: provide model turnaround renders and mechanical rig test before exporting the whole sequence. Source frame-rate policy is 30fps normally; 60fps actions require a separately approved config update. Event timing/contact tick is deliberately left unassigned until art/combat review.
