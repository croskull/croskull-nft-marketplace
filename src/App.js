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

let provider;
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

  setProvider = (_provider = false) => {
    if (_provider) {
      provider = _provider;
    } else if (!provider) {
      provider = window.ethereum
    }
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
        <Notifier data={store.getState().data} />
        {(
          <>
            <HashRouter
              basename="/">
              <Navbar />
              <Route
                render={({ location }) => (
                  <TransitionGroup className={`container-fluid ${location.pathname.replace('/', '')}`}>
                    <CSSTransition
                      key={location.pathname}
                      classNames="fade"
                      timeout={500}
                    >
                      <Switch
                        location={location}
                      >
                        <Route
                          path="/"
                          exact
                          render={() => (
                            <Home></Home>
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
                            <CroskullAdventure></CroskullAdventure>
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
                        />
                        <Route
                          path="/laboratory-potion"
                          render={() => (
                            <PotionLab />
                          )}
                          />*/}
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
