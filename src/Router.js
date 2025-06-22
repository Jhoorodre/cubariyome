import React from "react";
import { Switch, Route } from "react-router-dom";

// Importa os componentes de página
import Discover from "./containers/Discover";
import Search from "./containers/Search";
import History from "./containers/History";
import Sources from "./containers/Sources";
import Saved from "./containers/Saved";
import Settings from "./containers/Settings";
import Reader from "./containers/Reader";
import PageNotFound from "./containers/PageNotFound";

// Modificado para aceitar scrollableContainerRef como prop
const AppRouter = ({ scrollableContainerRef }) => {
  return (
    <>
      <Switch>
        {/* Modificada a rota Discover para usar a prop render e passar a ref */}
        <Route
          path="/"
          exact
          render={(props) => (
            <Discover {...props} scrollableContainerRef={scrollableContainerRef} />
          )}
        />
        <Route path="/search" component={Search} />
        <Route path="/history" component={History} />
        <Route path="/sources" component={Sources} />
        <Route path="/saved" component={Saved} />
        <Route path="/settings" component={Settings} />

        {/* Rota para o leitor de mangá, recebendo os novos parâmetros */}
        <Route
          path="/reader/:provider_id/:content_id/:chapter_id?"
          component={Reader}
        />

        {/* Rota para a página de detalhes de um mangá (NOVA SUGESTÃO) */}
        {/* Você vai precisar de um container `Details.js` para esta rota */}
        {/* <Route path="/details/:provider_id/:content_id" component={Details} /> */}

        {/* Rota padrão para páginas não encontradas */}
        <Route component={PageNotFound} />
      </Switch>
    </>
  );
};

export default AppRouter;
