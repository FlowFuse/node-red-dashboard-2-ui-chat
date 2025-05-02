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
                <div class="nrdb-ui-message-content">
                    {{ message.text }}
                </div>
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
</style>
