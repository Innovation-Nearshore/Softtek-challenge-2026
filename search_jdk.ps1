# Buscar javac.exe en ubicaciones comunes
$locations = @(
    "C:\Program Files",
    "C:\Program Files (x86)",
    "C:\Users\pc\AppData\Local"
)

foreach ($loc in $locations) {
    if (Test-Path $loc) {
        $found = Get-ChildItem -Path $loc -Recurse -Filter "javac.exe" -ErrorAction SilentlyContinue
        foreach ($f in $found) {
            Write-Host "ENCONTRADO: $($f.FullName)"
        }
    }
}

# Verificar registro
$regPaths = @(
    "HKLM:\SOFTWARE\JavaSoft\Java Development Kit",
    "HKLM:\SOFTWARE\JavaSoft\JDK",
    "HKLM:\SOFTWARE\WOW6432Node\JavaSoft\Java Development Kit"
)
foreach ($reg in $regPaths) {
    if (Test-Path $reg) {
        Write-Host "Registro JDK encontrado en: $reg"
        Get-ItemProperty -Path $reg -ErrorAction SilentlyContinue | Format-List
    }
}

Write-Host "Busqueda completada."
