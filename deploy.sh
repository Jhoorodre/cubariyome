#!/bin/bash

# 🚀 Deploy Script - CubariYome
echo "🚀 CubariYome Deploy Helper"
echo "=========================="
echo ""

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "� Deploy Steps:"
echo ""
echo "1. BACKEND:"
echo "   cd gateway_service && vercel --prod"
echo ""
echo "2. FRONTEND:"
echo "   cd .. && vercel --prod"
echo ""
echo "3. Configure REACT_APP_API_URL no Vercel Dashboard"
echo ""

echo "⚙️ Required Environment Variables:"
echo ""
echo "Backend (.env):"
echo "- DJANGO_SECRET_KEY"
echo "- SUWAYOMI_API_URL"
echo "- SUWAYOMI_BASE_URL"
echo ""
echo "Frontend (Vercel):"
echo "- REACT_APP_API_URL"
echo ""

echo "� More details: gateway_service/README.md"
