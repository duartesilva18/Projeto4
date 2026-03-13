process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import JWESession from '$lib/server/jwe_session';
import { PUBLIC_API_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import { DO_PERMISSION_CHECKS } from '$env/static/private';

let dados_login = {
    id_utilizador: 'dev',
    pass: '12345',
    email: "dev@ipvc.pt",
    nome: "Developer Teste",
    uo: "ESTG",
    num: "90000"
}

export function handleError({ event, error }) {
    if (error.status == 307) {
        redirect(307, error.location);
    }

    if (error.status == 404) {
        return {
            message: 'A página que procura não existe!',
            code: '404'
        };
    }

    console.log(error.message, error.stack, error.status)
    console.log("==== ERRO =====")
    console.log(error)
    console.log("==== EVENTO =====")
    console.log(event)
    console.log("==== ======== =====")
    console.log("Data-hora: " + new Date())
    console.log("==== FIM ERRO =====\n")
    return {
        message: 'Ocorreu um erro. Poderão estar a ser feitas atualizações. Se o problema persistir, contacte os SI.',
        code: '500'
    };
}

/**
 * Rotas acessíveis sem login
 * @type {string[]}
 */
const rotas_publicas = [];

/**
 * Rotas não acessíveis com login
 * @type {string[]}
 */
const rotas_bloqueadas_com_login = ["/sem_login", "/login"];


async function loginÑaAPI(){
    let key = null;
    try {
        const res = await fetch(PUBLIC_API_URL + "auth/signIn", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_utilizador: dados_login.id_utilizador,
                password: dados_login.pass
            })
        });
        const item = await res.json();
        if (!item || !item.hasOwnProperty("access_token")) {
            console.log(item)
            error(500, {message: 'Problema a obter a Token da API.'});
        }
        
        key = item.access_token;
        // obter permissões utilizador
        
    } catch (e) {
        error(500, { message: 'Problema no acesso à API! Provavelmente estão a ser realizadas atualizações.' });
    }

    return key;
}


/** @type {import('@sveltejs/kit').Handle} */
export const handle = (async ({ event, resolve }) => {

    //
    // código existente removido propositadamente para este repositório
    //

    // obter utilizador ficticio login
    if (!event.url.pathname.startsWith("/ch/")) console.log(event.url.pathname)

    // verificação de login
    let jwecookie = event.cookies.get('AuthorizationToken');
    if (jwecookie) {
        // verificar se válida
        const token = jwecookie.split(' ')[1];

        let jwt = await new JWESession().decrypJWE(token)
        if (jwt.payload && !jwt.errcode) {
            // se chega aqui, JWE ainda não expirou e é válida, ainda existe login nesta página
            event.locals.info_utili = {
                id_utilizador: dados_login.id_utilizador,
                nome: dados_login.nome,
                email: dados_login.email
            }
            // @ts-ignore
            event.locals.on_p_key = jwt.payload.on_user_key

            // verificar se não é rota publica
            if (!rotas_publicas.includes(event.url.pathname) && !event.url.pathname.startsWith("/ch/")) {

                // API
                // -- se jwe sessão não possuir jwt da api, fazer login
                if (!jwt.payload.hasOwnProperty("jwt_api") || !jwt.payload.jwt_api) {
                    let login = false;
                    console.log("[!] Requesting API KEY")

                    jwt.payload.jwt_api = await loginÑaAPI();
                    // obter permissões utilizador
                    event.cookies.set('AuthorizationToken', "Bearer " + await new JWESession().createJWE(jwt.payload), { path: '/' })
                } else {
                    // ainda tem token no login
                }

                // adicionar jwt_api e permissoes_rota ao locals
                // @ts-ignore
                if (jwt.payload.jwt_api)
                    event.locals.info_utili.jwt_api = jwt.payload.jwt_api;
            }

        } else {
            // jwe inválida - remover
            event.cookies.delete("AuthorizationToken", { path: '/' })

            let dados = {
                "id_utilizador": dados_login.id_utilizador,
                "email": dados_login.email,
                "nome": dados_login.nome,
                "num": dados_login.num,
                "uo": dados_login.uo
            }

            let jwe = await new JWESession().createJWE(dados);
            let jwt = await new JWESession().decrypJWE(jwe);

            // voltar a fazer login aqui (apenas se payload existir)
            if (jwt && jwt.payload) {
                jwt.payload.jwt_api = await loginÑaAPI();
                // obter permissões utilizador
                event.cookies.set(
                    'AuthorizationToken',
                    'Bearer ' + (await new JWESession().createJWE(jwt.payload)),
                    { path: '/' }
                );

                event.locals.info_utili = jwt;
            }

        }
    } else {
        // não tem JWE, gerar nova e fazer login na API
        let dados = {
            "id_utilizador": dados_login.id_utilizador,
            "email": dados_login.email,
            "nome": dados_login.nome,
            "num": dados_login.num,
            "uo": dados_login.uo
        }

        let jwe = await new JWESession().createJWE(dados);
        let jwt = await new JWESession().decrypJWE(jwe)

        // voltar a fazer login aqui
        jwt.payload.jwt_api = await loginÑaAPI();
        // obter permissões utilizador
        event.cookies.set('AuthorizationToken', "Bearer " + await new JWESession().createJWE(jwt.payload), { path: '/' })
        event.locals.info_utili = jwt;

    }

    // adicionar o que for necessário de midleware aqui


    // continuar pedido
    return await resolve(event);
});