import React, { PureComponent, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import Section from "./Section";
import Container from "./Container";
import { useTranslation, Trans } from 'react-i18next';

// Discord invite link
const DISCORD_INVITE = "https://discord.gg/azxf6nxd6D";

// We'll throw these up here since they're replaced at build time anyway
const CHANGELOG_KEY = "changelog";
const CHANGELOG_SERIES = []; // Definido como array vazio para evitar erros

class InfoModalClass extends PureComponent {
  state = {
    isOpen: false,
    changeAvailable: false,
  };

  setIsOpen = (open) => {
    return () => {
      if (CHANGELOG_SERIES.length > 0) {
        localStorage.setItem(CHANGELOG_KEY, CHANGELOG_SERIES[0].abbrevHash);
      }
      this.setState({ isOpen: open, changeAvailable: false });
    };
  };

  componentDidMount = () => {
    const lastItem = localStorage.getItem(CHANGELOG_KEY);
    if (CHANGELOG_SERIES.length > 0 && (!lastItem || lastItem !== CHANGELOG_SERIES[0].abbrevHash)) {
      this.setState({
        changeAvailable: true,
      });
    }
  };

  render() {
    const { t } = this.props;
    return (
      <Fragment>
        <button
          className="p-1 relative rounded-full bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
          onClick={this.setIsOpen(true)}
        >
          {this.state.changeAvailable ? (
            <Fragment>
              <span className="animate-ping absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 dark:bg-red-600 rounded-full"></span>
              <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 dark:bg-red-600 rounded-full"></span>
            </Fragment>
          ) : undefined}
          <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <Transition appear show={this.state.isOpen} as={Fragment}>
          <Dialog
            open={this.state.isOpen}
            onClose={this.setIsOpen(false)}
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 text-center flex items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="text-black dark:text-white inline-block bg-white dark:bg-gray-800 w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
                  {/* Header do Modal */}
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('modalTitle')}
                    </Dialog.Title>
                    <button
                      onClick={this.setIsOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Conteúdo do Modal */}
                  <div className="space-y-6">
                    <Section text={t('aboutTitle')} />
                    <Container>
                      <Dialog.Description className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Trans i18nKey="aboutDescription">
                          <a className="text-blue-500 hover:text-blue-600 underline font-medium" href="https://cubari.moe/" target="_blank" rel="noopener noreferrer">cubari.moe</a>
                        </Trans>
                      </Dialog.Description>
                    </Container>

                    <Section text={t('projectTitle')} />
                    <Container>
                      <Dialog.Description className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Trans i18nKey="projectDescription">
                          <a className="text-blue-500 hover:text-blue-600 underline font-medium" href="https://github.com/Jhoorodre/cubariyome" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </Trans>
                      </Dialog.Description>
                    </Container>
                    <Section text={t('creditsTitle')} />
                    <Container>
                      <Dialog.Description className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Trans i18nKey="creditsDescription">
                          <a className="text-blue-500 hover:text-blue-600 underline font-medium" href="https://suwayomi.org/" target="_blank" rel="noopener noreferrer">Suwayomi</a>
                        </Trans>
                      </Dialog.Description>
                    </Container>

                    <Section text={t('discordTitle')} />
                    <Container>
                      <Dialog.Description className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Trans i18nKey="discordDescription">
                          <a className="text-blue-500 hover:text-blue-600 underline font-medium" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">entre no nosso Discord</a>
                        </Trans>
                      </Dialog.Description>
                    </Container>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Dica:</strong> Use o botão de chat na navbar para acessar rapidamente o suporte da comunidade.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>                  {/* Footer do Modal */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <a
                      href="https://cubari.moe/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      {t('cubariMoeButton')}
                    </a>
                    <a
                      href="https://github.com/Jhoorodre/gikamura"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                    <a
                      href={DISCORD_INVITE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Discord
                    </a>
                    <button
                      onClick={this.setIsOpen(false)}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t('coolButton')}
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </Fragment>
    );
  }
}

const InfoModal = (props) => {
  const { t } = useTranslation();
  return <InfoModalClass {...props} t={t} />;
};

export default InfoModal;
