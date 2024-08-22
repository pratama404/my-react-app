// Import the necessary dependencies
import React, { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocoModel from "@tensorflow-models/coco-ssd";

// Import Firebase dependencies
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmLMrAZhTg7SJD_fa2dw8OHMUoydo67IU",
  authDomain: "mlprat.firebaseapp.com",
  projectId: "mlprat",
  storageBucket: "mlprat.appspot.com",
  messagingSenderId: "1001930496947",
  appId: "1:1001930496947:web:9feffb826b956810be09c6",
  measurementId: "G-7XNF7K6E03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function App() {
  const [model, setModel] = useState();
  const [objectName, setObjectName] = useState("");
  const [objectScore, setObjectScore] = useState("");

  // Load the COCO-SSD model
  async function loadModel() {
    try {
      const dataset = await cocoModel.load();
      setModel(dataset);
      console.log('Model ready...');
    } catch (err) {
      console.log(err);
    }
  }

  // Load the model when the component mounts
  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  // Function to handle object detection and saving results
  async function predict() {
    const videoElement = document.getElementById("videoSource");
    const detection = await model.detect(videoElement);

    if (detection.length > 0) {
      detection.forEach(async (result, i) => {
        const name = result.class;
        const score = result.score;
        setObjectName(name);
        setObjectScore(score);

        // Capture the current video frame
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext("2d").drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");

        // Upload the image to Firebase Storage
        const storageRef = ref(storage, `images/${Date.now()}_${name}.jpg`);
        await uploadString(storageRef, dataUrl, 'data_url');
        const imageUrl = await getDownloadURL(storageRef);

        // Save the object data to Firestore
        await addDoc(collection(db, "object-detections"), {
          name: name,
          score: score,
          imageUrl: imageUrl,
          timestamp: new Date()
        });

        console.log(`Saved: ${name}, ${score}, ${imageUrl}`);
      });
    }
  }

  const videoOption = {
    width: 720,
    height: 480,
    facingMode: "environment"
  };

  return (
    <div className="App">
      <h1>ML Test Pratama</h1>
      <h3>{objectName}</h3>
      <h3>{objectScore}</h3>
      <button onClick={predict}>TEBAK OBJEK</button>
      <Webcam
        id="videoSource"
        audio={false}
        videoConstraints={videoOption}
      />
    </div>
  );
}

export default App;
