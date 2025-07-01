# RAFAL E-commerce Backend

This is the backend API for the RAFAL Electric E-commerce platform. It provides all the necessary endpoints for the frontend to interact with the database and handle business logic.

## Features

- **User Management**:
  - Custom user model with phone-based authentication
  - JWT authentication for secure API access
  - Address management for shipping and billing
  - Wishlist functionality

- **Product Management**:
  - Categories with multiple image types (main, wall, category)
  - Detailed product information with specifications
  - Color options with hex values and color-specific images
  - Product features and tags
  - Review system

- **Order System**:
  - Shopping cart with session support
  - Complete checkout process
  - Order history and detailed order tracking
  - Order timeline for status updates

- **Payment Processing**:
  - Support for multiple payment providers (Paymob, Fawry, Aman)
  - Payment verification and webhook handling
  - Secure payment intent creation

- **Advertisement System**:
  - Banner management with scheduling options
  - Priority-based display

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL (recommended) or SQLite
- Redis (for Celery)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rafal-backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Docker Setup

Alternatively, you can use Docker to run the application:

1. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

2. Run migrations:
   ```bash
   docker-compose exec web python manage.py migrate
   ```

3. Create a superuser:
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Main API Endpoints

- **Authentication**:
  - `POST /api/users/register/`: Register a new user
  - `POST /api/users/token/`: Get JWT token
  - `POST /api/users/token/refresh/`: Refresh JWT token

- **User Management**:
  - `GET /api/users/profile/me/`: Get current user profile
  - `PUT /api/users/profile/me/`: Update user profile
  - `GET /api/users/addresses/`: List user addresses
  - `POST /api/users/addresses/`: Create a new address

- **Products**:
  - `GET /api/products/categories/`: List all categories
  - `GET /api/products/`: List all products
  - `GET /api/products/{id}/`: Get product details
  - `GET /api/products/featured/`: Get featured products
  - `GET /api/products/best_sellers/`: Get best seller products
  - `GET /api/products/offers/`: Get products on offer

- **Cart & Orders**:
  - `GET /api/orders/cart/current/`: Get current cart
  - `POST /api/orders/cart-items/add_to_cart/`: Add item to cart
  - `POST /api/orders/checkout/`: Process checkout
  - `GET /api/orders/history/`: Get order history

- **Payments**:
  - `POST /api/payments/payment_checker/`: Initialize payment
  - `POST /api/payments/verify/`: Verify payment status

- **Advertisements**:
  - `GET /api/ads/`: Get active advertisements

## License

This project is proprietary and owned by RAFAL Electric / New Way Electric Company.