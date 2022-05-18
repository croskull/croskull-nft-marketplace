import React, { Component } from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import Marketplace from "./components/Marketplace/Marketplace";
import CroskullAdventure from "./components/Adventure/Adventure";
import Merchant from "./components/Merchant/Merchant";
import Analytics from "./components/Analytics/Analytics";
import Navbar from "./components/Navbar/Navbar";
import Notifier from "./components/Notifier/Notifier";
import Tavern from "./components/Tavern/Tavern";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import store from "./redux/store";
import Raffle from "./components/Raffle/Raffle";
import Home from "./components/Home/Home";
import Bank from "./components/Bank/Bank";
import Laboratory from "./components/Laboratory/Laboratory";
import ClickSound from "./sounds/click-sound.mp3"
import PotionLab from "./components/Laboratory/PotionLab/PotionLab";
import "./App.css";
import MintEvo from "./components/MintEvo/MintEvo";
import EvoTavern from "./components/EvoTavern/EvoTavern";

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.subscribe()
    let clickSound = new Audio(ClickSound)
    clickSound.volume = 0.1
    document.addEventListener('click', () => {
      clickSound.currentTime = 0
      clickSound.play()
    })
  }

  subscribe = () => {
    store.subscribe(() => {
      this.setState({
        blockchain: store.getState().blockchain
      });
    });
  }


  render() {
    return (
      <div className="main">
        <Notifier />
        {(
          <>
            <HashRouter
              basename="/">
              <Navbar />
              <Route
                render={({ location }) => (
                  <TransitionGroup className={`container-fluid ${location.pathname.replace('/', '')}`}>
                    <CSSTransition
                      classNames="fade"
                      key={location.pathname.split("/")[1] || "/"}
                      timeout={{ enter: 600, exit: 600 }}
                      appear
                    >
                      <Switch
                        location={location}
                      >
                        <Route
                          path="/"
                          exact
                          render={() => (
                            <Home/>
                          )}
                        />
                        <Route
                          path="/marketplace"
                          render={() => (
                            <Marketplace/>
                          )}
                        />
                        <Route
                          path="/adventure"
                          render={() => (
                            <CroskullAdventure />
                          )}
                        />
                        <Route
                          path="/tavern"
                          render={() => (
                            <Tavern />
                          )}
                        />
                        <Route
                          path="/merchant"
                          render={() => (
                            <Merchant />
                          )}
                        />
                        <Route
                          path="/analytics"
                          render={() => (
                            <Analytics />
                          )}
                        />
                        <Route
                          path="/raffle"
                          render={() => (
                            <Raffle />
                          )}
                        />
                        <Route
                          path="/bank"
                          render={() => (
                            <Bank />
                          )}
                        />
                        {/**<Route
                          path="/laboratory"
                          render={() => (
                            <Laboratory />
                          )}
                        />*/}
                        <Route
                          path="/laboratory-potion"
                          render={() => (
                            <PotionLab />
                          )}
                        />
                        <Route
                          path="/mint-evo"
                          render={() => (
                            <MintEvo />
                          )}
                        />
                        <Route
                          path="/evo-tavern"
                          render={() => (
                            <EvoTavern/>
                          )}
                        />
                      </Switch>
                    </CSSTransition>
                  </TransitionGroup>
                )} />
            </HashRouter>
          </>
        )}
      </div>
    );
  }
}

export default App;
//preparing modal
