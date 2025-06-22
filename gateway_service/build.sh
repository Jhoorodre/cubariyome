#!/bin/bash
# build.sh - Script de build para Vercel

echo "🔧 Configurando Django para Vercel..."

# Instalar dependências
pip install -r requirements.txt

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

echo "✅ Build concluído!"
