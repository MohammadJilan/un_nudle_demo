export default class XRChangeManager {
    constructor(xr) {
        this.xr = xr;
    }

    inAR() { }

    in3D() { }

    onExitAR() { }

    onExit3D() { }

    processCheck() {
        if (this.xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            this.onExit3D();
            this.inAR();
        } else if (this.xr.baseExperience.state === BABYLON.WebXRState.NOT_IN_XR) {
            this.onExitAR();
            this.in3D();
        }
    }
}