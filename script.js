document.addEventListener('DOMContentLoaded', function () {
    const formGasto = document.getElementById('form-gasto');
    const listaGastos = document.getElementById('lista-gastos');
    const relatorio = document.getElementById('relatorio');
    const graficoCanvas = document.getElementById('grafico-gastos').getContext('2d');

    let gastos = JSON.parse(localStorage.getItem('gastos')) || []; //Armazena os dados dos gastos
    let rendaFamiliar = parseFloat(localStorage.getItem('rendaFamiliar')) || 0; //Armazena a renda familiar, usada p/ cálculos percentuais
    let grafico; //Instância do gráfico pizza

    //Função para filtrar gastos
    function filtrarGastos() {
        const filtroDataInicio = new Date(document.getElementById('data-inicial').value);
        const filtroDataFim = new Date(document.getElementById('data-final').value);
        filtroDataFim.setUTCHours(23, 59, 59, 999);
        listaGastos.innerHTML = '';

        gastos.forEach((gasto, index) => {
            const dataGasto = new Date(gasto.data);
            if (dataGasto >= filtroDataInicio && dataGasto <= filtroDataFim) {
                const li = document.createElement('li');
                const dataFinal = formatarData(gasto.data);
                li.innerHTML = `${gasto.descricao} - R$${gasto.valor.toFixed(2)} (${gasto.categoria}) - ${gasto.metodoPagamento} - ${dataFinal}
                    <button class="btn-editar" onclick="editarGasto(${index})">Editar</button>
                    <button class="btn-remover" onclick="removerGasto(${index})">Remover</button>`;
                listaGastos.appendChild(li);
            }
        });
        atualizarRelatorio();
        atualizarGrafico();
    }
    
    //Formata a data para dia/mês/ano
    function formatarData(data) {
        const dataFormatada = new Date(data);
        const dia = String(dataFormatada.getUTCDate()).padStart(2, '0');
        const mes = String(dataFormatada.getUTCMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const ano = dataFormatada.getUTCFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    //Calcula e exibe total gastos e o percentual de acordo com a renda familiar
    function atualizarResumo() {
        const totalGasto = gastos.reduce((acc, gasto) => acc + gasto.valor, 0);
        const percentualGasto = rendaFamiliar ? ((totalGasto / rendaFamiliar) * 100).toFixed(2) : 0;
        document.getElementById('total-gasto').innerText = `R$ ${totalGasto.toFixed(2)}`;
        document.getElementById('total-percentual').innerText = `${percentualGasto}%`;
    }

    //Atualizar a lista de gastos
    function atualizarListaGastos() {
        listaGastos.innerHTML = '';
        gastos.forEach((gasto, index) => {
            const li = document.createElement('li');
            const dataFinal = formatarData(gasto.data);
            li.innerHTML = `${gasto.descricao} - R$${gasto.valor.toFixed(2)} (${gasto.categoria}) - ${gasto.metodoPagamento} - ${dataFinal}
                <button class="btn-editar" onclick="editarGasto(${index})">Editar</button>
                <button class="btn-remover" onclick="removerGasto(${index})">Remover</button>`;
            listaGastos.appendChild(li);
        });
        atualizarResumo(); 
        atualizarRelatorio();
        atualizarGrafico();
    }
    
    //Adicionar novo gasto
    formGasto.addEventListener('submit', function (event) {
        event.preventDefault();
        const novoGasto = {
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(document.getElementById('valor').value),
            categoria: document.getElementById('categoria').value,
            metodoPagamento: document.getElementById('metodo-pagamento').value,
            data: document.getElementById('data').value
        };

        gastos.push(novoGasto);
        localStorage.setItem('gastos', JSON.stringify(gastos));
        formGasto.reset();
        atualizarListaGastos();
    });

    //Remove gasto
    window.removerGasto = function (index) {
        gastos.splice(index, 1);
        localStorage.setItem('gastos', JSON.stringify(gastos));
        atualizarListaGastos();
    };

    //Edita gasto
    window.editarGasto = function (index) {
        const gasto = gastos[index];
        document.getElementById('descricao').value = gasto.descricao;
        document.getElementById('valor').value = gasto.valor;
        document.getElementById('categoria').value = gasto.categoria;
        document.getElementById('metodo-pagamento').value = gasto.metodoPagamento;
        document.getElementById('data').value = gasto.data;
        removerGasto(index);
    };

    //Função para atualizar o relatório
    function atualizarRelatorio() {
        const totalPorCategoria = {
            'Lazer': 0,
            'Alimentação': 0,
            'Serviços Digitais': 0,
            'Necessidades': 0,
            'Transporte': 0,
            'Moradia': 0,
            'Educação': 0
        };

        gastos.forEach(gasto => {
            totalPorCategoria[gasto.categoria] += gasto.valor;
        });

        let relatorioHTML = `<table border="1" style="width: 100%; text-align: left;">
                                <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th>Total (R$)</th>
                                        <th>Percentual (%)</th>
                                    </tr>
                                </thead>
                                <tbody>`;

        for (const [categoria, total] of Object.entries(totalPorCategoria)) {
            let percentual = rendaFamiliar ? ((total / rendaFamiliar) * 100).toFixed(2) : 0;
            relatorioHTML += `<tr>
                                <td>${categoria}</td>
                                <td>R$ ${total.toFixed(2)}</td>
                                <td>${percentual}%</td>
                              </tr>`;
        }

        relatorioHTML += `</tbody></table>`;
        relatorio.innerHTML = relatorioHTML;
    }

    //Atualização da renda familiar
    document.getElementById('adicionar-renda').addEventListener('click', function () {
        rendaFamiliar = parseFloat(document.getElementById('renda-familiar').value);
        localStorage.setItem('rendaFamiliar', rendaFamiliar);
        atualizarRelatorio();
        atualizarResumo();
    });

    //Atualiza o relatório com a renda familiar ao carregar a página
    atualizarRelatorio();

    //Inicializa a renda familiar ao carregar a página
    document.getElementById('renda-familiar').value = rendaFamiliar || ''; //Define o valor de renda familiar no form como salvo no localstorage
    atualizarResumo(); //Atualiza o resumo e exibe total gastos e total percentual em relação a renda familiar

    //Filtro por data, chama a função filtrarGastos()
    document.getElementById('filtrar-gastos').addEventListener('click', filtrarGastos);

    //Função para atualizar o gráfico
    function atualizarGrafico() {
        const totalPorCategoria = {
            'Lazer': 0,
            'Alimentação': 0,
            'Serviços Digitais': 0,
            'Necessidades': 0,
            'Transporte': 0,
            'Moradia': 0,
            'Educação': 0
        };

        //Soma o valor gasto em toda categoria
        gastos.forEach(gasto => {
            totalPorCategoria[gasto.categoria] += gasto.valor;
        });

        const labels = Object.keys(totalPorCategoria); //Armazena o nome das categorias
        const data = Object.values(totalPorCategoria); //Armazena os valores totais por categoria

        if (grafico) {
            grafico.destroy(); //Apaga gráfico anterior, se existir
        }

        //Cria gráfico pizza e cada categoria tem uma cor diferente
        grafico = new Chart(graficoCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0', '#9966FF', '#FF6600'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Gastos por Categoria'
                    }
                }
            }
        });
    }

    //Resetar filtro, chama atualizarListaGastos() p/ mostrar tds gastos de novo, sem filtro
    document.getElementById('resetar-filtro').addEventListener('click', function () {
        atualizarListaGastos();
    });

    //Inicializa a lista e o gráfico ao carregar a página
    atualizarListaGastos();
    atualizarGrafico();

    //Função que mostra a lista de gastos filtrados
    function atualizarListaGastosFiltrados(gastosFiltrados) {
        listaGastos.innerHTML = '';
        gastosFiltrados.forEach((gasto, index) => {
            const li = document.createElement('li');

            // Formatando a data para dia/mês/ano
            const dataFormatada = new Date(gasto.data);
            const dia = String(dataFormatada.getDate()).padStart(2, '0');
            const mes = String(dataFormatada.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
            const ano = dataFormatada.getFullYear();
            const dataFinal = `${dia}/${mes}/${ano}`;

            li.innerHTML = `${gasto.descricao} - R$${gasto.valor.toFixed(2)} (${gasto.categoria}) - ${gasto.metodoPagamento} - ${dataFinal}
                <button class="btn-editar" onclick="editarGasto(${index})">Editar</button>
                <button class="btn-remover" onclick="removerGasto(${index})">Remover</button>`;
            listaGastos.appendChild(li);
        });

        if (gastosFiltrados.length === 0) {
            listaGastos.innerHTML = '<li>Nenhum gasto encontrado no período selecionado.</li>';
        }
    }

    document.getElementById('resetar-filtro').addEventListener('click', function () {
        atualizarListaGastos();
    });
    
    //Atualiza o relatório e a lista de gastos ao carregar a página
    atualizarRelatorio(); 
    atualizarListaGastos();
    
    //Função que atualiza o gráfico de gastos
    function atualizarGrafico() {
        const totalPorCategoria = gastos.reduce((acc, gasto) => {
            acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor;
            return acc;
        }, {});

        const categorias = Object.keys(totalPorCategoria);
        const valores = Object.values(totalPorCategoria);

        if (grafico) {
            grafico.destroy();
        }

        grafico = new Chart(graficoCanvas, {
            type: 'pie',
            data: {
                labels: categorias,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#cc65fe', '#ff9f40', '#4bc0c0', '#9966ff']
                }]
            }
        });
    }

    //Exporta relatório em pdf
    document.getElementById('exportar-relatorio').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        const totalPorCategoria = {
            'Lazer': 0,
            'Alimentação': 0,
            'Serviços Digitais': 0,
            'Necessidades': 0,
            'Transporte': 0,
            'Moradia': 0,
            'Educação': 0
        };

        gastos.forEach(gasto => {
            totalPorCategoria[gasto.categoria] += gasto.valor;
        });

        //Calcula total e percentual
        const totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0).toFixed(2);
        const percentualGastos = rendaFamiliar ? ((totalGastos / rendaFamiliar) * 100).toFixed(2) : 0;

        doc.setFontSize(16); //Tam da fonte
        doc.text("Relatório Financeiro", 20, 10);

        const headers = ['Categoria', 'Total'];
        const data = Object.entries(totalPorCategoria).map(([categoria, total]) => [categoria, `R$ ${total.toFixed(2)}`]);

        //Adiciona a tabela ao PDF
        doc.autoTable({ html: '#relatorio table' });

        //Adiciona gasto total e total percentual debaixo da tabela
        doc.setFontSize(12); //Tam da fonte
        const yPosition = doc.lastAutoTable.finalY + 10; //Fica na vertical abaixo da tabela
        
        //Textos na horizontal lado a lado
        doc.text(`Total Gasto: R$ ${totalGastos}`, 20, yPosition);
        doc.text(`Percentual Gasto: ${percentualGastos}%`, 120, yPosition);

        //Nome do arquivo
        doc.save('relatorio_financeiro.pdf');
    });

    atualizarListaGastos();
});
