<template>
    <div class="nrdb-ui-chat">
        <!-- Chat messages container -->
        <div class="nrdb-ui-chat-messages">
            <div
                v-for="(message, index) in messages"
                :key="index"
                class="nrdb-ui-message"
                :class="message.sent ? 'sent' : 'received'"
            >
                <div v-if="props.showAuthor && !message.sent" class="nrdb-ui-message-author">
                    {{ message.author }}
                </div>
                <div class="nrdb-ui-message-content" v-html="renderMarkdown(message.text)"/>
                <div class="nrdb-ui-message-time">
                    {{ message.time }}
                </div>
            </div>
            <div v-if="typing" class="nrdb-ui-message received">
                <div class="nrdb-ui-message-content nrdb-ui-message-typing">
                    <div class="nrdb-ui-message-typing-dot" />
                    <div class="nrdb-ui-message-typing-dot" />
                    <div class="nrdb-ui-message-typing-dot" />
                </div>
            </div>
        </div>

        <!-- Message input form -->
        <div class="nrdb-ui-chat-input">
            <div class="nrdb-ui-chat-input-container">
                <input
                    v-model="newMessage"
                    type="text"
                    placeholder="Type a message..."
                    :disabled="!state.enabled"
                    @keyup.enter="sendMessage"
                >
                <button
                    class="nrdb-ui-chat-send" :disabled="!state.enabled || !newMessage.trim()"
                    @click="sendMessage"
                >
                    <AirplaneIcon />
                </button>
            </div>
        </div>
    </div>
</template>

<script>

import DOMPurify from 'dompurify'

import { marked } from 'marked'

import AirplaneIcon from './icons/AirplaneIcon.vue'

export default {
    name: 'UIChat',
    components: {
        AirplaneIcon
    },
    inject: ['$socket', '$dataTracker'],
    props: {
        /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({ enabled: false, visible: false }) }
    },
    setup (props) {
        // Configure marked options
        marked.setOptions({
            breaks: true, // Convert line breaks to <br>
            gfm: true, // Enable GitHub Flavored Markdown
            sanitize: true, // Don't HTML (be careful with user input)
            smartLists: true,
            smartypants: true
        })
    },
    data () {
        return {
            messages: [],
            newMessage: '',
            typing: false
        }
    },
    computed: {

    },
    created () {
        // setup our event handlers, and informs Node-RED that this widget has loaded
        this.$dataTracker(this.id, this.onInput, this.onLoad)
    },
    methods: {
        renderMarkdown (text) {
            try {
                // Parse markdown and return HTML
                const html = marked.parse(text)
                return DOMPurify.sanitize(html)
            } catch (error) {
                console.error('Error parsing markdown:', error)
                // Fallback to plain text if markdown parsing fails
                return this.escapeHtml(text)
            }
        },
        escapeHtml (text) {
            // Basic HTML escaping for fallback
            const div = document.createElement('div')
            div.textContent = text
            return div.innerHTML
        },
        onInput (msg) {
            if (msg.topic === '_typing') {
                this.typing = true
            } else if (msg?.payload) {
                // Handle incoming messages from Node-RED
                this.typing = false
                this.messages.push({
                    author: msg.topic,
                    text: msg.payload,
                    time: new Date().toLocaleTimeString(),
                    sent: false
                })
            }
            this.$nextTick(() => {
                this.scrollToBottom()
            })
        },
        onLoad (msg) {
            // Handle initial load
            if (Array.isArray(msg?.payload)) {
                this.messages = msg.payload.map(m => ({
                    ...m,
                    time: new Date(m.timestamp || Date.now()).toLocaleTimeString()
                }))
                this.$nextTick(() => {
                    this.scrollToBottom()
                })
            }
        },
        send (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        sendMessage () {
            if (!this.newMessage.trim() || !this.state.enabled) return

            // Create message object
            const message = {
                author: 'user',
                text: this.newMessage,
                time: new Date().toLocaleTimeString(),
                sent: true
            }

            // Add to local messages
            this.messages.push(message)

            // Send to Node-RED
            this.send({
                topic: 'user-message',
                payload: this.newMessage
            })

            // Clear input
            this.newMessage = ''

            // Scroll to bottom
            this.$nextTick(() => {
                this.scrollToBottom()
            })
        },
        scrollToBottom () {
            const container = this.$el.querySelector('.nrdb-ui-chat-messages')
            if (container) {
                container.scrollTop = container.scrollHeight
            }
        }
    }
}
</script>

<style scoped>
/* CSS is auto scoped, but using named classes is still recommended */
@import "../stylesheets/ui-chat.css";

/* Additional styles for markdown content */
.nrdb-ui-message-content :deep(p) {
    margin: 0.5em 0;
}

.nrdb-ui-message-content :deep(p:first-child) {
    margin-top: 0;
}

.nrdb-ui-message-content :deep(p:last-child) {
    margin-bottom: 0;
}

.nrdb-ui-message-content :deep(code) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
}

.nrdb-ui-message-content :deep(pre) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    white-space: pre-wrap;
}

.nrdb-ui-message-content :deep(blockquote) {
    border-left: 4px solid #ddd;
    margin: 0.5em 0;
    padding-left: 1em;
    color: #666;
}

.nrdb-ui-message-content :deep(ul),
.nrdb-ui-message-content :deep(ol) {
    margin: 0.5em 0;
    padding-left: 1.5em;
}

.nrdb-ui-message-content :deep(strong) {
    font-weight: bold;
}

.nrdb-ui-message-content :deep(em) {
    font-style: italic;
}

.nrdb-ui-message-content :deep(a) {
    color: #007bff;
    text-decoration: underline;
}

.nrdb-ui-message-content :deep(h1),
.nrdb-ui-message-content :deep(h2),
.nrdb-ui-message-content :deep(h3),
.nrdb-ui-message-content :deep(h4),
.nrdb-ui-message-content :deep(h5),
.nrdb-ui-message-content :deep(h6) {
    margin: 0.5em 0;
    font-weight: bold;
}
</style>