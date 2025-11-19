'use client';

import { useState } from 'react';
import { LogOut, Trash2 } from 'lucide-react';

interface SessionDevice {
    id: string;
    deviceName: string;
    lastActive: string;
    isCurrentDevice: boolean;
}

export function SessionManager() {
    const [sessions, setSessions] = useState<SessionDevice[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogoutAll = async () => {
        if (!confirm('Tem certeza? Você será desconectado em todos os dispositivos.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/logout-all', {
                method: 'POST',
            });

            if (response.ok) {
                // Redirecionar para home
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
        setLoading(false);
    };

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Revogar acesso deste dispositivo?')) {
            return;
        }

        try {
            const response = await fetch('/api/auth/revoke-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
                setSessions(sessions.filter((s) => s.id !== sessionId));
            }
        } catch (error) {
            console.error('Erro ao revogar sessão:', error);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meus Dispositivos</h3>

            {sessions.length === 0 ? (
                <p className="text-gray-500">Carregando dispositivos...</p>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between border rounded-lg p-4 bg-gray-50"
                        >
                            <div>
                                <p className="font-medium">{session.deviceName}</p>
                                <p className="text-sm text-gray-500">
                                    Último acesso: {new Date(session.lastActive).toLocaleDateString('pt-BR')}
                                </p>
                                {session.isCurrentDevice && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                                        Dispositivo atual
                                    </span>
                                )}
                            </div>

                            {!session.isCurrentDevice && (
                                <button
                                    onClick={() => handleRevokeSession(session.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                    title="Revogar acesso"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleLogoutAll}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
                <LogOut size={18} />
                {loading ? 'Desconectando...' : 'Sair de Todos os Dispositivos'}
            </button>
        </div>
    );
}
