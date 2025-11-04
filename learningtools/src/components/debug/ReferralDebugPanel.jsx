// src/components/debug/ReferralDebugPanel.jsx
// ⚠️ COMPONENTE TEMPORÁRIO PARA DEBUG
// Adicione no App.jsx para testar

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bug, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  getReferredBy,
  hasProcessedReferral,
  getMyReferralCode
} from '../../utils/referralUtils';
import {
  findUserByReferralCode,
  registerReferralUsage
} from '../../services/referralService';

export const ReferralDebugPanel = () => {
  const { userId, mode, referral } = useSelector(state => state.user);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Testa busca de código
  const testFindCode = async () => {
    if (!referral?.code) {
      setTestResult({ error: 'Você não tem código de referral' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await findUserByReferralCode(referral.code);
      setTestResult({
        success: true,
        data: result,
        message: result ? '✅ Código encontrado!' : '❌ Código não encontrado'
      });
    } catch (error) {
      setTestResult({
        error: error.message,
        hint: 'Verifique se o índice do Firestore foi criado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Testa registro de referral
  const testRegisterReferral = async () => {
    const testCode = prompt('Digite um código de referral para testar:');
    if (!testCode) return;

    setIsLoading(true);
    try {
      const result = await registerReferralUsage(userId, testCode);
      setTestResult({
        success: result?.success,
        data: result,
        message: result?.success ? '✅ Registrado com sucesso!' : '❌ Falha no registro'
      });
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const localStorageData = {
    referredBy: getReferredBy(),
    processed: hasProcessedReferral(),
    myCode: getMyReferralCode()
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border-2 border-purple-500 p-4 z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-purple-200">
        <Bug className="text-purple-600" size={24} />
        <h3 className="font-bold text-lg">Referral Debug</h3>
      </div>

      {/* Estado Redux */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          📊 Estado Redux
        </h4>
        <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
          <div><strong>Mode:</strong> {mode}</div>
          <div><strong>User ID:</strong> {userId?.slice(0, 20)}...</div>
          <div><strong>Meu Código:</strong> {referral?.code || '❌ Nenhum'}</div>
          <div><strong>Convidado por:</strong> {referral?.referredBy || '❌ Nenhum'}</div>
          <div><strong>Total Convites:</strong> {referral?.totalInvites || 0}</div>
          <div><strong>Pending:</strong> {referral?.pending?.length || 0}</div>
          <div><strong>Successful:</strong> {referral?.successfulInvites?.length || 0}</div>
          <div><strong>Skip Phrases:</strong> {referral?.rewards?.skipPhrases || 0}</div>
          <div><strong>Bônus Recebido:</strong> {referral?.hasReceivedWelcomeBonus ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* LocalStorage */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          💾 LocalStorage
        </h4>
        <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
          <div><strong>Referred By:</strong> {localStorageData.referredBy || '❌'}</div>
          <div><strong>Processed:</strong> {localStorageData.processed ? '✅' : '❌'}</div>
          <div><strong>My Code:</strong> {localStorageData.myCode || '❌'}</div>
        </div>
      </div>

      {/* Testes */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          🧪 Testes
        </h4>
        <div className="space-y-2">
          <button
            onClick={testFindCode}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Testar Busca do Meu Código'}
          </button>

          <button
            onClick={testRegisterReferral}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Testando...' : 'Testar Registro de Código'}
          </button>
        </div>
      </div>

      {/* Resultado dos Testes */}
      {testResult && (
        <div className={`p-3 rounded text-xs ${
          testResult.error
            ? 'bg-red-50 border border-red-300'
            : 'bg-green-50 border border-green-300'
        }`}>
          <div className="flex items-start gap-2 mb-2">
            {testResult.error ? (
              <XCircle className="text-red-600 flex-shrink-0" size={16} />
            ) : (
              <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
            )}
            <div className="flex-1">
              <p className="font-semibold mb-1">
                {testResult.message || testResult.error}
              </p>
              {testResult.hint && (
                <p className="text-gray-600 text-xs">💡 {testResult.hint}</p>
              )}
              {testResult.data && (
                <pre className="mt-2 bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diagnóstico */}
      <div className="mt-4 pt-4 border-t-2 border-purple-200">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          🩺 Diagnóstico
        </h4>
        <div className="space-y-2 text-xs">
          {mode === 'guest' && (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle size={14} />
              <span>Modo Guest - Faça login para usar referral</span>
            </div>
          )}

          {!referral?.code && mode === 'authenticated' && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={14} />
              <span>Código não gerado - Recarregue a página</span>
            </div>
          )}

          {referral?.referredBy && referral?.pending?.length === 0 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle size={14} />
              <span>Você foi convidado mas não está nos pending de ninguém</span>
            </div>
          )}

          {referral?.code && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={14} />
              <span>Sistema OK - Código ativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Botão Fechar */}
      <button
        onClick={() => document.querySelector('.referral-debug')?.remove()}
        className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-semibold"
      >
        Fechar Debug
      </button>
    </div>
  );
};