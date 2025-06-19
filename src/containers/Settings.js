// src/containers/Settings.js
import React, { PureComponent } from "react";
import Container from "../components/Container";
import Section from "../components/Section";
import Widget from "remotestorage-widget";
import { remoteStorage } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { Switch } from "@headlessui/react";
import { classNames } from "../utils/strings";
import { withTranslation } from 'react-i18next';

const REMOTE_STORAGE_WIDGET_ID = "remote-storage-widget";
const HENTAI_KEY = "hentai";
const HENTAI_VALUE = "enabled";

class SettingsClass extends PureComponent {
  constructor(props) {
    super(props);
    this.widgetRef = React.createRef();
    if (localStorage.getItem(HENTAI_KEY)) {
      localStorage.setItem(HENTAI_KEY, HENTAI_VALUE);
    }
    this.widget = new Widget(remoteStorage, {
      skipInitial: true,
      modalBackdrop: false,
      leaveOpen: true,
    });
    this.state = {
      ready: false,
      hentaiEnabled: !!localStorage.getItem(HENTAI_KEY),
    };
  }

  componentDidMount = () => {
    remoteStorage.on("ready", () => {
      if (this.widgetRef.current) {
        this.widget.attach(this.widgetRef.current.id);
        this.setState({
          ready: true,
        });
      }
    });
    // Se o widget já estiver conectado, precisamos chamá-lo manualmente.
    if (remoteStorage.connected && this.widgetRef.current) {
        this.widget.attach(this.widgetRef.current.id);
        this.setState({ ready: true });
    }
  };

  hentaiToggle = (state) => {
    this.setState(
      {
        hentaiEnabled: state,
      },
      () => {
        if (state) {
          localStorage.setItem(HENTAI_KEY, HENTAI_VALUE);
        } else {
          localStorage.removeItem(HENTAI_KEY);
        }
        window.location.reload();
      }
    );
  };

  render() {
    const { t } = this.props;
    return (
      <Container>
        <Section text={t('settingsPageTitle')}></Section>
        <Section
          text={t('hentaiModeTitle')}
          textSize="text-2xl"
          subText={t('hentaiModeSubtext')}
        ></Section>
        <Container>
          <div className="h-full w-full mb-5 items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
            <Switch
              checked={this.state.hentaiEnabled}
              onChange={this.hentaiToggle}
              className={classNames(
                this.state.hentaiEnabled
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-gray-700 dark:bg-gray-200",
                "relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
              )}
            >
              <span className="sr-only">{t('srOnlyEnableHentaiMode')}</span>
              <span
                className={classNames(
                  this.state.hentaiEnabled ? "translate-x-6" : "translate-x-1",
                  "inline-block w-4 h-4 transform bg-white dark:bg-gray-900 rounded-full"
                )}
              />
            </Switch>
          </div>
        </Container>
        <Section
          text={t('remoteStorageTitle')}
          textSize="text-2xl"
          subText={t('remoteStorageSubtext')}
        />
        <Container className="mt-4 mb-6 text-sm space-y-3">
          <p className="text-gray-700 dark:text-gray-300 italic">{t('settings.remoteStorage.briefIntroPlusBenefits')}</p>
          <p className="text-gray-700 dark:text-gray-300">
            {t('settings.remoteStorage.createAccountPromptShort')}{' '}
            <a 
              href="https://5apps.com/users/sign_up?site=storage" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {t('settings.remoteStorage.createAccountLinkText')}
            </a>
          </p>
        </Container>
        <div className="h-full w-full items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
          <div id={REMOTE_STORAGE_WIDGET_ID} ref={this.widgetRef}></div>
          {this.state.ready ? undefined : <Spinner />}
        </div>
      </Container>
    );
  }
}

// O componente de classe é mantido aqui, pois a biblioteca remotestorage-widget
// funciona bem com o ciclo de vida de classes.
export default withTranslation()(SettingsClass);