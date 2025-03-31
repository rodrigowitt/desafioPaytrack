const fs = require('fs');

// Função para gerar relatório no arquivo relatorio.txt
const gerarRelatorio = (atualizacoesCount, insercoesCount, ignoradosCount, inconsistencias = []) => {
  const dataInicio = new Date().toLocaleString(); // Pega o horário que começou a verificação
  const totalProcessados = atualizacoesCount + insercoesCount + ignoradosCount; // Soma os totais de atualizações, inserções e ignorados para trazer o total

  // Monta o relatório com o horário e as contagens
  let log = `\n===========================\n`;
  log += `Relatório de Atualizações - Iniciado em: ${dataInicio}\n`;
  log += `Foram processados um total de ${totalProcessados} registros.\n\n`;
  log += `🔹 Atualizações feitas: ${atualizacoesCount}\n`;
  log += `🔹 Inserções feitas: ${insercoesCount}\n`;
  log += `🔹 Registros ignorados: ${ignoradosCount}\n\n`;

  // Adiciona os erros ao relatório, caso existam
  if (inconsistencias.length > 0) {
    log += `⚠️ **Detalhes de possíveis erros ou inconsistências:**\n`;
    log += inconsistencias.join("\n") + "\n";
  } else {
    log += `✅ Nenhuma inconsistência foi encontrada.\n`;
  }

  log += `===========================\n`;

  // Escreve o relatório no arquivo 'relatorio.txt'
  fs.appendFileSync('relatorio.txt', log);
  console.log('Relatório atualizado!');
};

module.exports = { gerarRelatorio };
