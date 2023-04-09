const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Three = require("three")

const blockIconURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAT6SURBVHhe7ZtdqBVVFMfXnHuvXG9i9/ZhWYGVYWoggqGVFSV9ywUpohch+lARFXwRAu1BEB97kNAKheiphyAKEqKXICIyKuhFS0Qh+yKvZqLXj+sZ//+99syZU/ecMx975pzDzA/WzFpzzszstWatvfeZmSMV3WXArkvHOMSPyFJIKRiChI6PL2kKAsWDFEqRJ6SDhgGcdeoAFG4ZRCNeNpujFNauIk40AblBVZH6fpx0mrPW6wjMOmson0OeUTU/anadB9sgvMbG+fdfhYGrPp3zpIaW8PMDr9kNIk9DuP+LxsqJPDLgRsgpVUXunyfy3ZtQkpwJbt/9hsjx8CiG6yAXVHWH6wCEdT42InJ6D5QsZ8DRZm8SOXfJ2orTNrs62J+QW1QVmXxHZJj9vSPOToqMbraG8gfkNlWzkbUPWA/hVTfO/7gTBurYpfPk+pl63P2v2A0icyE87xPGykDGBFWW3ynyLeu8CHDWFbtEDp2wtpLaj6Q78vsYsJQhTGQvvwvFVSElZAjD5lTYGkPiliTZ4STkdlVxIT7A4orqXQUeeBhiIxyGLFa1M3H6gNUQprtxft9aGJzF9YLzBC1je7Zx1qAsgrC9DxurA+0yYAxyWlWRNfi58jF74i6leyzg9sLtIj//ZW1lFHJW1f/Tyh1uN9U1MkPk/F67pV9AIGZsQJJetXab1rf6gAk+OPUZ5ucc4fuUr4+hDnYb9RBkhdH+Q9s+YGA+FisRUFZUH1FnezFTWLlK7XbEmgh57E4ozUNO70HHMT+sJZgjxp8J8uCPQB4wVu/Bn2B0PGG2Jp8K8y4ey4J9aw9QH8aCE2N01mlIHgCLdx8WCIQ0etpCMf0SHK9xsM5A6gCEPGolYeqlJXDcc/Jb0EUACLMAnaT/kJp54c9x53iAmwBYzO0u9g/skBxSH8SCVz2HpwhOAxDgLcSCgch4dJ+ZxTq/We08yCUAAd6DWLCjTDp/YJ0j1b071MyTXAMQgvmDv8zqHTDlk2I8T0sxAQAex2uWRYtOrM5xnHWecjxPS2EBCPDuwoKBsPMHn+XBOnfcccal8AAEeJw74MeWF95j6g5dC0CvUAXArktLFQC7Li1VAOy6tFQBsOvSUgXArktLFQC7Li3tA8B7cf3MrM5PdFt9YzYkfKTs/4JFHo/F+ODV+YtvYACONd4XIC0j0SoD/oWE92a8BSL3PAmloNtUWVjwenznSbsS4CNy7mxuYh37FcYikYkLndOqG5ycQPueEzn6u92AAoB0bGwSbw5CnlUVycD0/Uf11LgoAVxCr/mN4rchW1TtTJrLeRli3gQcRpFM/kQtJRkDUFuNC9Fclon9STMMsm8wL0BfRCj4EOSlrbQKAg4v3YzzIt0jzs+EpKrNVDtF4NsC36gq8ulekfEYb2WEJM2A4Zp4q5qGo3shHKNSkzUAAXwva46quDK/YXFO9bbEDcAIGvqY1RUG3cmjWFcBCAiT8qYxkb/D3GhBjADMel7k/EVrKE7bnKYPaAcbN4/KqTMw0D+89yGt5GzZh/1R5xHn50JcXzD3B4zwAuQjVTGt/B7TS/7lIco0GfDFDyJP7bCGwkcoX6nqnjwDENA0UPnHsQj+ABENAPpx73GrK8ihxn+N+h2WGgNhZPF8jGBHIF9CDop/62jjMyuuS7NnQH/ecPSTPUNRpyml4S1I1PGNkIqKiqIRuQYHeAEU9sBGCQAAAABJRU5ErkJggg==";

/**
 * Class for 3D blocks
 * @constructor
 */
class Jg3DBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        // prism has screenshots, lets tell it to use OUR canvas for them
        this.runtime.prism_screenshot_checkForExternalCanvas = true;
        this.runtime.prism_screenshot_externalCanvas = null;

        // Three.js requirements
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // extras
        this.lastStageSizeWhenRendering = {
            width: 0,
            height: 0
        }

        this.runtime.on('PROJECT_STOP_ALL', () => {
            // stop button clicked or project restarted, dispose of all objects
            if (this.scene) {
                this.scene.remove();
                this.scene = null;
            }
            if (this.camera) {
                this.camera.remove();
                this.camera = null;
            }
            if (this.renderer) {
                this.renderer.domElement.remove();
                this.renderer.dispose();
                this.renderer = null;
                this.runtime.prism_screenshot_externalCanvas = null;
            }
        });
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'jg3d',
            name: '3D',
            color1: '#B100FE',
            color2: '#8000BC',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'initialize',
                    text: 'create 3D scene',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'setCameraPerspective0',
                    text: 'set scene camera to perspective camera with fov: [FOV]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FOV: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 70
                        }
                    }
                },
                {
                    opcode: 'setCameraPerspective1',
                    text: 'set scene camera to perspective camera with fov: [FOV] aspect ratio: [AR]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FOV: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 70
                        },
                        AR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 480 / 360
                        }
                    }
                },
                {
                    opcode: 'setCameraPerspective2',
                    text: 'set scene camera to perspective camera with fov: [FOV] aspect ratio: [AR] and only render objects within [NEAR] and [FAR] of the camera',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FOV: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 70
                        },
                        AR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 480 / 360
                        },
                        NEAR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1
                        },
                        FAR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1000
                        }
                    }
                },
                {
                    opcode: 'setCameraPosition',
                    text: 'set camera position to x: [X] y: [Y] z: [Z]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'render',
                    text: 'render',
                    blockType: BlockType.COMMAND
                },
            ],
            menus: {
                cameraType: {
                    acceptReporters: true,
                    items: [
                        "perspective",
                        "orthographic"
                    ].map(item => ({ text: item, value: item }))
                }
            }
        };
    }
    // utilities
    getScratchCanvas() {
        return this.runtime.renderer.canvas;
    }
    restyleExternalCanvas(canvas) {
        canvas.style.position = "absolute"; // position above canvas without pushing it down
        canvas.style.width = "100%";
        canvas.style.height = "100%";
    }
    appendElementAboveScratchCanvas(element) {
        this.getScratchCanvas().parentElement.prepend(element);
    }
    needsToResizeCanvas() {
        const stage = {
            width: this.runtime.stageWidth,
            height: this.runtime.stageHeight
        }
        return stage !== this.lastStageSizeWhenRendering;
    }

    initialize() {
        this.scene = new Three.Scene();
        this.renderer = new Three.WebGLRenderer({ preserveDrawingBuffer: true });
        // add renderer canvas ontop of scratch canvas
        const canvas = this.renderer.domElement;
        this.runtime.prism_screenshot_externalCanvas = canvas;

        this.restyleExternalCanvas(canvas);
        this.appendElementAboveScratchCanvas(canvas);
        // we dont need to set renderer size since the render function will do that for us

        /* dev: test rendering by drawing a cube and see if it appears

        const geometry = new Three.BoxGeometry(1, 1, 1);
        const material = new Three.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new Three.Mesh(geometry, material);
        this.scene.add(cube);

        dev update: it worked W

        */
    }
    render() {
        if (!this.renderer) return;
        if (!this.scene) return;
        if (!this.camera) return;
        if (this.needsToResizeCanvas()) {
            this.lastStageSizeWhenRendering = {
                width: this.runtime.stageWidth,
                height: this.runtime.stageHeight
            }
            /*
                multiply sizes because the stage looks like doo doo xd
                we dont need to worry about multiplying 1920 * 2 since projects
                shouldnt be using that large of a stage but instead a smaller size
                with the same aspect ratio, penguinmod even says that
            */
            this.renderer.setSize(this.lastStageSizeWhenRendering.width * 2, this.lastStageSizeWhenRendering.height * 2);
            this.restyleExternalCanvas(this.renderer.domElement);
        }
        // when switching between project page & editor, we need to move the canvas again since it gets lost
        /* todo: create layers so that iframe appears above 3d every time this is done */
        this.appendElementAboveScratchCanvas(this.renderer.domElement);
        return new Promise((resolve) => {
            // we do this to avoid HUGE lag when not waiting 1 tick
            // and because it waits if the tab isnt focused
            requestAnimationFrame(() => {
                // renderer might not exist anymore
                if (!this.renderer) return;
                resolve(this.renderer.render(this.scene, this.camera));
            })
        })
    }

    setCameraPerspective2(args) {
        if (this.camera) {
            // remove existing camera
            this.camera.remove();
            this.camera = null;
        }

        const fov = Cast.toNumber(args.FOV);
        const aspect = Cast.toNumber(args.AR);
        const near = Cast.toNumber(args.NEAR);
        const far = Cast.toNumber(args.FAR);

        this.camera = new Three.PerspectiveCamera(fov, aspect, near, far);
    }
    setCameraPerspective1(args) {
        /* todo: make near and far be the same as the existing camera if there is one */
        const near = 0.1;
        const far = 1000;
        return this.setCameraPerspective2({
            FOV: args.FOV,
            AR: args.AR,
            NEAR: near,
            FAR: far
        })
    }
    setCameraPerspective0(args) {
        /* todo: make ar, near and far be the same as the existing camera if there is one */
        const ar = this.runtime.stageWidth / this.runtime.stageHeight;
        const near = 0.1;
        const far = 1000;
        return this.setCameraPerspective2({
            FOV: args.FOV,
            AR: ar,
            NEAR: near,
            FAR: far
        })
    }

    setCameraPosition(args) {
        if (!this.camera) return;
        const position = {
            x: Cast.toNumber(args.X),
            y: Cast.toNumber(args.Y),
            z: Cast.toNumber(args.Z),
        }
        this.camera.position.set(position.x, position.y, position.z);
    }
}

module.exports = Jg3DBlocks;
