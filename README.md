# MERN Stack Inventory Tracker

This is a complete full-stack inventory tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It was created as part of an internship project.

The application allows users to register, log in, and then perform complete CRUD (Create, Read, Update, Delete) operations on an inventory database. The backend is secured with JSON Web Tokens (JWT) to ensure only authenticated users can manage items.

## Features

* **User Authentication:** Secure user registration and login system.
* **JWT Security:** Backend API is protected. A valid JWT must be sent with all requests to manage items.
* **Full CRUD:** Users can **C**reate new items, **R**ead the full inventory list, **U**pdate existing items, and **D**elete items.
* **Full-Stack:** A React frontend that communicates with a Node.js/Express backend API.
* **Database:** MongoDB (using Mongoose) stores all user and item data.

## Technology Stack

* **Frontend:**
    * React.js
    * Tailwind CSS
    * `axios` (for API requests)
* **Backend:**
    * Node.js
    * Express.js
    * MongoDB (with Mongoose)
    * `bcryptjs` (for password hashing)
    * `jsonwebtoken` (for user auth)
    * `cors` (for cross-origin requests)

## How to Run This Project

To run this project, you must run the **Backend** and **Frontend** in two separate terminals.

### Prerequisites

* [Node.js](https://nodejs.org/) installed (which includes `npm`)
* [Git](https://git-scm.com/) installed
* **MongoDB URI:** You must have a connection string from MongoDB (either a local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cloud account).

---

### **Step 1: Backend Setup**

1.  **Clone the Repository:**
    ```sh
    git clone [https://github.com/rakesh-patil777/Small-Inventory-Tracking.git](https://github.com/rakesh-patil777/Small-Inventory-Tracking.git)
    cd Small-Inventory-Tracking
    ```

2.  **Create `.env` File:**
    * In the main project folder (the one with `backend.js`), create a new file named `.env`
    * Open this file and add your MongoDB connection string and a secret for JWT:
        ```
        MONGO_URI=your_mongodb_connection_string_goes_here
        JWT_SECRET=a_very_secret_key_that_you_make_up
        ```
    *(Remember to add `.env` to your `.gitignore` file!)*

3.  **Install Backend Dependencies:**
    ```sh
    npm install
    ```

4.  **Run the Backend Server:**
    ```sh
    node backend.js
    ```
    *You should see `Server is running on http://localhost:5000` in your terminal. Leave this terminal running.*

---

### **Step 2: Frontend Setup (in a new terminal)**

1.  **Open a new terminal.**
2.  **Navigate to the Client Folder:**
    ```sh
    cd inventory-client
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    npm install
    ```

4.  **Run the Frontend App:**
    ```sh
    npm start
    ```
    *Your browser should automatically open to `http://localhost:3000`, and you can now use the application.*
    *(Note: The code already includes Tailwind CSS. If styling is missing, follow the setup in the `frontend.jsx` file to re-install it).*
