"use strict";

// =============================================================
// Entregável Web – Objetos, Dados e Assincronismo – Semana 05
// Abra o index.html no navegador com o Console aberto (F12)
// =============================================================

// =============================================================
// PARTE 1 – MANIPULAÇÃO E VALIDAÇÃO DE DADOS
// =============================================================
console.log("===== PARTE 1 – Pedidos =====");

const pedidos = [
  { cliente: "Bia", valor: 120, status: "pago" },
  { cliente: "Caio", valor: 80.5, status: "pendente" },
  { cliente: "", valor: 50, status: "pago" },          // inválido: cliente vazio
  { cliente: "Dani", valor: -10, status: "pago" },     // inválido: valor <= 0
  { cliente: "Edu", valor: "abc", status: "pago" },    // inválido: valor não numérico
  { cliente: "Fábio", valor: 200, status: "pago" },
];

// 1) Validar: cliente não vazio e valor numérico > 0
const pedidosValidos = pedidos.filter(
  (p) =>
    typeof p.cliente === "string" &&
    p.cliente.trim() !== "" &&
    typeof p.valor === "number" &&
    p.valor > 0
);
console.log("Pedidos válidos:", pedidosValidos);

// 2) Apenas os pagos
const pedidosPagos = pedidosValidos.filter((p) => p.status === "pago");
console.log("Pedidos pagos:", pedidosPagos);

// 3) Total faturado com reduce
const totalFaturado = pedidosPagos.reduce((total, p) => total + p.valor, 0);
console.log(`Total faturado: R$ ${totalFaturado.toFixed(2)}`);

// 4) Textos no formato "Bia — R$ 120.00"
const textos = pedidosPagos.map((p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`);
textos.forEach((t) => console.log(t));

// =============================================================
// FUNÇÕES AUXILIARES (quatro estados de tela)
// =============================================================
// Estados: carregando, erro, vazio, sucesso.
function mostrarStatus(elemento, tipo, mensagem = "") {
  elemento.className = `status ${tipo}`;
  elemento.textContent = mensagem; // textContent: nunca innerHTML (evita XSS)
}

function limparStatus(elemento) {
  mostrarStatus(elemento, "", "");
}

// =============================================================
// PARTE 2 – BUSCADOR DE CEP (ViaCEP)
// =============================================================
const formCep = document.querySelector("#form-cep");
const inputCep = document.querySelector("#cep");
const btnCep = document.querySelector("#btn-cep");
const statusCep = document.querySelector("#status-cep");
const resultadoCep = document.querySelector("#resultado-cep");
const historicoCep = document.querySelector("#historico-cep");

const historico = []; // bônus: array de objetos { cep, cidade, uf }

// trim() + remoção de hífen/pontos/espaços; depois valida com regex
function limparCep(valor) {
  return valor.trim().replace(/[-.\s]/g, "");
}

function cepEhValido(cep) {
  return /^\d{8}$/.test(cep); // apenas dígitos e exatamente 8
}

function renderizarCep(dados) {
  resultadoCep.replaceChildren(); // limpa o resultado anterior

  const campos = [
    ["Rua", dados.logradouro],
    ["Bairro", dados.bairro],
    ["Cidade", dados.localidade],
    ["UF", dados.uf],
  ];

  campos.forEach(([rotulo, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = rotulo;
    const dd = document.createElement("dd");
    dd.textContent = valor || "—";
    resultadoCep.append(dt, dd);
  });
}

function renderizarHistorico() {
  historicoCep.replaceChildren();
  historico.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.cep} — ${item.cidade}/${item.uf}`;
    historicoCep.append(li);
  });
}

function registrarHistorico(dados, cep) {
  // evita duplicar o mesmo CEP; o mais recente fica no topo
  const indice = historico.findIndex((h) => h.cep === cep);
  if (indice !== -1) historico.splice(indice, 1);
  historico.unshift({ cep, cidade: dados.localidade, uf: dados.uf });
  renderizarHistorico();
}

async function buscarCep(cep) {
  // AbortSignal.timeout evita requisição pendurada se o servidor demorar
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`); // fetch não rejeita em 404/500
  }
  return response.json();
}

formCep.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cep = limparCep(inputCep.value);

  if (!cepEhValido(cep)) {
    resultadoCep.replaceChildren();
    mostrarStatus(statusCep, "erro", "CEP inválido: digite 8 números.");
    return;
  }

  // Estado: CARREGANDO
  mostrarStatus(statusCep, "carregando", "Buscando...");
  btnCep.disabled = true;

  try {
    const dados = await buscarCep(cep);

    // Estado: VAZIO / NÃO ENCONTRADO (a ViaCEP responde 200 com { erro: true })
    if (dados.erro) {
      resultadoCep.replaceChildren();
      mostrarStatus(statusCep, "vazio", "CEP não encontrado");
      return;
    }

    // Estado: SUCESSO
    renderizarCep(dados);
    registrarHistorico(dados, cep);
    limparStatus(statusCep);
  } catch (erro) {
    // Estado: ERRO (rede, timeout ou HTTP)
    console.error(erro);
    resultadoCep.replaceChildren();
    mostrarStatus(statusCep, "erro", "Falha na conexão. Tente novamente.");
  } finally {
    btnCep.disabled = false; // sempre reabilita o botão
  }
});

// =============================================================
// PARTE 3 – DESAFIO MINI POKÉDEX (PokéAPI)
// =============================================================
const formPokemon = document.querySelector("#form-pokemon");
const inputPokemon = document.querySelector("#pokemon");
const btnPokemon = document.querySelector("#btn-pokemon");
const statusPokemon = document.querySelector("#status-pokemon");
const resultadoPokemon = document.querySelector("#pokemon-resultado");

function renderizarPokemon(pokemon) {
  resultadoPokemon.replaceChildren();

  const nome = document.createElement("h3");
  nome.textContent = pokemon.name;

  const imagem = document.createElement("img");
  imagem.src = pokemon.sprites.front_default;
  imagem.alt = `Imagem de ${pokemon.name}`;

  const tipos = document.createElement("p");
  tipos.textContent = `Tipos: ${pokemon.types.map((t) => t.type.name).join(", ")}`;

  resultadoPokemon.append(nome, imagem, tipos);
}

async function buscarPokemon(nome) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) {
    return null; // não encontrado (estado vazio)
  }
  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }
  return response.json();
}

formPokemon.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputPokemon.value.trim().toLowerCase();

  if (nome === "") {
    resultadoPokemon.replaceChildren();
    mostrarStatus(statusPokemon, "erro", "Digite o nome de um Pokémon.");
    return;
  }

  mostrarStatus(statusPokemon, "carregando", "Buscando...");
  btnPokemon.disabled = true;

  try {
    const pokemon = await buscarPokemon(nome);

    if (pokemon === null) {
      resultadoPokemon.replaceChildren();
      mostrarStatus(statusPokemon, "vazio", "Pokémon não encontrado");
      return;
    }

    renderizarPokemon(pokemon);
    limparStatus(statusPokemon);
  } catch (erro) {
    console.error(erro);
    resultadoPokemon.replaceChildren();
    mostrarStatus(statusPokemon, "erro", "Falha na conexão. Tente novamente.");
  } finally {
    btnPokemon.disabled = false;
  }
});
