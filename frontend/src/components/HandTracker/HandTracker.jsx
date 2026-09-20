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

function getGrabPoint(hand) {
  const thumb = hand[4];
  const index = hand[8];
  const middle = hand[12];

  return {
    x: (thumb.x + index.x + middle.x) / 3,
    y: (thumb.y + index.y + middle.y) / 3,
    z: (thumb.z + index.z + middle.z) / 3,
  };
}

function HandTracker({ onOpennessChange = () => {} }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let animationId;

    async function startCamera() {
      try {
        const vision =
          await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
          );

        const handLandmarker =
          await HandLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              },

              runningMode: "VIDEO",

              // Теперь ищем две руки
              numHands: 2,
            }
          );

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

          // Нам нужны ОБЕ руки
          if (results.landmarks.length === 2) {
            const leftHand =
              results.landmarks[0];

            const rightHand =
              results.landmarks[1];

            // Точка, за которую условно
            // "держим" сферу каждой рукой
            const leftPoint =
              getGrabPoint(leftHand);

            const rightPoint =
              getGrabPoint(rightHand);

            // Расстояние между руками
            const handDistance =
              distance(
                leftPoint,
                rightPoint
              );

            // Настройка диапазона
            const minDistance = 0.25;
            const maxDistance = 0.8;

            const normalized =
              (handDistance -
                minDistance) /
              (maxDistance -
                minDistance);

            const clamped =
              Math.max(
                0,
                Math.min(1, normalized)
              );

            // Обновляем размер только когда
            // видны обе руки
            onOpennessChange(clamped);
          }

          // Если рук меньше двух —
          // НИЧЕГО не делаем.
          //
          // Поэтому последнее значение
          // размера сохраняется.

          animationId =
            requestAnimationFrame(
              detectHands
            );
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
          .forEach((track) =>
            track.stop()
          );
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