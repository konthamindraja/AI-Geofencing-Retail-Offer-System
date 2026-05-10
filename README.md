# AI-Geofencing Retail Offer & POS Dashboard 🚀

A sophisticated Retail POS Dashboard featuring real-time AI-driven geofencing, personalized offer recommendations, and a seamless offer claiming system.

## 🌟 Key Features

- **📍 Real-time Geofencing**: Automatically detects when a customer enters a 100-meter radius of any store.
- **🤖 AI-Driven Recommendations**: Uses CrewAI and large language models to analyze purchase history and generate personalized offers.
- **💰 Smart Discount Engine**: Tiered discount categories (up to 30% OFF) based on customer loyalty and purchase frequency.
- **🤝 Offer Claiming System**: Customers can "Claim" offers when near a store and "Redeem" them during purchase.
- **🗺️ Interactive Map**: Integrated Leaflet map showing 7 store locations across Hyderabad and real-time customer movement.
- **🛍️ Product Catalog**: Full product list with pricing in Indian Rupees (₹), showing personalized savings for each customer.
- **📊 Customer Logs**: Detailed view of purchase history, identified interests, and active discount calculations.
- **🔐 User Authentication**: Secure login/signup system with personalized dashboard views.
- **🚶 Auto-Tracking Simulation**: Fully automatic mode that simulates a customer walking between stores to demonstrate the AI geofence triggers.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS, Leaflet Maps, Lucide Icons, Axios.
- **Backend**: FastAPI (Python), Pandas for data processing.
- **AI Engine**: CrewAI for multi-agent collaboration and personalized offer generation.
- **Database**: CSV-based data storage for stores, customers, and transactions.

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/nikhitha2807/AI-Geofencing-Retail-Offer-System.git
cd AI-Geofencing-Retail-Offer-System
```

### 2. Backend Setup
```bash
cd backend
pip install fastapi uvicorn pandas crewai geopy
uvicorn api.api:app --reload
```
*Backend runs at `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd retail-dashboard
npm install
npm start
```
*Frontend runs at `http://localhost:3000`*

## 📁 Project Structure

- `/frontend`: React source code, components (Map, Catalog, Logs, Simulator).
- `/backend/api`: FastAPI endpoints for geofencing, offers, and claims.
- `/backend/data`: Dataset for stores, customers, and purchase history.
- `/backend/retail_agent`: CrewAI configuration for the recommendation agents.

## 📸 Dashboard Preview
The dashboard includes a high-quality landing page with video background, a live map tracking system, and a detailed product inventory with smart pricing.

---
Created with ❤️ for the KLHH Hackathon.
