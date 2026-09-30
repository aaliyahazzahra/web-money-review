#!/usr/bin/env bash

set -e

GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RED='\033[1;31m'
NC='\033[0m'

echo -e "${CYAN}== Git Repository Setup ==${NC}"
echo

# Check Git hooks folder
if [ ! -d ".githooks" ]; then
    echo -e "${RED}❌ Folder .githooks tidak ditemukan!${NC}"
    exit 1
fi

# Enable Git hooks
chmod +x .githooks/* 2>/dev/null || true
git config core.hooksPath .githooks

echo -e "${GREEN}✅ Git hooks installed.${NC}"
echo

# Get current Git config
current_name=$(git config user.name)
current_email=$(git config user.email)

echo -e "${CYAN}Identitas Git lokal saat ini:${NC}"
echo "Username : ${current_name:-<not set>}"
echo "Email    : ${current_email:-<not set>}"
echo
echo -e "Format username yang digunakan adalah ${YELLOW}firstname.lastname${NC}"
echo "Contoh: ahmad.andrianto"
echo
echo "Apabila format username dan email Anda saat ini masih belum sesuai, mohon diatur pada langkah berikut."
echo

read -p "Atur identitas untuk repositori ini? (y/N): " answer

if [[ "$answer" =~ ^[Yy]$ ]]; then

    while true; do
        read -p "Masukkan username: " name

        if [[ "$name" =~ ^[a-z]+(\.[a-z]+)+$ ]]; then
            break
        else
            echo -e "${RED}❌ Format salah. Gunakan format: firstname.lastname${NC}"
        fi
    done

    while true; do
        read -p "Masukkan email   : " email

        if [[ "$email" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; then
            break
        else
            echo -e "${RED}❌ Format email tidak valid.${NC}"
        fi
    done

    git config user.name "$name"
    git config user.email "$email"

    echo
    echo -e "${GREEN}✅ Identitas Git berhasil diperbarui.${NC}"
fi

echo
echo -e "${GREEN}Setup selesai!${NC}"
echo
echo "Konfigurasi akhir:"
echo "Hooks Path : $(git config core.hooksPath)"
echo "Username   : $(git config user.name)"
echo "Email      : $(git config user.email)"