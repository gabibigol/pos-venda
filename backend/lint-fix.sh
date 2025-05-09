#!/bin/bash

# Função para adicionar nova linha no final do arquivo
add_newline_to_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        # Verifica se o arquivo não termina com uma nova linha
        if [[ -n "$(tail -c1 "$file")" ]]; then
            echo "" >> "$file"
        fi
    fi
}

# Corrigir trailing spaces e adicionar novas linhas
find . -type f -name "*.js" | while read -r file; do
    # Remove trailing spaces
    sed -i 's/[[:space:]]*$//' "$file"
    
    # Adiciona nova linha no final do arquivo
    add_newline_to_file "$file"
done

# Executar ESLint fix
npx eslint . --ext .js --fix

# Corrigir arquivos específicos que podem ter problemas
sed -i 's/const Op = Sequelize.Op;/const { Op } = require("sequelize");/g' src/services/ReportService.js
sed -i 's/const ServiceOrder = require(.*);//g' src/services/ReportService.js

# Remover variáveis não utilizadas em testes
sed -i '/const testUser = /d' tests/auth.test.js
sed -i '/const inactiveUser = /d' tests/auth.test.js
sed -i '/const mockNext = /d' tests/financial/financialController.test.js
sed -i '/const mockNext = /d' tests/reportController.test.js
sed -i '/const FinancialTransaction = /d' tests/financial.integration.test.js

# Adicionar tratamento de erros e validações
echo "Lint fix concluído. Código padronizado automaticamente."
