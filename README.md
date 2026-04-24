# Expense Tracker (INR)A production-grade Minitab Expense Tracker built with the MERN stack, focusing on data integrity, precision handling of currency, and network resilience.🚀 
# Live DemoFrontend: 'https://expense-tracker-gl5h.vercel.app/'
# Backend: https://expense-tracker-git-main-smkaif12s-projects.vercel.app
# 🛠 Tech Stack
- Frontend: React.js, Bootstrap 5 (Styling)
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- State Management: React Hooks (Lifting State Up pattern)✨ 
# Key Features & Logic 
- 1. Financial Precision (Money Handling)Decimal128: Used MongoDB's Decimal128 type for the amount field. This avoids the "binary floating-point" errors common in JavaScript (e.g., $0.1 + 0.2 \neq 0.3$).INR Formatting: All currency displays use Intl.NumberFormat('en-IN') to ensure professional Indian Rupee formatting (e.g., ₹1,00,000.00).
- 2. Network Resilience (Realistic Conditions)Idempotency: Implemented X-Idempotency-Key using UUIDs. This ensures that if a user clicks "Save" multiple times due to a slow network, only one record is created in the database.Loading States: UI includes spinners and disabled buttons during API calls to prevent redundant requests and improve UX.
- 3. Data Integrity & UXLifting State Up: Synchronized the "Add Expense" and "Show Expenses" components through a shared parent state, ensuring the list refreshes automatically upon entry.Filtering & Sorting: Supports server-side filtering by Category and sorting by Date (Newest First by default) to handle large datasets efficiently.