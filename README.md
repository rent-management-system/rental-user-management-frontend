# Rental User Management Frontend

This is the frontend application for the Rental User Management System. It provides user authentication (login, signup, Google OAuth), profile management, and role-based dashboards for tenants, landlords, and administrators.

## Features

-   **User Authentication:** Secure login and registration with email/password.
-   **Google OAuth:** Seamless sign-in using Google accounts.
-   **Role-Based Dashboards:** Different dashboards for Tenants, Landlords, and Admins.
-   **User Profile Management:** View and edit user profile information, including profile photos.
-   **Internationalization (i18n):** Support for multiple languages (English, Amharic, Afaan Oromo).
-   **Theme Toggling:** Light and dark mode support.
-   **Responsive Design:** Optimized for various screen sizes.
-   **Error Handling:** Robust error boundaries and toast notifications for user feedback.

## Technologies Used

-   **React:** Frontend library for building user interfaces.
-   **TypeScript:** Statically typed superset of JavaScript.
-   **Vite:** Fast frontend build tool.
-   **Tailwind CSS:** Utility-first CSS framework for styling.
-   **React Router DOM:** Declarative routing for React.
-   **Zustand:** Small, fast, and scalable bear-bones state-management solution.
-   **Axios:** Promise-based HTTP client for API requests.
-   **Sonner:** An opinionated toast component for React.
-   **i18next & React-i18next:** Internationalization framework.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/rental-user-management-frontend.git
    cd rental-user-management-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```
    VITE_API_BASE_URL=https://rent-managment-system-user-magt.onrender.com/api/v1
    VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    ```
    Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google OAuth Client ID obtained from the Google Cloud Console.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production-ready build.

## Project Structure

```
.env
.gitignore
index.html
package.json
...
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── auth/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── profile/
│   └── ui/
├── hooks/
├── lib/
├── locales/
├── pages/
├── providers/
└── types/
```

## Contributing

Feel free to fork the repository, make changes, and submit pull requests. Please ensure your code adheres to the existing style and conventions.

## License

[Specify your license here, e.g., MIT License]



