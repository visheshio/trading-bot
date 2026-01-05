
***

# 📈 TradeBot: The Visual Trading Bot Builder

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://trading-n8n-monorepo-client-9q2irjifu.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

### 🚀 Automate Your Trading Strategy—No Code Required.

**TradeBot** is a powerful workflow automation tool inspired by **n8n**, specifically designed for financial trading.

For the uninitiated: **n8n** is a tool that lets you connect different apps together using a visual interface. This project applies that same logic to trading. Instead of writing complex code to say *"If Bitcoin hits $50k, buy Ethereum,"* users can simply drag and drop nodes to create that logic visually.

> **Note:** This project is currently in the **Architectural/UI phase**. It features a fully functional workflow engine, user management, and dashboard, but is not yet connected to live exchanges (like Binance or Coinbase). It is designed to be "Exchange Agnostic"—ready to be plugged into any API.

---

## 🛠 Tech Stack

Built with a focus on performance, scalability, and type safety using a modern monorepo structure.

*   **Frontend:** React, TypeScript, TailwindCSS
*   **UI Components:** Shadcn UI (for accessible, professional design)
*   **Backend/Database:** MongoDB Atlas (Scalable NoSQL storage)
*   **Security:** Jose (JWE/JWS for robust JSON Web Token encryption)

---

## ✨ Key Features

*   **🎨 Visual Workflow Builder:** Drag-and-drop interface to design trading algorithms. Create triggers and actions without writing a single line of code.
*   **🔐 Secure Authentication:** robust Sign-up and Sign-in flows to keep user strategies private.
*   **📊 User Dashboard:** A central hub to manage workflows, view account status, and monitor performance.
*   **📜 Execution Logging:** Detailed history of every workflow run. See exactly what happened, when it happened, and why.
*   **🌗 Themeable UI:** Built-in Dark and Light mode support for day/night trading sessions.
*   **💾 Workflow Management:** Save, Clear, Edit, and Run workflows on demand.

---

## 📸 Application Tour

### 1. The Landing Page
A clean, welcoming entry point introducing the platform.
![Landing Page](https://github.com/user-attachments/assets/4c40727f-4375-4bf4-9e3d-a52e3189caa5)

### 2. Authentication
Secure access is paramount. New users can register, and existing users are authenticated securely before accessing the dashboard.
| Sign In | Sign Up |
| :---: | :---: |
| ![Sign In](https://github.com/user-attachments/assets/25c7973b-03d9-46bb-af12-aa49da9eaf44) | ![Sign Up](https://github.com/user-attachments/assets/d2a1dd88-6a6e-4b95-b471-c8f533eddd7a) |

### 3. The Dashboard
The command center. If you are new, it's a clean slate. Once you start building, this populates with your active trading bots and their statuses.
![Dashboard](https://github.com/user-attachments/assets/9d3bc5cb-c6f6-4279-946e-db5d1e4ab4c2)

### 4. Visual Workflow Editor (The Core)
This is where the magic happens. Users can create triggers (e.g., "Every 5 minutes") and actions (e.g., "Check Price"). The UI supports full drag-and-drop capabilities.
![Workflow Editor](https://github.com/user-attachments/assets/1367e133-8c39-455a-9cbe-2c6a147a5383)

*Users can customize the interface with Dark Mode:*
![Dark Mode](https://github.com/user-attachments/assets/cceb23c9-aa25-40d1-9b59-09c78091cf4d)

### 5. Workflow Management
Manage complexity with ease. Create new workflows, modify existing ones, or clear the canvas to start fresh.
![Management](https://github.com/user-attachments/assets/8df8133a-95bf-42a6-a9b7-548bf5e3e9cc)

### 6. Execution & Logs
Transparency is key in trading. Users can drill down into specific execution logs to debug their strategies or confirm trades.
![Execution](https://github.com/user-attachments/assets/e7f550d7-cf75-4d64-95f3-55292347b59c)

*Detailed status views:*
![Status](https://github.com/user-attachments/assets/93a8c215-2cd7-464f-b33f-7d78f625399e)

---

## 🚀 Getting Started Locally

To run this application on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/trading-n8n-monorepo.git
    cd trading-n8n-monorepo
    ```

2.  **Install Dependencies:**
    ```bash
    bun install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:
    ```env
    DATABASE_URL="your_mongodb_connection_string"
    JWT_SECRET="your_secure_secret"
    ```

4.  **Run the App:**
    ```bash
    bun run dev
    ```

---

## 🗺 Roadmap

*   [x] **Core Architecture:** Workflow Engine, Auth, Database.
*   [x] **UI/UX:** Dashboard, Node Editor, Theme Support.
*   [ ] **Exchange Integration:** Connect CCXT or specific APIs (Binance, Alpaca) to allow real trades.
*   [ ] **Backtesting:** Allow users to run workflows against historical data.

---

## 🤝 Contributing

Contributions are welcome! Whether it's connecting a new exchange API, fixing a bug, or improving the UI. Please feel free to fork the repo and submit a Pull Request.

---

*Project created by [ Vishesh Maheshwari]*



