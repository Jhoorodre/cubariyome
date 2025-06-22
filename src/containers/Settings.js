// src/containers/Settings.js
import React, { useState, useEffect, useRef } from "react";
import Container from "../components/Container";
import Section from "../components/Section";
import Widget from "remotestorage-widget";
import { remoteStorage } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { Switch } from "@headlessui/react";
import { classNames } from "../utils/strings";
import { useTranslation } from 'react-i18next';


const REMOTE_STORAGE_WIDGET_ID = "remote-storage-widget";
const HENTAI_KEY = "hentai";
const HENTAI_VALUE = "enabled";

const Settings = () => {
    const { t } = useTranslation();
    const widgetRef = useRef(null);
    const [ready, setReady] = useState(false);
    // DESABILITADO: Estado do hentai - agora controlado pela aba Fontes
    // const [hentaiEnabled, setHentaiEnabled] = useState(!!localStorage.getItem(HENTAI_KEY));

    useEffect(() => {
        // Inicializa o widget do RemoteStorage
        const widget = new Widget(remoteStorage, {
            skipInitial: true,
            modalBackdrop: false,
            leaveOpen: true,
        });

        const onReady = () => {
            if (widgetRef.current) {
                widget.attach(widgetRef.current.id);
                setReady(true);
            }
        };

        remoteStorage.on("ready", onReady);
        
        // Se já estiver conectado, anexa o widget imediatamente
        if (remoteStorage.connected && widgetRef.current) {
            onReady();
        }        // Cleanup: remove o listener quando o componente é desmontado
        return () => {
            remoteStorage.removeEventListener("ready", onReady);
        };    }, []);

    // DESABILITADO: Função do toggle hentai - agora controlado pela aba Fontes
    /*
    const handleHentaiToggle = (isEnabled) => {
        setHentaiEnabled(isEnabled);
        if (isEnabled) {
            localStorage.setItem(HENTAI_KEY, HENTAI_VALUE);
        } else {
            localStorage.removeItem(HENTAI_KEY);
        }
        // Recarregar a página para que as fontes NSFW sejam (des)carregadas
        window.location.reload();
    };
    */return (
        <Container>
            <Section text={t('settingsPageTitle')} />
            
            {/* DESABILITADO: Modo Hentai - agora controlado pela aba Fontes
            <Section
                text={t('hentaiModeTitle')}
                textSize="text-2xl"
                subText={t('hentaiModeSubtext')}
            />
            <Container>
                <div className="h-full w-full mb-5 items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
                    <Switch
                        checked={hentaiEnabled}
                        onChange={handleHentaiToggle}
                        className={classNames(
                            hentaiEnabled ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-200",
                            "relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
                        )}
                    >
                        <span className="sr-only">{t('srOnlyEnableHentaiMode')}</span>
                        <span
                            className={classNames(
                                hentaiEnabled ? "translate-x-6" : "translate-x-1",
                                "inline-block w-4 h-4 transform bg-white dark:bg-gray-900 rounded-full"
                            )}
                        />
                    </Switch>
                </div>            </Container>
            */}

            <Section
                text={t('remoteStorageTitle')}
                textSize="text-2xl"
                subText={t('remoteStorageSubtext')}
            />
            <Container className="mt-4 mb-6 text-sm space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                    {t('settings.remoteStorage.briefIntroPlusBenefits')}
                </p>
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
            </Container>            <div className="h-full w-full items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
                <div id={REMOTE_STORAGE_WIDGET_ID} ref={widgetRef}></div>
                {!ready && <Spinner />}
            </div>
        </Container>
    );
}

export default Settings;