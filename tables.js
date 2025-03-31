const pool = require ('./database')

console.log('Verificando se as tabelas já existem, caso não existam serão inseridas.')
const criarTabelas = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        cnpj VARCHAR(14) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      );
    `);
  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS centros_de_custo (
        identificador VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      );
    `);
  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colaboradores (
        cpf VARCHAR(11) PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        sobrenome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255),
        matricula VARCHAR(255),
        empresa_cnpj VARCHAR(14) REFERENCES empresas(cnpj),
        centro_custo_identificador VARCHAR(255) REFERENCES centros_de_custo(identificador)
      );
    `);
  };
  
  module.exports = {
    criarTabelas
  };