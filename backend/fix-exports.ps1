$ErrorActionPreference = 'Continue'
$files = Get-ChildItem -Path ".\src" -Recurse -Filter "*.ts"

$count = 0
foreach ($file in $files) {
    Write-Host "Fixing: $($file.Name)"
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Fix: class X -> export class X (but not if already has export)
    $content = $content -replace "(?<!\bexport\s)(?<!\bmodule\.)(?<!\bimport\s)(\r?\n)(\s*)(@Injectable\(\)|@Module\(|@Controller\(|@Guard\(|@Pipe\(|@Decorator\()\r?\n(\s*)class\s", "`$1`$2`$3`$4export class "
    
    # Simpler approach: add export before @Injectable, @Module, @Controller, etc.
    $content = $content -replace "(@Injectable\(\))\r?\n(\s*)class\s", "`$1`$2export class "
    $content = $content -replace "(@Module\(\{)\r?\n(\s*)class\s", "`$1`$2export class "
    $content = $content -replace "(@Controller\([^)]*\))\r?\n(\s*)class\s", "`$1`$2export class "
    $content = $content -replace "(@Injectable\(\))\r?\n(\s*)class\s", "`$1`$2export class "
    $content = $content -replace "(?<!export\s)class\s+(AuthService|UsersService|TenantsService|CategoriesService|SubCategoriesService|ProductsService|CurrenciesService|PublicService|UploadsService|TranslationRequestsService|PrismaService)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)class\s+(AuthController|UsersController|TenantsController|CategoriesController|SubCategoriesController|ProductsController|CurrenciesController|PublicController|UploadsController|TranslationRequestsController)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)class\s+(JwtAuthGuard|RolesGuard|TenantIsolationGuard)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)class\s+(CurrentUser|Roles)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)class\s+(CreateUserDto|UpdateUserDto|CreateTenantDto|UpdateTenantDto|CreateCategoryDto|UpdateCategoryDto|CreateSubCategoryDto|UpdateSubCategoryDto|CreateProductDto|UpdateProductDto|CreateCurrencyDto|UpdateCurrencyDto|CreateTranslationRequestDto|LoginDto|RegisterDto)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)class\s+(AuthModule|UsersModule|TenantsModule|CategoriesModule|SubCategoriesModule|ProductsModule|CurrenciesModule|PublicModule|UploadsModule|TranslationRequestsModule|DatabaseModule|AppModule)\b", "export class `$1"
    $content = $content -replace "(?<!export\s)(const|function)\s+(Roles|CurrentUser)\b", "export `$1 `$2"
    
    Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
    $count++
}

Write-Host "`n✅ Successfully fixed exports in $count TypeScript files!" -ForegroundColor Green
