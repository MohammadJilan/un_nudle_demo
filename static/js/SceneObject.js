export default class SceneObject {
    constructor(link, scene) {
        this.link = link
        this.scene = scene;
        this.object = null;
    }

    async loadObject() {
        this.object = await BABYLON.ImportMeshAsync(this.link, this.scene);
    }

    getObject() {
        return this.object;
    }

    getRoot() {
        return this.object.meshes[0];
    }

    setVisible(isVisible) {
        if (isVisible) {
            this.getRoot().setEnabled(true);
        } else {
            this.getRoot().setEnabled(false);
        }
    }
    setScaling(scale) {
        this.getRoot().scaling = new BABYLON.Vector3(scale, scale, scale);
    }

    setParent(parent) {
        this.getRoot().parent = parent;
    }

    stopAllAnimation() {
        if (!this.object) return;

        this.object.animationGroups.forEach(group => {
            group.stop();
        });
    }

    playAnimation(animation, loop = false, speed = 1, startFrame = null, endFrame = null) {
        this.stopAllAnimation();
        const anim = this.object.animationGroups.find(a => a.name === animation);
        if (startFrame != null && endFrame != null) {
            anim.reset();
            anim.goToFrame(startFrame);
            anim.start(loop, speed, startFrame, endFrame);
        }
        else {
            anim.start(loop, speed);
        }
    }

    highlightMesh(meshName, darken = false) {
        const excluded = meshName;

        this.object.meshes.forEach(mesh => {
            if (mesh.name !== excluded) {
                if (mesh.material) {
                    if (!mesh.material.isUnique) {
                        mesh.material = mesh.material.clone(mesh.name + "_mat");
                    }
                    mesh.material.alpha = 0.3;
                }
            } else {
                if (darken) { // if darken is true, we make it darker
                    mesh.material.albedoColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                }
            }
        });
    }

    resetHighlight() {

        this.object.meshes.forEach(mesh => {
            if (mesh.material) {
                if (!mesh.material.isUnique) {
                    mesh.material = mesh.material.clone(mesh.name + "_mat");
                }
                mesh.material.alpha = 1;
                mesh.material.albedoColor = new BABYLON.Color3(1, 1, 1);
            }
        })

    }

    findMesh(meshName) {
        const targetMesh = this.object.meshes.find(m => m.name === meshName);
        return targetMesh
    }

    attachLabel(meshName, advancedTexture, text) {
        const mesh = this.findMesh(meshName);

        const rect = new BABYLON.GUI.Rectangle("caption");
        rect.background = "rgb(40,40,40)";   // Dark gray background
        rect.color = "white";                // Outline color
        rect.thickness = 2;                  // Outline thickness
        rect.height = "40px";
        rect.width = "200px";                // Wide enough for long text
        rect.cornerRadius = 8;               // Rounded edges
        rect.alpha = 0.9;                    // Slight transparency

        // Add text inside rectangle
        const label = new BABYLON.GUI.TextBlock();
        label.text = text;
        label.color = "white";
        label.fontSize = 14;
        label.fontFamily = "Poppins-Regular, Times new Roman"; // If Canva Sans not available, fallback to sans-serif
        label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        label.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        // Add text to rectangle
        rect.addControl(label);

        // Add rectangle to UI
        advancedTexture.addControl(rect);

        rect.linkWithMesh(mesh);

        rect.linkOffsetY = 0;

        return rect;
    }

    attachOccluder(plane) {
        this.plane = plane;
        this.plane.id = "CullingPlane";
        this.plane.parent = this.object.meshes[0];
    }

    activateOccluder(isActivate) {
        if (!this.plane) {
            return;
        }

        if (isActivate) {

            this.getRoot().getChildMeshes().forEach(mesh => {
                mesh.isVisible = false;
            });

            /*this.getRoot().getChildMeshes().forEach(mesh => {
                this.scene.onBeforeRenderObservable.add(() => {
                    if(mesh.intersectsMesh(this.plane, false) && mesh.id != "CullingPlane"){
                        mesh.isVisible = true;
                        
                    }
                });
            });*/

            this.getRoot().getChildMeshes().forEach(mesh => {
                this.scene.onBeforeRenderObservable.add(() => {
                    if (mesh.id !== "CullingPlane") {
                        const meshY = mesh.getBoundingInfo().boundingBox.centerWorld.y;
                        const planeY = this.plane.getAbsolutePosition().y;

                        if (meshY <= planeY) {
                            mesh.isVisible = true;
                        } else {
                            mesh.isVisible = false;
                        }
                    }
                });
            });

        } else {
            this.plane.isVisible = false;
            this.object.getChildMeshes().forEach(mesh => {
                mesh.isVisible = true;
            });

        }

    }

    async faceCameraByMesh(targetMeshName, camera, offsetDegrees = 0, duration = 60) {
        const root = this.getRoot(); // get the root

        const targetMesh = this.findMesh(targetMeshName);

        let bestDistance = Infinity;
        let bestRotationY = root.rotation.y;

        // Step size (smaller = more accurate, slower)
        const step = BABYLON.Angle.FromDegrees(2).radians();

        const tempRotY = root.rotation.y;

        for (let angle = 0; angle < Math.PI * 2; angle += step) { // for x from 0 to 360, do the following:
            // Apply rotation
            root.rotation.y = angle; // first off set angle to rotation as intial value.
            root.computeWorldMatrix(true);
            targetMesh.computeWorldMatrix(true);

            // Get mesh position after rotation
            let meshPos = targetMesh.getAbsolutePosition();

            // Calculate distance to camera
            let distance = BABYLON.Vector3.Distance(meshPos, camera.position);


            // Update best if this is closer
            if (distance < bestDistance) {
                bestDistance = distance;
                bestRotationY = angle;
            }
        }

        root.rotation.y = tempRotY;


        // Convert offset from degrees → radians
        const offsetRadians = BABYLON.Angle.FromDegrees(offsetDegrees).radians();
        const finalRotationY = bestRotationY + offsetRadians;

        // Create animation
        const animation = new BABYLON.Animation(
            "smoothRotateY",
            "rotation.y",
            60, // fps
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );


        const keys = [
            { frame: 0, value: root.rotation.y },
            { frame: duration, value: finalRotationY }
        ];

        animation.setKeys(keys);
        root.animations = [animation];


        // Run the animation
        root.getScene().beginAnimation(root, 0, duration, false, 1, () => {
            // nothing.
        });
    }

}