# Sistema de Integração em Node.js

Este repositório contém um sistema de integração desenvolvido em Node.js, que sincroniza dados entre uma API externa e um banco de dados PostgreSQL local. O sistema verifica periodicamente a necessidade de atualizações e armazena logs detalhados sobre as operações realizadas.

## 🛠️ Requisitos

Antes de iniciar a instalação, certifique-se de que possui os seguintes requisitos:

- **PostgreSQL 17.4.1**: [Baixar aqui](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- **Node.js 23.10.0**: [Baixar aqui](https://nodejs.org/pt/download)

## ⚙️ Configuração

Siga os passos abaixo para configurar e rodar o sistema:

### 1. Instalar o PostgreSQL
Baixe e instale a versão **17.4.1** do PostgreSQL que já contém o pgAdmin 4 a partir do site oficial.

### 2. Instalar o Node.js
Baixe e instale a versão **23.10.0** do Node.js para garantir compatibilidade com a integração.

### 3. Criar o Banco de Dados
Abra o **pgAdmin 4** e crie um novo banco de dados para armazenar os dados da integração.

### 4. Configurar as Credenciais
No diretório do sistema, crie um arquivo **.env** e adicione as configurações do banco de dados criado:

```
DB_USER=seu_usuario
DB_HOST=localhost
DB_DATABASE=seu_banco_de_dados
DB_PASSWORD=sua_senha
DB_PORT=5432
```

### 5. Instalar Dependências
Execute o seguinte comando para instalar todas as dependências necessárias:

```
npm install express axios node-cron dotenv pg
```

## 🚀 Modo de Uso

Após configurar tudo corretamente, inicie o sistema executando o comando:

```
node server.js
```

O sistema irá:
- Verificar se as tabelas necessárias existem, criando-as automaticamente caso não existam.
- Sincronizar os dados entre a API e o banco de dados local a cada **15 minutos**.
- Gerar um arquivo **relatorio.txt** contendo informações sobre os registros **inseridos, atualizados e ignorados**.
- Atualizar automaticamente o banco de dados caso haja divergências nos dados recebidos da API.

## 📄 Logs e Relatórios

Os logs do sistema são organizados em:
- **Inseridos**: Novos registros adicionados ao banco de dados.
- **Atualizados**: Registros que sofreram modificações.
- **Ignorados**: Dados que foram ignorados devido a falta de informações do centro de custo.

Todos os registros de operações serão salvos no arquivo **relatorio.txt** no diretório do sistema.

---

🌟 *Sistema de Integração desenvolvido por Rodrigo Witthoeft.*

