pipeline {
    agent any

    environment {
        IMAGE_NAME = 'yugshah0109/weather-app'
        IMAGE_TAG = '1.0'
        APP_PORT = '8081'

        // Full paths because Jenkins Windows service cannot find them automatically
        MAVEN_CMD = 'C:\\Program Files\\Apache\\Maven\\apache-maven-3.9.11\\bin\\mvn.cmd'

        DOCKER_EXE = 'C:\\Users\\91986\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                bat '''
                    "%MAVEN_CMD%" clean package -DskipTests
                '''
            }
        }

        stage('Start Weather App') {
            steps {
                powershell '''
                    $jar = Get-ChildItem "target\\*.jar" |
                           Where-Object { $_.Name -notlike "*original*" } |
                           Select-Object -First 1

                    if (-not $jar) {
                        throw "Application JAR not found."
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
                                break
                            }
                        }
                        catch {
                            # Application is still starting
                        }
                    }

                    if (-not $ready) {

                        Write-Host "Application output:"
                        Get-Content "app.log" -ErrorAction SilentlyContinue

                        Write-Host "Application error output:"
                        Get-Content "app-error.log" -ErrorAction SilentlyContinue

                        throw "Weather App did not start on port 8081."
                    }

                    Write-Host "Weather App is running on port 8081."
                '''
            }
        }

        stage('Selenium Tests') {
            steps {
                bat '''
                    "%MAVEN_CMD%" test
                '''
            }
        }

        stage('Docker Build') {
            steps {
                bat '''
                    "%DOCKER_EXE%" build -t %IMAGE_NAME%:%IMAGE_TAG% .
                '''
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
                        echo %DOCKER_PASSWORD% | "%DOCKER_EXE%" login -u %DOCKER_USERNAME% --password-stdin

                        "%DOCKER_EXE%" push %IMAGE_NAME%:%IMAGE_TAG%
                    '''
                }
            }
        }
    }

    post {

        always {

            powershell '''
                if (Test-Path "app.pid") {

                    $appPid = Get-Content "app.pid"

                    Write-Host "Stopping Weather App process: $appPid"

                    try {
                        Stop-Process `
                            -Id $appPid `
                            -Force `
                            -ErrorAction SilentlyContinue
                    }
                    catch {
                        Write-Host "Application process already stopped."
                    }
                }

                Write-Host "Pipeline execution completed."
            '''
        }
    }
}