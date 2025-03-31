const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const { inserirDados, atualizados, inseridos, ignorados, inconsistencias } = require('./insert'); // importa a função de inserirar dados, junto com os dados necessários para o relatório.
const { criarTabelas } = require('./tables'); // Importa a função de criação das tabelas
const { gerarRelatorio } = require('./report'); // Importa a função de gerar relatórios

const app = express();

// Ao iniciar na porta 3000, já executa a verificação da api
app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
  criarTabelas();
  verificarApi();
});

// Cron para reiniciar a cada 15 minutos
cron.schedule('*/15 * * * *', () => {
  console.log('Iniciando verificação automática da API...');
  verificarApi();
});

// Função para verificação dos dados da api
async function verificarApi() {
  try {
    const response = await axios.get('https://dataprovider.paytrack.com.br/data', {
      params: {
        view: 'view_colaboradores_teste_tecnico'
      },
      headers: {
        Authorization: 'Basic MjU4Mzg1NDc4NjA0NGU0YThkNDc5MWIzOTlhYTg4YWI6MGUwMWYwNDc1MzRiNGNjOGJlZjg5OWMwM2U4ZGQ2OGY=',
        Cookie: 'JSESSIONID=DFB0A1EB06770A374497CA40069CB873'
      }
    });

    // Percorrer todos os dados da api
    const dados = response.data;
    for (const dado of dados) {
      await inserirDados(dado);
    }

  } catch (error) {
    console.error(error);
  } finally {
    console.log("Verificação finalizada com sucesso");
    
    // Contabiliza as atualizações e inserções e gera o relatório 
    const atualizacoesCount = Object.keys(atualizados).length;
    const insercoesCount = Object.keys(inseridos).length;
    const ignoradosCount = Object.keys(ignorados).length;
    

    gerarRelatorio(atualizacoesCount, insercoesCount, ignoradosCount, inconsistencias);
    inconsistencias.length = 0; // Zera as inconsistências ao final de cada consulta. 

    // Zera os contadores para a próxima verificação 
    Object.keys(atualizados).forEach(key => delete atualizados[key]);
    Object.keys(inseridos).forEach(key => delete inseridos[key]);
    Object.keys(ignorados).forEach(key => delete ignorados[key]);
  }
}
