// Global variables
let socket = null;
let currentUser = null;
let currentGroup = null;
let isAnonymousMode = false;
let authMode = 'login'; // 'login' or 'register'

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

// Test if script is loading
console.log('Script.js loaded successfully!');

function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        showChatInterface();
        initializeSocket();
        loadMessages();
    } else {
        showAuthModal();
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Auth form submission
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
        console.log('Auth form event listener added');
    } else {
        console.error('Auth form not found!');
    }
    
    // Also add click listener to the submit button as backup
    const submitButton = authForm?.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            console.log('Submit button clicked!');
            e.preventDefault();
            handleAuth(e);
        });
        console.log('Submit button click listener added');
    }
    
    // Auth mode switch
    const authSwitch = document.getElementById('authSwitch');
    if (authSwitch) {
        authSwitch.addEventListener('click', toggleAuthMode);
        console.log('Auth switch event listener added');
    } else {
        console.error('Auth switch not found!');
    }
    
    // Message input enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        console.log('Message input event listener added');
    } else {
        console.error('Message input not found!');
    }
}

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('chatInterface').classList.add('hidden');
}

function showChatInterface() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('chatInterface').classList.remove('hidden');
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';
    
    const title = document.getElementById('authTitle');
    const buttonText = document.getElementById('authButtonText');
    const switchText = document.getElementById('authSwitchText');
    const switchButton = document.getElementById('authSwitch');
    const usernameField = document.getElementById('usernameField');
    
    if (authMode === 'register') {
        title.textContent = 'Register';
        buttonText.textContent = 'Register';
        switchText.textContent = 'Already have an account?';
        switchButton.textContent = 'Login';
        usernameField.classList.remove('hidden');
    } else {
        title.textContent = 'Login';
        buttonText.textContent = 'Login';
        switchText.textContent = "Don't have an account?";
        switchButton.textContent = 'Register';
        usernameField.classList.add('hidden');
    }
}

async function handleAuth(e) {
    e.preventDefault();
    console.log('handleAuth called, authMode:', authMode);
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    console.log('Form data:', { email, password, username, authMode });
    
    try {
        let response;
        if (authMode === 'register') {
            response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
        } else {
            response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            showChatInterface();
            initializeSocket();
            loadMessages();
        } else {
            alert(data.error || 'Authentication failed');
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('Network error. Please try again.');
    }
}

function initializeSocket() {
    socket = io('http://127.0.0.1:8000');
    
    socket.on('connect', () => {
        console.log('Connected to server');
        // Join the default group (ID: 1)
        socket.emit('join-group', 1);
        console.log('Joined group 1');
    });
    
    socket.on('new-message', (data) => {
        console.log('Received new message:', data);
        addMessageToUI(data.message, data.message.user_id === currentUser.id);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

async function loadMessages() {
    try {
        // For demo purposes, we'll use a default group ID
        // In a real app, you'd get this from the current group context
        const groupId = 1;
        
        const response = await fetch(`${API_BASE_URL}/chat/groups/${groupId}/messages`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';
            
            data.messages.forEach(message => {
                addMessageToUI(message, message.user_id === currentUser.id);
            });
            
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function addMessageToUI(message, isSent) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'} new-message`;
    
    const time = new Date(message.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const displayName = message.is_anonymous ? 'Anonymous' : message.username;
    
    messageElement.innerHTML = `
        <div class="message-bubble">
            ${!isSent ? `
                <div class="message-info">
                    <div class="user-avatar">${displayName.charAt(0).toUpperCase()}</div>
                    <span class="username">${displayName}</span>
                </div>
            ` : ''}
            <div class="message-content">${message.content}</div>
            <div class="message-time">${time}</div>
            ${isSent ? `
                <div class="message-status">
                    <span>✓✓</span>
                </div>
            ` : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                group_id: 1, // Default group for demo
                content: content,
                is_anonymous: isAnonymousMode
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addMessageToUI(data.data, true);
            messageInput.value = '';
            
            // Emit socket event for real-time updates
            if (socket) {
                socket.emit('send-message', {
                    groupId: 1,
                    message: data.data
                });
                console.log('Emitted send-message event:', data.data);
            }
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Network error. Please try again.');
    }
}

function toggleIncognito() {
    isAnonymousMode = !isAnonymousMode;
    
    const incognitoOnIcon = document.getElementById('incognitoOnIcon');
    const incognitoOffIcon = document.getElementById('incognitoOffIcon');
    const anonymousBanner = document.getElementById('anonymousBanner');
    const anonymousIndicator = document.getElementById('anonymousIndicator');
    
    if (isAnonymousMode) {
        incognitoOnIcon.classList.remove('hidden');
        incognitoOffIcon.classList.add('hidden');
        anonymousBanner.classList.remove('hidden');
        anonymousIndicator.classList.remove('hidden');
    } else {
        incognitoOnIcon.classList.add('hidden');
        incognitoOffIcon.classList.remove('hidden');
        anonymousBanner.classList.add('hidden');
        anonymousIndicator.classList.add('hidden');
    }
    
    // Update anonymous mode on server
    updateAnonymousMode();
}

async function updateAnonymousMode() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/anonymous-mode`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                is_anonymous: isAnonymousMode
            })
        });
        
        if (!response.ok) {
            console.error('Failed to update anonymous mode');
        }
    } catch (error) {
        console.error('Error updating anonymous mode:', error);
    }
}

function goBack() {
    // In a real app, this would navigate back to the groups list
    console.log('Going back to groups list');
}

function attachFile() {
    // File attachment functionality
    console.log('Attach file clicked');
}

function attachImage() {
    // Image attachment functionality
    console.log('Attach image clicked');
}

// Sample messages for demo (remove in production)
function loadSampleMessages() {
    const sampleMessages = [
        {
            id: 1,
            content: "Someone order Bornvita!!",
            username: "Anonymous",
            is_anonymous: true,
            created_at: new Date().toISOString(),
            user_id: 2
        },
        {
            id: 2,
            content: "Anonymous hahahahah!!",
            username: "Anonymous",
            is_anonymous: true,
            created_at: new Date().toISOString(),
            user_id: 3
        },
        {
            id: 3,
            content: "We have Surprise For you!!",
            username: "Abhay Shukla",
            is_anonymous: false,
            created_at: new Date().toISOString(),
            user_id: 4
        },
        {
            id: 4,
            content: "I'm Excited For this Event! Ho-Ho",
            username: "Anonymous",
            is_anonymous: true,
            created_at: new Date().toISOString(),
            user_id: 5
        },
        {
            id: 5,
            content: "Hi Guysss 👋",
            username: "You",
            is_anonymous: false,
            created_at: new Date().toISOString(),
            user_id: 1
        },
        {
            id: 6,
            content: "Hello!",
            username: "Anonymous",
            is_anonymous: true,
            created_at: new Date().toISOString(),
            user_id: 6
        },
        {
            id: 7,
            content: "Yessss!!!!!!!",
            username: "Anonymous",
            is_anonymous: true,
            created_at: new Date().toISOString(),
            user_id: 7
        },
        {
            id: 8,
            content: "Maybe I am not attending this event!",
            username: "You",
            is_anonymous: false,
            created_at: new Date().toISOString(),
            user_id: 1
        }
    ];
    
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    sampleMessages.forEach(message => {
        addMessageToUI(message, message.user_id === 1);
    });
    
    scrollToBottom();
}