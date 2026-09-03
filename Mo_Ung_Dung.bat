@echo off
title Order Nuoc Cong Ty
echo ========================================================
echo   DANG KHOT CHAY UNG DUNG ORDER NUOC CONG TY...
echo ========================================================
start http://localhost:5000
node server/index.js
