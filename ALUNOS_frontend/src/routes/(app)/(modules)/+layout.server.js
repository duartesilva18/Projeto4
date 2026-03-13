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
                    descricao: "Página base",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos"
                },
                {
                    id_objeto: 2,
                    descricao: "Editoras - listagem",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos/editoras/(listagem)"
                },
                {
                    id_objeto: 3,
                    descricao: "Nova editora",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/exemplos/editoras/nova"
                },
                {
                    id_objeto: 4,
                    descricao: "Editoras - detalhe",
                    item_menu: false,
                    ativo: true,
                    ficheiro: "/exemplos/editoras/1"
                }
            ]
        }
    ];

    return {
        sidebar_modulos,
        sidebar_areas
    };
}