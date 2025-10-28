# MERN DevSecOps Project 🚀

### Author: Somnath Damale  
🔗 [GitHub Profile](https://github.com/i-damale)

---

## 🧠 Project Overview
The **MERN DevSecOps Project** demonstrates a full CI/CD + security-integrated delivery pipeline for a modern MERN (MongoDB, Express, React, Node) stack application.  
It shows how DevSecOps principles — security, automation, and reliability — can be embedded at every stage of the SDLC.  
The project is deployed and managed via **Jenkins** on an **AWS EC2** instance, with Docker for containerisation and multiple security scanning tools integrated.

---

## 🧩 Tech Stack

### Application Layer
- **Frontend:** React.js  
- **Backend:** Node.js + Express  
- **Database:** MongoDB  
- **Runtime:** Node.js  
- **Containerisation:** Docker + Docker Compose  

### DevSecOps Layer
- **CI/CD:** Jenkins  
- **Infrastructure:** AWS EC2 (Ubuntu)  
- **Version Control:** GitHub  
- **Security Tools:**  
  - **Trufflehog** – Detects secrets in code history  
  - **OWASP Dependency-Check** – Identifies vulnerable dependencies  
  - **SonarQube** – Code quality and static analysis  
  - **Trivy** – Docker image vulnerability scanning  
- **Artifact Management:** Docker Hub (`idamale` org)  

---

## 🏗️ Architecture Overview
```
Developer → GitHub → Jenkins (CI/CD) → Docker Build → Security Scans → Push to Docker Hub → Deploy to AWS EC2
```

- Jenkins automates the entire workflow from code checkout to deployment.  
- Each pipeline stage performs quality and security checks before building and pushing containers.  
- The EC2 instance hosts Jenkins, the Docker engine, and the deployed containers.  

---

## ⚙️ Key Features
- End-to-end automated pipeline with build, scan, and deployment stages.  
- Multiple integrated security tools (Trufflehog, OWASP, SonarQube, Trivy).  
- Dynamic Docker tagging using Jenkins parameters.  
- Automated artifact archival and HTML report publishing.  
- Secure credential handling for Docker Hub and SonarQube.  
- Clear separation between frontend and backend services with independent Dockerfiles.  

---

## 📁 Repository Structure
```
mern-devsecops-project/
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   ├── tests/
│   └── Dockerfile
│
├── frontend/                 # React.js frontend
│   ├── src/
│   ├── public/
│   └── Dockerfile
│
├── docker-compose.yml        # Multi-container configuration
├── Jenkinsfile               # Complete CI/CD + security pipeline
├── nginx.conf                # Reverse proxy configuration
└── README.md
```

---

## 🚀 Local Setup (Manual Run)

### 1. Clone the repository
```bash
git clone https://github.com/i-damale/mern-devsecops-project.git
cd mern-devsecops-project
```

### 2. Build and run with Docker Compose
```bash
docker-compose up --build
```

### 3. Access services
- Frontend → http://localhost:3000  
- Backend API → http://localhost:5000/api  
- MongoDB → configured within `docker-compose.yml`  

---

## 🧰 Jenkins Pipeline Breakdown

The `Jenkinsfile` automates every stage of development, testing, scanning, and deployment.

### **Pipeline Flow**
1. **Clean Workspace** – Ensures a fresh build environment.  
2. **Git Checkout** – Pulls the latest `main` branch from GitHub.  
3. **Install Node Dependencies** – Installs NPM packages for both frontend and backend.  
4. **Trufflehog Scan** – Scans Git history for exposed secrets and publishes an HTML report.  
5. **OWASP Dependency-Check** – Detects vulnerable libraries; results published as HTML + XML.  
6. **SonarQube Scan** – Performs static code analysis for bugs, code smells, and vulnerabilities.  
7. **Quality Gate** – Waits for SonarQube results; logs non-blocking status.  
8. **Docker Build** – Builds tagged Docker images for backend and frontend using the pipeline parameter `IMAGE_TAG_PARAM`.  
9. **Trivy Scan** – Scans Docker images for vulnerabilities and archives JSON reports.  
10. **Docker Push** – Tags and securely pushes both images to Docker Hub using Jenkins credentials.  
11. **Post Actions** – Archives all reports, logs completion, and highlights failures.

### **Security Highlights**
- Credentials (Docker Hub, SonarQube token) stored in Jenkins credential store.  
- Secrets are never hard-coded.  
- All scans produce archived HTML or JSON reports for auditing.  
- Quality gate failures are logged but do not block deployment (soft gate).

---

## ☁️ AWS Deployment Overview
- Jenkins runs on an AWS EC2 (Ubuntu) server with Docker installed.  
- Docker Compose orchestrates the backend, frontend, and MongoDB containers.  
- Nginx acts as a reverse proxy, routing requests between services.  
- Security groups restrict inbound access to required ports (80, 443, 8080).  
- Logs and artifacts are stored locally for audit and monitoring.

---

## 🛡️ DevSecOps Integrations Summary
| Tool | Purpose | Output |
|------|----------|--------|
| **Trufflehog** | Secret detection in code history | HTML report |
| **OWASP Dependency-Check** | Vulnerability scanning for dependencies | HTML + XML reports |
| **SonarQube** | Code quality and static analysis | Dashboard + quality gate |
| **Trivy** | Container vulnerability scanning | JSON reports |
| **Docker Hub** | Artifact registry for images | Tagged backend/frontend images |

---

## 📊 Future Roadmap
- Integrate **Terraform** for AWS infrastructure as code.  
- Add **Prometheus + Grafana** for system monitoring.  
- Deploy to **Kubernetes** with Helm for scalable environments.  
- Implement **blue-green** or **canary deployments** for zero downtime.  
- Add **Slack/Email notifications** for build and scan summaries.

---

## 📜 License
Licensed under the **MIT License**.

---

🔗 [GitHub: i-damale](https://github.com/i-damale)

---

*“From Code to Cloud — Securely Automating the MERN Stack.”*
