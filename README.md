ParkPin
ParkPin is a modern web application designed to help users locate and share parking spots with ease. Built with a full-stack TypeScript architecture, it leverages cutting-edge technologies to provide a seamless user experience.​

Features
Real-Time Parking Spot Sharing: Users can share available parking spots in real-time, helping others find parking quickly.

Interactive Map Interface: An intuitive map interface allows users to view and select parking spots effortlessly.

User Authentication: Secure login and registration system to personalize user experience.

Responsive Design: Optimized for both desktop and mobile devices.​
Stack Overflow
+2
GitHub Docs
+2
GitHub
+2

Tech Stack
Frontend: React, Vite, Tailwind CSS

Backend: Node.js, Express

Database: Drizzle ORM with PostgreSQL

Shared Utilities: TypeScript modules for consistent data handling across client and server​

Project Structure
bash
Copy
Edit
ParkPin/
├── client/             # Frontend application
├── server/             # Backend API and server logic
├── shared/             # Shared TypeScript types and utilities
├── drizzle.config.ts   # Drizzle ORM configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite bundler configuration
└── package.json        # Project metadata and scripts
Getting Started
Prerequisites
Node.js (v16 or higher)

PostgreSQL database​

Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/Preacher-leee/ParkPin.git
cd ParkPin
Install dependencies:

bash
Copy
Edit
npm install
Configure environment variables:

Create a .env file in the root directory and add the necessary environment variables:

env
Copy
Edit
DATABASE_URL=your_postgresql_connection_string
PORT=5000
Run the application:

bash
Copy
Edit
npm run dev
The application will be accessible at http://localhost:5000.

Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.​

License
This project is licensed under the MIT License.​

