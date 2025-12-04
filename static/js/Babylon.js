import SceneObject from "./SceneObject.js";
import XRChangeManager from "./XRChangeManager.js";
import BaseState from "./flowengine/BaseState.js";
import FlowEngine from "./flowengine/FlowEngine.js";
import InfoPoint from "./InfoPoint.js";


var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };


// States
class IntroScene extends BaseState {
    constructor() {
        super('Introduction');
        this.rootLayout = null;
    }

    async enter(engine) {

        const startButton = document.querySelector("._startbutton div");
        this.startpanel = document.querySelector("._startpanel");

        this.startpanel.classList.add("flex");
        this.startpanel.classList.remove("hidden");

        startButton.addEventListener("click", () => {
            engine.goTo("Overview");
        });


    }

    async exit() {
        this.startpanel.classList.add("hidden");
        this.startpanel.classList.remove("flex");

        delete this.startpanel;
    }
}

class OverviewScene extends BaseState {
    constructor() {
        super('Overview');
    }

    async enter(engine, payload) {
        const xrManager = new XRChangeManager(engine.context.xr);

        // showing sidebar
        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        xrManager.inAR = () => {
            engine.context.isARPlaced = true;

            engine.context.dot.isVisible = false;

            engine.context.root.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);

        }

        xrManager.in3D = async () => {
            engine.context.root.scaling = new BABYLON.Vector3(1, 1, 1);

            // changing position y to be bit lower
            engine.context.root.position.y = -1.5;

            // sky lighting
            this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
            this.light.intensity = 0.7;
            this.light.diffuse = new BABYLON.Color3.FromHexString("#156345");
            this.light.ground = new BABYLON.Color3.FromHexString("#664406");

            // enabling goat
            const goat = engine.context.models.goat;
            goat.setVisible(true);

            // sun
            this.sun = new BABYLON.DirectionalLight("SunLight", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
            this.sun.direction = new BABYLON.Vector3(-0.001507023801166572, -0.9891807330185057, 0.14669426132004784);
            this.sun.diffuse = new BABYLON.Color3.FromHexString("#D2D900");
            this.sun.position = new BABYLON.Vector3(0.002885129302740097, 2.8937411308288574, -0.2808395326137543)
            this.sun.intensity = 3;

            // sun spill
            this.sunSpill = new BABYLON.DirectionalLight("SunLightSpill", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
            this.sunSpill.direction = new BABYLON.Vector3(0.009916541653459112, -0.2610295946850095, -0.9652798624752381)
            this.sunSpill.diffuse = new BABYLON.Color3.FromHexString("#787A32");
            this.sunSpill.intensity = 3;

            // ground
            this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene)
            this.ground.rotation.x = Math.PI / 2
            this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene)
            this.ground.material.activeLight = this.sun;
            this.ground.receiveShadows = true;
            this.ground.parent = engine.context.root;

            // shadows
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sun);
            this.shadowGenerator.useBlurExponentialShadowMap = true;
            this.shadowGenerator.blurScale = 4;
            this.shadowGenerator.setDarkness(0.2);

            goat.getObject().meshes.forEach(mesh => {
                this.shadowGenerator.getShadowMap().renderList.push(mesh);
            });

            // adding infoboxes
            this.if1 = new InfoPoint("red", "1", engine.context.advancedTexture, engine.context.scene);
            this.if1.setPosition(engine.context.root, new BABYLON.Vector3(0, 1.98, 0.68));
            this.if1.set("Goat horns are permanent, keratin-covered structures used for defense, dominance, and thermoregulation.");

            this.if2 = new InfoPoint("blue", "2", engine.context.advancedTexture, engine.context.scene);
            this.if2.setPosition(engine.context.root, new BABYLON.Vector3(0, 0.1437, -0.54));
            this.if2.set("Goat hooves are cloven and flexible, helping them climb rocky and uneven terrain with agility.");

        }

        xrManager.onExitAR = () => {
            engine.context.isARPlaced = false;
        }


        xrManager.processCheck();


    }

    async exit(engine) {
        // hiding sidebar
        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        // hiding navigator
        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        // hiding goat
        const goat = engine.context.models.goat;
        goat.setVisible(false);

        // disposing of lights
        this.light.dispose();
        this.sun.dispose();
        this.sunSpill.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.sun;
        delete this.sunSpill;
        delete this.ground;
        delete this.shadowGenerator;

        this.if1.dispose();
        this.if2.dispose();

    }
}

class Slide1Scene extends BaseState {
    constructor() {
        super("Slide1");
    }

    async enter(engine) {

        // showing sidebar
        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        // sky lighting
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 1;
        this.light.diffuse = new BABYLON.Color3.FromHexString("#E0EB71");
        this.light.groundColor = new BABYLON.Color3.FromHexString("#694937");

        // enabling skeleton
        const skeleton = engine.context.models.skeleton;
        skeleton.setVisible(true);


        skeleton.getObject().meshes.forEach(m => {
            if (m.material && m.material.sheen) {
                m.material.sheen.isEnabled = true;
                m.material.sheen.intensity = 1;
            }
        });

        // secondary lighting
        this.sun = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
        this.sun.diffuse = new BABYLON.Color3.White;
        this.sun.intensity = 9;
        this.sun.position = new BABYLON.Vector3(-1.8959672089149775e-15, 9.538678169250488, 0)

        // ground
        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene)
        this.ground.rotation.x = Math.PI / 2
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene)
        this.ground.material.activeLight = this.sun;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;

        // shadows
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sun);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.setDarkness(0.2);

        skeleton.getObject().meshes.forEach(mesh => {
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        // setting parents for lights
        this.light.parent = skeleton.getRoot();
        this.sun.parent = skeleton.getRoot();

        // scaling skeletons
        skeleton.getRoot().scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);

        // adding infoboxes
        this.if1 = new InfoPoint("red", "1", engine.context.advancedTexture, engine.context.scene);
        this.if1.setPosition(engine.context.root, new BABYLON.Vector3(0, 2.5239720344543457, 1.336405634880066));
        this.if1.set("Skull: Lightweight, sturdy structure protecting the brain and supporting horns and teeth.");

        this.if2 = new InfoPoint("blue", "2", engine.context.advancedTexture, engine.context.scene);
        this.if2.setPosition(engine.context.root, new BABYLON.Vector3(-0.358362078666687, 1.815094232559204, 0.4275822341442108));
        this.if2.set("Spine: Flexible backbone providing support and agility for climbing and jumping.");

        this.if3 = new InfoPoint("green", "3", engine.context.advancedTexture, engine.context.scene);
        this.if3.setPosition(engine.context.root, new BABYLON.Vector3(0.4365695118904114, 1.2459067106246948, -0.814842164516449));
        this.if3.set("Femur bone: Thick thigh bone transmitting weight from the hip to the lower leg. Will be explained more later.");

        this.if4 = new InfoPoint("yellow", "4", engine.context.advancedTexture, engine.context.scene);
        this.if4.setPosition(engine.context.root, new BABYLON.Vector3(0.25542253255844116, 1.6876914501190186, 1.4395687580108643));
        this.if4.set("Mandible: Strong and hinged for chewing tough plant material efficiently.");

        this.if5 = new InfoPoint("orange", "5", engine.context.advancedTexture, engine.context.scene);
        this.if5.setPosition(engine.context.root, new BABYLON.Vector3(-0.43876442313194275, 1.1986513137817383, 0.34603428840637207));
        this.if5.set("Rib cage: Curved bones protecting the heart and lungs while allowing respiratory movement.");

        let playing = false;
        this.reset = () => {
            skeleton.stopAllAnimation();

            skeleton.getObject().animationGroups.forEach(anim => {
                anim.goToFrame(0);
                anim.start(false, 1, 0, 0);
            });

            engine.context.scene.render();

        }

        let stopAnimate = () => {
            skeleton.stopAllAnimation();

            skeleton.getObject().animationGroups.forEach(anim => {
                anim.start(false, 1, 250, 0);
            });

            playing = false;
        }

        this.animate = () => {
            if (!playing) {
                playing = true;

                skeleton.getObject().animationGroups.forEach(anim => {
                    anim.start(false, 1, 0, 250);
                });
            } else {
                stopAnimate();

            }
        }

        this.animateButton = document.querySelector("._navigator ._animatebutton");
        this.animateButton.addEventListener("click", this.animate);


    }

    async exit(engine) {
        // hiding sidebar
        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        // hiding navigator
        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        // hiding skeleton
        const skeleton = engine.context.models.skeleton;
        skeleton.setVisible(false);

        // disposing of lights
        this.light.dispose();
        this.sun.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.sun;
        delete this.ground;
        delete this.shadowGenerator;

        let infoBoxes = [this.if1, this.if2, this.if3, this.if4, this.if5];
        infoBoxes.forEach(ib => {
            ib.dispose();
        });

        // removing animation
        this.animateButton.removeEventListener("click", this.animate);
        delete this.animateButton;

        this.reset();
    }

}

class Slide2Scene extends BaseState {
    constructor() {
        super("Slide2");
    }

    async enter(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 0.5;

        const heart = engine.context.models.heart;
        heart.setVisible(true);
        heart.getRoot().position = new BABYLON.Vector3(0, 1.5, 0);

        // setting scaling
        heart.setScaling(0.2);

        // initial heartbeat animation
        const exclude = [
            "CameraRootAction",
            "Heart_OutsideSpliceAction"
        ];

        heart.getObject().animationGroups.forEach(anim => {
            if (exclude.includes(anim.name)) return; // skip excluded
            anim.play(true);
        });


        this.lamp = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 5, 0), engine.context.scene);
        this.lamp.intensity = 29;
        this.lamp.range = 10;
        this.lamp.parent = heart.getRoot();
        this.lamp.position = new BABYLON.Vector3(-3.777353286743164, 2.127333641052246, -4.837428092956543);

        this.lamp2 = new BABYLON.PointLight("pointLight2", new BABYLON.Vector3(0, 5, 0), engine.context.scene);
        this.lamp2.intensity = 29;
        this.lamp2.range = 10;

        this.lamp3 = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), engine.context.scene);
        this.lamp3.diffuse = new BABYLON.Color3.FromHexString("#97C7C7");
        this.lamp3.position = new BABYLON.Vector3(3.6040196418762207, -3.328416585922241, 3.6040196418762207);
        this.lamp3.direction = new BABYLON.Vector3(-0.006231618007651102, 0.9999611652224214, -0.006231772141523057);
        this.lamp3.intensity = 4;

        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene);
        this.ground.material.activeLight = this.lamp3;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;


        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.lamp3);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 10;
        this.shadowGenerator.blurBoxOffset = 6;
        this.shadowGenerator.setDarkness(0.2);

        heart.getObject().meshes.forEach(mesh => {
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        this.if1 = new InfoPoint("orange", "1", engine.context.advancedTexture, engine.context.scene);
        this.if1.setPosition(engine.context.root, new BABYLON.Vector3(0, 2.8976755142211914, -0.5400000214576721));
        this.if1.set("The goat heart is a muscular, four-chambered organ that efficiently pumps blood throughout its body.")



        let playing = false;
        this.reset = () => {
            heart.stopAllAnimation();
            let spliceAnim = heart.getObject().animationGroups.find(anim => anim.name === "Heart_OutsideSpliceAction");
            spliceAnim.goToFrame(0);
            spliceAnim.start(false, 1, 0, 0);

            // initial heartbeat animation
            const exclude = [
                "CameraRootAction",
                "Heart_OutsideSpliceAction"
            ];

            heart.getObject().animationGroups.forEach(anim => {
                if (exclude.includes(anim.name)) return; // skip excluded
                anim.play(true);
            });
        }

        let stopAnimate = () => {
            heart.stopAllAnimation();
            let spliceAnim = heart.getObject().animationGroups.find(anim => anim.name === "Heart_OutsideSpliceAction");
            spliceAnim.goToFrame(690);
            spliceAnim.start(false, 1, 690, 600);

            playing = false;
        }

        this.animate = () => {
            if (!playing) {
                let spliceAnim = heart.getObject().animationGroups.find(anim => anim.name === "Heart_OutsideSpliceAction");
                spliceAnim.goToFrame(600);
                spliceAnim.start(false, 1, 600, 690);
                playing = true;
            } else {
                stopAnimate();
            }

        }

        this.animateButton = document.querySelector("._navigator ._animatebutton");
        this.animateButton.addEventListener("click", this.animate);




    }

    async exit(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        const heart = engine.context.models.heart;
        heart.setVisible(false);

        this.light.dispose();
        this.lamp.dispose();
        this.lamp2.dispose();
        this.lamp3.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.lamp;
        delete this.lamp2;
        delete this.lamp3;
        delete this.ground;
        delete this.shadowGenerator;

        this.if1.dispose();

        // removing animation
        this.animateButton.removeEventListener("click", this.animate);
        delete this.animateButton;

        this.reset();

    }

}




class Slide3Scene extends BaseState {
    constructor() {
        super("Slide3");
    }

    async enter(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 0.5;

        const stomach = engine.context.models.stomach;
        stomach.setVisible(true);
        stomach.getRoot().position = new BABYLON.Vector3(0, 5.376912593841553, 0);

        stomach.getObject().meshes.forEach(mesh => {
            if (mesh.material) {
                mesh.material.opacityTexture = new BABYLON.Texture("static/media/textures/opacity_map.png", engine.context.scene);
            }
        });

        // scaling and position;
        stomach.setScaling(0.5);
        stomach.getRoot().position = new BABYLON.Vector3(0, 1.5, 0);

        this.lamp = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 5, 0), engine.context.scene);
        this.lamp.intensity = 29;
        this.lamp.range = 10;
        this.lamp.parent = stomach.getRoot();
        this.lamp.position = new BABYLON.Vector3(-3.777353286743164, 2.127333641052246, -4.837428092956543);

        this.lamp2 = new BABYLON.PointLight("pointLight2", new BABYLON.Vector3(0, 5, 0), engine.context.scene);
        this.lamp2.intensity = 29;
        this.lamp2.range = 10;
        this.lamp2.parent = stomach.getRoot();
        this.lamp2.position = new BABYLON.Vector3(4.409378528594971, -1.7498345375061035, -0.706532895565033);

        this.lamp3 = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), engine.context.scene);
        this.lamp3.diffuse = new BABYLON.Color3.FromHexString("#97C7C7");
        this.lamp3.position = new BABYLON.Vector3(3.6040196418762207, -3.328416585922241, 3.6040196418762207);
        this.lamp3.direction = new BABYLON.Vector3(-0.006231618007651102, 0.9999611652224214, -0.006231772141523057);
        this.lamp3.intensity = 4;

        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene);
        this.ground.material.activeLight = this.lamp3;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.lamp3);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.setDarkness(0.2);

        stomach.getObject().meshes.forEach(mesh => {
            if (mesh.name === "ToTop4.001") return;
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        this.if1 = new InfoPoint("blue", "1", engine.context.advancedTexture, engine.context.scene);
        this.if1.setPosition(engine.context.root, new BABYLON.Vector3(0, 0.1437, -0.54));
        this.if1.set("The goat stomach is a complex, four-chambered organ specialized for fermenting and digesting fibrous plant material.")

        let playing = false;

        this.reset = () => {
            stomach.stopAllAnimation();

            // deactivating alpha mask
            const inside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive1");
            const outside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive0");

            inside.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
            outside.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;

            inside.material.alpha = 1;
            outside.material.alpha = 1;
        }

        let stopAnimate = () => {
            stomach.stopAllAnimation();

            // deactivating alpha mask
            const inside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive1");
            const outside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive0");

            inside.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
            outside.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;

            inside.material.alpha = 1;
            outside.material.alpha = 1;

            playing = false;
        }

        // animate button
        this.animate = () => {
            if (!playing) {
                // play animation
                stomach.playAnimation("Action", true);

                // activating alpha mask
                const inside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive1");
                const outside = stomach.getObject().meshes.find(mesh => mesh.name === "Open_primitive0");

                inside.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
                outside.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

                outside.material.alpha = 0.2;
                inside.material.alpha = 0.2;

                playing = true;

                // BACKUP CODE
                //outside.material.opacityTexture = new BABYLON.Texture("https://i.imgur.com/4s7Wl0o.png", scene);
                //inside.material.opacityTexture = new BABYLON.Texture("http://i.imgur.com/06LfDgb.png", scene);

                /*outside.material.useAlphaFromDiffuseTexture = true; // if using diffuseTexture with alpha
                outside.material.opacityTexture = new BABYLON.Texture("http://i.imgur.com/06LfDgb.png", scene);
                outside.material.opacityTexture.hasAlpha = true;
                outside.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
    
                inside.material.useAlphaFromDiffuseTexture = true; // if using diffuseTexture with alpha
                inside.material.opacityTexture = new BABYLON.Texture("https://i.imgur.com/4s7Wl0o.png", scene);
                inside.material.opacityTexture.hasAlpha = true;
                inside.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;*/
            } else {
                stopAnimate();
            }
        }

        this.animateButton = document.querySelector("._navigator ._animatebutton");
        this.animateButton.addEventListener("click", this.animate);

    }

    async exit(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        const stomach = engine.context.models.stomach;
        stomach.setVisible(false);

        this.light.dispose();
        this.lamp.dispose();
        this.lamp2.dispose();
        this.lamp3.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.lamp;
        delete this.lamp2;
        delete this.lamp3;
        delete this.ground;
        delete this.shadowGenerator;

        this.if1.dispose();


        // removing animation
        this.animateButton.removeEventListener("click", this.animate);
        delete this.animateButton;

        this.reset();

    }

}

class Slide4Scene extends BaseState {
    constructor() {
        super("Slide4");
    }

    async enter(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 0.2;

        const lungs = engine.context.models.lungs;
        lungs.setVisible(true);

        // scaling and position;
        lungs.setScaling(0.2);
        lungs.getRoot().position = new BABYLON.Vector3(0, 1, 0);


        lungs.getObject().animationGroups.forEach(anim => {
            anim.stop();
        });

        // initial animation
        const idleAnim = lungs.getObject().animationGroups.find(anim => anim.name === "ArmatureAction")
        idleAnim.start(true);

        this.bulb = new BABYLON.PointLight("lightBulb", new BABYLON.Vector3(2, 3, -2), engine.context.scene);
        this.bulb.position = new BABYLON.Vector3(4.656996250152588, 11.44823932647705, -0.8961555361747742);
        this.bulb.intensity = 45;
        this.bulb.range = 25;
        this.bulb.diffuse = BABYLON.Color3.FromHexString("#BBC257");

        this.window = new BABYLON.SpotLight("window", new BABYLON.Vector3(0, 3, 0), new BABYLON.Vector3(0, -1, 0), Math.PI * 0.85, 2, engine.context.scene);
        this.window.intensity = 50;
        this.window.position = new BABYLON.Vector3(-3.447660446166992, 13.335060119628906, -1.3779650926589966);

        this.sun = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
        this.sun.diffuse = new BABYLON.Color3.FromHexString("#D3D696");
        this.sun.position = new BABYLON.Vector3(-4.761377602006131e-15, 22.44333839416504, 0);
        this.sun.direction = new BABYLON.Vector3(0, -1, 0);
        this.sun.intensity = 3;

        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene);
        this.ground.material.activeLight = this.sun;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sun);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.setDarkness(0.2);

        lungs.getObject().meshes.forEach(mesh => {
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        this.if1 = new InfoPoint("blue", "1", engine.context.advancedTexture, engine.context.scene);
        this.if1.setPosition(engine.context.root, new BABYLON.Vector3(-0.8524721264839172, 1.2846691608428955, 0.3985106348991394));
        this.if1.set("Lungs: Goat lungs are spongy, highly vascular organs that facilitate oxygen exchange to support their active, climbing lifestyle.");

        this.if2 = new InfoPoint("orange", "2", engine.context.advancedTexture, engine.context.scene);
        this.if2.setPosition(engine.context.root, new BABYLON.Vector3(0.8, 2.37, 0.4));
        this.if2.set("Ribcage: The goat ribcage is a flexible bony structure that protects the heart and lungs while allowing breathing movements.");

        let playing = false;

        this.reset = () => {
            const exclude = [
                "ArmatureAction",
            ];

            lungs.getObject().animationGroups.forEach(anim => {
                if (exclude.includes(anim.name)) return; // skip excluded
                anim.goToFrame(430);
                anim.start(false, 1, 430, 430);
            });
        }

        let stopAnimate = () => {
            const exclude = [
                "ArmatureAction",
            ];

            lungs.getObject().animationGroups.forEach(anim => {
                if (exclude.includes(anim.name)) return; // skip excluded
                anim.goToFrame(530);
                anim.start(false, 1, 530, 300);
            });

            playing = false;
        }

        this.animate = () => {
            if (!playing) {
                const exclude = [
                    "ArmatureAction",
                ];

                lungs.getObject().animationGroups.forEach(anim => {
                    if (exclude.includes(anim.name)) return; // skip excluded
                    anim.goToFrame(430);
                    anim.start(false, 1, 430, 620);
                });

                playing = true;
            } else {
                stopAnimate();
            }
        }

        this.animateButton = document.querySelector("._navigator ._animatebutton");
        this.animateButton.addEventListener("click", this.animate);

    }

    async exit(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        const lungs = engine.context.models.lungs;
        lungs.setVisible(false);

        this.light.dispose();
        this.bulb.dispose();
        this.window.dispose();
        this.sun.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.bulb;
        delete this.window;
        delete this.sun;
        delete this.ground;
        delete this.shadowGenerator;

        this.if1.dispose();
        this.if2.dispose();

        // removing animation
        this.animateButton.removeEventListener("click", this.animate);
        delete this.animateButton;

        this.reset();

    }

}

class Slide5Scene extends BaseState {
    constructor() {
        super("Slide5");
    }

    async enter(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.remove("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.remove("hidden");
        navigator.classList.add("flex");

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 0.5;

        const femur = engine.context.models.femur;
        femur.setVisible(true);

        // scaling and position
        femur.setScaling(0.4);
        femur.getRoot().position = new BABYLON.Vector3(0, 0.3, 0);

        femur.getObject().animationGroups.forEach(anim => {
            anim.stop();
        });

        this.bulb = new BABYLON.PointLight("lightBulb", new BABYLON.Vector3(2, 3, -2), engine.context.scene);
        this.bulb.position = new BABYLON.Vector3(4.656996250152588, 11.44823932647705, -0.8961555361747742);
        this.bulb.intensity = 45;
        this.bulb.range = 25;
        this.bulb.diffuse = BABYLON.Color3.FromHexString("#BBC257");

        this.window = new BABYLON.SpotLight("window", new BABYLON.Vector3(0, 3, 0), new BABYLON.Vector3(0, -1, 0), Math.PI * 0.85, 2, engine.context.scene);
        this.window.intensity = 50;
        this.window.position = new BABYLON.Vector3(-3.447660446166992, 13.335060119628906, -1.3779650926589966);

        this.sun = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
        this.sun.diffuse = new BABYLON.Color3.FromHexString("#D3D696");
        this.sun.position = new BABYLON.Vector3(-4.761377602006131e-15, 22.44333839416504, 0);
        this.sun.direction = new BABYLON.Vector3(0, -1, 0);
        this.sun.intensity = 3;

        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene);
        this.ground.material.activeLight = this.sun;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sun);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.setDarkness(0.2);

        femur.getObject().meshes.forEach(mesh => {
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        this.if1 = new InfoPoint("pink", "1", engine.context.advancedTexture, engine.context.scene);
        this.if1.setPosition(engine.context.root, new BABYLON.Vector3(0, 0.1437, -0.54));
        this.if1.set("The goat femur is a strong, weight-bearing thigh bone that supports movement and agility.");


        // animation button
        let playing = false;

        this.reset = () => {
            let spliceAnim = femur.getObject().animationGroups.find(anim => anim.name === "SplicePieceAction");
            spliceAnim.goToFrame(450);
            spliceAnim.start(false, 1, 450, 450);
        }

        let stopAnimate = () => {
            let spliceAnim = femur.getObject().animationGroups.find(anim => anim.name === "SplicePieceAction");
            spliceAnim.goToFrame(560);
            spliceAnim.start(false, 1, 560, 450);

            playing = false;
        }


        this.animate = () => {
            if (!playing) {
                let spliceAnim = femur.getObject().animationGroups.find(anim => anim.name === "SplicePieceAction");
                spliceAnim.goToFrame(450);
                spliceAnim.start(false, 1, 450, 560);
                playing = true;
            } else {
                stopAnimate();
            }
        }

        this.animateButton = document.querySelector("._navigator ._animatebutton");
        this.animateButton.addEventListener("click", this.animate);

    }

    async exit(engine) {

        const sidebar = document.querySelector("._sidebar");
        sidebar.classList.add("hidden");

        const navigator = document.querySelector("._navigator");
        navigator.classList.add("hidden");
        navigator.classList.remove("flex");

        const femur = engine.context.models.femur;
        femur.setVisible(false);

        this.light.dispose();
        this.bulb.dispose();
        this.window.dispose();
        this.sun.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.bulb;
        delete this.window;
        delete this.sun;
        delete this.ground;
        delete this.shadowGenerator;

        this.if1.dispose();

        // removing animation
        this.animateButton.removeEventListener("click", this.animate);
        delete this.animateButton;

        this.reset();

    }

}

class Slide6Scene extends BaseState {
    constructor() {
        super('Slide6');
    }

    async enter(engine) {
        const quizConfirmPanel = document.querySelector("._quizconfirmpanel");
        quizConfirmPanel.classList.remove("hidden");

        const yesButton = document.querySelector("._quizconfirmpanel ._yesbutton");
        const noButton = document.querySelector("._quizconfirmpanel ._nobutton");

        yesButton.addEventListener("click", () => {
            engine.goTo("Slide7");
        });

        noButton.addEventListener("click", () => {
            engine.goTo("Slide5");
        });

    }

    async exit(engine) {
        const quizConfirmPanel = document.querySelector("._quizconfirmpanel");
        quizConfirmPanel.classList.add("hidden");
    }
}


class Slide7Scene extends BaseState {
    constructor() {
        super('Slide7');
    }

    async enter(engine) {
        // changing position y to be bit lower
        engine.context.root.position.y = -0.5;

        // sky lighting
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), engine.context.scene);
        this.light.intensity = 1;
        this.light.diffuse = new BABYLON.Color3.FromHexString("#E0EB71");
        this.light.groundColor = new BABYLON.Color3.FromHexString("#694937");

        // enabling skeleton
        const skeleton = engine.context.models.skeletonquiz;
        skeleton.setVisible(true);


        skeleton.getObject().meshes.forEach(m => {
            if (m.material && m.material.sheen) {
                m.material.sheen.isEnabled = true;
                m.material.sheen.intensity = 1;
            }
        });

        // secondary lighting
        this.sun = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), engine.context.scene);
        this.sun.diffuse = new BABYLON.Color3.White;
        this.sun.intensity = 9;
        this.sun.position = new BABYLON.Vector3(-1.8959672089149775e-15, 9.538678169250488, 0)

        // ground
        this.ground = BABYLON.Mesh.CreatePlane('ground', 1000, engine.context.scene)
        this.ground.rotation.x = Math.PI / 2
        this.ground.material = new BABYLON.ShadowOnlyMaterial('shadowOnly', engine.context.scene)
        this.ground.material.activeLight = this.sun;
        this.ground.receiveShadows = true;
        this.ground.parent = engine.context.root;

        // shadows
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sun);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.setDarkness(0.2);

        skeleton.getObject().meshes.forEach(mesh => {
            this.shadowGenerator.getShadowMap().renderList.push(mesh);
        });

        // setting parents for lights
        this.light.parent = skeleton.getRoot();
        this.sun.parent = skeleton.getRoot();

        // scaling skeletons
        skeleton.getRoot().scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        engine.context.models.skeletonfalling.getRoot().scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        engine.context.models.skeletonwalking.getRoot().scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);

        // enabling selection
        let glow = new BABYLON.GlowLayer("glow", engine.context.scene);
        glow.intensity = 0.6; // slight neon glow

        let groups = {
            "skull": ["Object_3.001", "Object_119.004"],
            "frontlegs": ["Object_113.001", "Object_116.001", "Object_120.004", "Object_120.011", "Object_115.001", "Object_112.001"],
            "backlegs": ["Object_5.001", "Object_13.001", "Object_27.001", "Object_109.001", "Object_111.003"],
            "ribs": ["Object_71.001", "Object_73.001", "Object_75.001", "Object_77.001", "Object_85.001", "Object_88.001", "Object_92.001", "Object_93.001", "Object_94.001", "Object_96.001", "Object_97.001", "Object_98.001", "Object_99.001", "Object_100.001", "Object_101.001", "Object_102.001", "Object_103.001", "Object_104.001", "Object_105.001", "Object_106.001", "Object_107.001", "Object_108.001"],
            "spine": ["Object_65.001", "Object_66.001", "Object_67.001", "Object_69.001", "Object_70.001", "Object_72.001", "Object_74.001", "Object_76.001", "Object_78.001", "Object_79.001", "Object_80.001", "Object_81.001", "Object_83.001", "Object_84.001", "Object_86.001", "Object_89.001", "Object_90.001", "Object_91.001", "Object_95.001"]
        }

        let selectedGroup = "";
        const originalMaterial = skeleton.getObject().meshes.find(mesh => mesh.name == "Object_9.001").material; // getting it from a mesh not part of the groups since it wont have its material changing.

        let resetAll = () => {
            skeleton.getObject().meshes.forEach(mesh => {
                mesh.material = originalMaterial;
            });
        }

        engine.context.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                const pick = pointerInfo.pickInfo;
                if (pick.hit && pick.pickedMesh) {
                    let selectedMeshName = pick.pickedMesh.name;

                    // find the group
                    for (let groupName in groups) {
                        let arr = groups[groupName];
                        if (arr.includes(selectedMeshName)) {
                            // now we have the selected arr
                            const mat = new BABYLON.StandardMaterial("myMat", engine.context.scene);
                            mat.emissiveColor = new BABYLON.Color3(1, 0.2, 0.79); // glow tint
                            selectedGroup = groupName;
                            resetAll();

                            arr.forEach(name => {
                                let mesh = skeleton.getObject().meshes.find(mesh => mesh.name === name);
                                console.log(mesh, name);
                                mesh.material = mat;
                            });

                            break;
                        }
                    }
                }
            }
        });


        // enabling quiz panel
        const quizPanel = document.querySelector("._quizpanel");
        quizPanel.classList.remove("hidden");
        quizPanel.classList.add("flex");

        // quiz logic
        let correctAnswer = "skull";


        function isCorrect() {
            let sk = engine.context.models.skeletonwalking.getRoot();
            skeleton.setVisible(false);
            sk.setVisible(true);
            sk.playAnimation("Animation", true);
        }

        function isWrong() {

        }

        document.querySelector("#quizbutton").addEventListener("click", () => {
            if (selectedGroup == correctAnswer) {
                isCorrect();
            } else {
                isWrong();
            }
        });


    }

    async exit(engine) {
        // hiding skeleton
        const skeleton = engine.context.models.skeleton;
        skeleton.setVisible(false);

        // disposing of lights
        this.light.dispose();
        this.sun.dispose();
        this.ground.dispose();
        this.shadowGenerator.dispose();

        delete this.light;
        delete this.sun;
        delete this.ground;
        delete this.shadowGenerator;

        // disabling quizpanel
        const quizPanel = document.querySelector("._quizpanel");
        quizPanel.classList.add("hidden");
        quizPanel.classList.remove("flex");
    }
}


class ArIntroScene extends BaseState {
    constructor() {
        super('ArIntroduction')
    }

    async enter(engine) {
        engine.context.skybox.isVisible = false;

        engine.context.dot.isVisible = true;
        engine.context.hitTest.onHitTestResultObservable.add((results) => {
            if (engine.context.isARPlaced == false) {
                if (results.length) {
                    engine.context.dot.isVisible = true;
                    results[0].transformationMatrix.decompose(engine.context.dot.scaling, engine.context.dot.rotationQuaternion, engine.context.dot.position);
                    results[0].transformationMatrix.decompose(undefined, engine.context.root.rotationQuaternion, engine.context.root.position);
                } else {
                    engine.context.dot.isVisible = false;
                }
            }
        });

    }

    async exit(engine) {

    }

}


class ConcludeScene extends BaseState {
    constructor() {
        super('Conclusion');
        this.rootLayout = null;
    }

    async enter(engine) {

        const endButton = document.querySelector("._endbutton div");
        this.endpanel = document.querySelector("._endpanel");

        this.endpanel.classList.add("flex");
        this.endpanel.classList.remove("hidden");

        endButton.addEventListener("click", () => {
            window.location.href = window.location.href;
        });

    }

    async exit() {
        this.endScreenObj.dispose();
    }
}



var createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.85, 0.85, 0.85);

    var camera = new BABYLON.ArcRotateCamera("camera1", 0, Math.PI / 2, 6.025, BABYLON.Vector3.Zero(), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const xrButton = document.querySelector(".xr-button-overlay");
    if (xrButton)
        xrButton.style.position = "";


    // GLOBAL VALUES


    // GLOBAL COMPONENTS
    const ADVANCEDTEXTURE = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    const XR = await scene.createDefaultXRExperienceAsync({
        // ask for an ar-session
        uiOptions: {
            sessionMode: "immersive-ar",
            disableDefaultUI: true,
        },
    });


    const ROOT = new BABYLON.TransformNode("ParentNode", scene);




    // Defining pointer in main scene
    //const DOT = BABYLON.SphereBuilder.CreateSphere("dot",{diameter: 0.1,},scene);
    const DOT = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.05, tessellation: 32 });
    DOT.isVisible = false;
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const { hit, pickedMesh } = pointerInfo.pickInfo;
            if (hit && pickedMesh === DOT) {
                MANAGER.goTo("Overview");
            }
        }
    });

    const FEATUREMANAGER = XR.baseExperience.featuresManager;
    const HITTEST = FEATUREMANAGER.enableFeature(BABYLON.WebXRHitTest, "latest");

    // loading all objects
    let MODELS = {
        "goat": new SceneObject("static/media/models/goat.glb", scene),
        "lungs": new SceneObject("static/media/models/lungs.glb", scene),
        "heart": new SceneObject("static/media/models/heart.glb", scene),
        "stomach": new SceneObject("static/media/models/stomach.glb", scene),
        "skeleton": new SceneObject("static/media/models/skeleton.glb", scene),
        "femur": new SceneObject("static/media/models/femur.glb", scene),
        "skeletonwalking": new SceneObject("static/media/models/skeletonwalking.glb", scene),
        "skeletonfalling": new SceneObject("static/media/models/skeletonfalling.glb", scene),
        "skeletonquiz": new SceneObject("static/media/models/skeletonquiz.glb", scene),
    };

    console.log("Loading all scene models...");
    for (const key in MODELS) {
        await MODELS[key].loadObject();
        MODELS[key].getObject().animationGroups.forEach(anim => {
            anim.stop();
        });
        MODELS[key].setVisible(false);
        MODELS[key].setParent(ROOT);
        console.log("Loaded model: " + key);
    }
    console.log("Loading complete!");



    // =======
    const MANAGER = new FlowEngine({
        states: [new IntroScene(), new OverviewScene(), new Slide1Scene(), new Slide2Scene(), new Slide3Scene(), new Slide4Scene(), new Slide5Scene(), new Slide6Scene(), new Slide7Scene(), new ConcludeScene(), new ArIntroScene()],
        initial: 'Introduction',
        context: {
            advancedTexture: ADVANCEDTEXTURE, xr: XR, babylonEngine: engine,
            root: ROOT, scene: scene, dot: DOT, featureManager: FEATUREMANAGER,
            hitTest: HITTEST, isARPlaced: false,
            uiScale: 1, models: MODELS, camera: camera,
        }
    });


    /**TOPMENU.arButton.onPointerUpObservable.add(() => {
        if (XR.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            XR.baseExperience.exitXRAsync();
        } else if (XR.baseExperience.state === BABYLON.WebXRState.NOT_IN_XR) {
            XR.baseExperience.enterXRAsync("immersive-ar", "local-floor");
        }
    });*/




    document.querySelector("._navigator ._left").addEventListener('click', () => {
        const current = MANAGER.current?.name;
        const stateNames = Array.from(MANAGER.states.keys());
        let index = stateNames.indexOf(current);
        if (index >= 1 && index < stateNames.length) {
            MANAGER.goTo(stateNames[index - 1]);
        }
    });

    document.querySelector("._navigator ._right").addEventListener('click', () => {
        const current = MANAGER.current?.name;
        const stateNames = Array.from(MANAGER.states.keys());
        let index = stateNames.indexOf(current);
        if (index >= 0 && index < stateNames.length - 1) {
            MANAGER.goTo(stateNames[index + 1]);
        }
    });



    // Handling XR changes
    XR.baseExperience.onStateChangedObservable.add((state) => {
        if (state === BABYLON.WebXRState.IN_XR) {
            MANAGER.goTo("ArIntroduction"); // restarting scene
        } else if (state === BABYLON.WebXRState.NOT_IN_XR) {
            MANAGER.goTo("Overview"); // restarting scene
        }
    });

    // MAIN
    await MANAGER.start();

    // delete me
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "g") {
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show();
            }
        }
    });



    return scene;
};

window.initFunction = async function () {


    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }


    // Fixing JS module glitch.
    engine = await asyncEngineCreation();
    window.engine = window;

    const engineOptions = window.engine.getCreationOptions?.();
    if (!engineOptions || engineOptions.audioEngine !== false) {

    }
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);

    // Fixing JS module glitch.
    scene = createScene();
    window.scene = scene;
};
initFunction().then(() => {
    scene.then(returnedScene => { sceneToRender = returnedScene; });

});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});