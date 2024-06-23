# CatarActNow Cloud Computing Repository

Welcome to the CatarActNow Cloud Computing repository! This project is a crucial part of the CatarActNow application, responsible for providing essential backend services such as user authentication and news integration. This README provides an overview of the implemented features, the technology stack, and deployment instructions.

## Features

### News API
Our News API fetches and delivers the latest news articles to the CatarActNow application. This API ensures that users have access to up-to-date information seamlessly.

### Login API
The Login API authenticates users by verifying their credentials. This ensures that only registered users can access the application.

### Register API
The Register API allows new users to create an account by storing their details in Firestore, our chosen database solution. This API ensures the secure and efficient registration of users.

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for Node.js, used to build the APIs.

### Cloud Platform
- **Google App Engine**: Hosting and deployment of our APIs using App Engine.
- **Google Firestore**: A NoSQL document database used for storing user credentials securely.
- **Google Cloud Monitoring**: Oversees the health and performance of the application with integrated metrics and logs.
