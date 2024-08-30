"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import Webcam from "react-webcam";

interface Prediction {
  class: string;
  score: number;
}

const Home: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<Prediction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [anyError, setAnyError] = useState<boolean>(false);

  const webcamRef = useRef<Webcam>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc || null);
      setWebcamEnabled(false);

      // Convert base64 image to file object
      if (imageSrc) {
        const byteString = atob(imageSrc.split(",")[1]);
        const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], "capture.jpg", { type: mimeString });
        setSelectedFile(file);
      }
    }
  };

  const getAnimalName = (cls: string) => {
    switch (cls) {
      case "deer":
        return "사슴";
      case "cat":
        return "고양이";
      case "fox":
        return "여우";
      case "dog":
        return "강아지";
      case "rabbit":
      default:
        return "토끼";
    }
  };

  const getAnimalIcon = (cls: string) => {
    switch (cls) {
      case "deer":
        return "/animals/deer.png";
      case "cat":
        return "/animals/cat.png";
      case "fox":
        return "/animals/fox.png";
      case "dog":
        return "/animals/dog.png";
      case "rabbit":
      default:
        return "/animals/rabbit.png";
    }
  };

  const analyzeImage = async () => {
    setLoading(true);
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await fetch("/api/animal", {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(10000),
        });

        const data = (await response.json()) as Prediction[];
        const sorted = data.sort((a, b) => b.score - a.score);
        setPrediction(sorted);
      } catch (error: any) {
        console.error(error);
        setAnyError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="bg-white h-5/6 w-5/6 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">동물상 분석기</h1>
        <div className="mt-4 text-gray-700">
          <div className="flex justify-center mb-4">
            <button
              className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600"
              onClick={() => document.getElementById("upload-input")?.click()}
              style={{ marginRight: 8 }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{ display: "none" }}
                id="upload-input"
              />
              <Image
                alt="사진업로드"
                src="/icons/upload.png"
                width={32}
                height={32}
              />
              PC에서 사진을 선택
            </button>
            {webcamEnabled ? (
              <button
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600"
                onClick={handleCapture}
              >
                캡쳐
              </button>
            ) : (
              <button
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-600"
                onClick={() => setWebcamEnabled(true)}
              >
                <Image
                  alt="CAM 실행"
                  src="/icons/cam.png"
                  width={32}
                  height={32}
                />
                웹캠을 이용해 촬영
              </button>
            )}
          </div>
          {webcamEnabled && (
            <div className="flex justify-center mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
              />
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Image
              alt="dog"
              src="/animals/dog.png"
              width={32}
              height={32}
              style={{ marginRight: 4 }}
            />
            <Image
              alt="cat"
              src="/animals/cat.png"
              width={32}
              height={32}
              style={{ marginRight: 4 }}
            />
            <Image
              alt="rabbit"
              src="/animals/rabbit.png"
              width={32}
              height={32}
              style={{ marginRight: 4 }}
            />
            <Image
              alt="fox"
              src="/animals/fox.png"
              width={32}
              height={32}
              style={{ marginRight: 4 }}
            />
            <Image
              alt="deer"
              src="/animals/deer.png"
              width={32}
              height={32}
              style={{ marginRight: 4 }}
            />
          </div>
        </div>
      </div>
      <br />
      {imageSrc && (
        <div className="bg-white h-5/6 w-5/6 p-8 rounded-lg shadow-lg flex flex-col">
          <h1 className="text-2xl font-bold">선택된 이미지</h1>
          <br />
          <div className="flex flex-col justify-center items-center mb-4">
            <img
              src={imageSrc}
              alt="Captured or Uploaded"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
            <button
              className="flex justify-center items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 w-96 mt-4"
              onClick={analyzeImage}
              disabled={loading}
            >
              {loading ? "분석 중" : "분석 시작"}
            </button>
          </div>

          {anyError && (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <span className="font-medium">서비스 오류</span> 오류가
              발생했습니다. 서버를 재시작하거나, 새로고침하세요.
            </div>
          )}
        </div>
      )}
      <br />

      {prediction.length != 0 && (
        <div className="bg-white h-5/6 w-5/6 p-8 rounded-lg shadow-lg flex flex-col justify-center items-center text-center">
          <h3 className="text-xl">
            당신은 약 <b>{(prediction[0].score * 100).toFixed(1)}%</b>의 확률로{" "}
            <b>{getAnimalName(prediction[0].class)}상</b> 입니다.
          </h3>
          <Image
            alt="prediction icon"
            src={getAnimalIcon(prediction[0].class)}
            width={128}
            height={128}
          />
        </div>
      )}
    </main>
  );
};

export default Home;
