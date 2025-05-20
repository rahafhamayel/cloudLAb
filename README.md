# AWS-Powered Chatbot Assistant

Welcome to our **AWS Chatbot Assistant** — a cloud-native web application designed to help users interact with key AWS services through natural language conversations. This intelligent assistant is built on top of **Amazon Lex**, **Cognito**, and a **cloud-hosted database**, enabling both seamless user authentication and real-time execution of AWS functions via chat.

---
![image](https://github.com/user-attachments/assets/43138dc6-fd73-4ce2-99a8-beb43a913976)

## What It Does

Our chatbot acts as a smart assistant that understands user input and responds by executing AWS-related tasks or guiding users through AWS service usage. Whether you want to manage a resource, retrieve information, or get step-by-step assistance — it’s all just a message away.

---

## Key Features

### User Authentication with AWS Cognito

We integrated **Amazon Cognito** to securely register and log in users. This provides a reliable authentication layer while allowing us to control access to certain chatbot features based on identity.

### Cloud Database for Chat History

To ensure continuity and context in conversations, we set up a **cloud-based database** that stores user chat logs. This enables:
- Retrieving previous chat history
- Providing context-aware responses
- Analyzing user interactions to improve the chatbot over time

### Secure Permission Handling

The chatbot is granted specific **IAM permissions** to execute AWS operations on behalf of authenticated users. All actions are scoped to operate securely and within limits.

---

## Technologies Used

- **Amazon Cognito** – User sign-up, sign-in, and session management
- **Amazon Lex** – Conversational chatbot engine
- **AWS IAM** – Access control and role-based permissions
- **AWS DynamoDB** – Persistent storage for chat logs
- **React** – Frontend web framework

---

## Use Case Examples

Here are a few sample commands that users can issue:

- `List all my S3 buckets`
- `Check my EC2 instances status`
- `List all active IAM users`

Each request is processed securely and the bot executes only within its authorized capabilities.

---

