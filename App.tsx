@@ .. @@
 import React, { useState, useEffect, useCallback } from 'react';
-import { GoogleGenAI } from "@google/genai";
 import { useInterval } from './hooks/useInterval';
 import { Coordinates, Direction } from './types';
 import {
@@ .. @@
   SPEED_INCREMENT,
 } from './constants';

-const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
-
 const FunFactDisplay: React.FC<{
   fact: string;
   isLoading: boolean;
@@ .. @@
   const fetchFunFact = useCallback(async () => {
     setIsFactLoading(true);
     setFunFact('');
     try {
-      const response = await ai.models.generateContent({
-        model: "gemini-2.5-flash",
-        contents: "Tell me a very short, interesting, and fun fact about snakes or apples.",
-        config: { temperature: 1 }
-      });
-      setFunFact(response.text);
+      // For now, we'll use a simple array of facts
+      const facts = [
+        "Snakes can't bite food, so they have to swallow it whole!",
+        "Apples float because 25% of their volume is air.",
+        "A group of snakes is called a 'nest' or 'den'.",
+        "There are over 7,500 varieties of apples grown worldwide.",
+        "Snakes smell with their tongues!",
+        "Apple trees can live for over 100 years.",
+        "Some snakes can go months without eating.",
+        "Apples are more effective than coffee at waking you up in the morning."
+      ];
+      const randomFact = facts[Math.floor(Math.random() * facts.length)];
+      setFunFact(randomFact);
     } catch (error) {
       console.error("Error fetching fun fact:", error);
       setFunFact("Could not fetch a fact right now. Please try again later.");
@@ .. @@
       <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-2 tracking-widest">
         GEMINI SNAKE
       </h1>
+      <p className="text-sm text-gray-500 mb-4">Use arrow keys to control the snake</p>
       <div className="text-lg text-gray-400 mb-4">Score: <span className="font-bold text-green-400 text-2xl">{score}</span></div>