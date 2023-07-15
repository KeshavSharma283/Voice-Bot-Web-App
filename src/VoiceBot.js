import React, { useEffect, useState } from 'react';

const SpeechToText = () => {
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  const [botResponses, setBotResponses] = useState([]);

  useEffect(() => {
    // Check browser support for the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Create a new instance of SpeechRecognition
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

      // Set the properties
      recognition.continuous = false; // Recognize speech only once
      recognition.lang = 'en-US'; // Set the language

      // Event handler for capturing the user's speech input
      recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        setUserMessage(transcript);
        sendUserMessage(transcript);
      };

      setSpeechRecognition(recognition);
    } else {
      console.log('Speech recognition not supported');
    }
  }, []);

  const sendUserMessage = async message => {
    const response = await fetch('http://localhost:5002/webhooks/rest/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    const botResponses = data.map(item => item.text);
    setBotResponses(botResponses);

    // Convert the text response to speech
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(botResponses.join(' '));
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    speechRecognition.start();
  };

  return (
    <div>
      <button onClick={startListening}>Start Listening</button>
      <p>You said: {userMessage}</p>
      <p>Bot says: {botResponses.join(' ')}</p>
    </div>
  );
};

export default SpeechToText;
