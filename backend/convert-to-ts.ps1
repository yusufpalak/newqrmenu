$files = Get-ChildItem -Path ".\src" -Recurse -Filter "*.ts"

$count = 0
foreach ($file in $files) {
    Write-Host "Converting: $($file.Name)"
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Convert require() to import
    $content = $content -replace "const\s*\{([^}]+)\}\s*=\s*require\('([^']+)'\);", 'import { $1 } from ''$2'';'
    $content = $content -replace "const\s+(\w+)\s*=\s*require\('([^']+)'\);", 'import $1 from ''$2'';'
    
    # Convert module.exports to export
    $content = $content -replace "module\.exports\s*=\s*", 'export default '
    $content = $content -replace "^\s*(class|function|const|let|var|interface|type|enum)\s+", 'export $1 '
    
    # Remove .js extensions from imports
    $content = $content -replace "from\s+'([^']+)\\.js';", "from '`$1';"
    
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    $count++
}

Write-Host "`n✅ Successfully converted $count TypeScript files!"
