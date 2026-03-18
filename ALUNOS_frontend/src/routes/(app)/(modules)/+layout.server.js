/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async () => {
    // Configuração estática da sidebar para o módulo ALUNOS_VAGAS
    const sidebar_modulos = [
        {
            id_modulo: 1,
            descricao: "ALUNOS_VAGAS",
            ativo: true,
            link: "/exemplos"
        }
    ];

    const sidebar_areas = [
        {
            id_area: 1,
            id_modulo: 1,
            ativo: true,
            modulo: "ALUNOS_VAGAS",
            prefixo: "exemplos",
            path: "/exemplos",
            objetos: [
                {
                    id_objeto: 1,
                    descricao: "Regime Nacional (inclui sobras/anulações)",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos?tab=regime-nacional"
                },
                {
                    id_objeto: 3,
                    descricao: "Reingresso + Mudança par (Int/Curso)",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos?tab=reingresso-mudanca"
                },
                {
                    id_objeto: 5,
                    descricao: "Concursos Especiais",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos?tab=concursos"
                },
                {
                    id_objeto: 6,
                    descricao: "Regimes Esp + Internacionais",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos?tab=regimes-esp-internacionais"
                },
                {
                    id_objeto: 8,
                    descricao: "Totais",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos?tab=totais"
                }
            ]
        }
    ];

    return {
        sidebar_modulos,
        sidebar_areas
    };
}