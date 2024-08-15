import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from "react";
import Webcam from "react-webcam";
import { div } from '@tensorflow/tfjs';
import * as tf from "@tensorflow/tfjs"
import * as cocoModel from "@tensorflow-models/coco-ssd"


function App() {
  const [model, setModel] = useState()
  const [objectName, setObjectName] = useState("")
  const [objectScore, setObjectScore] = useState("")

  async function loadModel() {
    try{
      const dataset = await cocoModel.load()
      setModel(dataset)
      console.log('dataset ready...')
    }catch(err){
      console.log(err)
    }    
  }
  useEffect(()=>{
    tf.ready().then(() =>{
      loadModel()
    })
  }, [])

  async function predict (){
    const detection = await model.detect(document.getElementById("videoSource"))
    if(detection.length > 0) {
      detection.map((result, i)=>{
        setObjectName(result.class)
        setObjectScore(result.score)
      })
    }
    console.log(detection)
  } 

  const videoOption = {
    width: 720,
    height: 480,
    facingMode: "environment"
  }

  console.log(model)
  return (
    <div className="App">
      <h1>ML test pratama</h1>
      <h3>{objectName ? objectName.toString() : ""}</h3>
      <h3>{objectScore ? objectScore.toString() : ""}</h3>
      <button onClick={()=>predict()}>TEBAK OBJEK</button>
      <Webcam
      id="videoSource"
      audio={false}
      videoConstraints={videoOption}
      />
    </div>
  );
}

export default App
