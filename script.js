/* ==========================
   MENU HAMBÚRGUER
========================== */
const iconeMenu = document.getElementById("icone-menu");
const menu = document.querySelector(".menu");

iconeMenu.addEventListener("click", () => {
    menu.classList.toggle("ativo");
    iconeMenu.classList.toggle("ativo");

    if (menu.classList.contains("ativo")) {
        iconeMenu.classList.remove("bi-list");
        iconeMenu.classList.add("bi-x");
    } else {
        iconeMenu.classList.remove("bi-x");
        iconeMenu.classList.add("bi-list");
    }
});
const iconeShare = document.getElementById("iconeShare");

iconeShare.addEventListener("click", async () => {
    const dados = {
        title: "Formação do Evento",
        text: "Confira essa formação:",
        url: window.location.href
    };

    try {
        if (navigator.share && window.isSecureContext) {
            await navigator.share(dados);
        } else {
            throw new Error("Share não suportado");
        }
    } catch (erro) {
        // fallback: copiar link
        try {
            await navigator.clipboard.writeText(dados.url);
            alert("Link copiado para a área de transferência!");
        } catch {
            alert("Não foi possível compartilhar.");
        }
    }
});

document.addEventListener("click", (e) => {
    const clicouForaDoMenu =
        !menu.contains(e.target) &&
        !iconeMenu.contains(e.target);

    if (menu.classList.contains("ativo") && clicouForaDoMenu) {
        menu.classList.remove("ativo");
        iconeMenu.classList.remove("ativo");
        iconeMenu.classList.remove("bi-x-lg");
        iconeMenu.classList.add("bi-list");
    }
});


/* ==========================
   ELEMENTOS
========================== */
const inputEvento = document.querySelector("input");
const btnArtistas = document.querySelector(".btnPart:nth-of-type(2)");
const btnLocal = document.querySelector(".btnPart:nth-of-type(1)");
const btnData = document.querySelector(".btnData");
const nomeEvento = document.getElementById("nomeEvento");
const palco = document.getElementById("boxPalco");

/* ==========================
   AJUSTAR ALTURA DO PALCO
========================== */
function ajustarAlturaPalco() {
    let maiorY = 0;
    palco.querySelectorAll(".participante").forEach(p => {
        const bottom = p.offsetTop + p.offsetHeight;
        if (bottom > maiorY) maiorY = bottom;
    });
    const alturaMinima = window.innerHeight * 0.65;
    palco.style.height = Math.max(maiorY + 20, alturaMinima) + "px";
}

/* ==========================
   POSIÇÃO EM COLUNAS
========================== */
function proximaPosicaoColuna() {
    const participantes = [...palco.querySelectorAll(".participante")];
    const alturaPalco = palco.clientHeight - 20;
    const larguraParticipante = 120;
    const alturaParticipante = 40;
    const gap = 10;

    let coluna = 0;
    let topo = 10;

    while (true) {
        const ocupado = participantes.some(p => {
            const left = parseInt(p.style.left);
            const top = parseInt(p.style.top);
            return left === coluna * (larguraParticipante + gap) && top === topo;
        });

        if (!ocupado) break;

        topo += alturaParticipante + gap;

        if (topo + alturaParticipante > alturaPalco) {
            coluna++;
            topo = 10;
        }
    }

    const left = coluna * (larguraParticipante + gap);
    return { left: left + "px", top: topo + "px" };
}

/* ==========================
   LOCAL STORAGE
========================== */
function salvarFormacao() {
    const dados = {
        evento: nomeEvento.querySelector("span") ? nomeEvento.querySelector("span").textContent : "",
        local: nomeEvento.querySelector(".localEvento") ? nomeEvento.querySelector(".localEvento").textContent : "",
        data: nomeEvento.querySelector(".dataEvento") ? nomeEvento.querySelector(".dataEvento").textContent : "",
        participantes: []
    };

    palco.querySelectorAll(".participante").forEach(p => {
        dados.participantes.push({
            nome: p.querySelector("span").textContent,
            left: p.style.left,
            top: p.style.top
        });
    });

    localStorage.setItem("formacao", JSON.stringify(dados));
}

function carregarFormacao() {
    const dados = JSON.parse(localStorage.getItem("formacao"));
    if (!dados) return;

    if (dados.evento) criarEvento(dados.evento);

    if (dados.local) {
        let spanLocal = document.querySelector("#nomeEvento .localEvento");
        if (!spanLocal) {
            spanLocal = document.createElement("span");
            spanLocal.classList.add("localEvento");
            nomeEvento.appendChild(spanLocal);
        }
        spanLocal.textContent = dados.local;
    }

    if (dados.data) {
        let spanData = document.querySelector("#nomeEvento .dataEvento");
        if (!spanData) {
            spanData = document.createElement("span");
            spanData.classList.add("dataEvento");
            nomeEvento.appendChild(spanData);
        }
        spanData.textContent = dados.data;
    }

    if (dados.participantes && dados.participantes.length) {
        dados.participantes.forEach(p => criarParticipante(p.nome, p.left, p.top));
    }

    ajustarAlturaPalco();
}

/* ==========================
   CRIAR PARTICIPANTE
========================== */
function criarParticipante(nome, left = null, top = null) {
    const participante = document.createElement("div");
    participante.classList.add("participante");
    participante.style.position = "absolute";

    const spanNome = document.createElement("span");
    spanNome.textContent = nome;

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "✖";
    btnRemover.classList.add("remover");

    btnRemover.addEventListener("click", e => {
        e.stopPropagation();
        participante.remove();
        ajustarAlturaPalco();
        salvarFormacao();
    });

    participante.appendChild(spanNome);
    participante.appendChild(btnRemover);
    palco.appendChild(participante);

    if (!left || !top) {
        const pos = proximaPosicaoColuna();
        participante.style.left = pos.left;
        participante.style.top = pos.top;
    } else {
        participante.style.left = left;
        participante.style.top = top;
    }

    ajustarAlturaPalco();
    salvarFormacao();
}

/* ==========================
   CRIAR EVENTO (SEM BOTÃO REMOVER)
========================== */
function criarEvento(nome) {
    nomeEvento.innerHTML = "";

    const spanEvento = document.createElement("span");
    spanEvento.textContent = nome;

    nomeEvento.appendChild(spanEvento);

    salvarFormacao();
}

inputEvento.addEventListener("keydown", e => {
    if (e.key === "Enter" && inputEvento.value.trim() !== "") {
        criarEvento(inputEvento.value.trim());
        inputEvento.value = "";
    }
});

/* ==========================
   MODAL PARTICIPANTES
========================== */
const modal = document.getElementById("modal");
const inputParticipante = document.getElementById("inputParticipante");
const btnConfirmar = document.getElementById("confirmarModal");
const btnCancelar = document.getElementById("cancelarModal");

btnArtistas.addEventListener("click", () => {
    modal.classList.add("ativo");
    inputParticipante.focus();
});

function fecharModal() {
    modal.classList.remove("ativo");
    inputParticipante.value = "";
}

btnCancelar.addEventListener("click", fecharModal);
modal.addEventListener("click", e => { if (e.target === modal) fecharModal(); });
btnConfirmar.addEventListener("click", adicionarParticipante);

inputParticipante.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        adicionarParticipante();
    }
});

function adicionarParticipante() {
    const nome = inputParticipante.value.trim();
    if (!nome) return;
    criarParticipante(nome);
    fecharModal();
}

/* ==========================
   MODAL LOCAL
========================== */
const modalLocal = document.getElementById("modalLocal");
const inputLocal = document.getElementById("inputLocal");
const btnConfirmarLocal = document.getElementById("confirmarLocal");
const btnCancelarLocal = document.getElementById("cancelarLocal");

btnLocal.addEventListener("click", () => {
    modalLocal.classList.add("ativo");
    inputLocal.focus();
});

function fecharModalLocal() {
    modalLocal.classList.remove("ativo");
}

btnCancelarLocal.addEventListener("click", fecharModalLocal);
modalLocal.addEventListener("click", e => { if (e.target === modalLocal) fecharModalLocal(); });

btnConfirmarLocal.addEventListener("click", () => {
    const local = inputLocal.value.trim();
    if (!local) return;

    let spanLocal = document.querySelector("#nomeEvento .localEvento");
    if (!spanLocal) {
        spanLocal = document.createElement("span");
        spanLocal.classList.add("localEvento");
        nomeEvento.appendChild(spanLocal);
    }

    spanLocal.textContent = local;

    salvarFormacao();
    fecharModalLocal();
});

inputLocal.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        btnConfirmarLocal.click();
    }
});

/* ==========================
   MODAL DATA (CORRIGIDO PARA NÃO SUBTRAIR UM DIA)
========================== */
const modalData = document.getElementById("modalData");
const inputData = document.getElementById("inputData");
const btnConfirmarData = document.getElementById("confirmarData");
const btnCancelarData = document.getElementById("cancelarData");

btnData.addEventListener("click", () => {
    modalData.classList.add("ativo");
    inputData.focus();
});

function fecharModalData() {
    modalData.classList.remove("ativo");
}

btnCancelarData.addEventListener("click", fecharModalData);
modalData.addEventListener("click", e => { if (e.target === modalData) fecharModalData(); });

btnConfirmarData.addEventListener("click", () => {
    const data = inputData.value;
    if (!data) return;

    // CORREÇÃO: parse manual para não subtrair 1 dia
    const partes = data.split("-"); // "YYYY-MM-DD"
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // meses 0-11
    const dia = parseInt(partes[2], 10);

    const dataLocal = new Date(ano, mes, dia);
    const dataFormatada = dataLocal.toLocaleDateString("pt-BR");

    let spanData = document.querySelector("#nomeEvento .dataEvento");
    if (!spanData) {
        spanData = document.createElement("span");
        spanData.classList.add("dataEvento");
        nomeEvento.appendChild(spanData);
    }

    spanData.textContent = dataFormatada;

    salvarFormacao();
    fecharModalData();
});

inputData.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        btnConfirmarData.click();
    }
});

/* ==========================
   SISTEMA DE ARRASTAR
========================== */
let arrastando = null, offsetX = 0, offsetY = 0;

function iniciarArrasto(x, y, alvo) {
    arrastando = alvo;
    const rect = arrastando.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    palco.appendChild(arrastando);
}

function moverArrasto(x, y) {
    if (!arrastando) return;
    const rect = palco.getBoundingClientRect();
    let posX = x - rect.left - offsetX;
    let posY = y - rect.top - offsetY;
    posX = Math.max(0, Math.min(posX, palco.clientWidth - arrastando.offsetWidth));
    posY = Math.max(0, Math.min(posY, palco.clientHeight - arrastando.offsetHeight));
    arrastando.style.left = posX + "px";
    arrastando.style.top = posY + "px";
    ajustarAlturaPalco();
}

function finalizarArrasto() {
    if (arrastando) salvarFormacao();
    arrastando = null;
}

document.addEventListener("mousedown", e => {
    if (e.target.classList.contains("remover")) return;
    const alvo = e.target.closest(".participante");
    if (!alvo) return;
    iniciarArrasto(e.clientX, e.clientY, alvo);
});
document.addEventListener("mousemove", e => moverArrasto(e.clientX, e.clientY));
document.addEventListener("mouseup", finalizarArrasto);

document.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    if (e.target.classList.contains("remover")) return;
    const alvo = e.target.closest(".participante");
    if (!alvo) return;
    iniciarArrasto(touch.clientX, touch.clientY, alvo);
});
document.addEventListener("touchmove", e => {
    if (!arrastando) return;
    e.preventDefault();
    const touch = e.touches[0];
    moverArrasto(touch.clientX, touch.clientY);
}, { passive: false });
document.addEventListener("touchend", finalizarArrasto);

/* ==========================
   BOTÃO APAGAR TODA FORMAÇÃO
========================== */
const btnDelete = document.querySelector(".btnDelete");

btnDelete.addEventListener("click", () => {
    nomeEvento.innerHTML = "";
    palco.querySelectorAll(".participante").forEach(p => p.remove());
    localStorage.removeItem("formacao");
    ajustarAlturaPalco();
});

/* ==========================
   CARREGAR AO ABRIR
========================== */
carregarFormacao();
