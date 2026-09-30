Write-Host "== Git Repository Setup ==" -ForegroundColor Cyan
Write-Host ""

# Check .githooks folder
if (-not (Test-Path ".githooks")) {
    Write-Host "❌ Folder .githooks tidak ditemukan!" -ForegroundColor Red
    Write-Host "Pastikan Anda menjalankan script ini dari root repository." -ForegroundColor Yellow
    exit 1
}

# Enable Git hooks
git config core.hooksPath .githooks | Out-Null

Write-Host "✅ Git hooks installed." -ForegroundColor Green
Write-Host ""

# Get current Git config
$currentName = git config user.name
$currentEmail = git config user.email

if (-not $currentName) { $currentName = "<not set>" }
if (-not $currentEmail) { $currentEmail = "<not set>" }

Write-Host "Identitas Git lokal saat ini:" -ForegroundColor Cyan
Write-Host "Username : $currentName"
Write-Host "Email    : $currentEmail"
Write-Host ""

Write-Host "Format username yang digunakan adalah firstname.lastname" -ForegroundColor Yellow
Write-Host "Contoh: ahmad.andrianto"
Write-Host ""

Write-Host "Apabila format belum sesuai, silakan lakukan konfigurasi berikut."
Write-Host ""

# -----------------------------
# Ask user
# -----------------------------
$answer = Read-Host "Atur identitas untuk repositori ini?? (y/N)"

if ($answer -match '^[Yy]$') {

    # -------------------------
    # Username validation
    # -------------------------
    while ($true) {
        $name = Read-Host "Masukkan username (firstname.lastname)"

        if ($name -match '^[a-z]+(\.[a-z]+)+$') {
            break
        } else {
            Write-Host "❌ Format salah! Gunakan firstname.lastname" -ForegroundColor Red
        }
    }

    # -------------------------
    # Email validation
    # -------------------------
    while ($true) {
        $email = Read-Host "Masukkan email"

        if ($email -match '^[^@\s]+@[^@\s]+\.[^@\s]+$') {
            break
        } else {
            Write-Host "❌ Format email tidak valid!" -ForegroundColor Red
        }
    }

    # -------------------------
    # Save config (local repo)
    # -------------------------
    git config user.name "$name" | Out-Null
    git config user.email "$email" | Out-Null

    Write-Host ""
    Write-Host "✅ Identitas Git berhasil diperbarui." -ForegroundColor Green
}

# -----------------------------
# Final summary
# -----------------------------
Write-Host ""
Write-Host "Setup selesai!" -ForegroundColor Green
Write-Host ""
Write-Host "Konfigurasi akhir:"
Write-Host "Hooks Path : $(git config core.hooksPath)"
Write-Host "Name       : $(git config user.name)"
Write-Host "Email      : $(git config user.email)"