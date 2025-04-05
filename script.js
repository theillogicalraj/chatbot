// script.js — AI Emergency Fund Calculator Chatbot with Enhanced UI

const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const toggleMode = document.getElementById('toggle-mode');
const micButton = document.getElementById('micButton');

// Toggle dark/light mode
toggleMode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleMode.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// Append message to chat
function appendMessage(sender, text, isBot = false) {
  const messageWrapper = document.createElement('div');
  messageWrapper.classList.add('message-wrapper');
  messageWrapper.classList.add(isBot ? 'bot' : 'user');

  const bubble = document.createElement('div');
  bubble.classList.add('message-bubble');
  bubble.innerHTML = `<span class="sender">${sender}:</span> <p>${text}</p>`;

  const timestamp = document.createElement('div');
  timestamp.classList.add('time');
  timestamp.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  messageWrapper.appendChild(bubble);
  messageWrapper.appendChild(timestamp);
  chatDisplay.appendChild(messageWrapper);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
  const typing = document.createElement('div');
  typing.id = 'typing';
  typing.classList.add('message-wrapper', 'bot');
  typing.innerHTML = `<div class="message-bubble"><em>AI FundBot is calculating<span class="dots">.</span></em></div>`;
  chatDisplay.appendChild(typing);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
  animateDots();
}

function removeTypingIndicator() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

function animateDots() {
  const typing = document.getElementById('typing');
  if (!typing) return;

  const dotsSpan = typing.querySelector('.dots');
  let dotCount = 1;

  const interval = setInterval(() => {
    if (!document.getElementById('typing')) {
      clearInterval(interval);
      return;
    }
    dotsSpan.textContent = '.'.repeat(dotCount);
    dotCount = (dotCount % 3) + 1;
  }, 400);
}

// Send user message
async function sendMessage() {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage('You', userMessage);
  userInput.value = '';
  showTypingIndicator();

  try {
    const response = await fetch('https://ai-fund-bot.glitch.me/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    setTimeout(() => {
      removeTypingIndicator();
      appendMessage('AI FundBot', data.reply || 'Sorry, I could not calculate that.', true);
    }, 1000);
  } catch (error) {
    removeTypingIndicator();
    appendMessage('AI FundBot', '⚠️ Calculation failed. Please check your connection.', true);
    console.error('AI FundBot error:', error);
  }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Voice input for emergency fund questions
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';

  micButton.addEventListener('click', () => {
    recognition.start();
    micButton.textContent = '🎙️ Listening...';
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    micButton.textContent = '🎤';
    sendMessage();
  };

  recognition.onerror = () => {
    micButton.textContent = '🎤';
  };

  recognition.onend = () => {
    micButton.textContent = '🎤';
  };
}

// Add greeting message on load
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    appendMessage('AI FundBot', '👋 Hello! I\'m here to help you calculate your emergency fund. Ask me anything like: "How much emergency fund do I need if my salary is ₹50,000?"', true);
  }, 300);
});
