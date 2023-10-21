# Emoji Mood Tracker API

The Emoji Mood Tracker API is a Node.js application that allows users to record daily emotions with emojis, view mood summaries, analyze mood trends, and more. This API is built using Node.js, Express.js, MongoDB Atlas as the database, and JWT for authentication.

## Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js: Ensure you have Node.js installed on your system.
MongoDB Atlas: Set up a MongoDB Atlas cluster and obtain the connection URI.

## Installation
Clone the repository:
```
git clone https://github.com/SuhailAnsariRepo/emoji-mood-tracker-api.git
```

Install dependencies:
```
npm install
```

## Configuration
Create a .env file in the root directory of the project.

Add the following environment variables to the .env file:
```
PORT=<your_port_number>
MONGODB_URI=<your_mongodb_connection_uri>
JWT_SECRET=<your_jwt_secret_key>
```

Replace <your_mongodb_connection_uri> with your MongoDB Atlas connection URI and <your_jwt_secret_key> with your JWT secret key.

## Usage
Start the server:
```
npm start
```

The API will be accessible at http://localhost:3000.

Access the API endpoints using tools like Postman or any API testing tool of your choice.

## API Documentation
The API documentation, including available endpoints, request formats, and responses, can be found at [Emoji Mood Tracker Postman docs](https://www.postman.com/red-meteor-882109/workspace/testing/collection/25328716-1a351bb1-66e2-4b34-ad85-a2cb0de290e5?action=share&creator=25328716) after starting the server. This documentation is generated using Postman and provides a detailed overview of the API functionality.

## Endpoints
### Authentication:
- POST `/api/user/register`: Register a new user.
- POST `/api/user/login`: Authenticate an existing user.

### Mood Entries:
- POST `/api/mood`: Log a new mood entry.
- GET `/api/mood/filter?`: Get mood entries based on filters.
- PUT `/api/mood/:id`: Update a specific mood entry.
- DELETE `/api/mood/:id`: Delete a specific mood entry.

### Mood Summaries:
- GET `/api/mood/monthly-summary`: Get a summary of the user's moods for a specific month.

### Emoji Statistics:
- GET `/api/mood/emoji-statistics`: Get statistics on emoji usage over time.

### Sharing and Collaboration:
- GET `/api/mood/share`: Generate a unique link to share mood history.
- PUT `/api/user/toggle-sharing`: Disable mood history sharing.

### Data Insights:
- GET `/api/mood/mood-trends`: Get insights into mood trends using data visualization.

### Emoji Suggestions:
- POST `/api/mood/suggest-emojis`: Get emoji suggestions based on mood notes.

### Public Mood Board:
- GET `/api/mood/public-mood-board`: Get aggregated, anonymized mood data for the public mood board.


# License
This project is licensed under the MIT License.

