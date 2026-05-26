@echo off
setlocal EnableDelayedExpansion

echo === Buscando JDK instalado ===

REM Buscar Microsoft OpenJDK
for /d %%d in ("C:\Program Files\Microsoft\jdk-17*") do (
    if exist "%%d\bin\javac.exe" (
        set "JAVA_HOME=%%d"
        echo Encontrado: %%d
        goto :found
    )
)

REM Buscar Eclipse Adoptium
for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do (
    if exist "%%d\bin\javac.exe" (
        set "JAVA_HOME=%%d"
        echo Encontrado: %%d
        goto :found
    )
)

REM Buscar Oracle JDK
for /d %%d in ("C:\Program Files\Java\jdk*") do (
    if exist "%%d\bin\javac.exe" (
        set "JAVA_HOME=%%d"
        echo Encontrado: %%d
        goto :found
    )
)

echo ERROR: No se encontro un JDK instalado.
echo Por favor instala un JDK desde https://adoptium.net
exit /b 1

:found
echo JAVA_HOME configurado en: %JAVA_HOME%
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Verificando javac:
javac -version

echo.
echo === Compilando backend con Maven ===
cd backend
call mvnw.cmd compile -DskipTests > ..\build_output.txt 2>&1
if errorlevel 1 (
    echo BUILD FAILED - Ver build_output.txt
    type ..\build_output.txt
) else (
    echo BUILD SUCCESS
)
cd ..
endlocal
