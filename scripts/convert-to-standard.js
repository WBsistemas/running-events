#!/usr/bin/env node

/**
 * Script para converter arquivos JavaScript/TypeScript para Standard.js
 * 
 * Execução: node scripts/convert-to-standard.js
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

// Obter o diretório atual do módulo ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Diretórios para processar (relativo à raiz do projeto)
const DIRS_TO_PROCESS = ['src']

// Extensões de arquivos para processar
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']

// Função para verificar se deve processar o arquivo baseado na extensão
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return FILE_EXTENSIONS.includes(ext)
}

// Função para processar recursivamente os diretórios
function processDirectory(directory) {
  const items = fs.readdirSync(directory)
  
  for (const item of items) {
    const itemPath = path.join(directory, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory()) {
      // Ignorar node_modules e diretórios com ponto
      if (item !== 'node_modules' && !item.startsWith('.')) {
        processDirectory(itemPath)
      }
    } else if (stat.isFile() && shouldProcessFile(itemPath)) {
      processFile(itemPath)
    }
  }
}

// Alterações básicas para converter para Standard.js
function processFile(filePath) {
  console.log(`Processando: ${filePath}`)
  
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Substituir aspas duplas por aspas simples (exceto em strings que já têm aspas simples dentro)
    content = content.replace(/"([^"]*(?:[^\\]'[^"]*)*)"/g, function(match) {
      // Ignorar a substituição se a string contiver aspas simples não escapadas
      if (/'/.test(match) && !/'[^']*\\'/.test(match)) {
        return match
      }
      return match.replace(/"/g, "'")
    })
    
    // Remover ponto e vírgula no final das linhas
    content = content.replace(/;(\s*}|\s*$|\s*\/\/|\s*\n)/g, '$1')
    
    // Espaço antes dos parênteses em definições de função
    content = content.replace(/function(\w+\()/g, 'function $1')
    
    // Converter arrow functions em componentes para função normal
    content = content.replace(/const\s+(\w+)\s*=\s*\((.*?)\)\s*=>\s*{/g, 'function $1($2) {')
    
    // Escrever as alterações no arquivo
    fs.writeFileSync(filePath, content)
    
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error)
  }
}

// Função principal
function main() {
  console.log('Convertendo arquivos para Standard.js...')
  
  // Processar cada diretório especificado
  for (const dir of DIRS_TO_PROCESS) {
    const dirPath = path.resolve(process.cwd(), dir)
    if (fs.existsSync(dirPath)) {
      processDirectory(dirPath)
    } else {
      console.warn(`Diretório não encontrado: ${dirPath}`)
    }
  }
  
  // Executar ESLint com --fix para corrigir problemas
  try {
    console.log('\nExecutando ESLint --fix para corrigir problemas restantes...')
    execSync('npm run lint:fix', { stdio: 'inherit' })
    console.log('\nConversão concluída com sucesso!')
  } catch (error) {
    console.error('\nErros ESLint encontrados. Verifique os problemas manualmente.')
  }
}

// Chamada da função principal
main() 