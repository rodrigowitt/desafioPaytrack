const pool = require('./database'); // Importa a conexão com o banco de dados

const atualizados = {};      // Registra CPFs, CNPJs e centros de custo que foram atualizados
const inseridos = {};        // Registra CPFs, CNPJs e centros de custo que foram inseridos
const ignorados = {};        // Registra CPFs que foram ignorados devido a falta de dados
const inconsistencias = [];  // Lista que armazena mensagens de inconsistências e erros


// Função para buscar os dados da api 
const inserirDados = async (dados) => {
  const {
    usuario,
    nome,
    sobrenome,
    cargo,
    matricula,
    cpf,
    empresa_cnpj,
    empresa_nome,
    centro_custo_identificador,
    centro_custo_nome,
  } = dados;

  // Caso não tenho informações sobre centro de custo, deve ser ignorado
  if (!centro_custo_identificador || !centro_custo_nome) {
    ignorados[cpf] = true;
    return 
  }

  // Início do bloco try para conexão com o banco
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Início da validação da tabela de empresa 
    const empresaExistente = await client.query(
      `SELECT * FROM empresas WHERE cnpj = $1`,
      [empresa_cnpj]
    );

    // Se o resultado da consulta for 0 faz a inserção. Realiza também a validação para que o mesmo resultado não seja inserido várias vezes
    if (empresaExistente.rows.length === 0 && !inseridos[empresa_cnpj]) {
      inseridos[empresa_cnpj] = true;
      await client.query(
        `INSERT INTO empresas (cnpj, nome) VALUES ($1, $2)`,
        [empresa_cnpj, empresa_nome]
      );
    } else if (!atualizados[empresa_cnpj]) {
      const empresa = empresaExistente.rows[0];
      // Caso não tenha inserido e tenha uma diferença no nome, faz o update dentro da tabela de empresa
      if (empresa.nome !== empresa_nome) {
        atualizados[empresa_cnpj] = true;
        inconsistencias.push(`Possível inconsistência: O campo "nome" da empresa de CNPJ ${empresa_cnpj} foi alterado de "${empresa_nome}" para "${empresa.nome}".`);
        await client.query(
          `UPDATE empresas SET nome = $2 WHERE cnpj = $1`,
          [empresa_cnpj, empresa_nome]
        );
      }
    }

       // Início da validação da tabela de centro de custo 
        const centroExistente = await client.query(
          `SELECT * FROM centros_de_custo WHERE identificador = $1`,
          [centro_custo_identificador]
        );
    
        // Caso não exista faça a inserção. Realiza também a validação para que o mesmo resultado não seja inserido várias vezes
        if (centroExistente.rows.length === 0 && !inseridos[centro_custo_identificador]) {
          inseridos[centro_custo_identificador] = true;
          await client.query(
            `INSERT INTO centros_de_custo (identificador, nome) VALUES ($1, $2)`,
            [centro_custo_identificador, centro_custo_nome]
          );
        } else if (!atualizados[centro_custo_identificador]) {
          const centro = centroExistente.rows[0];
         // Caso não tenha inserido e tenha uma diferença no nome dentro do centro de custa, faz o update
          if (centro.nome !== centro_custo_nome) {
            atualizados[centro_custo_identificador] = true;
            inconsistencias.push(`Possível inconsistência: O campo "nome" do centro de custo de identificador ${centro_custo_identificador} foi alterado de "${centro_custo_nome}" para "${centro.nome }".`);
            await client.query(
              `UPDATE centros_de_custo SET nome = $2 WHERE identificador = $1`,
              [centro_custo_identificador, centro_custo_nome]
            );
          }
        }
    
       // Início da validação da tabela de  Colaboradores 

    const colaboradorExistente = await client.query(
      `SELECT * FROM colaboradores WHERE cpf = $1`,
      [cpf]
    );

    // Se o resultado da consulta for 0 faz a inserção. Realiza também a validação para que o mesmo resultado não seja inserido várias vezes
    if (colaboradorExistente.rows.length === 0 && !inseridos[cpf]) {
          inseridos[cpf] = true;
          await client.query(
            `INSERT INTO colaboradores (
              cpf, usuario, nome, sobrenome, cargo, matricula, empresa_cnpj, centro_custo_identificador
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [cpf, usuario, nome, sobrenome, cargo, matricula, empresa_cnpj, centro_custo_identificador]
          );
        } else if (!atualizados[cpf]) {
          const colaborador = colaboradorExistente.rows[0];
          // Buscar todos os campos dentro da tabela de Colaboradores para determinar com precisão qual campo houve alteração.
          const campos = ['usuario', 'nome', 'sobrenome', 'cargo', 'matricula', 'empresa_cnpj', 'centro_custo_identificador'];
          for (const campo of campos) {
            // Caso houver alguma diferença entre os campos faz o update.
            if (colaborador[campo] !== dados[campo]) {
              atualizados[cpf] = true;
              inconsistencias.push(`Possível inconsistência: O campo "${campo}" do colaborador de CPF ${cpf} foi alterado de "${dados[campo]}" para "${colaborador[campo]}".`);
              await client.query(
                `UPDATE colaboradores SET
                  usuario = $2, nome = $3, sobrenome = $4, cargo = $5,
                  matricula = $6, empresa_cnpj = $7, centro_custo_identificador = $8
                WHERE cpf = $1`,
                [cpf, usuario, nome, sobrenome, cargo, matricula, empresa_cnpj, centro_custo_identificador]
              );

            }
          }
        }

    // Faz o commit no banco das atualizações ou inserções.
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    // Caso houver algum erro envia para a lista de inconsistências.
    inconsistencias.push(`Erro ao tentar inserir ou atualizar no banco de dados: ${error}".`);
    console.error(`Erro ao inserir/atualizar`, error);
  } finally {
    client.release();
  }

  return inconsistencias; 
};

module.exports = {
  inserirDados,
  atualizados,
  inseridos,
  ignorados,
  inconsistencias
};
