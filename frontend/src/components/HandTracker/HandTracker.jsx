import { useEffect, useRef } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

function distance(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2 +
      (a.z - b.z) ** 2
  );
}

function HandTracker({ onOpennessChange = () => {} }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let animationId;

    async function startCamera() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        const handLandmarker =
          await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            },
            runningMode: "VIDEO",
            numHands: 1,
          });

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
          });

        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        function detectHands() {
          const results =
            handLandmarker.detectForVideo(
              videoRef.current,
              performance.now()
            );

          if (results.landmarks.length > 0) {
            const hand = results.landmarks[0];

            const wrist = hand[0];

            const indexTip = hand[8];
            const middleTip = hand[12];
            const ringTip = hand[16];
            const pinkyTip = hand[20];

            const indexDistance = distance(
              wrist,
              indexTip
            );

            const middleDistance = distance(
              wrist,
              middleTip
            );

            const ringDistance = distance(
              wrist,
              ringTip
            );

            const pinkyDistance = distance(
              wrist,
              pinkyTip
            );

            const openness =
              (indexDistance +
                middleDistance +
                ringDistance +
                pinkyDistance) /
              4;

            const min = 0.15;
            const max = 0.5;

            const normalized =
              (openness - min) /
              (max - min);

            const clamped = Math.max(
              0,
              Math.min(1, normalized)
            );

            onOpennessChange(clamped);
          }

          animationId =
            requestAnimationFrame(detectHands);
        }

        detectHands();
      } catch (error) {
        console.error(
          "Camera / MediaPipe error:",
          error
        );
      }
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [onOpennessChange]);

    return (
    <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
    />
    );
    }

export default HandTracker;