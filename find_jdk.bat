@echo off
echo Buscando javac.exe en el sistema...
where /R "C:\Program Files" javac.exe 2>nul
where /R "C:\Program Files (x86)" javac.exe 2>nul
echo Verificando variable JAVA_HOME:
echo %JAVA_HOME%
echo Verificando PATH:
echo %PATH%
echo Hecho.
