// src/hooks/useAdvancedNotification.js
import { useState, useCallback, useRef, useEffect } from 'react';

const useAdvancedNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const notificationIdRef = useRef(0);

    const showNotification = useCallback((message, type = 'info', duration = 4000, options = {}) => {
        const id = ++notificationIdRef.current;
        const notification = {
            id,
            message,
            type,
            timestamp: Date.now(),
            ...options
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remover após duração especificada (se não for persistente)
        if (!options.persistent) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }

        return id; // Retorna ID para remoção manual se necessário
    }, []);

    const hideNotification = useCallback((id) => {
        if (id) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        } else {
            // Se não passar ID, remove a mais recente
            setNotifications(prev => prev.slice(0, -1));
        }
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);    // Limpar notificações antigas automaticamente (configurável)
    useEffect(() => {
        const MAX_AGE = 30000; // 30 segundos
        const CLEANUP_INTERVAL = 5000; // 5 segundos
        
        const interval = setInterval(() => {
            const now = Date.now();
            setNotifications(prev => {
                const filtered = prev.filter(n => n.persistent || (now - n.timestamp) < MAX_AGE);
                // Só atualiza se houve mudança para evitar re-renders desnecessários
                return filtered.length !== prev.length ? filtered : prev;
            });
        }, CLEANUP_INTERVAL);

        return () => clearInterval(interval);
    }, []);    return {
        notifications,
        currentNotification: notifications[notifications.length - 1] || null,
        showNotification,
        hideNotification,
        clearAllNotifications,
        hasNotifications: notifications.length > 0,
        notificationCount: notifications.length
    };
};

export default useAdvancedNotification;
