# Semana 05 – Objetos, Dados e Assincronismo

Mini projeto da disciplina de Desenvolvimento Web. Trabalha objetos e arrays, `fetch` com `async/await` e os **quatro estados de uma tela**: carregando, erro, vazio e sucesso.

## Como executar

1. Baixe ou clone o repositório.
2. Abra o `index.html` no navegador (é preciso internet para as APIs).
3. Abra o Console (`F12`) para ver a Parte 1.

## Estrutura

- `index.html`: formulários do CEP e da Pokédex.
- `app.js`: lógica das três partes.
- `README.md`: esta documentação.

## O que foi feito

**Parte 1 – Pedidos.** Valida cada pedido (cliente não vazio e valor numérico maior que 0) com `filter`, separa os pagos, soma com `reduce` e gera textos como `Bia — R$ 120.00` com `toFixed(2)`.

**Parte 2 – Buscador de CEP (ViaCEP).** O CEP passa por `.trim()` e regex (`/^\d{8}$/`). A consulta usa `fetch` com `async/await` e `AbortSignal.timeout(5000)`. Estados da tela:

| Estado | Comportamento |
| --- | --- |
| Carregando | Mostra "Buscando..." e desabilita o botão (reabilitado no `finally`). |
| Erro | Trata falha de rede, timeout e erro HTTP (`!response.ok`), exibindo mensagem de falha na conexão. |
| Vazio | A ViaCEP responde 200 com `{ erro: true }`; exibe "CEP não encontrado". |
| Sucesso | `replaceChildren()` limpa o resultado anterior e `createElement` + `textContent` montam `<dt>`/`<dd>` com Rua, Bairro, Cidade e UF. |

Bônus: o histórico de CEPs fica em um array de objetos e é listado na tela.

**Parte 3 – Mini Pokédex (PokéAPI).** O nome é validado (não vazio) e convertido para minúsculo. Exibe nome, imagem (`sprites.front_default`) e tipos. O erro 404 vira "Pokémon não encontrado", pois o `fetch` não rejeita a Promise em erros HTTP e é preciso checar `response.status`/`response.ok`.

## Segurança

Dados vindos das APIs são inseridos apenas com `textContent` e `createElement`, nunca com `innerHTML`, para evitar ataques de XSS.

## Parte 4 – Reflexão

**Por que `Promise.all` pode ser mais rápido que vários `await` seguidos?**

Com `await` em sequência, cada requisição só começa depois que a anterior termina, então os tempos se somam:

```js
const a = await fetch(urlA); // espera ~300 ms
const b = await fetch(urlB); // só começa agora, espera ~300 ms
// total ≈ 600 ms
```

Com `Promise.all`, todas as requisições são disparadas ao mesmo tempo (em paralelo) e o código espera todas terminarem juntas:

```js
const [a, b] = await Promise.all([fetch(urlA), fetch(urlB)]);
// total ≈ 300 ms (o tempo da mais lenta)
```

Assim o tempo total tende ao da requisição mais lenta, e não à soma de todas, aproveitando melhor o tempo de rede. Isso só vale quando as requisições são independentes entre si; se uma depende do resultado da outra, é preciso esperar em sequência.
