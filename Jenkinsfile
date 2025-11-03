pipeline {
    agent any

    // Updated 3rd November 2025 ⚠️ PARAMETER: The parameter 'IMAGE_TAG_PARAM' MUST be defined in the Jenkins UI.

    environment {
        // --- SonarQube / Scanning Credentials ---
        SCANNER_HOME = tool name: 'SonarScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
        SONAR_AUTH_TOKEN = credentials('sonarqube')
        SONAR_HOST_URL = 'http://65.1.190.76:9000'
        
        // --- Docker Hub Configuration ---
        DOCKER_HUB_ORG = 'idamale' // <-- 🚨 CHANGE THIS TO YOUR USERNAME/ORG!
        
        // Define repository names (corrected from previous error logs)
        BACKEND_REPO = 'mern-loparser-backend'
        FRONTEND_REPO = 'mern-loparser-frontend'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Git Checkout') {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/i-damale/mern-devsecops-project.git'
            }
        }

        stage('Install Node Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                sh 'cd backend && npm install'
                echo 'Installing frontend dependencies...'
                sh 'cd frontend && npm install'
            }
        }

        stage('Trufflehog Scan') {
            steps {
                sh 'docker run gesellix/trufflehog --json https://github.com/i-damale/mern-devsecops-project.git > trufflehog.json'

                script {
                    sh 'mkdir -p scanresults'
                    def jsonReport = readFile('trufflehog.json')
                    def htmlReport = """
                        <html><head><title>Trufflehog Scan Report</title></head>
                        <body><h1>Trufflehog Scan Report</h1><pre>${jsonReport}</pre></body>
                        </html>
                    """
                    writeFile file: 'scanresults/trufflehog-report.html', text: htmlReport
                }

                archiveArtifacts artifacts: 'scanresults/trufflehog-report.html', allowEmptyArchive: true

                publishHTML([
                    allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true,
                    reportDir: 'scanresults', reportFiles: 'trufflehog-report.html',
                    reportName: 'Trufflehog Report'
                ])
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                echo 'Running OWASP Dependency Check scan...'
                dependencyCheck additionalArguments: '--scan . --format ALL', odcInstallation: 'Default'

                archiveArtifacts artifacts: 'dependency-check-report.html, dependency-check-report.xml, dependency-check-jenkins.html', allowEmptyArchive: true

                dependencyCheckPublisher pattern: 'dependency-check-report.xml'

                publishHTML([
                    allowMissing: false, alwaysLinkToLastBuild: true, keepAll: true,
                    reportDir: '.', reportFiles: 'dependency-check-report.html',
                    reportName: 'OWASP Dependency Check Report'
                ])
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('MySonarQubeServer') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \\
                        -Dsonar.projectKey=mern-devsecops-project \\
                        -Dsonar.sources=. \\
                        -Dsonar.host.url=${SONAR_HOST_URL} \\
                        -Dsonar.login=${SONAR_AUTH_TOKEN}
                    """
                }
            }
        }

        // 🟢 Soft Quality Gate (5-minute timeout, non-blocking failure)
        stage('SonarQube Quality Gate') {
            steps {
                script {
                    try {
                        timeout(time: 5, unit: 'MINUTES') { 
                            waitForQualityGate pollingTimeoutSec: 10
                        }
                        echo '✅ SonarQube Quality Gate Passed. Continuing pipeline.'
                    } catch (Exception e) {
                        echo '⚠️ SonarQube Quality Gate FAILED or TIMED OUT. This gate is NON-BLOCKING.'
                    }
                }
            }
        }

        // 🐳 Docker Build (Uses the UI-defined parameter)
        stage('Docker Build') {
            steps {
                echo "Starting Docker builds using tag: ${params.IMAGE_TAG_PARAM}"
                sh "docker build -t ${BACKEND_REPO}:${params.IMAGE_TAG_PARAM} ./backend"
                sh "docker build -t ${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM} ./frontend"
            }
        }
        
        // 🛡️ Trivy Container Image Scanning (Outputs JSON artifacts)
        stage('Trivy Scan') {
            steps {
                script { 
                    echo "Starting Trivy vulnerability scan for images tagged: ${params.IMAGE_TAG_PARAM}"
                    sh 'mkdir -p scanresults/trivy' 

                    // Using JSON output as JUnit is not supported by Trivy
                    def trivy_args = "--severity CRITICAL,HIGH --ignore-unfixed --exit-code 0 --format json"
                    
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${trivy_args} ${BACKEND_REPO}:${params.IMAGE_TAG_PARAM} > scanresults/trivy/trivy-backend-report.json"
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${trivy_args} ${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM} > scanresults/trivy/trivy-frontend-report.json"
                }

                archiveArtifacts artifacts: 'scanresults/trivy/*.json', allowEmptyArchive: true
                echo "Trivy reports saved as JSON artifacts."
            }
        }

        // 🚀 Docker Push (Requires 'docker-hub-credentials' set up in Jenkins)
        stage('Docker Push') {
            steps {
                // Securely retrieve Docker Hub credentials
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PWD', usernameVariable: 'DOCKER_USER')]) {
                    
                    // 1. Login to Docker Hub
                    sh 'echo "$DOCKER_PWD" | docker login -u "$DOCKER_USER" --password-stdin'
                    
                    // 2. Tag Images with the full repository path (org/repo:tag)
                    sh "docker tag ${BACKEND_REPO}:${params.IMAGE_TAG_PARAM} ${DOCKER_HUB_ORG}/${BACKEND_REPO}:${params.IMAGE_TAG_PARAM}"
                    sh "docker tag ${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM} ${DOCKER_HUB_ORG}/${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM}"
                    
                    // 3. Push the tagged images
                    echo "Pushing ${DOCKER_HUB_ORG}/${BACKEND_REPO}:${params.IMAGE_TAG_PARAM} to Docker Hub..."
                    sh "docker push ${DOCKER_HUB_ORG}/${BACKEND_REPO}:${params.IMAGE_TAG_PARAM}"
                    
                    echo "Pushing ${DOCKER_HUB_ORG}/${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM} to Docker Hub..."
                    sh "docker push ${DOCKER_HUB_ORG}/${FRONTEND_REPO}:${params.IMAGE_TAG_PARAM}"
                    
                    // 4. Logout
                    sh 'docker logout'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Artifacts and reports archived.'
        }
        failure {
            echo 'Build failed. Check security scans and SonarQube Quality Gate.'
        }
    }
}
