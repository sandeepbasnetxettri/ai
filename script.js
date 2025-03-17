document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const newChatBtn = document.getElementById('newChatBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const chatHistory = document.querySelector('.chat-history');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const translateBtn = document.getElementById('translateBtn');
    const newChatMobileBtn = document.getElementById('newChatMobileBtn');

    // Initialize current chat ID
    let currentChatId = Date.now().toString();

    // Load chat history
    function loadChatHistory() {
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        chatHistory.innerHTML = '';
        
        Object.entries(chats).reverse().forEach(([chatId, chat]) => {
            const date = new Date(chat.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            });

            // Get last message and a preview of the conversation
            const lastMsg = chat.messages[chat.messages.length - 1];
            const previewMessages = chat.messages
                .slice(0, 2)
                .map(msg => {
                    const emoji = msg.sender === 'user' ? 
                        '<span class="chat-emoji wizard-float">🧙‍♂️</span>' : 
                        '<span class="chat-emoji bolt-flash">⚡</span>';
                    return `${emoji} ${msg.text.substring(0, 30)}${msg.text.length > 30 ? '...' : ''}`;
                })
                .join('\n');

            const chatElement = document.createElement('div');
            chatElement.className = 'chat-history-item';
            chatElement.innerHTML = `
                <div class="chat-preview">
                    <div class="chat-preview-header">
                        <i class="fas fa-scroll"></i>
                        <span class="chat-date">${formattedDate}</span>
                    </div>
                    <div class="chat-preview-content">
                        ${previewMessages}
                    </div>
                    <div class="chat-message-count">
                        ${chat.messages.length} messages
                    </div>
                </div>
                <div class="chat-actions">
                    <button class="delete-chat" data-chat-id="${chatId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            chatElement.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-chat')) {
                    loadChat(chatId);
                }
            });
            
            chatHistory.appendChild(chatElement);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-chat').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = button.dataset.chatId;
                deleteChat(chatId);
            });
        });
    }

    // Load specific chat
    function loadChat(chatId) {
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        const chat = chats[chatId];
        
        if (chat) {
            currentChatId = chatId;
            chatContainer.innerHTML = '';
            chat.messages.forEach(msg => {
                addMessage(msg.sender, msg.text, false);
            });
            sidebar.classList.remove('active');
        }
    }

    // Delete chat
    function deleteChat(chatId) {
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        delete chats[chatId];
        localStorage.setItem('chats', JSON.stringify(chats));
        loadChatHistory();
        
        if (chatId === currentChatId) {
            startNewChat();
        }
    }

    // Save message to current chat
    function saveMessage(sender, text) {
        const chats = JSON.parse(localStorage.getItem('chats') || '{}');
        
        if (!chats[currentChatId]) {
            chats[currentChatId] = {
                timestamp: Date.now(),
                messages: []
            };
        }
        
        chats[currentChatId].messages.push({
            sender,
            text,
            timestamp: Date.now()
        });
        
        localStorage.setItem('chats', JSON.stringify(chats));
        loadChatHistory();
    }

    // Handle sidebar toggle
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Handle send message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            simulateResponse(message);
            userInput.value = '';
            userInput.style.height = 'auto';
        }
    }

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter (but allow new lines with Shift+Enter)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Modified startNewChat function
    function startNewChat() {
        currentChatId = Date.now().toString();
        chatContainer.innerHTML = '';
        sidebar.classList.remove('active');
        addMessage('assistant', 'Welcome to Hogwarts! I am Harry Potter, your magical assistant. How may I help you today?');
    }

    newChatBtn.addEventListener('click', startNewChat);
    newChatMobileBtn.addEventListener('click', startNewChat);

    // Voice input handling
    voiceInputBtn.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'ne-NP';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                voiceInputBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                voiceInputBtn.classList.add('recording');
            };

            recognition.onend = () => {
                voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceInputBtn.classList.remove('recording');
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                userInput.dispatchEvent(new Event('input'));
            };

            recognition.start();
        } else {
            alert('माफ गर्नुहोस्, तपाईंको ब्राउजरमा भ्वाइस इनपुट सपोर्ट छैन।');
        }
    });

    // Image upload handling
    imageUploadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                addMessage('user', '🖼️ जादुई तस्विर अपलोड गरिएको');
                simulateResponse('तस्विर प्राप्त भयो। म यसलाई जादुई तरिकाले विश्लेषण गर्दैछु...');
            }
        };
        input.click();
    });

    // Camera handling
    cameraBtn.addEventListener('click', () => {
        if ('mediaDevices' in navigator) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    addMessage('user', '📸 जादुई क्यामेराबाट तस्विर लिइएको');
                    simulateResponse('तस्विर प्राप्त भयो। होगवार्ट्सको जादूले विश्लेषण गर्दैछु...');
                }
            };
            input.click();
        } else {
            alert('माफ गर्नुहोस्, तपाईंको डिभाइसमा जादुई क्यामेरा सपोर्ट छैन।');
        }
    });

    // Translation toggle
    translateBtn.addEventListener('click', () => {
        alert('जादुई भाषा परिवर्तन सुविधा छिट्टै आउँदैछ।');
    });

    // Modified addMessage function to include saving
    function addMessage(sender, text, shouldSave = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.animation = 'fadeIn 0.3s ease';

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${sender}-avatar`;
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-hat-wizard"></i>' : '<i class="fas fa-magic"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatContainer.appendChild(messageDiv);

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Save message if needed
        if (shouldSave) {
            saveMessage(sender, text);
        }
    }

    // Simulate AI response
    async function simulateResponse(userMessage) {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message';
        loadingMessage.style.animation = 'fadeIn 0.3s ease';
        loadingMessage.innerHTML = `
            <div class="message-avatar assistant-avatar">
                <i class="fas fa-magic"></i>
            </div>
            <div class="message-content">
                <i class="fas fa-bolt lightning-spin"></i> *Consulting the ancient tomes of Hogwarts...*
            </div>
        `;
        chatContainer.appendChild(loadingMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Enhanced magical responses with better context handling
        const magicalResponses = [
            {
                text: "📚 *Opening my enchanted portfolio* Let me share with you my magical collection about '%QUERY%'. Each project is like a unique spell, crafted with care and precision...",
                animation: "book",
                emoji: "✨",
                type: "portfolio"
            },
            {
                text: "🏰 *The walls of Hogwarts showcase* Your interest in '%QUERY%' reminds me of my portfolio of magical achievements. Let me show you through this enchanted gallery...",
                animation: "castle",
                emoji: "🖼️",
                type: "portfolio"
            },
            {
                text: "⚡ *Illuminating the Room of Requirement* For your query about '%QUERY%', the room has transformed into a magical showcase of my work and experiences...",
                animation: "sparkle",
                emoji: "💫",
                type: "portfolio"
            },
            {
                text: "🪄 *With a flourish of my wand* Allow me to present my portfolio featuring '%QUERY%'. Each project tells a unique story of magical innovation...",
                animation: "wand",
                emoji: "🌟",
                type: "portfolio"
            },
            {
                text: "📜 *Unrolling the magical scroll* Here's my collection of enchanted works about '%QUERY%'. Each piece is infused with unique magical properties...",
                animation: "book",
                emoji: "📖",
                type: "portfolio"
            }
        ];

        try {
            // Dynamic thinking time based on question complexity
            const thinkingTime = 1500 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, thinkingTime));
            
            // Enhanced response selection based on portfolio context
            const portfolioResponses = magicalResponses.filter(response => response.type === 'portfolio');
            const selectedResponse = portfolioResponses[Math.floor(Math.random() * portfolioResponses.length)];
            
            // Enhanced response formatting with portfolio-specific elements
            const formattedResponse = selectedResponse.text
                .replace(/%QUERY%/g, userMessage)
                .replace(/\*(.*?)\*/g, (_, text) => `<em>${text}</em>`);
            
            // Add special portfolio effects
            const magicClass = 'portfolio-showcase';
            
            // Remove loading and add enhanced portfolio response
            chatContainer.removeChild(loadingMessage);
            const messageDiv = document.createElement('div');
            messageDiv.className = `message assistant-message magic-${selectedResponse.animation} ${magicClass}`;
            messageDiv.innerHTML = `
                <div class="message-avatar assistant-avatar">
                    <span class="response-emoji">${selectedResponse.emoji}</span>
                </div>
                <div class="message-content">
                    ${formattedResponse}
                    <div class="portfolio-preview">
                        <span class="portfolio-icon">📂</span>
                        <span class="portfolio-text">Magical Portfolio Collection</span>
                    </div>
                </div>
            `;
            chatContainer.appendChild(messageDiv);
            saveMessage('assistant', formattedResponse);
            
        } catch (error) {
            chatContainer.removeChild(loadingMessage);
            addMessage('assistant', "🎨 *Organizing my magical portfolio* Give me a moment to arrange these enchanted works properly...");
        }
    }

    // Initialize chat history
    loadChatHistory();
}); 