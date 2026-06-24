/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async () => {
    const sidebar_modulos = [
        {
            id_modulo: 1,
            descricao: "Proposta de Vagas",
            ativo: true,
            link: "/proposta-vagas"
        }
    ];

    const sidebar_areas = [
        {
            id_area: 2,
            id_modulo: 1,
            ativo: true,
            modulo: "Proposta de Vagas",
            designacao: "Análise e Administração",
            prefixo: "admin",
            path: "/gestao-tabelas",
            objetos: [
                {
                    id_objeto: 50,
                    descricao: "Dashboard",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/dashboard"
                },
                {
                    id_objeto: 51,
                    descricao: "Comparar anos",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/comparar-anos"
                },
                {
                    id_objeto: 99,
                    descricao: "Gestão de Tabelas",
                    item_menu: true,
                    ativo: true,
                    ficheiro: "/gestao-tabelas"
                }
            ]
        }
    ];

    return {
        sidebar_modulos,
        sidebar_areas
    };
}