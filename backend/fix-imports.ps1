$files = Get-ChildItem -Path ".\src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    # Remove .js from imports
    $content = $content -replace "from\s+'([^']*)\.js';", "from '`$1';"
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
}

Write-Host "✅ Removed .js extensions from all imports"
