#!/bin/bash

# Navega para o diretório do serviço de gateway (backend Django)
echo "Navegando para o diretório gateway_service..."
cd gateway_service

# Instala as dependências listadas no requirements.txt do gateway_service
echo "Instalando dependências do Python..."
pip install -r requirements.txt

# Coleta arquivos estáticos para o diretório STATIC_ROOT configurado no settings.py
# --noinput evita prompts interativos durante a coleta.
echo "Coletando arquivos estáticos do Django..."
python manage.py collectstatic --noinput

# Executa as migrações do banco de dados.
# --noinput evita prompts interativos durante as migrações.
echo "Aplicando migrações do banco de dados Django..."
python manage.py migrate --noinput

# Retorna ao diretório raiz (opcional, mas boa prática)
cd ..
