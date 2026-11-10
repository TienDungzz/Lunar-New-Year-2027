"""Xuân An Yên environment. Run in Blender's Python editor or via Blender MCP.
Creates a separate scene; preserves existing scenes. No external assets required.
Blender coordinates Z-up, front at Y=-; glTF exporter converts to Y-up.
"""
import bpy
import math
import os
import random
from mathutils import Vector

ROOT = os.environ.get('TET_PROJECT_ROOT', r'C:\Users\trant\Desktop\Source\Lunar-New-Year')
scene = bpy.data.scenes.new('Tet_Environment')
bpy.context.window.scene = scene

def material(name, color, emission=0):
    mat = bpy.data.materials.new('Tet_' + name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = 0.72
    if emission:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        shader.inputs['Emission Strength'].default_value = emission
    return mat

wall = material('Ochre plaster', (0.57, 0.35, 0.18))
wood = material('Dark teak', (0.12, 0.055, 0.031))
trim = material('Warm teak', (0.29, 0.12, 0.057))
roof = material('Terracotta', (0.27, 0.065, 0.043))
tile = material('Tile edges', (0.4, 0.115, 0.067))
stone = material('Limestone', (0.35, 0.36, 0.29))
gold = material('Brass', (0.78, 0.45, 0.1))
red = material('Silk red', (0.65, 0.032, 0.025))
glow = material('Window amber', (1.0, 0.43, 0.09), 2.4)
lantern_mat = material('Lantern amber red', (1.0, 0.17, 0.035), 0.8)

def cube(name, loc, scale, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft handmade edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def cylinder(name, loc, radius, depth, mat, vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj

cube('House foundation', (0, 0, 0.18), (7.9, 4.3, 0.36), stone, 0.08)
cube('Plaster house', (0, 0.25, 1.62), (7.1, 3.3, 2.65), wall, 0.035)
cube('Porch floor', (0, -1.94, 0.38), (8, 1.65, 0.25), stone, 0.04)
for i in range(3):
    cube('Front step', (0, -2.55-i*0.26, 0.27-i*0.085), (4.7+i*0.3, 0.35, 0.18), stone, 0.025)

# Front wall panels, windows and entrance.
for x in (-2.5, 2.5):
    cube('Luminous window', (x, -1.42, 1.72), (1.25, 0.05, 1.25), glow)
    for dx in (-0.69, 0, 0.69):
        cube('Window mullion', (x+dx, -1.48, 1.72), (0.07, 0.12, 1.46), wood, 0.01)
    for z in (1.02, 1.72, 2.42):
        cube('Window transom', (x, -1.49, z), (1.45, 0.12, 0.065), wood)
    for dx in (-0.9, 0.9):
        cube('Window shutter', (x+dx, -1.5, 1.72), (0.25, 0.13, 1.45), trim, 0.02)

cube('Door warm interior', (0, -1.43, 1.53), (1.6, 0.06, 2.25), glow)
for x in (-0.91, 0.91):
    cube('Door jamb', (x, -1.52, 1.54), (0.15, 0.23, 2.5), wood)
    cube('Open wooden door', (x*1.18, -1.7, 1.53), (0.42, 0.12, 2.25), trim, 0.025)
cube('Door header', (0, -1.53, 2.79), (1.98, 0.23, 0.15), wood)
font = bpy.data.fonts.load(os.path.join(ROOT, 'public', 'fonts', 'be-vietnam-pro.ttf'))
def lettering(name, text, location, size):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = text
    curve.font = font
    curve.size = size
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.extrude = 0.0008
    curve.resolution_u = 3
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (math.pi/2, 0, 0)
    obj.data.materials.append(gold)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    return bpy.context.object

for x, words in [(-1.2, ['XUÂN','SANG','PHÚC','LỘC','ĐẦY','NHÀ']), (1.2, ['TẾT','ĐẾN','AN','KHANG','VẠN','SỰ'])]:
    cube('Couplet red silk panel', (x, -2.37, 1.67), (0.44, 0.055, 2.04), red, 0.012)
    for dx in (-0.205, 0.205):
        cube('Couplet gold border', (x+dx, -2.405, 1.67), (0.012, 0.012, 1.99), gold)
    for i, word in enumerate(words):
        lettering('Couplet lettering ' + word, word, (x, -2.409, 2.44-i*.305), 0.108)
cube('New year greeting sign', (0, -2.72, 2.70), (2.45, 0.06, 0.35), red, 0.02)
lettering('New year greeting lettering', 'CHÚC MỪNG NĂM MỚI', (0, -2.761, 2.70), 0.13)

for x in (-3.55, -1.2, 1.2, 3.55):
    cylinder('Porch teak column', (x, -2.22, 1.7), 0.105, 2.5, wood)
    cylinder('Column stone foot', (x, -2.22, 0.53), 0.17, 0.25, stone)
cube('Porch lintel', (0, -2.22, 2.98), (7.5, 0.25, 0.23), wood)

# Two broad sloping roof surfaces, with curved tile ridges.
for side in (-1, 1):
    verts = [(-4.15, 0, 4.32), (4.15, 0, 4.32), (4.15, side*2.65, 2.95), (-4.15, side*2.65, 2.95)]
    mesh = bpy.data.meshes.new('Roof slope mesh')
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    mesh.materials.append(roof)
    obj = bpy.data.objects.new('Terracotta roof slope', mesh)
    scene.collection.objects.link(obj)
    for i in range(42):
        x = -4.1+i*0.2
        a, b = Vector((x, 0, 4.35)), Vector((x, side*2.69, 2.97))
        obj = cylinder('Raised tile rib', (a+b)/2, 0.043, (b-a).length, tile, 6)
        obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    for j in range(1, 8):
        t = j/8
        cube('Horizontal tile seam', (0, side*2.65*t, 4.34-1.37*t), (8.3, 0.038, 0.025), tile)
    cube('Roof fascia', (0, side*2.66, 2.94), (8.5, 0.12, 0.15), wood, 0.02)
ridge = cylinder('Roof ridge', (0, 0, 4.38), 0.10, 8.6, tile)
ridge.rotation_euler[1] = math.pi/2

for x in (-3.0, -1.82, 1.82, 3.0):
    cylinder('Lantern cord', (x, -2.35, 2.75), 0.015, 0.44, gold, 6)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=1, location=(x, -2.35, 2.43))
    obj = bpy.context.object
    obj.name = 'Silk lantern'
    obj.scale = (0.24, 0.24, 0.31)
    obj.data.materials.append(lantern_mat)
    for poly in obj.data.polygons: poly.use_smooth = True
    for z in (2.12, 2.73):
        cylinder('Lantern gold cap', (x, -2.35, z), 0.14, 0.06, gold)
    cylinder('Lantern tassel', (x, -2.35, 1.99), 0.025, 0.22, red, 6)

# A few porch details; no dedicated table or character scene.
for x in (-3.13, 3.13):
    cube('Wooden porch bench', (x, -1.9, 0.82), (0.85, 0.55, 0.12), trim, 0.03)
    for dx in (-0.3, 0.3):
        cube('Bench leg', (x+dx, -1.9, 0.63), (0.08, 0.4, 0.35), wood)

# A broader five-bay main house, with two extra lit room openings.
for obj in list(scene.objects):
    obj.location.x *= 1.35
    obj.location.z *= 1.08
    obj.scale.x *= 1.35
    obj.scale.z *= 1.08
for x in (-2.05, 2.05):
    cube('Main house extra room window', (x,-1.58,1.85), (.85,.06,1.25), glow)
    for dx in (-.48,0,.48):
        cube('Extra room window frame', (x+dx,-1.64,1.85), (.065,.1,1.4), wood)
    for z in (1.16,1.85,2.54):
        cube('Extra room window transom', (x,-1.64,z), (1.02,.1,.065), wood)

# Lower side house: two separate entrances and a shared veranda.
# Set back from the cooking area, so the open courtyard stays usable.
cube('Side house foundation', (7.55,1.05,.18), (4.1,4.5,.36), stone,.04)
cube('Side house plaster rooms', (7.55,1.3,1.47), (3.65,3.7,2.25), wall,.035)
cube('Side house veranda', (7.55,-1.15,.38), (4.2,1.1,.22), stone,.025)
cube('Side house front step', (7.55,-1.86,.16), (3.6,.45,.24), stone,.025)
for x in (6.55,8.55):
    cube('Side room warm doorway', (x,-.59,1.48), (.94,.06,1.96), glow)
    for dx in (-.53,.53):
        cube('Side room door jamb', (x+dx,-.66,1.48), (.1,.16,2.12), wood)
    cube('Side room door header', (x,-.66,2.53), (1.16,.16,.12), wood)
    cube('Side room door leaf', (x-.3,-.73,1.48), (.32,.12,1.95), trim,.015)
for x in (5.65,7.55,9.45):
    cylinder('Side veranda column', (x,-1.4,1.57), .09,2.4,wood)
cube('Side veranda lintel', (7.55,-1.4,2.8), (4.2,.18,.18), wood)
for side in (-1,1):
    mesh = bpy.data.meshes.new('Side house roof mesh')
    mesh.from_pydata([(5.3,1,3.8),(9.8,1,3.8),(9.8,1+side*2.65,2.8),(5.3,1+side*2.65,2.8)],[],[(0,1,2,3)])
    mesh.materials.append(roof)
    obj = bpy.data.objects.new('Side house tiled roof',mesh)
    scene.collection.objects.link(obj)
    for i in range(23):
        x = 5.35+i*.2
        a,b = Vector((x,1,3.83)),Vector((x,1+side*2.66,2.83))
        obj = cylinder('Side roof tile rib',(a+b)/2,.035,(b-a).length,tile,6)
        obj.rotation_euler = (b-a).to_track_quat('Z','Y').to_euler()
    for j in range(1,8):
        t = j/8
        cube('Side roof tile seam',(7.55,1+side*2.65*t,3.82-t),(4.5,.035,.025),tile)
    cube('Side roof fascia',(7.55,1+side*2.67,2.78),(4.6,.12,.14),wood)
obj = cylinder('Side roof ridge',(7.55,1,3.86),.08,4.65,tile)
obj.rotation_euler[1] = math.pi/2
for x in (6.55,8.55):
    cylinder('Side house lantern cord',(x,-1.5,2.59),.012,.35,gold,6)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=(x,-1.5,2.3))
    obj = bpy.context.object
    obj.name = 'Side house silk lantern'
    obj.scale = (.2,.2,.27)
    obj.data.materials.append(lantern_mat)
    cylinder('Side lantern tassel',(x,-1.5,1.96),.02,.16,red,6)

# Keep architecture and courtyard props separate for web loading and batching.
house_objects = list(scene.objects)
brick = material('Stove brick', (0.34, 0.12, 0.06))
iron = material('Blackened cooking pot', (0.055, 0.065, 0.058))
iron_shader = next(n for n in iron.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
iron_shader.inputs['Metallic'].default_value = 0.65
iron_shader.inputs['Roughness'].default_value = 0.32
leaf = material('Dong leaves', (0.13, 0.27, 0.085))
foliage = material('Kumquat foliage', (0.08, 0.19, 0.085))
orange = material('Kumquat orange', (0.95, 0.32, 0.025))
yellow = material('Chrysanthemum gold', (1.0, 0.64, 0.045))
clay = material('Garden terracotta', (0.48, 0.19, 0.08))
string = material('Bamboo tying strips', (0.82, 0.75, 0.45))
bulb = material('Festoon light bulbs', (1.0, 0.59, 0.2), 4)
embers = material('Stove embers', (1.0, 0.12, 0.008), 3)

def sphere(name, loc, scale, mat, detail=1):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=detail, radius=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    return obj

def torus(name, loc, major, minor, mat, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=20, minor_segments=6, location=loc, rotation=rotation, major_radius=major, minor_radius=minor)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj

def segment(name, a, b, radius, mat):
    a, b = Vector(a), Vector(b)
    obj = cylinder(name, (a+b)/2, radius, (b-a).length, mat, 6)
    obj.rotation_euler = (b-a).to_track_quat('Z','Y').to_euler()
    return obj

def lantern(name, x, y, z, radius=.23):
    sphere(name, (x,y,z), (radius,radius,radius*1.35), lantern_mat, 2)
    for dz in (-1.3, 1.3): cylinder('Lantern cap', (x,y,z+radius*dz), radius*.55, .045, gold)
    cylinder('Lantern hanging cord', (x,y,z+radius*1.75), .012, radius*.9, gold, 6)
    cylinder('Lantern red tassel', (x,y,z-radius*1.9), .023, radius*.8, red, 6)

# A wood-fired nồi bánh chưng at the right-hand side of the porch.
px, py = 4.45, -2.9
cube('Stove stone base', (px,py,.06), (1.55,1.45,.12), stone, .035)
for layer in range(3):
    z = .17+layer*.155
    for i in range(3):
        cube('Stove rear brick', (px+(i-1)*.39,py+.47,z), (.36,.23,.14), brick, .012)
    for side in (-1,1):
        for i in range(3): cube('Stove side brick', (px+side*.55,py+(i-1)*.34,z), (.22,.31,.14), brick, .012)
for i in range(4):
    obj = cylinder('Firewood', (px+(i-1.5)*.18,py-.32,.24), .07, 1.0, wood, 7)
    obj.rotation_euler[0] = math.pi/2
    sphere('Glowing ember', (px+(i-1.5)*.17,py-.32,.31), (.12,.16,.045), embers)
cylinder('BanhChungPot iron body', (px,py,.92), .54, .64, iron, 24)
torus('Pot upper rim', (px,py,1.25), .53,.035,iron)
for side in (-1,1): torus('Pot side handle', (px+side*.58,py,1.08), .13,.032,iron,(0,math.pi/2,0))
sphere('Pot domed lid', (px,py,1.29), (.57,.57,.085), iron, 2)
cylinder('Pot lid knob', (px,py,1.39), .08,.08,wood)

# Leaf-wrapped square cakes and spare leaves on a low wooden crate.
cube('Banh chung wooden crate', (3.32,-3.12,.3), (.83,.75,.55), trim, .025)
for i in range(5):
    x, y, z = 3.14+(i%2)*.36, -3.24+(i//2%2)*.12, .66+(i//2)*.18
    cube('Wrapped banh chung', (x,y,z), (.33,.33,.16), leaf, .02)
    for offset in (-.085,.085):
        cube('Banh chung tying strip', (x+offset,y,z+.084), (.014,.34,.008), string)
        cube('Banh chung tying strip', (x,y+offset,z+.089), (.34,.014,.008), string)

# Potted chrysanthemums frame the entrance and courtyard edges.
rng = random.Random(2027)
for x,y in [(-3.3,-2.9),(3.3,-2.35),(-3.0,-5.3),(3.0,-5.3),(-5.0,-4.3),(5.5,-4.3)]:
    bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=.23, radius2=.36, depth=.43, location=(x,y,.26))
    bpy.context.object.name = 'Chrysanthemum clay pot'
    bpy.context.object.data.materials.append(clay)
    torus('Flower pot rim', (x,y,.47), .35,.035,clay)
    for i in range(12):
        a = i/12*math.tau
        fx,fy,fz = x+math.cos(a)*(.12+rng.random()*.19), y+math.sin(a)*(.12+rng.random()*.19), .7+rng.random()*.23
        segment('Flower stem', (x,y,.46), (fx,fy,fz), .009, leaf)
        sphere('Chrysanthemum blossom', (fx,fy,fz), (.09,.09,.075), yellow if i%4 else orange, 1)
        sphere('Flower foliage', (fx,fy,fz-.12), (.13,.06,.04), foliage, 1)

for x,y in [(-5.1,-1.3),(5.15,-.5)]:
    cylinder('Kumquat clay planter', (x,y,.32), .48,.64,clay)
    torus('Kumquat pot rim', (x,y,.64), .47,.045,clay)
    cylinder('Kumquat trunk', (x,y,1.1), .055,1.2,wood,8)
    for dx,dy,dz,r in [(-.3,0,1.5,.5),(.3,.1,1.65,.5),(0,0,2,.47)]:
        sphere('Kumquat leaf crown', (x+dx,y+dy,dz), (r,r,r*.85), foliage, 2)
    for i in range(32):
        a, z = rng.random()*math.tau, 1.25+rng.random()*.95
        r = .48*math.sqrt(max(.1,1-((z-1.7)/.75)**2))
        sphere('Kumquat fruit', (x+math.cos(a)*r,y+math.sin(a)*r,z), (.06,.06,.06), orange, 1)

# Low timber fencing and a pair of red lantern gate posts.
for side in (-1,1):
    x = -6.5 if side == -1 else 10.3
    for y in (-5,-3,-1,1,3):
        cube('Garden fence post', (x,y,.61), (.13,.13,1.2), wood, .012)
        sphere('Fence finial', (x,y,1.26), (.11,.11,.12), gold, 1)
    for z in (.35,.9): cube('Garden fence rail', (x,-1,z), (.08,8.1,.10), trim)
    cube('Lantern gate post', (side*3.7,-5.8,1.1), (.15,.15,2.2), wood, .015)
    segment('Lantern gate bracket', (side*3.7,-5.8,2.12), (side*3.35,-5.8,2.12), .025, gold)
    lantern('Gate red silk lantern', side*3.35,-5.8,1.79,.22)

# Warm bulbs suspended in three swags, each with an actual hanging wire.
for a,b,n in [((-3.7,-5.8,2.3),(3.7,-5.8,2.3),24),((-3.6,-2.5,2.85),(-3.7,-5.8,2.3),12),((3.6,-2.5,2.85),(3.7,-5.8,2.3),12)]:
    previous = None
    for i in range(n+1):
        t = i/n
        p = (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t-.3*math.sin(math.pi*t))
        if previous: segment('Festoon hanging wire',previous,p,.008,wood)
        if i%2 == 0: sphere('Warm festoon bulb',(p[0],p[1],p[2]-.055),(.042,.042,.06),bulb,1)
        previous = p

garden_objects = [obj for obj in scene.objects if obj not in house_objects]
os.makedirs(os.path.join(ROOT, 'public', 'models'), exist_ok=True)
os.makedirs(os.path.join(ROOT, 'art', 'blender'), exist_ok=True)
for filename, objects in [('tet-house.glb', house_objects), ('tet-courtyard.glb', garden_objects)]:
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        if obj.type == 'MESH': obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, 'public', 'models', filename), use_selection=True, use_active_scene=True, export_format='GLB', export_yup=True)

world = bpy.data.worlds.new('Tet night')
world.use_nodes = True
background = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
background.inputs[0].default_value = (0.035, 0.07, 0.12, 1)
background.inputs[1].default_value = 0.4
scene.world = world
bpy.ops.object.light_add(type='AREA', location=(1, -5, 7))
bpy.context.object.data.energy = 1400
bpy.context.object.data.color = (1, 0.7, 0.4)
bpy.context.object.data.shape = 'DISK'
bpy.context.object.data.size = 8
bpy.context.object.rotation_euler = (Vector((0, 0, 1.5))-bpy.context.object.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.camera_add(location=(11, -16, 9))
cam = bpy.context.object
cam.rotation_euler = (Vector((0, -1.2, 1.6))-cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.type = 'ORTHO'
cam.data.ortho_scale = 16
scene.camera = cam
scene.render.resolution_x = 1000
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
bpy.data.libraries.write(os.path.join(ROOT, 'art', 'blender', 'tet-environment.blend'), {scene}, fake_user=True, compress=True)
print('Exported tet-house.glb and tet-courtyard.glb; saved only the generated environment in tet-environment.blend; preserved existing live scenes.')

