@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")
@SET MAVEN_WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%~dp0.mvn\wrapper\maven-wrapper.properties
@SET MVNW_REPOURL=

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    @IF "%%A"=="distributionUrl" SET "DISTRIBUTION_URL=%%B"
    @IF "%%A"=="wrapperUrl" SET "WRAPPER_URL=%%B"
)

@SET MAVEN_USER_HOME=%USERPROFILE%\.m2
@SET MAVEN_HOME=

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
    @IF "%%A"=="distributionUrl" SET "DISTRIBUTION_URL=%%B"
)

@SET DISTRIBUTION_URL_NAME=
@FOR %%F IN ("%DISTRIBUTION_URL%") DO SET "DISTRIBUTION_URL_NAME=%%~nxF"
@SET DISTRIBUTION_URL_NAME=%DISTRIBUTION_URL_NAME:-bin.zip=%

@SET MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\%DISTRIBUTION_URL_NAME%

@IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" GOTO run_maven
@IF EXIST "%MAVEN_HOME%\bin\mvn" GOTO run_maven

@ECHO Downloading Maven from %DISTRIBUTION_URL%
@CALL powershell -Command "& { $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%MAVEN_USER_HOME%\wrapper\dists\maven.zip' -UseBasicParsing }"
@IF NOT EXIST "%MAVEN_USER_HOME%\wrapper\dists\" MKDIR "%MAVEN_USER_HOME%\wrapper\dists\"
@CALL powershell -Command "& { Expand-Archive -Path '%MAVEN_USER_HOME%\wrapper\dists\maven.zip' -DestinationPath '%MAVEN_USER_HOME%\wrapper\dists\' -Force }"
@DEL "%MAVEN_USER_HOME%\wrapper\dists\maven.zip"

:run_maven
@"%MAVEN_HOME%\bin\mvn.cmd" %*
