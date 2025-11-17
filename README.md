# FREELANCER CRM  
A simple and efficient CRM for freelancers to manage clients, projects, and tasks — built with **Django** and **Django REST Framework (DRF)** as the backend and **React/Vite** as the frontend

---

## 🚀 Features
- 👤 **User Registration & Authentication** (JWT authentication)
- 🧾 **Client Management** (create, list, update,delete)
- 📁 **Project Management** (create, assign to client, update, delete)
- 🔐 **Secure API endpoints**
- ⚙️ **RESTful design using DRF ViewSets + Routers**

---

## 🛠️ Tech Stack
- **Python 3**
- **Django**
- **Django REST Framework (DRF)**
- **SimpleJWT** for authentication
- **PostgreSQL** 
- **React/Vite**

---

## 📂 Project Structure
```
FREELANCER_CRM/
│── gitignore
│── .env
│── manage.py
│── Procfile
│── requirements.txt
│── crm/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── register.py
│   ├── tests/
│── crm_project/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│── freelancer-crm-ui/

```

---

## 🔑 API Authentication (JWT)
The API uses **JSON Web Tokens** with SimpleJWT.

### Obtain Token  
POST → `/api/auth/token/`

Body:
```json
{
  "username": "yourusername",
  "password": "yourpassword"
}
```

### Refresh Token  
POST → `/api/auth/refresh/`

---

## 👤 User Registration
Endpoint for new user signup:

POST → `/api/register/`

Body:
```json
{
  "username": "newuser",
  "password": "password123"
}
```

---

## 👥 Clients API

### List Clients  
GET → `/api/clients/`

### Create Client  
POST → `/api/clients/`

Example Body:
```json
{
  "name": "John Doe",
  "phone": "0712345678",
  "company": "Nairobi"
}
```

---

## 📁 Projects API

### List Projects  
GET → `/api/projects/`

### Create Project  
POST → `/api/projects/`

Example Body:
```json
{
  "title": "Website Design",
  "status": "Active",
  "client": 1
}
```

---

## 🧭 URLs Overview

### **Main URLs (`FREELANCER_CRM/urls.py`)**
```

/api/
/api/auth/token/
/api/auth/refresh/
```

### **CRM App URLs (`crm/urls.py`)**
```
/clients/
/projects/
/register/
```

All automatically routed using `DefaultRouter`.

---

## ▶️ Running the Project Locally

### START VIRTUAL ENVIRONMENT(IF PY IS INSTALLED IN A VIRTUAL ENV) ON UBUNTU/(OTHER):
`source myenv/bin/activate`

### START POSTGRES SERVER ON UBUNTU:
`sudo service postgresql start`

### 1️⃣ Install dependencies  
```
pip install -r requirements.txt
```

### 2️⃣ Run migrations  
```
python manage.py migrate
```
### (Optional) Run tests for Backend
```
pytest
```

### 3️⃣ Start server  
```
python manage.py runserver
```

### 4️⃣ cd into the Frontend
```
cd freelnacer-crm-ui
```

### 5️⃣ Install Dependencies
```
npm i
```

### 6️⃣ Run the Dev Server
```
npm run dev
```

### 7️⃣ Open in Browser
Go to the URL shown in the terminal (usually http://localhost:5173) to see the app live.

---

## 🤝 Contributing
Contributions are welcome!  
Feel free to open issues or submit pull requests.

---

## 📜 License
This project is licensed under the **MIT License**.


