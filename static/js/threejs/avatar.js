import { TalkingHead } from 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.5/modules/talkinghead.mjs';
import { CubeTextureLoader } from "three";

var head;


document.addEventListener('DOMContentLoaded', async function (e) {

    const nodeAvatar = document.getElementById('avatar');
    head = new TalkingHead(nodeAvatar, {
        ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
        ttsApikey: "AIzaSyBP-bFMtnNRCU3EruW8zFL3PziWZ5XA5CE", // <- Change this
        lipsyncModules: ["en", "fi"],
        cameraView: "upper"
    });

    window.head = head;
    head.controls.enableRotate = false;

    const nodeLoading = document.getElementById('loading');
    try {
        nodeLoading.textContent = "Loading...";
        await head.showAvatar({
            url: 'https://models.readyplayer.me/68f649820401b1cdf594bcc2.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
            body: 'F',
            avatarMood: 'neutral',
            ttsLang: "en-US",
            ttsVoice: "en-US-Standard-C",
            lipsyncLang: 'en'
        }, (ev) => {
            if (ev.lengthComputable) {
                let val = Math.min(100, Math.round(ev.loaded / ev.total * 100));
                nodeLoading.textContent = "Loading " + val + "%";
            }
        });
        nodeLoading.style.display = 'none';

    } catch (error) {
        console.log(error);
        nodeLoading.textContent = error.toString();
    }

    // Pause animation when document is not visible
    document.addEventListener("visibilitychange", async function (ev) {
        if (document.visibilityState === "visible") {
            head.start();
        } else {
            head.stop();
        }
    });

    // animation loop
    function animate() {
        requestAnimationFrame(animate);
        head.animate();
    }

});