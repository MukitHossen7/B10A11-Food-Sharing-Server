## Project Name : Food Sharing Platform - Server Side

- Description :
- The server-side of this project handles the backend logic for the Food Sharing and Surplus Reduction Platform. It manages user authentication, CRUD operations for food items, JWT-based authorization for private routes, and interactions with MongoDB to store food donations and user data.

## Server Live Link:

-- https://food-shearing-server-side.vercel.app/

## Key Features

- Create : Allow users to add food items to the platform, storing them in a database.
- Read : Fetch and display food items available for sharing.
- Update : Let users update food details they have added.
- Delete : Allow users to delete food items they have posted.
- Food Status Management: Update food status based on user actions.
- JWT Token Signing: Use a secret key to sign the JWT, ensuring it can be validated later.
- HTTP-Only Cookies: Store JWT tokens in secure, HTTP-only cookies to prevent client-side
  JavaScript access, protecting against XSS attacks.

## Technologies Used

- Node.js (Backend runtime)
- Express.js (Web framework for handling HTTP requests)
- MongoDB (Database for storing food items, user data, and food requests)
- JWT (For user authentication and authorization)
- Firebase Authentication (For handling login and registration)
- TanStack Query (For efficient data fetching and mutations)
- dotenv (For managing environment variables)
