let contas = [];
let historico = [];

const API_CONTAS = "https://6a8f8c4fa12b7de8cc0f75bc.mockapi.io/contas";
const API_HISTORICO = "https://6a8f8c4fa12b7de8cc0f75bc.mockapi.io/historico";
const janela = document.querySelector("#dialogo")
const btn = document.querySelector("#botao")

btn.addEventListener("click", abrirtela);

async function carregarContas() {
    try {
        const resposta = await fetch(API_CONTAS);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar contas");
        }

        contas = await resposta.json();

        contas.forEach(conta => {
            conta.saldo = Number(conta.saldo);
        });

        atualizarlista();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar as contas.");
    }
}

async function carregarHistorico() {
    const resposta = await fetch(API_HISTORICO);
    historico = await resposta.json();

    atualizarHistorico();
}

async function Deletar() {
    let id = document.getElementById("listaContas").value;

    if (id === "") {
        alert("Selecione uma conta.");
        return;
    }

    try {
        const resposta = await fetch(`${API_CONTAS}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao deletar conta");
        }

        alert("Conta removida com sucesso!");

        await carregarContas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao remover a conta.");
    }
}

async function depositar() {
    let id = document.getElementById("listaContas").value;
    let valor = Number(document.getElementById("valor").value);

    if (id === "") {
        alert("Selecione uma conta.");
        return;
    }

    if (valor <= 0 || isNaN(valor)) {
        alert("Digite um valor válido para depósito.");
        return;
    }

    let conta = contas.find(conta => String(conta.id) === String(id));

    if (!conta) {
        alert("Conta não encontrada.");
        return;
    }

    conta.saldo = Number(conta.saldo);
    conta.saldo += valor;

    try {
        const resposta = await fetch(`${API_CONTAS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: conta.nome,
                saldo: conta.saldo
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar saldo");
        }

        await registrarHistorico(conta, "Depósito", valor);

        alert("Depósito realizado com sucesso!");

        document.getElementById("valor").value = "";

        await carregarContas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao realizar depósito.");
    }
}

async function sacar() {
    let id = document.getElementById("listaContas").value;
    let valor = Number(document.getElementById("valor").value);

    if (id === "") {
        alert("Selecione uma conta.");
        return;
    }

    if (valor <= 0 || isNaN(valor)) {
        alert("Digite um valor válido para saque.");
        return;
    }

    let conta = contas.find(conta => String(conta.id) === String(id));

    if (!conta) {
        alert("Conta não encontrada.");
        return;
    }

    conta.saldo = Number(conta.saldo);

    if (conta.saldo < valor) {
        alert("Saldo insuficiente.");
        return;
    }

    conta.saldo -= valor;

    try {
        const resposta = await fetch(`${API_CONTAS}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: conta.nome,
                saldo: conta.saldo
            })
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar saldo");
        }

        await registrarHistorico(conta, "Saque", valor);

        alert("Saque realizado com sucesso!");

        document.getElementById("valor").value = "";

        await carregarContas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao realizar saque.");
    }
}


function atualizarTransferencia() {
    let idOrigem = Number(document.getElementById("origem").value);
    let destino = document.getElementById("destino");

    destino.innerHTML = "";

    let opcao = document.createElement("option");
    opcao.value = "";
    opcao.text = "Selecione uma conta";
    destino.appendChild(opcao);

    for (let i = 0; i < contas.length; i++) {

        if (contas[i].id !== idOrigem) {

            let option = document.createElement("option");
            option.value = contas[i].id;
            option.text = contas[i].nome +
                          " - Saldo: " + contas[i].saldo.toFixed(2) +
                          " - ID: " + contas[i].id;

            destino.appendChild(option);
        }
    }
}


async function cadastrar() {
    let nome = document.getElementById("nome").value;
    let saldo = parseFloat(document.getElementById("saldo").value);

    if (nome == "") {
        alert("Digite o nome da conta.");
        return;
    }

    if (isNaN(saldo)) {
        saldo = 0;
    }

    let conta = {
        nome: nome,
        saldo: saldo
    };

    try {
        const resposta = await fetch(API_CONTAS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(conta)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao cadastrar conta");
        }

        alert("Conta cadastrada com sucesso!");

        document.getElementById("nome").value = "";
        document.getElementById("saldo").value = "";

        janela.close();

        await carregarContas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao cadastrar a conta.");
    }
}

function atualizarlista() {

    let lista = document.getElementById("listaContas");
    let origem = document.getElementById("origem");

    lista.innerHTML = "";
    origem.innerHTML = "";

    let opcao1 = document.createElement("option");
    opcao1.value = "";
    opcao1.text = "Selecione uma conta";
    lista.appendChild(opcao1);

    let opcao2 = document.createElement("option");
    opcao2.value = "";
    opcao2.text = "Selecione uma conta";
    origem.appendChild(opcao2);

    for (let i = 0; i < contas.length; i++) {

        let option1 = document.createElement("option");
        option1.value = contas[i].id;
        option1.text = contas[i].nome +
                       " - Saldo: " + contas[i].saldo.toFixed(2) +
                       " - ID: " + contas[i].id;
        lista.appendChild(option1);

        let option2 = document.createElement("option");
        option2.value = contas[i].id;
        option2.text = contas[i].nome +
                       " - Saldo: " + contas[i].saldo.toFixed(2) +
                       " - ID: " + contas[i].id;
        origem.appendChild(option2);
    }
}




function abrirtela() {
    janela.showModal()
}

async function transferir() {
    let idOrigem = document.getElementById("origem").value;
    let idDestino = document.getElementById("destino").value;
    let valor = Number(document.getElementById("valorTransferencia").value);

    if (idOrigem === "" || idDestino === "") {
        alert("Selecione as duas contas.");
        return;
    }

    if (idOrigem === idDestino) {
        alert("A conta de origem e destino devem ser diferentes.");
        return;
    }

    if (valor <= 0 || isNaN(valor)) {
        alert("Digite um valor válido.");
        return;
    }

    let contaOrigem = contas.find(
        conta => String(conta.id) === String(idOrigem)
    );

    let contaDestino = contas.find(
        conta => String(conta.id) === String(idDestino)
    );

    if (!contaOrigem || !contaDestino) {
        alert("Conta não encontrada.");
        return;
    }

    // Garante que os saldos sejam números
    contaOrigem.saldo = Number(contaOrigem.saldo);
    contaDestino.saldo = Number(contaDestino.saldo);

    if (contaOrigem.saldo < valor) {
        alert("Saldo insuficiente para transferência.");
        return;
    }

    // Atualiza os saldos
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    try {

        // Atualiza conta de origem na MockAPI
        const respostaOrigem = await fetch(`${API_CONTAS}/${idOrigem}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: contaOrigem.nome,
                saldo: contaOrigem.saldo
            })
        });

        if (!respostaOrigem.ok) {
            throw new Error("Erro ao atualizar conta de origem");
        }

        // Atualiza conta de destino na MockAPI
        const respostaDestino = await fetch(`${API_CONTAS}/${idDestino}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: contaDestino.nome,
                saldo: contaDestino.saldo
            })
        });

        if (!respostaDestino.ok) {
            throw new Error("Erro ao atualizar conta de destino");
        }

        // Registra no histórico
        await registrarHistorico(
            contaOrigem,
            "Transferência enviada",
            valor
        );

        await registrarHistorico(
            contaDestino,
            "Transferência recebida",
            valor
        );

        alert("Transferência realizada com sucesso!");

        document.getElementById("valorTransferencia").value = "";

        // Recarrega as contas da API
        await carregarContas();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao realizar transferência.");
    }
}

async function registrarHistorico(conta, tipo, valor) {
    let operacao = {
        data: new Date().toLocaleString("pt-BR"),
        conta: conta.nome,
        tipo: tipo,
        valor: valor,
        saldo: conta.saldo
    };

    await fetch(API_HISTORICO, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(operacao)
    });

    await carregarHistorico();
}

function atualizarHistorico() {

    let tabela = document.getElementById("historico");

    tabela.innerHTML = "";

    let historicoInvertido = [...historico].reverse();

    for (let i = 0; i < historicoInvertido.length; i++) {

        let linha = document.createElement("tr");

        linha.innerHTML =
        "<td>" + historicoInvertido[i].data + "</td>" +
        "<td>" + historicoInvertido[i].conta + "</td>" +
        "<td>" + historicoInvertido[i].tipo + "</td>" +
        "<td>R$ " + Number(historicoInvertido[i].valor).toFixed(2) + "</td>" +
        "<td>R$ " + Number(historicoInvertido[i].saldo).toFixed(2) + "</td>";

        tabela.appendChild(linha);
    }
}

// CARREGAR OS DADOS QUANDO O SITE ABRIR
carregarContas();
carregarHistorico();
