// src/components/NotificationStack.js
import React from 'react';
import { XIcon } from '@heroicons/react/solid';
import { classNames } from '../utils/strings';

const NotificationItem = React.memo(({ notification, onClose, index }) => {
    const handleClose = () => {
        if (onClose) {
            onClose(notification.id);
        }
    };

    return (
        <div 
            className={classNames(
                "max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out mb-2",
                "transform translate-x-0", // Animação de entrada
                notification.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
                notification.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
                notification.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
                notification.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
            )}
            style={{ 
                marginTop: index > 0 ? '8px' : '0',
                transform: `translateY(${index * 4}px)`,
                zIndex: 50 - index
            }}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {notification.type === 'success' && (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    )}
                    {notification.type === 'warning' && (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {notification.type === 'error' && (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                    {notification.type === 'info' && (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    {notification.subtitle && (
                        <p className="text-xs opacity-75 mt-1">{notification.subtitle}</p>
                    )}
                </div>
                {!notification.persistent && (
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

const NotificationStack = React.memo(({ notifications, onClose, maxVisible = 3 }) => {
    if (!notifications || notifications.length === 0) return null;

    // Mostrar apenas as notificações mais recentes
    const visibleNotifications = notifications.slice(-maxVisible);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {visibleNotifications.map((notification, index) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={onClose}
                    index={index}
                />
            ))}
            
            {/* Indicador de notificações ocultas */}
            {notifications.length > maxVisible && (
                <div className="text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        +{notifications.length - maxVisible} notificação{notifications.length - maxVisible !== 1 ? 'ões' : ''}
                    </div>
                </div>
            )}
        </div>
    );
});

NotificationItem.displayName = 'NotificationItem';
NotificationStack.displayName = 'NotificationStack';

export default NotificationStack;
