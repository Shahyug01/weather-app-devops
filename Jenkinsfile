pipeline {
    agent any

    tools {
        maven 'Maven'
    }

    environment {
        IMAGE_NAME = 'yugshah0109/weather-app'
        IMAGE_TAG = '1.0'
        APP_PORT = '8081'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Start Weather App') {
            steps {
                powershell '''
                    $jar = Get-ChildItem "target\\*.jar" |
                           Where-Object { $_.Name -notlike "*original*" } |
                           Select-Object -First 1

                    if (-not $jar) {
                        throw "Application JAR not found in target folder."
                    }

                    Write-Host "Starting application: $($jar.FullName)"

                    $process = Start-Process `
                        -FilePath "java" `
                        -ArgumentList "-jar `"$($jar.FullName)`" --server.port=8081" `
                        -PassThru `
                        -RedirectStandardOutput "app.log" `
                        -RedirectStandardError "app-error.log"

                    Set-Content -Path "app.pid" -Value $process.Id

                    Write-Host "Application PID: $($process.Id)"

                    $ready = $false

                    for ($i = 0; $i -lt 30; $i++) {
                        Start-Sleep -Seconds 2

                        try {
                            $response = Invoke-WebRequest `
                                -Uri "http://localhost:8081" `
                                -UseBasicParsing `
                                -TimeoutSec 2

                            if ($response.StatusCode -eq 200) {
                                $ready = $true
                                Write-Host "Weather App is running on port 8081."
                                break
                            }
                        }
                        catch {
                            Write-Host "Waiting for application..."
                        }
                    }

                    if (-not $ready) {
                        Write-Host "Application output:"
                        Get-Content "app.log" -ErrorAction SilentlyContinue

                        Write-Host "Application errors:"
                        Get-Content "app-error.log" -ErrorAction SilentlyContinue

                        throw "Weather App did not start on port 8081."
                    }
                '''
            }
        }

        stage('Selenium Tests') {
            steps {
                bat 'mvn test'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat '''
                        echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin
                        docker push %IMAGE_NAME%:%IMAGE_TAG%
                    '''
                }
            }
        }
    }

    post {
        always {
            powershell '''
                if (Test-Path "app.pid") {
                    $pid = Get-Content "app.pid"

                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "Weather App stopped."
                    }
                    catch {
                        Write-Host "Application process already stopped."
                    }
                }
            '''

            echo 'Pipeline completed.'
        }
    }
}