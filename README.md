# Chat Window Widget for FlowFuse Dashboard (Node-RED Dashboard 2.0)

This repository contains a third-party, node for the Node-RED Dashboard to provide an interactive chat window widget.

Easily build a chat-based user interface, and seamlessly integrate it with the vast collection of other Node-RED nodes available, including many for well-known AI services and offerings like [OpenAI](https://flows.nodered.org/node/@inductiv/node-red-openai-api) or [ollama](https://flows.nodered.org/node/node-red-contrib-ollama).

Below is a demonstration of the chat widget in action, integrated with an OpenAI node to provide a chatbot interface, one trained on 

## Examples

### OpenAI Chatbot

Here, an OpenAI agent was prompted that it is an expert in Node-RED, and should assist users with flow-building and answering general questions:

<img style="max-width:600px; margin: auto;" alt="Screenshot of a FlowFuse Dashboard built to enable interaction with an LLM Agent that can answer questions about Node-RED" src="./docs/screenshot-open-ai.png" />

### Chat & Worldmap Integration

This agent was provisioned to provide coordinate data alongside it's text-based answers, which are then rendered onto a World Map, also rendered within FlowFuse Dashboard.

<img alt="Screenshot of a FlowFuse Dashboard built to enable interaction with an LLM Agent that can answer questions and provide coordinate data, which is then rendered on a World Map" src="./docs/screenshot-worldmap.png" />

## Usage

### Installation

#### Install via Node-RED UI

1. Navigate to a Node-RED Editor
2. Click on the "Manage Palette" option int eh Node-RED menu
3. Switch to the "Install" tab
4. Search for "@flowfuse/node-red-dashboard-2-ui-chat"
5. Click on the "Install" button

#### Install via NPM

```bash
npm install @flowfuse/node-red-dashboard-2-ui-chat
```

### Using in a Flow

<img width="964" alt="Image" src="https://github.com/user-attachments/assets/a6597ab4-bfc8-4358-8c2a-8c4b69ecbeda" />

Anything sent into the node will be considered as a _received_ message. Any messages typed into the chat will be sent out of the node as a _sent_ message.

#### Predefined Input Types

You can create placeholder items in your chat, like a "Typing" message by using different `msg.topic` values.

##### "Typing" Placeholder

By assigning a `msg.topic` of `_typing`, then a placeholder "Typing..." message will be shown in the chat. This is automatically removed when the next message is received.

##### Defining Message Authors

Any other `msg.topic` values used are assumed to be the name of the "author" of the message.

#### Message Formats

The chat widget supports both single messages and arrays of messages, providing flexibility for various use cases.

##### Single Message (Basic Usage)

```javascript
msg.payload = "Hello, this is a simple message";
msg.topic = "user";  // Optional: sets the author name
```

##### Array of Messages

You can send multiple messages at once by providing an array in `msg.payload`:

```javascript
// Array of simple strings
msg.payload = [
    "Hello!",
    "How are you?",
    "This is a test message."
];
msg.topic = "user";  // Author applied to all messages
```

##### Advanced Message Objects

For more control, use message objects with custom parameters:

```javascript
msg.payload = [
    {
        text: "Message with custom time",
        time: "10:30:15",
        author: "Bot",
        sent: false
    },
    {
        text: "User message with timestamp",
        timestamp: Date.now(),  // Will be converted to time string
        sent: true
    },
    "Simple string message"  // Can mix strings and objects
];
```

##### Message Object Properties

- **`text`** (string): The message content (required)
- **`time`** (string): Custom time display (e.g., "10:30:15")
- **`timestamp`** (number): Unix timestamp (will be converted to time string)
- **`author`** (string): Message author name (overrides `msg.topic`)
- **`sent`** (boolean): Whether message appears as sent (true) or received (false)

**Note**: If both `time` and `timestamp` are provided, `time` takes precedence.

## Development

To get started, clone this repository:

```bash
# if using HTTPS:
git clone https://github.com/FlowFuse/node-red-dashboard-2-ui-chat.git

# if using SSH:
git clone git@github.com:FlowFuse/node-red-dashboard-2-ui-chat.git
```

Then, you can install it's dependencies with:

```bash
npm install
```