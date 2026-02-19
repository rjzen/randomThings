# HobbyHub (randomThings)

HobbyHub is a full-stack personal dashboard designed to help users organize and manage their hobbies, projects, and personal data. It features a responsive React frontend and a powerful Django backend, providing a seamless and customizable user experience.

## ✨ Features

-   **User Authentication**: Secure user login/logout with JWT-based authentication.
-   **Dynamic Theming**: Create and switch between multiple color themes to personalize the application's appearance. The selected theme is applied across the entire UI.
-   **Dashboard**: A central hub displaying an overview of recent activities and key metrics.
-   **Profile Management**: Users can view and edit their profile information, including personal details and an avatar.
-   **Photo Gallery**: An interactive gallery to upload, view, edit, and delete photos, with multiple layout options (grid, carousel, details).
-   **Calendar & Tasks**: A full-featured calendar to manage tasks. Users can create, update, delete, and toggle the completion status of tasks.
-   **Activity Feed**: Tracks user actions such as theme changes, profile updates, photo uploads, and task management.
-   **Responsive Design**: A modern interface with a collapsible sidebar, ensuring a great experience on both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Frontend**:
    -   React (with Vite)
    -   React Router
    -   TailwindCSS
    -   Axios
-   **Backend**:
    -   Django
    -   Django REST Framework
    -   Simple JWT (for token authentication)
-   **Database**:
    -   SQLite3 (for development)

## 📂 Project Structure

The repository is organized as a monorepo with two main directories:

```
/
├── backend/     # Django & Django REST Framework application
└── frontend/    # React (Vite) & TailwindCSS application
```

## 🚀 Getting Started

To get the project running locally, follow the steps below.

### Prerequisites

-   Python 3.8+ and Pip
-   Node.js and npm

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```sh
    # For Unix/macOS
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**
    *(Note: A `requirements.txt` file should be generated from the project's dependencies, including `Django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, and `Pillow`)*
    ```sh
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    ```sh
    python manage.py migrate
    ```

5.  **Run the development server:**
    ```sh
    python manage.py runserver
    ```
    The backend will be available at `http://localhost:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## ⚙️ API Endpoints

The backend exposes several RESTful endpoints to support the application's features:

-   `/api/auth/`: Handles user authentication (login, logout, token refresh).
-   `/api/profile/`: Manages user profiles, themes, and activity logs.
-   `/api/gallery/`: Powers the photo gallery features (upload, list, delete).
-   `/api/calendar/`: Manages tasks for the calendar.